import type { RendererStats, SceneOptions } from './types';

export type MainToWorkerMessage =
  | { type: 'probe'; requestId: number; failureMode: 'none' | 'probe' }
  | {
    type: 'init';
    requestId: number;
    canvas: OffscreenCanvas;
    width: number;
    height: number;
    options: SceneOptions;
    seed: number;
    failureMode: 'none' | 'init' | 'context';
  }
  | { type: 'resize'; width: number; height: number }
  | { type: 'options'; patch: Partial<SceneOptions> }
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'clear'; requestId: number }
  | { type: 'stats'; requestId: number }
  | { type: 'memory'; requestId: number };

export type WorkerToMainMessage =
  | { type: 'probe-result'; requestId: number; supported: boolean; reason: string | null }
  | { type: 'ready'; requestId: number }
  | { type: 'ack'; requestId: number; action: 'clear' }
  | { type: 'stats'; requestId: number; stats: RendererStats }
  | { type: 'memory'; requestId: number; bytes: number | null }
  | { type: 'error'; requestId: number | null; phase: string; message: string };
