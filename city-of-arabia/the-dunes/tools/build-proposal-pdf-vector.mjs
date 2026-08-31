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
const rawOutputPath = outputPath.replace(/\.pdf$/i, '-raw.pdf');
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
        const active = deck.querySelector('section[data-deck-active]');
        const walker = document.createTreeWalker(deck, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const value = walker.currentNode.nodeValue
            .replaceAll('🇬🇧 ', '')
            .replaceAll('🇧🇷 ', '')
            .replaceAll('🇦🇪 ', '');
          walker.currentNode.nodeValue = /LONDON\s*·\s*BRAZIL\s*·\s*DUBAI/i.test(value)
            ? ''
            : value;
        }

        deck.querySelectorAll('.dunes-cinema-light, .dunes-cinema-vignette').forEach((element) => {
          element.style.display = 'none';
        });
        active?.querySelectorAll('*').forEach((element) => {
          if (getComputedStyle(element).mixBlendMode !== 'normal') element.style.display = 'none';
        });

        const label = active?.dataset.label;
        if (label === 'Cover') {
          const background = active.querySelector('.bg');
          if (background) background.style.background = 'radial-gradient(ellipse at 55% 62%, #ffeecd 0%, #e8e5de 76%)';
        }
        if (label === 'Opening') {
          const background = active.querySelector('.bg');
          const light = active.querySelector('.bg2');
          if (background) background.style.background = 'linear-gradient(180deg, #c9d2e0 0%, #e8e5de 58%, #d6ccbd 100%)';
          if (light) light.style.display = 'none';
        }
        if (label === 'The work') {
          const light = active.querySelector('.bg2');
          if (light) light.style.display = 'none';
        }
        if (label === 'Four days') {
          const light = active.querySelector('.bg2');
          if (light) light.style.display = 'none';
          active.querySelectorAll('.fxf').forEach((element) => {
            if (getComputedStyle(element).backgroundImage !== 'none') {
              element.style.background = '#e4dcd4';
            }
          });
        }
        if (label === 'Investment') {
          const background = active.querySelector('.bg');
          if (background) background.style.background = 'radial-gradient(ellipse at 42% 36%, #ffe7ba 0%, #e8e5de 76%)';
        }
        if (label === 'Close') {
          const dawn = active.querySelector('.dawn2');
          if (dawn) dawn.style.display = 'none';

          const animatedO = active.querySelector('forma-lockup svg #sym');
          if (animatedO) {
            const normalO = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            normalO.setAttribute('font-family', "Newsreader, 'Times New Roman', serif");
            normalO.setAttribute('font-size', '803');
            normalO.setAttribute('font-weight', '359');
            normalO.setAttribute('x', '414');
            normalO.setAttribute('y', '0');
            normalO.setAttribute('fill', '#000000');
            normalO.style.fontVariationSettings = '"wght" 359, "opsz" 46';
            normalO.textContent = 'O';
            animatedO.replaceWith(normalO);
          }

          active.querySelectorAll('.fxf').forEach((element) => {
            if (element.textContent.trim() === 'sound takes different forms') {
              element.textContent = 'every film has a rhythm · every sound finds its form';
            }
          });
        }

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

  await rm(rawOutputPath, { force: true });
  const merge = spawnSync('pdfunite', [...pagePaths, rawOutputPath], { encoding: 'utf8' });
  if (merge.status !== 0) {
    throw new Error(merge.stderr || merge.stdout || 'Could not merge proposal pages.');
  }

  await rm(outputPath, { force: true });
  const compatibility = spawnSync('gs', [
    '-q',
    '-dSAFER',
    '-dBATCH',
    '-dNOPAUSE',
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.7',
    '-dPDFSETTINGS=/prepress',
    '-dAutoRotatePages=/None',
    '-dEmbedAllFonts=true',
    '-dSubsetFonts=true',
    '-dCompressFonts=true',
    '-dDetectDuplicateImages=true',
    `-sOutputFile=${outputPath}`,
    rawOutputPath,
  ], { encoding: 'utf8' });
  if (compatibility.status !== 0) {
    throw new Error(compatibility.stderr || compatibility.stdout || 'Could not finalize the compatible PDF.');
  }
  await rm(rawOutputPath, { force: true });

  process.stdout.write(`${JSON.stringify({ outputPath, pages: pagePaths.length })}\n`);
} finally {
  await context.close();
  await browser.close();
}
