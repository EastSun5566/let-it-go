import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import type { AddressInfo } from 'node:net';

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));
const modulePaths = new Map([
  ['/index.esm.js', `${projectRoot}/dist/index.esm.js`],
  ['/index.umd.js', `${projectRoot}/dist/index.umd.js`],
]);

const fixtureScript = `
  window.__workerCreated = 0;
  window.__workerReady = false;
  window.__workerTerminated = 0;
  const NativeWorker = window.Worker;
  window.Worker = class TrackedWorker extends NativeWorker {
    constructor(...args) {
      super(...args);
      window.__workerCreated += 1;
      this.addEventListener('message', ({ data }) => {
        if (data?.type === 'ready') window.__workerReady = true;
      });
    }
    terminate() {
      window.__workerTerminated += 1;
      super.terminate();
    }
  };
  window.createFillStyle = (kind) => {
    const source = document.createElement('canvas');
    source.width = 1;
    source.height = 1;
    const context = source.getContext('2d');
    if (kind === 'gradient') {
      const gradient = context.createLinearGradient(0, 0, 1, 1);
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(1, '#00ff00');
      return gradient;
    }
    context.fillStyle = '#00ff00';
    context.fillRect(0, 0, 1, 1);
    return context.createPattern(source, 'repeat');
  };
  window.startSnow = (LetItGo) => {
    const root = document.getElementById('root');
    const options = {
      root,
      renderer: new URLSearchParams(location.search).get('renderer') ?? 'worker',
      number: 8,
      velocityXRange: [0, 0],
      velocityYRange: [1, 1],
    };
    const fillStyle = new URLSearchParams(location.search).get('fillStyle');
    if (fillStyle) {
      options[fillStyle === 'gradient' ? 'color' : 'backgroundColor'] = window.createFillStyle(fillStyle);
    }
    window.snow = new LetItGo(options);
    window.__fixtureReady = true;
  };
`;

const fixtureHtml = (format: string): string => {
  const loader = format === 'umd'
    ? '<script src="/index.umd.js"></script><script>startSnow(letItGo.LetItGo)</script>'
    : '<script type="module">import { LetItGo } from "/index.esm.js"; startSnow(LetItGo)</script>';

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          html, body { margin: 0; }
          #root { width: 320px; height: 180px; }
        </style>
        <script>${fixtureScript}</script>
      </head>
      <body>
        <div id="root"></div>
        ${loader}
      </body>
    </html>`;
};

let baseURL = '';
const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const modulePath = modulePaths.get(url.pathname);
  if (modulePath) {
    response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    response.end(await readFile(modulePath));
    return;
  }

  if (url.pathname === '/') {
    if (url.searchParams.get('csp') === 'blocked') {
      response.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; worker-src 'none'",
      );
    }
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(fixtureHtml(url.searchParams.get('format') ?? 'esm'));
    return;
  }

  response.statusCode = 404;
  response.end('Not found');
});

test.beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;
  baseURL = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

for (const format of ['esm', 'umd']) {
  test(`${format.toUpperCase()} starts and controls a real Worker renderer`, async ({ page }) => {
    await page.goto(`${baseURL}/?format=${format}`);
    await page.waitForFunction(() => window.__fixtureReady && window.__workerReady);

    const initial = await page.evaluate(() => ({
      isHtmlCanvas: window.snow.canvas instanceof HTMLCanvasElement,
      workerCreated: window.__workerCreated,
      canvasCount: document.querySelectorAll('canvas').length,
      clientWidth: window.snow.canvas.clientWidth,
      clientHeight: window.snow.canvas.clientHeight,
    }));
    expect(initial).toEqual({
      isHtmlCanvas: true,
      workerCreated: 1,
      canvasCount: 1,
      clientWidth: 320,
      clientHeight: 180,
    });

    await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) throw new Error('Missing fixture root.');
      root.style.width = '480px';
      root.style.height = '240px';
      window.snow.velocityXRange = [10, 2];
      window.snow.color = '#abcdef';
      window.snow.letItStop();
      window.snow.letItGoAgain();
    });
    await expect.poll(() => page.evaluate(() => ({
      width: window.snow.canvas.clientWidth,
      height: window.snow.canvas.clientHeight,
    }))).toEqual({ width: 480, height: 240 });
    expect(await page.evaluate(() => window.snow.velocityXRange)).toEqual([2, 10]);

    await page.evaluate(() => window.snow.clear());
    await expect.poll(() => page.evaluate(() => window.__workerTerminated)).toBe(1);
    expect(await page.locator('canvas').count()).toBe(0);
  });
}

for (const renderer of ['main', 'worker']) {
  test(`${renderer} keeps its paused bitmap after resize`, async ({ page }) => {
    await page.goto(`${baseURL}/?renderer=${renderer}`);
    await page.waitForFunction(() => window.__fixtureReady
      && (window.__workerReady || window.__workerCreated === 0));
    await page.evaluate(() => {
      window.snow.number = 0;
      window.snow.backgroundColor = '#00ff00';
    });
    const pixel = () => page.evaluate(() => {
      const copy = document.createElement('canvas');
      copy.width = 1;
      copy.height = 1;
      const context = copy.getContext('2d');
      if (!context) throw new Error('Missing copy context.');
      context.drawImage(window.snow.canvas, 0, 0);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    });
    await expect.poll(pixel).toEqual([0, 255, 0, 255]);
    await page.evaluate(() => {
      window.snow.letItStop();
      const root = document.getElementById('root');
      if (!root) throw new Error('Missing fixture root.');
      root.style.width = '480px';
      root.style.height = '240px';
    });
    await expect.poll(() => page.evaluate(() => window.snow.canvas.clientWidth)).toBe(480);
    // Wait until the resize observer/Worker have processed the new layout.
    await page.evaluate(() => new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));
    await expect.poll(pixel).toEqual([0, 255, 0, 255]);
    await page.evaluate(() => window.snow.clear());
    expect(await page.locator('canvas').count()).toBe(0);
  });
}

for (const fillStyle of ['gradient', 'pattern'] as const) {
  const option = fillStyle === 'gradient' ? 'color' : 'backgroundColor';
  test(`${fillStyle} falls back before transfer at construction and safely after transfer through a setter`, async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') warnings.push(message.text());
    });

    await page.goto(`${baseURL}/?fillStyle=${fillStyle}`);
    await page.waitForFunction(() => window.__fixtureReady);
    expect(await page.evaluate(() => window.__workerCreated)).toBe(0);
    expect(await page.locator('canvas').count()).toBe(1);

    await page.goto(baseURL);
    await page.waitForFunction(() => window.__fixtureReady && window.__workerReady);
    expect(await page.evaluate(({ kind, key }) => {
      const canvas = window.snow.canvas;
      const style = window.createFillStyle(kind);
      window.snow.number = 0;
      window.snow[key] = style;
      return {
        replaced: canvas !== window.snow.canvas,
        preserved: window.snow[key] === style,
        terminated: window.__workerTerminated,
      };
    }, { kind: fillStyle, key: option } as const)).toEqual({ replaced: true, preserved: true, terminated: 1 });

    await page.evaluate(() => new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));
    expect(await page.evaluate((key) => {
      const context = window.snow.canvas.getContext('2d');
      if (!context) throw new Error('Fallback context is missing.');
      return key === 'color'
        ? context.fillStyle === window.snow.color
        : Array.from(context.getImageData(0, 0, 1, 1).data).join(',') === '0,255,0,255';
    }, option)).toBe(true);
    expect(await page.locator('canvas').count()).toBe(1);
    expect(warnings.filter((warning) => warning.includes('falling back to the main thread'))).toHaveLength(2);
    await page.evaluate(() => window.snow.clear());
    expect(await page.locator('canvas').count()).toBe(0);
  });
}

test('CSP-blocked Blob Workers transparently fall back to the main thread', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning') warnings.push(message.text());
  });

  await page.goto(`${baseURL}/?format=esm&csp=blocked`);
  await page.waitForFunction(() => window.__fixtureReady && window.__workerTerminated === 1);

  expect(await page.evaluate(() => ({
    isHtmlCanvas: window.snow.canvas instanceof HTMLCanvasElement,
    canvasCount: document.querySelectorAll('canvas').length,
    workerReady: window.__workerReady,
  }))).toEqual({ isHtmlCanvas: true, canvasCount: 1, workerReady: false });
  expect(warnings.some((warning) => warning.includes('falling back to the main thread'))).toBe(true);

  await page.evaluate(() => window.snow.clear());
  expect(await page.locator('canvas').count()).toBe(0);
});

declare global {
  interface Window {
    __fixtureReady: boolean;
    __workerCreated: number;
    __workerReady: boolean;
    __workerTerminated: number;
    createFillStyle(kind: 'gradient' | 'pattern'): CanvasGradient | CanvasPattern;
    snow: {
      canvas: HTMLCanvasElement;
      number: number;
      color: CanvasFillStrokeStyles['fillStyle'];
      backgroundColor: CanvasFillStrokeStyles['fillStyle'];
      velocityXRange: readonly [number, number];
      letItStop(): void;
      letItGoAgain(): void;
      clear(): void;
    };
  }
}
