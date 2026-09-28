# OffscreenCanvas Worker Spike

This package compares the current `LetItGo` renderer with deterministic main-thread and Worker prototypes. It is deliberately isolated from the published package: nothing under `benchmark/` is exported by `let-it-go`.

## Setup

```sh
pnpm build
pnpm -C benchmark install --frozen-lockfile
pnpm -C benchmark exec playwright install chromium firefox webkit
```

## Functional checks

```sh
pnpm -C benchmark type-check
pnpm -C benchmark build
pnpm -C benchmark test:functional
```

The functional suite runs against Chromium, Firefox, and WebKit. It covers feature detection, main-thread fallback, post-transfer canvas replacement, option synchronization, resize, stop/restart, repeated clear, and cleanup.

## Chromium benchmark

The full suite performs five repetitions per renderer and count. Each run uses a two-second warm-up and a ten-second sample:

```sh
pnpm -C benchmark benchmark:chromium
```

For a short harness check, override the sample settings without treating the output as decision evidence:

```sh
BENCHMARK_REPETITIONS=1 BENCHMARK_WARMUP_MS=100 BENCHMARK_DURATION_MS=500 \
  pnpm -C benchmark benchmark:chromium
```

The runner reads main and Dedicated Worker heap usage from their separate Chromium CDP targets after requesting garbage collection. The default output is `benchmark/test-results/benchmark-results.json`. Set `BENCHMARK_OUTPUT` to preserve a reviewed result under `benchmark/results/`.

The benchmark workflow runs the same full suite on a pinned Ubuntu 24.04 runner for pull requests that change this package and for manual dispatches. It prints the decision in the job log and retains the raw JSON as a 30-day Actions artifact. A failed decision remains evidence rather than failing CI; CI fails only when the harness cannot complete.

## Native Safari

Run `pnpm -C benchmark dev`, open <http://127.0.0.1:4174/?mode=prototype-worker&number=5000>, and confirm the status says `prototype-worker`. Use **Run 10s sample** and **Download JSON** for each required count. Repeat with `mode=production-main` and `mode=prototype-main`.

Safari results validate the Worker path, frame timing, interaction proxy, resize, and cleanup. Chromium CDP remains the decision source for main-thread scripting and total CPU proxy because those profiler signals are not equivalent across browser engines.

## Decision gates

- The deterministic main prototype must stay within 10% of production-main CPU proxy at every count.
- Worker main-thread task time must improve by at least 25% at both 5,000 and 10,000 flakes.
- At the default 1,280 flakes, Worker total CPU proxy and memory must not regress by more than 10%.
- A main-thread task coefficient of variation above 15% makes the result invalid and requires a rerun.
