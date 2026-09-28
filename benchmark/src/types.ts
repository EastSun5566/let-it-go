export type BenchmarkMode = 'production-main' | 'prototype-main' | 'prototype-worker';

export type FailureMode = 'none' | 'unsupported' | 'constructor' | 'probe' | 'init' | 'context';

export type Range = readonly [number, number];

export interface SceneOptions {
  number: number;
  velocityXRange: Range;
  velocityYRange: Range;
  radiusRange: Range;
  alphaRange: Range;
  color: string;
  backgroundColor: string;
}

export interface RendererStats {
  frames: number;
  steps: number;
  messages: number;
}

export interface RendererStatus {
  requestedMode: BenchmarkMode;
  activeMode: BenchmarkMode;
  workerSupported: boolean;
  fallbackReason: string | null;
  running: boolean;
  cleared: boolean;
  canvasCount: number;
  width: number;
  height: number;
  options: SceneOptions;
  stats: RendererStats;
}

export interface SampleResult {
  mode: BenchmarkMode;
  activeMode: BenchmarkMode;
  number: number;
  seed: number;
  durationMs: number;
  frameCount: number;
  droppedFrames: number;
  p95FrameIntervalMs: number;
  p95InteractionLatencyMs: number;
  longAnimationFrameCount: number;
  memoryBytes: number | null;
  rendererStats: RendererStats;
  userAgent: string;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  crossOriginIsolated: boolean;
  timestamp: string;
}

export interface BenchmarkRenderer {
  readonly requestedMode: BenchmarkMode;
  readonly activeMode: BenchmarkMode;
  readonly workerSupported: boolean;
  readonly fallbackReason: string | null;
  readonly canvas: HTMLCanvasElement;
  readonly options: SceneOptions;
  readonly stats: RendererStats;
  readonly running: boolean;
  readonly cleared: boolean;
  setOptions(patch: Partial<SceneOptions>): void;
  refreshStats(): Promise<RendererStats>;
  measureMemory(): Promise<number | null>;
  start(): void;
  stop(): void;
  resize(): void;
  clear(): Promise<void>;
}
