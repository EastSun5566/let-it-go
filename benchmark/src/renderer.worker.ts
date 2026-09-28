/// <reference lib="webworker" />

import {
  FRAME_INTERVAL,
  FRAME_RATE,
  MAX_CATCH_UP_STEPS,
  createScene,
  drawScene,
  resizeScene,
  setSceneOptions,
  updateScene,
} from './engine';
import type { MainToWorkerMessage, WorkerToMainMessage } from './protocol';
import type { RendererStats } from './types';

const scope = globalThis as unknown as DedicatedWorkerGlobalScope;

let canvas: OffscreenCanvas | null = null;
let context: OffscreenCanvasRenderingContext2D | null = null;
let scene: ReturnType<typeof createScene> | null = null;
let requestId: number | null = null;
let lastUpdate: number | null = null;
let running = false;
let dirty = true;
let stats: RendererStats = { frames: 0, steps: 0, messages: 0 };

const send = (message: WorkerToMainMessage): void => scope.postMessage(message);

const stop = (): void => {
  running = false;
  if (requestId !== null) scope.cancelAnimationFrame(requestId);
  requestId = null;
};

const animate = (timestamp: number): void => {
  if (!running || !scene || !context) return;
  if (lastUpdate === null) lastUpdate = timestamp;
  const elapsed = timestamp - lastUpdate;
  const dueSteps = Math.floor((elapsed * FRAME_RATE) / 1000);
  const steps = Math.min(dueSteps, MAX_CATCH_UP_STEPS);
  for (let index = 0; index < steps; index += 1) updateScene(scene);
  if (steps > 0) {
    stats.steps += steps;
    dirty = true;
    lastUpdate = timestamp - (elapsed % FRAME_INTERVAL);
  }
  if (dirty) {
    drawScene(scene, context);
    stats.frames += 1;
    dirty = false;
  }
  if (running) requestId = scope.requestAnimationFrame(animate);
};

const start = (): void => {
  if (running || !scene || !context) return;
  running = true;
  lastUpdate = null;
  dirty = true;
  requestId = scope.requestAnimationFrame(animate);
};

scope.addEventListener('message', ({ data }: MessageEvent<MainToWorkerMessage>) => {
  stats.messages += 1;
  try {
    switch (data.type) {
      case 'probe': {
        const supported = data.failureMode !== 'probe'
          && typeof scope.requestAnimationFrame === 'function'
          && typeof OffscreenCanvas !== 'undefined'
          && new OffscreenCanvas(1, 1).getContext('2d') !== null;
        send({
          type: 'probe-result',
          requestId: data.requestId,
          supported,
          reason: supported ? null : 'Worker RAF or OffscreenCanvas 2D context is unavailable.',
        });
        break;
      }
      case 'init': {
        if (data.failureMode === 'init') throw new Error('Worker initialization was forced to fail.');
        canvas = data.canvas;
        canvas.width = data.width;
        canvas.height = data.height;
        context = data.failureMode === 'context' ? null : canvas.getContext('2d');
        if (!context) throw new Error('Worker 2D context is unavailable.');
        scene = createScene(data.options, data.width, data.height, data.seed);
        stats = { frames: 0, steps: 0, messages: stats.messages };
        start();
        send({ type: 'ready', requestId: data.requestId });
        break;
      }
      case 'resize':
        if (!canvas || !scene) break;
        canvas.width = data.width;
        canvas.height = data.height;
        resizeScene(scene, data.width, data.height);
        dirty = true;
        break;
      case 'options':
        if (!scene) break;
        setSceneOptions(scene, data.patch);
        dirty = true;
        break;
      case 'start':
        start();
        break;
      case 'stop':
        stop();
        break;
      case 'stats':
        send({ type: 'stats', requestId: data.requestId, stats: { ...stats } });
        break;
      case 'memory': {
        const { memory } = performance as Performance & {
          memory?: { usedJSHeapSize: number };
        };
        send({ type: 'memory', requestId: data.requestId, bytes: memory?.usedJSHeapSize ?? null });
        break;
      }
      case 'clear':
        stop();
        if (context && canvas) context.clearRect(0, 0, canvas.width, canvas.height);
        scene = null;
        context = null;
        canvas = null;
        send({ type: 'ack', requestId: data.requestId, action: 'clear' });
        break;
      default: {
        const exhaustive: never = data;
        throw new Error(`Unknown message: ${JSON.stringify(exhaustive)}`);
      }
    }
  } catch (error) {
    send({
      type: 'error',
      requestId: 'requestId' in data ? data.requestId : null,
      phase: data.type,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
