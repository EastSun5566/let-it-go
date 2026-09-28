import './style.css';

import { createRenderer } from './renderers';
import type {
  BenchmarkMode,
  RendererStatus,
  SampleResult,
  SceneOptions,
} from './types';

interface BenchmarkController {
  getStatus(): Promise<RendererStatus>;
  setOptions(patch: Partial<SceneOptions>): void;
  start(): void;
  stop(): void;
  resize(width: number, height: number): Promise<void>;
  clear(): Promise<void>;
  warmup(durationMs: number): Promise<void>;
  measureMemory(): Promise<number | null>;
  runSample(durationMs: number, interactionCount?: number): Promise<SampleResult>;
}

declare global {
  interface Window {
    benchmark?: BenchmarkController;
  }
}

const DEFAULT_OPTIONS: SceneOptions = {
  number: 1_280,
  velocityXRange: [-3, 3],
  velocityYRange: [1, 5],
  radiusRange: [0.5, 1],
  alphaRange: [0.8, 1],
  color: '#ffffff',
  backgroundColor: 'transparent',
};

const wait = (durationMs: number): Promise<void> => new Promise((resolve) => {
  window.setTimeout(() => resolve(), durationMs);
});

const nextFrame = (): Promise<number> => new Promise((resolve) => {
  requestAnimationFrame(resolve);
});

const percentile = (values: number[], ratio: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1);
  return sorted[index] ?? 0;
};

const runInteractionProbes = async (count: number, durationMs: number): Promise<number[]> => {
  if (count === 0) return [];
  const latencies: number[] = [];
  const interval = durationMs / count;
  const startedAt = performance.now();
  await Promise.all(Array.from({ length: count }, (_, index) => new Promise<void>((resolve) => {
    const expectedAt = startedAt + interval * index;
    window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          latencies.push(performance.now() - expectedAt);
          resolve();
        });
      });
    }, Math.max(0, expectedAt - performance.now()));
  })));
  return latencies;
};

const parseMode = (value: string | null): BenchmarkMode => {
  if (value === 'production-main' || value === 'production-worker') return value;
  return 'production-main';
};

const params = new URLSearchParams(window.location.search);
const requestedMode = parseMode(params.get('mode'));
const requestedNumber = Number(params.get('number') ?? DEFAULT_OPTIONS.number);
const number = Number.isSafeInteger(requestedNumber) && requestedNumber >= 0 && requestedNumber <= 10_000
  ? requestedNumber
  : DEFAULT_OPTIONS.number;
const requestedSeed = Number(params.get('seed') ?? 5_566);
const seed = Number.isSafeInteger(requestedSeed) ? requestedSeed : 5_566;

const root = document.getElementById('canvas-root');
const statusOutput = document.getElementById('status');
const resultOutput = document.getElementById('results');
const interactionButton = document.getElementById('interaction-probe');
const runButton = document.getElementById('run-suite');
const downloadButton = document.getElementById('download-results');
if (
  !root
  || !(statusOutput instanceof HTMLOutputElement)
  || !(resultOutput instanceof HTMLPreElement)
  || !(interactionButton instanceof HTMLButtonElement)
  || !(runButton instanceof HTMLButtonElement)
  || !(downloadButton instanceof HTMLButtonElement)
) throw new Error('Benchmark DOM is incomplete.');

let latestResult: SampleResult | null = null;
let interactionCount = 0;

const { renderer, fallbackReason } = await createRenderer(
  requestedMode,
  root,
  { ...DEFAULT_OPTIONS, number },
  seed,
);

const getStatus = async (): Promise<RendererStatus> => {
  const stats = await renderer.refreshStats();
  return {
    requestedMode,
    activeMode: renderer.activeMode,
    workerSupported: renderer.workerSupported,
    fallbackReason: fallbackReason ?? renderer.fallbackReason,
    running: renderer.running,
    cleared: renderer.cleared,
    canvasCount: root.querySelectorAll('canvas').length,
    width: renderer.canvas.clientWidth,
    height: renderer.canvas.clientHeight,
    options: renderer.options,
    stats,
  };
};

const runSample = async (durationMs: number, sampleInteractionCount = 20): Promise<SampleResult> => {
  if (renderer.cleared) throw new Error('Cannot benchmark a cleared renderer.');
  const frameIntervals: number[] = [];
  let previousFrame: number | null = null;
  let sampling = true;
  let longAnimationFrameCount = 0;
  const observer = typeof PerformanceObserver !== 'undefined'
    && PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')
    ? new PerformanceObserver((list) => {
      longAnimationFrameCount += list.getEntries().length;
    })
    : null;
  observer?.observe({ type: 'long-animation-frame', buffered: false });

  const sampleFrames = (timestamp: number): void => {
    if (!sampling) return;
    if (previousFrame !== null) frameIntervals.push(timestamp - previousFrame);
    previousFrame = timestamp;
    requestAnimationFrame(sampleFrames);
  };
  requestAnimationFrame(sampleFrames);

  const interactionPromise = runInteractionProbes(sampleInteractionCount, durationMs);
  await wait(durationMs);
  sampling = false;
  const interactionLatencies = await interactionPromise;
  observer?.disconnect();
  const stats = await renderer.refreshStats();
  const expectedInterval = percentile(frameIntervals, 0.5) || 1000 / 60;
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };

  return {
    mode: requestedMode,
    activeMode: renderer.activeMode,
    number: renderer.options.number,
    seed,
    durationMs,
    frameCount: frameIntervals.length,
    droppedFrames: frameIntervals.filter((interval) => interval > expectedInterval * 1.5).length,
    p95FrameIntervalMs: percentile(frameIntervals, 0.95),
    p95InteractionLatencyMs: percentile(interactionLatencies, 0.95),
    longAnimationFrameCount,
    memoryBytes: await renderer.measureMemory(),
    rendererStats: stats,
    userAgent: navigator.userAgent,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigatorWithMemory.deviceMemory ?? null,
    crossOriginIsolated,
    timestamp: new Date().toISOString(),
  };
};

window.benchmark = {
  getStatus,
  setOptions: (patch) => renderer.setOptions(patch),
  start: () => renderer.start(),
  stop: () => renderer.stop(),
  resize: async (width, height) => {
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;
    renderer.resize();
    await nextFrame();
    await nextFrame();
  },
  clear: () => renderer.clear(),
  warmup: (durationMs) => wait(durationMs),
  measureMemory: () => renderer.measureMemory(),
  runSample,
};

interactionButton.addEventListener('click', () => {
  interactionCount += 1;
  interactionButton.dataset.count = String(interactionCount);
});

runButton.addEventListener('click', async () => {
  runButton.disabled = true;
  statusOutput.value = 'Running sample…';
  try {
    latestResult = await runSample(10_000);
    resultOutput.textContent = JSON.stringify(latestResult, null, 2);
    downloadButton.disabled = false;
    statusOutput.value = `Completed: ${renderer.activeMode}`;
  } catch (error) {
    statusOutput.value = error instanceof Error ? error.message : String(error);
  } finally {
    runButton.disabled = false;
  }
});

downloadButton.addEventListener('click', () => {
  if (!latestResult) return;
  const blob = new Blob([JSON.stringify(latestResult, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `let-it-go-${renderer.activeMode}-${renderer.options.number}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

const initialStatus = await getStatus();
statusOutput.value = initialStatus.fallbackReason
  ? `${initialStatus.activeMode} fallback: ${initialStatus.fallbackReason}`
  : initialStatus.activeMode;
