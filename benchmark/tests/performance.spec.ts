import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@playwright/test';
import type { Browser, CDPSession } from '@playwright/test';

import type { BenchmarkMode, SampleResult } from '../src/types';

interface TraceEvent {
  name: string;
  ph: string;
  pid: number;
  tid: number;
  dur?: number;
  args?: { name?: string };
}

interface TraceMetrics {
  mainThreadTaskMs: number;
  workerTaskMs: number;
  totalCpuProxyMs: number;
}

interface HeapUsage {
  usedSize: number;
  embedderHeapUsedSize?: number;
  backingStorageSize?: number;
}

interface BenchmarkRun {
  repetition: number;
  page: SampleResult;
  trace: TraceMetrics;
}

interface ScenarioSummary {
  mode: BenchmarkMode;
  number: number;
  mainThreadTaskMsMedian: number;
  totalCpuProxyMsMedian: number;
  memoryBytesMedian: number | null;
  p95FrameIntervalMsMedian: number;
  p95InteractionLatencyMsMedian: number;
  mainThreadTaskCoefficientOfVariation: number;
}

const MODES: BenchmarkMode[] = ['production-main', 'prototype-main', 'prototype-worker'];
const COUNTS = [1_000, 1_280, 5_000, 10_000];
const REPETITIONS = Number(process.env.BENCHMARK_REPETITIONS ?? 5);
const WARMUP_MS = Number(process.env.BENCHMARK_WARMUP_MS ?? 2_000);
const DURATION_MS = Number(process.env.BENCHMARK_DURATION_MS ?? 10_000);
const OUTPUT_PATH = process.env.BENCHMARK_OUTPUT
  ?? path.join('test-results', 'benchmark-results.json');

const median = (values: number[]): number => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  return sorted[middle] ?? 0;
};

const coefficientOfVariation = (values: number[]): number => {
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (average === 0) return 0;
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
  return Math.sqrt(variance) / average;
};

const parseTrace = (trace: string): TraceMetrics => {
  const parsed = JSON.parse(trace) as { traceEvents?: TraceEvent[] } | TraceEvent[];
  const events = Array.isArray(parsed) ? parsed : parsed.traceEvents ?? [];
  const threadNames = new Map<string, string>();
  for (const event of events) {
    if (event.ph === 'M' && event.name === 'thread_name' && event.args?.name) {
      threadNames.set(`${event.pid}:${event.tid}`, event.args.name);
    }
  }

  let mainThreadTaskMicroseconds = 0;
  let workerTaskMicroseconds = 0;
  for (const event of events) {
    if (event.name !== 'RunTask' || event.ph !== 'X' || !event.dur) continue;
    const threadName = threadNames.get(`${event.pid}:${event.tid}`) ?? '';
    if (threadName === 'CrRendererMain') mainThreadTaskMicroseconds += event.dur;
    else if (/worker/i.test(threadName)) workerTaskMicroseconds += event.dur;
  }

  const mainThreadTaskMs = mainThreadTaskMicroseconds / 1000;
  const workerTaskMs = workerTaskMicroseconds / 1000;
  return {
    mainThreadTaskMs,
    workerTaskMs,
    totalCpuProxyMs: mainThreadTaskMs + workerTaskMs,
  };
};

const readTraceStream = async (
  client: Awaited<ReturnType<import('@playwright/test').BrowserContext['newCDPSession']>>,
  stream: string,
): Promise<string> => {
  let trace = '';
  let done = false;
  while (!done) {
    const chunk = await client.send('IO.read', { handle: stream });
    trace += chunk.data;
    done = chunk.eof;
  }
  await client.send('IO.close', { handle: stream });
  return trace;
};

const totalHeapBytes = (usage: HeapUsage): number => usage.usedSize
  + (usage.embedderHeapUsedSize ?? 0)
  + (usage.backingStorageSize ?? 0);

const sendTargetCommand = async <T>(
  session: CDPSession,
  sessionId: string,
  id: number,
  method: string,
): Promise<T> => {
  const responsePromise = new Promise<T>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout>;
    const onMessage = (event: { sessionId: string; message: string }): void => {
      if (event.sessionId !== sessionId) return;
      const response = JSON.parse(event.message) as {
        id?: number;
        result?: T;
        error?: { message: string };
      };
      if (response.id !== id) return;
      clearTimeout(timeout);
      session.off('Target.receivedMessageFromTarget', onMessage);
      if (response.error) reject(new Error(response.error.message));
      else if (response.result) resolve(response.result);
      else reject(new Error(`CDP target command ${method} returned no result.`));
    };
    timeout = setTimeout(() => {
      session.off('Target.receivedMessageFromTarget', onMessage);
      reject(new Error(`CDP target command ${method} timed out.`));
    }, 2_000);
    session.on('Target.receivedMessageFromTarget', onMessage);
  });
  await session.send('Target.sendMessageToTarget', {
    sessionId,
    message: JSON.stringify({ id, method }),
  });
  return responsePromise;
};

const measureWorkerHeap = async (browser: Browser): Promise<number> => {
  const session = await browser.newBrowserCDPSession();
  try {
    const targets = await session.send('Target.getTargets');
    const workerTargets = targets.targetInfos.filter((target) => target.type === 'worker');
    let total = 0;
    for (const [index, target] of workerTargets.entries()) {
      const { sessionId } = await session.send('Target.attachToTarget', {
        targetId: target.targetId,
        flatten: false,
      });
      await sendTargetCommand<Record<string, never>>(
        session,
        sessionId,
        index * 2 + 1,
        'HeapProfiler.collectGarbage',
      );
      const usage = await sendTargetCommand<HeapUsage>(
        session,
        sessionId,
        index * 2 + 2,
        'Runtime.getHeapUsage',
      );
      total += totalHeapBytes(usage);
      await session.send('Target.detachFromTarget', { sessionId });
    }
    return total;
  } finally {
    await session.detach();
  }
};

const summarize = (runs: BenchmarkRun[]): ScenarioSummary[] => MODES.flatMap((mode) => COUNTS.map((number) => {
  const matches = runs.filter((run) => run.page.mode === mode && run.page.number === number);
  const mainThreadValues = matches.map((run) => run.trace.mainThreadTaskMs);
  const memoryValues = matches
    .map((run) => run.page.memoryBytes)
    .filter((value): value is number => value !== null);
  return {
    mode,
    number,
    mainThreadTaskMsMedian: median(mainThreadValues),
    totalCpuProxyMsMedian: median(matches.map((run) => run.trace.totalCpuProxyMs)),
    memoryBytesMedian: memoryValues.length === matches.length ? median(memoryValues) : null,
    p95FrameIntervalMsMedian: median(matches.map((run) => run.page.p95FrameIntervalMs)),
    p95InteractionLatencyMsMedian: median(matches.map((run) => run.page.p95InteractionLatencyMs)),
    mainThreadTaskCoefficientOfVariation: coefficientOfVariation(mainThreadValues),
  };
}));

const evaluateDecision = (summaries: ScenarioSummary[]): { status: 'passed' | 'failed' | 'invalid'; reasons: string[] } => {
  const reasons: string[] = [];
  if (summaries.some((summary) => summary.mainThreadTaskCoefficientOfVariation > 0.15)) {
    return { status: 'invalid', reasons: ['At least one main-thread task sample has coefficient of variation above 15%.'] };
  }

  for (const number of COUNTS) {
    const production = summaries.find((summary) => summary.mode === 'production-main' && summary.number === number);
    const prototype = summaries.find((summary) => summary.mode === 'prototype-main' && summary.number === number);
    if (!production || !prototype || production.totalCpuProxyMsMedian === 0) {
      return { status: 'invalid', reasons: [`Missing equivalence data for ${number} flakes.`] };
    }
    const difference = Math.abs(prototype.totalCpuProxyMsMedian - production.totalCpuProxyMsMedian)
      / production.totalCpuProxyMsMedian;
    if (difference > 0.1) reasons.push(`Prototype main differs from production main by more than 10% at ${number} flakes.`);
  }
  if (reasons.length > 0) return { status: 'invalid', reasons };

  for (const number of [5_000, 10_000]) {
    const production = summaries.find((summary) => summary.mode === 'production-main' && summary.number === number);
    const worker = summaries.find((summary) => summary.mode === 'prototype-worker' && summary.number === number);
    if (!production || !worker || production.mainThreadTaskMsMedian === 0) {
      return { status: 'invalid', reasons: [`Missing worker comparison data for ${number} flakes.`] };
    }
    const reduction = 1 - worker.mainThreadTaskMsMedian / production.mainThreadTaskMsMedian;
    if (reduction < 0.25) reasons.push(`Main-thread scripting reduction at ${number} flakes is below 25%.`);
  }

  const defaultProduction = summaries.find((summary) => summary.mode === 'production-main' && summary.number === 1_280);
  const defaultWorker = summaries.find((summary) => summary.mode === 'prototype-worker' && summary.number === 1_280);
  if (!defaultProduction || !defaultWorker) return { status: 'invalid', reasons: ['Missing default-count data.'] };
  if (defaultWorker.totalCpuProxyMsMedian > defaultProduction.totalCpuProxyMsMedian * 1.1) {
    reasons.push('Default-count total CPU proxy regresses by more than 10%.');
  }
  if (defaultProduction.memoryBytesMedian === null || defaultWorker.memoryBytesMedian === null) {
    return { status: 'invalid', reasons: ['Memory measurement is unavailable for the default-count scenario.'] };
  }
  if (defaultWorker.memoryBytesMedian > defaultProduction.memoryBytesMedian * 1.1) {
    reasons.push('Default-count memory regresses by more than 10%.');
  }
  return { status: reasons.length === 0 ? 'passed' : 'failed', reasons };
};

test('records deterministic main-thread and worker benchmark results', async ({ browser }) => {
  test.setTimeout(Math.max(120_000, MODES.length * COUNTS.length * REPETITIONS * (WARMUP_MS + DURATION_MS + 2_000)));
  const runs: BenchmarkRun[] = [];
  const order = Array.from({ length: REPETITIONS }, (_, repetition) => {
    const modes = repetition % 2 === 0 ? MODES : [...MODES].reverse();
    return modes.flatMap((mode) => COUNTS.map((number) => ({ mode, number, repetition })));
  }).flat();

  for (const scenario of order) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(`/?mode=${scenario.mode}&number=${scenario.number}&seed=5566`);
    await page.waitForFunction(() => window.benchmark !== undefined);
    const status = await page.evaluate(() => window.benchmark?.getStatus());
    expect(status?.activeMode).toBe(scenario.mode);
    await page.evaluate((duration) => window.benchmark?.warmup(duration), WARMUP_MS);

    const client = await context.newCDPSession(page);
    await client.send('HeapProfiler.collectGarbage');
    const tracingComplete = new Promise<string>((resolve, reject) => {
      client.once('Tracing.tracingComplete', ({ stream }) => {
        if (stream) resolve(stream);
        else reject(new Error('Chromium trace completed without a stream handle.'));
      });
    });
    await client.send('Tracing.start', {
      categories: 'devtools.timeline,toplevel,v8,blink.user_timing,disabled-by-default-devtools.timeline',
      transferMode: 'ReturnAsStream',
    });
    const pageResult = await page.evaluate(
      ({ duration }) => window.benchmark?.runSample(duration, 20),
      { duration: DURATION_MS },
    );
    await client.send('HeapProfiler.collectGarbage');
    const mainHeap = await client.send('Runtime.getHeapUsage');
    const memoryBytes = totalHeapBytes(mainHeap) + await measureWorkerHeap(browser);
    await client.send('Tracing.end');
    const stream = await tracingComplete;
    const trace = await readTraceStream(client, stream);
    if (!pageResult) throw new Error('Benchmark page did not return a sample.');
    runs.push({
      repetition: scenario.repetition,
      page: { ...pageResult, memoryBytes: memoryBytes ?? null },
      trace: parseTrace(trace),
    });
    await page.evaluate(() => window.benchmark?.clear());
    await context.close();
  }

  const summaries = summarize(runs);
  const result = {
    schemaVersion: 1,
    environment: {
      platform: process.platform,
      architecture: process.arch,
      node: process.version,
      browserVersion: browser.version(),
      repetitions: REPETITIONS,
      warmupMs: WARMUP_MS,
      durationMs: DURATION_MS,
      viewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
    },
    runs,
    summaries,
    decision: evaluateDecision(summaries),
  };
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  expect(runs).toHaveLength(MODES.length * COUNTS.length * REPETITIONS);
});
