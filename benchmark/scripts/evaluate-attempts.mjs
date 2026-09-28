import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const resultsRoot = process.argv[2] ?? 'benchmark-artifacts';
const entries = await readdir(resultsRoot, { recursive: true, withFileTypes: true });
const resultPaths = entries
  .filter((entry) => entry.isFile() && entry.name === 'benchmark-results.json')
  .map((entry) => path.join(entry.parentPath, entry.name));

if (resultPaths.length !== 3) {
  throw new Error(`Expected 3 benchmark attempts, found ${resultPaths.length}.`);
}

const attempts = await Promise.all(resultPaths.map(async (resultPath) => (
  JSON.parse(await readFile(resultPath, 'utf8'))
)));

const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
};

const summaryValues = (mode, number, field) => attempts.map((attempt) => {
  const summary = attempt.summaries.find((candidate) => (
    candidate.mode === mode && candidate.number === number
  ));
  if (!summary || summary[field] === null) {
    throw new Error(`Missing ${field} for ${mode} at ${number} flakes.`);
  }
  return summary[field];
});

const reasons = [];
const passedAttempts = attempts.filter((attempt) => attempt.decision.status === 'passed').length;
if (passedAttempts < 2) reasons.push(`Only ${passedAttempts}/3 individual attempts passed.`);

const unstable = attempts.some((attempt) => attempt.summaries.some((summary) => (
  summary.mainThreadTaskCoefficientOfVariation > 0.15
)));
if (unstable) reasons.push('At least one main-thread coefficient of variation exceeds 15%.');

const reductions = {};
for (const number of [5_000, 10_000]) {
  const main = median(summaryValues('production-main', number, 'mainThreadTaskMsMedian'));
  const worker = median(summaryValues('production-worker', number, 'mainThreadTaskMsMedian'));
  const reduction = 1 - worker / main;
  reductions[number] = reduction;
  if (reduction < 0.25) reasons.push(`${number}-flake main-thread reduction is below 25%.`);
}

const defaultMainCpu = median(summaryValues('production-main', 1_280, 'totalCpuProxyMsMedian'));
const defaultWorkerCpu = median(summaryValues('production-worker', 1_280, 'totalCpuProxyMsMedian'));
const defaultMainMemory = median(summaryValues('production-main', 1_280, 'memoryBytesMedian'));
const defaultWorkerMemory = median(summaryValues('production-worker', 1_280, 'memoryBytesMedian'));
const defaultCpuRegression = defaultWorkerCpu / defaultMainCpu - 1;
const defaultMemoryRegression = defaultWorkerMemory / defaultMainMemory - 1;
if (defaultCpuRegression > 0.1) reasons.push('Default-count total CPU regresses by more than 10%.');
if (defaultMemoryRegression > 0.1) reasons.push('Default-count memory regresses by more than 10%.');

const decision = {
  status: reasons.length === 0 ? 'passed' : 'failed',
  passedAttempts,
  reductions,
  defaultCpuRegression,
  defaultMemoryRegression,
  reasons,
};
process.stdout.write(`${JSON.stringify(decision, null, 2)}\n`);
if (decision.status !== 'passed') process.exitCode = 1;
