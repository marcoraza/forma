import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const pageDirectory = path.join(projectRoot, 'delivery', 'output', 'pdf-vector-pages');
const outputPath = path.resolve(
  projectRoot,
  '..',
  '..',
  'downloads',
  'FORMA-x-OUI-The-Dunes-Sound-Proposal.pdf',
);
const sourceUrl = process.env.DUNES_PROPOSAL_URL
  || 'http://127.0.0.1:4194/city-of-arabia/the-dunes/delivery/the-dunes-sound-proposal-motion.html?motion=off';

await mkdir(pageDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});

try {
  const pagePaths = [];
  for (let index = 1; index <= 6; index += 1) {
    const page = await context.newPage();
    try {
      await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.locator('deck-stage section[data-deck-active]').waitFor({ timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.emulateMedia({ media: 'screen', colorScheme: 'light' });

      await page.addStyleTag({ content: `
        @page { size: 20in 11.25in; margin: 0; }
        html, body {
          width: 1920px !important;
          height: 1080px !important;
          min-width: 1920px !important;
          min-height: 1080px !important;
          margin: 0 !important;
          overflow: hidden !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
        deck-stage {
          position: fixed !important;
          inset: 0 !important;
          width: 1920px !important;
          height: 1080px !important;
        }
        deck-stage > section[data-deck-active] {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;
        }
      ` });

      await page.evaluate(() => {
        const deck = document.querySelector('deck-stage');
        if (!deck?.shadowRoot) throw new Error('Proposal deck is unavailable.');
        deck.style.setProperty('--deck-rail-w', '0px');

        const shadow = deck.shadowRoot;
        const rail = shadow.querySelector('.rail');
        const railResize = shadow.querySelector('.rail-resize');
        const stage = shadow.querySelector('.stage');
        const canvas = shadow.querySelector('.canvas');
        const overlay = shadow.querySelector('.overlay');
        if (rail) rail.style.display = 'none';
        if (railResize) railResize.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
        if (stage) stage.style.left = '0';
        if (canvas) {
          canvas.style.transform = 'scale(1)';
          canvas.style.boxShadow = 'none';
        }

        const mobileDeck = document.getElementById('dunes-mobile-deck');
        const filmFrame = document.getElementById('dunes-final-film-desktop');
        if (mobileDeck) mobileDeck.style.display = 'none';
        if (filmFrame) filmFrame.style.display = 'none';
        document.querySelectorAll('.dunes-cinema-flare, .dunes-cinema-snapshot').forEach((element) => {
          element.style.display = 'none';
        });
      });

      for (let step = 1; step < index; step += 1) {
        await page.locator('deck-stage').evaluate((deck) => {
          deck.shadowRoot.querySelector('.next').click();
        });
        await page.waitForFunction((expectedIndex) => {
          const active = document.querySelector('deck-stage section[data-deck-active]');
          return active && Number(active.dataset.deckSlide) === expectedIndex;
        }, step);
      }

      await page.locator('deck-stage').evaluate((deck) => {
        deck.querySelectorAll('section:not([data-deck-active])').forEach((section) => section.remove());
      });
      await page.waitForTimeout(120);

      const pagePath = path.join(pageDirectory, `proposal-vector-${String(index).padStart(2, '0')}.pdf`);
      await page.pdf({
        path: pagePath,
        width: '20in',
        height: '11.25in',
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        printBackground: true,
        preferCSSPageSize: true,
        pageRanges: '1',
        tagged: true,
      });
      pagePaths.push(pagePath);
    } finally {
      await page.close();
    }
  }

  await rm(outputPath, { force: true });
  const merge = spawnSync('pdfunite', [...pagePaths, outputPath], { encoding: 'utf8' });
  if (merge.status !== 0) {
    throw new Error(merge.stderr || merge.stdout || 'Could not merge proposal pages.');
  }

  process.stdout.write(`${JSON.stringify({ outputPath, pages: pagePaths.length })}\n`);
} finally {
  await context.close();
  await browser.close();
}
