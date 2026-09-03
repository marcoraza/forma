import { chromium } from "playwright";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const sourceUrl = process.env.DUNES_RENDER_URL || "http://127.0.0.1:4194/thedunes.html";
const fps = 30;
const duration = 42;
const frameCount = fps * duration;
const workerCount = 4;
const outputDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "dunes-film-4k-frames-"));
const browser = await chromium.launch({ headless: true });

const preparePage = async () => {
  const context = await browser.newContext({
    viewport: { width: 3840, height: 2160 },
    screen: { width: 3840, height: 2160 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto(sourceUrl, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => document.documentElement.classList.contains("dunes-ready"),
    null,
    { timeout: 20_000 },
  );
  await page.locator('svg[data-om-exportable-video-with-duration-secs="42"]').waitFor();
  await page.addStyleTag({ content: `
    #dunes-master-video,
    #dunes-film-poster,
    #dunes-sound-gate,
    #dunes-player-controls,
    #dunes-ambient,
    .dunes-screen-next { display: none !important; }
    html, body, #dunes-landing, #dunes-film-screen { width: 3840px !important; height: 2160px !important; min-height: 2160px !important; overflow: hidden !important; }
  ` });
  await page.evaluate(() => {
    const chrome = document.querySelector('[data-om-starter="animations-v3"] [data-omelette-chrome="true"]');
    const progress = chrome?.children[3];
    if (!chrome || !progress) throw new Error("Film timeline controls unavailable.");
    chrome.style.setProperty("display", "flex", "important");
    chrome.style.setProperty("position", "fixed", "important");
    chrome.style.setProperty("top", "-220px", "important");
    chrome.style.setProperty("left", "0", "important");
    chrome.style.setProperty("width", "680px", "important");
    chrome.style.setProperty("max-width", "680px", "important");
    chrome.style.setProperty("visibility", "hidden", "important");
    chrome.style.setProperty("pointer-events", "none", "important");

    window.__dunesCaptureSeek = (target) => new Promise((resolve) => {
      const rect = progress.getBoundingClientRect();
      const clientX = rect.left + (target / 42) * rect.width;
      const clientY = rect.top + rect.height / 2;
      for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
        const EventType = type.startsWith("pointer") ? PointerEvent : MouseEvent;
        progress.dispatchEvent(new EventType(type, {
          bubbles: true,
          button: 0,
          buttons: type.endsWith("down") ? 1 : 0,
          clientX,
          clientY,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
        }));
      }
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  });
  return { context, page, cdp: await context.newCDPSession(page) };
};

const renderWorker = async (workerIndex) => {
  const { context, page, cdp } = await preparePage();
  const start = Math.floor((frameCount * workerIndex) / workerCount);
  const end = Math.floor((frameCount * (workerIndex + 1)) / workerCount);
  for (let frame = start; frame < end; frame += 1) {
    await page.evaluate((time) => window.__dunesCaptureSeek(time), frame / fps);
    const { data } = await cdp.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 100,
      fromSurface: true,
      captureBeyondViewport: false,
      optimizeForSpeed: true,
    });
    await fs.writeFile(
      path.join(outputDirectory, `frame-${String(frame).padStart(5, "0")}.jpg`),
      Buffer.from(data, "base64"),
    );
    if ((frame - start + 1) % 30 === 0 || frame + 1 === end) {
      process.stdout.write(`worker ${workerIndex + 1}: ${frame - start + 1}/${end - start}\n`);
    }
  }
  await context.close();
};

try {
  await Promise.all(Array.from({ length: workerCount }, (_, index) => renderWorker(index)));
  process.stdout.write(`${JSON.stringify({ outputDirectory, frameCount, fps, duration })}\n`);
} finally {
  await browser.close();
}
