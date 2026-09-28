import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const openBenchmark = async (
  page: Page,
  query: string,
): Promise<void> => {
  await page.goto(`/?${query}`);
  await page.waitForFunction(() => window.benchmark !== undefined);
};

test('loads the production renderer without changing its public canvas contract', async ({ page }) => {
  await openBenchmark(page, 'mode=production-main&number=10&seed=5566');
  const status = await page.evaluate(() => window.benchmark?.getStatus());

  expect(status?.activeMode).toBe('production-main');
  expect(status?.canvasCount).toBe(1);
  expect(status?.options.number).toBe(10);
  expect(status?.running).toBe(true);
});

test('uses the worker renderer when supported and otherwise falls back cleanly', async ({ page }) => {
  await openBenchmark(page, 'mode=prototype-worker&number=10&seed=5566');
  const status = await page.evaluate(() => window.benchmark?.getStatus());

  expect(['prototype-worker', 'prototype-main']).toContain(status?.activeMode);
  expect(status?.canvasCount).toBe(1);
  if (status?.activeMode === 'prototype-worker') {
    expect(status.workerSupported).toBe(true);
    expect(status.fallbackReason).toBeNull();
  } else {
    expect(status?.fallbackReason).toBeTruthy();
  }
});

test('falls back before transfer when worker support is unavailable', async ({ page }) => {
  await openBenchmark(page, 'mode=prototype-worker&failure=unsupported&number=10');
  const status = await page.evaluate(() => window.benchmark?.getStatus());

  expect(status?.requestedMode).toBe('prototype-worker');
  expect(status?.activeMode).toBe('prototype-main');
  expect(status?.workerSupported).toBe(false);
  expect(status?.canvasCount).toBe(1);
  expect(status?.fallbackReason).toContain('forced unsupported');
});

test.describe('post-transfer fallbacks', () => {
  for (const failure of ['init', 'context'] as const) {
    test(`replaces the transferred canvas after ${failure} failure`, async ({ page }) => {
      await openBenchmark(page, `mode=prototype-worker&failure=${failure}&number=10`);
      const status = await page.evaluate(() => window.benchmark?.getStatus());

      expect(status?.activeMode).toBe('prototype-main');
      expect(status?.workerSupported).toBe(true);
      expect(status?.canvasCount).toBe(1);
      expect(status?.fallbackReason).toBeTruthy();
    });
  }
});

test('synchronizes options, resize, stop, restart, and permanent clear', async ({ page }) => {
  await openBenchmark(page, 'mode=prototype-worker&number=10&seed=5566');

  await page.evaluate(() => {
    window.benchmark?.setOptions({
      number: 25,
      color: '#ff0000',
      velocityXRange: [-1, 1],
    });
  });
  await page.evaluate(() => window.benchmark?.resize(640, 360));
  let status = await page.evaluate(() => window.benchmark?.getStatus());
  expect(status?.options.number).toBe(25);
  expect(status?.options.color).toBe('#ff0000');
  expect(status?.options.velocityXRange).toEqual([-1, 1]);
  expect(status?.width).toBe(640);
  expect(status?.height).toBe(360);

  await page.evaluate(() => window.benchmark?.stop());
  await page.waitForTimeout(100);
  const stoppedStats = await page.evaluate(() => window.benchmark?.getStatus());
  await page.waitForTimeout(150);
  status = await page.evaluate(() => window.benchmark?.getStatus());
  expect(status?.running).toBe(false);
  expect(status?.stats.frames).toBe(stoppedStats?.stats.frames);

  await page.evaluate(() => window.benchmark?.start());
  await page.waitForTimeout(100);
  status = await page.evaluate(() => window.benchmark?.getStatus());
  expect(status?.running).toBe(true);

  await page.evaluate(() => window.benchmark?.clear());
  await page.evaluate(() => window.benchmark?.clear());
  await page.waitForTimeout(500);
  status = await page.evaluate(() => window.benchmark?.getStatus());
  expect(status?.cleared).toBe(true);
  expect(status?.running).toBe(false);
  expect(status?.canvasCount).toBe(0);
});

test('keeps the benchmark controls responsive', async ({ page }) => {
  await openBenchmark(page, 'mode=prototype-worker&number=1000');
  const button = page.getByRole('button', { name: 'Interaction probe' });
  await button.click();
  await expect(button).toHaveAttribute('data-count', '1');
});
