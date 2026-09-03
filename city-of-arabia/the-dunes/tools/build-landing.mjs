import fs from "node:fs/promises";
import zlib from "node:zlib";

const sourcePath = "/Users/marko/Downloads/The Dunes - Film (standalone).html";
const audioPath = "/Users/marko/Projects/business/FORMA /city-of-arabia/the-dunes/delivery/tmp/the-dunes-track-42s-pcm24.wav";
const audioPublicPath = "/media/the-dunes-track-42s-pcm24.wav";
const mediaDirectoryPath = "/Users/marko/Projects/business/FORMA /media";
const audioOutputPath = `${mediaDirectoryPath}/the-dunes-track-42s-pcm24.wav`;
const pdfSourcePath = "/Users/marko/Projects/business/FORMA /city-of-arabia/the-dunes/delivery/output/pdf/FORMA x OUI - The Dunes - Sound Proposal.pdf";
const downloadDirectoryPath = "/Users/marko/Projects/business/FORMA /downloads";
const pdfOutputPath = `${downloadDirectoryPath}/FORMA-x-OUI-The-Dunes-Sound-Proposal.pdf`;
const outputPath = "/Users/marko/Projects/business/FORMA /thedunes.html";

const source = await fs.readFile(sourcePath, "utf8");
const audio = await fs.readFile(audioPath);

const manifestPattern = /(<script type="__bundler\/manifest">\s*)([\s\S]*?)(\s*<\/script>)/;
const manifestMatch = source.match(manifestPattern);
if (!manifestMatch) throw new Error("Bundled resource manifest not found.");

const manifest = JSON.parse(manifestMatch[2]);
const audioEntries = Object.entries(manifest).filter(([, entry]) => entry.mime === "audio/wav");
if (audioEntries.length !== 1) {
  throw new Error(`Expected one WAV resource, found ${audioEntries.length}.`);
}

const [audioResourceId, audioResource] = audioEntries[0];
audioResource.mime = "audio/wav";
audioResource.compressed = false;
audioResource.external = true;
audioResource.url = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
audioResource.data = "";

const filmRuntimeEntry = Object.values(manifest).find((entry) => {
  if (entry.mime !== "text/jsx" || !entry.compressed || !entry.data) return false;
  try {
    const source = zlib.gunzipSync(Buffer.from(entry.data, "base64")).toString("utf8");
    return source.includes("function CompositionStage(props)");
  } catch {
    return false;
  }
});
if (!filmRuntimeEntry) throw new Error("Film timeline runtime not found.");

const filmRuntimeSource = zlib.gunzipSync(Buffer.from(filmRuntimeEntry.data, "base64")).toString("utf8");
const autoplayNeedle = "var autoplay = props.autoplay == null ? true : String(props.autoplay) !== 'false';";
if (!filmRuntimeSource.includes(autoplayNeedle)) throw new Error("Film autoplay default not found.");
filmRuntimeEntry.data = zlib.gzipSync(
  Buffer.from(filmRuntimeSource.replace(
    autoplayNeedle,
    "var autoplay = props.autoplay == null ? false : String(props.autoplay) !== 'false';",
  )),
  { level: 9 },
).toString("base64");

let output = source.replace(
  manifestPattern,
  `$1${JSON.stringify(manifest)}$3`,
);

const decodeEntryNeedle = String.raw`      try {
        const binaryStr = atob(entry.data);`;
const decodeEntryReplacement = String.raw`      try {
        if (entry.external && entry.url) {
          blobUrls[uuid] = entry.url;
          return;
        }
        const binaryStr = atob(entry.data);`;
if (!output.includes(decodeEntryNeedle)) throw new Error("Bundled resource decoder not found.");
output = output.replace(decodeEntryNeedle, decodeEntryReplacement);

const outerHeadInjection = String.raw`
<style id="dunes-outer-boot-styles">
  html.dunes-booting,
  html.dunes-booting body {
    overflow: hidden !important;
    background: #e8e5de !important;
  }

  html.dunes-booting::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    background:
      radial-gradient(ellipse at 72% 76%, rgba(255, 232, 187, .38), transparent 38%),
      linear-gradient(145deg, #faf9f5 0%, #e8e5de 56%, #e4dcd4 100%);
  }

  html.dunes-booting::after {
    content: '';
    position: fixed;
    left: 50%;
    bottom: max(28px, env(safe-area-inset-bottom));
    z-index: 2147483647;
    width: 28px;
    height: 1px;
    background: rgba(0, 0, 0, .48);
    transform: translate3d(-50%, 0, 0) scaleX(.34);
    transform-origin: 50% 50%;
    animation: dunes-boot-pulse 1.8s cubic-bezier(.4, 0, .2, 1) infinite;
  }

  @keyframes dunes-boot-pulse {
    0%, 100% { opacity: .3; transform: translate3d(-50%, 0, 0) scaleX(.34); }
    50% { opacity: .8; transform: translate3d(-50%, 0, 0) scaleX(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    html:not(.dunes-ready)::after {
      animation: none !important;
      opacity: .6;
    }

    html.dunes-booting::after { animation: none; opacity: .6; }
  }
</style>
<script>
  (() => {
    const resetScroll = () => window.scrollTo(0, 0);
    document.documentElement.classList.add('dunes-booting');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    try { localStorage.setItem('animstage-v3:t', '0'); } catch (_) {}
    window.__dunesResetScroll = resetScroll;
    resetScroll();
    window.addEventListener('pageshow', resetScroll);
  })();
</script>`;

output = output.replace("</head>", `${outerHeadInjection}\n</head>`);

const templatePattern = /(<script type="__bundler\/template">\s*)([\s\S]*?)(\s*<\/script>)/;
const templateMatch = output.match(templatePattern);
if (!templateMatch) throw new Error("Bundled HTML template not found.");

let template = JSON.parse(templateMatch[2]);
const audioTagNeedle = `<audio data-sfx="" src="${audioResourceId}" preload="none"`;
if (!template.includes(audioTagNeedle)) throw new Error("Bundled audio element not found.");

const headInjection = String.raw`
<title>The Dunes | Sound Proposal</title>
<meta name="description" content="Original score and sound design proposal for The Dunes.">
<meta name="theme-color" content="#e8e3dc">
<meta property="og:title" content="The Dunes | Sound Proposal">
<meta property="og:description" content="Original score and sound design by FORMA.">
  <meta property="og:type" content="website">
  <link rel="preload" href="/media/the-dunes-poster-typewriting.webp" as="image" type="image/webp" fetchpriority="high">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2311100f'/%3E%3Cpath d='M24 18v28l22-14-22-14Z' fill='%23f3f0eb'/%3E%3C/svg%3E">
<style id="dunes-player-styles">
  :root {
    --dunes-paper: #e4dcd4;
    --dunes-paper-light: #ffffff;
    --dunes-bone: #e8e5de;
    --dunes-ink: #000000;
    --dunes-ink-soft: rgba(0, 0, 0, .55);
    --dunes-line: rgba(0, 0, 0, .16);
    --dunes-cobalt-1: #c9d2e0;
    --dunes-cobalt-2: #8e9dbe;
    --dunes-cobalt-4: #3f5e9e;
    --dunes-cobalt-6: #1f3258;
    --dunes-cobalt-ink: #16264a;
    --dunes-cobalt-fg: #eaeff8;
    --dunes-serif: 'Newsreader', Georgia, 'Times New Roman', serif;
    --dunes-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    --dunes-ease: cubic-bezier(.4, 0, .2, 1);
    --dunes-page-pad: 64px;
    --dunes-page-max: 1280px;
  }

  html:not(.dunes-ready),
  html:not(.dunes-ready) body {
    overflow: hidden !important;
    background: var(--dunes-bone) !important;
  }

  html:not(.dunes-ready)::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    background:
      radial-gradient(ellipse at 72% 76%, rgba(255, 232, 187, .38), transparent 38%),
      linear-gradient(145deg, #faf9f5 0%, #e8e5de 56%, #e4dcd4 100%);
  }

  html:not(.dunes-ready)::after {
    content: '';
    position: fixed;
    left: 50%;
    bottom: max(28px, env(safe-area-inset-bottom));
    z-index: 2147483647;
    width: 28px;
    height: 1px;
    background: rgba(0, 0, 0, .48);
    transform: translate3d(-50%, 0, 0) scaleX(.34);
    transform-origin: 50% 50%;
    animation: dunes-boot-pulse 1.8s var(--dunes-ease) infinite;
  }

  html {
    width: 100%;
    height: 100%;
    min-width: 320px;
    margin: 0;
    overflow-x: clip;
    overflow-y: visible;
    scroll-behavior: smooth;
    scroll-snap-type: none;
    background: var(--dunes-paper-light);
    overflow-anchor: none;
  }

  body {
    width: 100%;
    min-width: 320px;
    min-height: 300dvh;
    margin: 0;
    overflow-x: clip;
    overflow-y: visible;
    background: var(--dunes-paper-light);
    overflow-anchor: none;
  }

  #dunes-landing {
    position: relative;
    width: 100%;
    overflow: clip;
  }

  svg[data-om-exportable-video-with-duration-secs="42"] {
    width: 1920px !important;
    height: 1080px !important;
    display: block !important;
    flex-shrink: 0 !important;
    transform: var(--dunes-film-transform, scale(1)) !important;
    transform-origin: center center !important;
    box-shadow: none !important;
  }

  #dunes-ambient {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    background: #e8e5de;
  }

  .dunes-ambient-layer {
    position: absolute;
    inset: -8%;
    transform: scale(1.04);
    transition: opacity 800ms linear;
  }

  .dunes-ambient-warm {
    background:
      radial-gradient(ellipse at 78% 76%, rgba(255, 232, 187, .72), transparent 38%),
      linear-gradient(145deg, #faf9f5 0%, #e8e5de 56%, #e4dcd4 100%);
    opacity: var(--dunes-ambient-warm, 1);
  }

  .dunes-ambient-sand {
    background:
      radial-gradient(ellipse at 20% 55%, rgba(255, 239, 208, .66), transparent 42%),
      linear-gradient(160deg, #faf9f5 0%, #eae4d9 48%, #bdb4a8 100%);
    opacity: var(--dunes-ambient-sand, 0);
  }

  .dunes-ambient-cool {
    background:
      radial-gradient(ellipse at 50% 82%, rgba(255, 239, 208, .58), transparent 40%),
      linear-gradient(180deg, #aab5c4 0%, #cdcFCC 34%, #e8e5de 68%, #faf9f5 100%);
    opacity: var(--dunes-ambient-cool, 0);
  }

  #dunes-ambient::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 38%, rgba(42, 18, 21, .045) 100%);
  }

  #dunes-film-poster {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 2;
    width: 1920px;
    height: 1080px;
    max-width: none;
    display: block;
    object-fit: cover;
    opacity: 1;
    pointer-events: none;
    transform: translate3d(-50%, -50%, 0) scale(1);
    transform-origin: center;
    transition: opacity 180ms ease, visibility 0s linear 0s;
    will-change: transform, opacity;
  }

  #dunes-master-video {
    position: absolute;
    inset: 0;
    z-index: 3;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    object-position: center;
    background: var(--dunes-bone);
  }

  html[data-dunes-started="true"] #dunes-film-poster {
    opacity: 0;
    visibility: hidden;
    transition: opacity 180ms ease, visibility 0s linear 180ms;
  }

  [data-dunes-pagination="hidden"] {
    display: none !important;
  }

  [data-om-starter="animations-v3"] > [data-omelette-chrome="true"] {
    position: absolute !important;
    top: -220px !important;
    left: 0 !important;
    width: 680px !important;
    max-width: 680px !important;
    display: flex !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  #dunes-sound-gate,
  #dunes-player-controls,
  .dunes-screen,
  .dunes-screen * {
    box-sizing: border-box;
  }

  #dunes-sound-gate *,
  #dunes-player-controls * {
    box-sizing: border-box;
  }

  #dunes-sound-gate {
    position: absolute;
    inset: 0;
    z-index: 2147483000;
    display: grid;
    place-items: center;
    color: #fff;
    background: transparent;
    opacity: 1;
    visibility: visible;
    transition: opacity 240ms ease, visibility 0s linear 0s;
  }

  #dunes-sound-gate.is-dismissed {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 240ms ease, visibility 0s linear 240ms;
  }

  .dunes-start-button,
  .dunes-gate-action,
  .dunes-control-button {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .dunes-start-button {
    width: 72px;
    height: 72px;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, .38);
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: rgba(16, 16, 16, .16);
    color: #fff;
    box-shadow: 0 12px 36px rgba(0, 0, 0, .18), inset 0 1px 0 rgba(255, 255, 255, .14);
    backdrop-filter: blur(12px) saturate(115%);
    -webkit-backdrop-filter: blur(12px) saturate(115%);
    opacity: 1;
    transform: translate3d(0, 90px, 0) scale(1);
    transition: transform 180ms var(--dunes-ease), background-color 180ms ease, opacity 180ms ease;
  }

  .dunes-start-button:hover {
    background: rgba(16, 16, 16, .26);
    transform: translate3d(0, 90px, 0) scale(1.04);
  }

  .dunes-start-button:active {
    transform: translate3d(0, 90px, 0) scale(.96);
  }

  .dunes-start-button svg {
    width: 22px;
    height: 24px;
    margin-left: 4px;
    fill: currentColor;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, .28));
  }

  #dunes-sound-gate.is-choosing .dunes-start-button {
    pointer-events: none;
    opacity: 0;
    transform: translate3d(0, 90px, 0) scale(.9);
  }

  .dunes-orientation-hint {
    position: absolute;
    left: 50%;
    top: calc(50% + 142px);
    width: max-content;
    max-width: calc(100vw - 40px);
    min-height: 34px;
    padding: 7px 11px 7px 9px;
    border: 1px solid rgba(255, 255, 255, .18);
    border-radius: 999px;
    display: none;
    align-items: center;
    gap: 7px;
    background: rgba(17, 17, 17, .42);
    color: rgba(255, 255, 255, .88);
    box-shadow: 0 10px 28px rgba(0, 0, 0, .12), inset 0 1px 0 rgba(255, 255, 255, .08);
    backdrop-filter: blur(14px) saturate(115%);
    -webkit-backdrop-filter: blur(14px) saturate(115%);
    font-family: var(--dunes-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .025em;
    line-height: 1.25;
    opacity: 0;
    pointer-events: none;
    transform: translate3d(-50%, 8px, 0) scale(.96);
    transition: opacity 220ms ease, transform 240ms var(--dunes-ease);
  }

  html.dunes-handset .dunes-orientation-hint {
    display: flex;
  }

  html.dunes-handset .dunes-orientation-hint.is-visible {
    opacity: 1;
    transform: translate3d(-50%, 0, 0) scale(1);
  }

  .dunes-orientation-hint svg {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    overflow: visible;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.35;
    transform: rotate(-90deg);
    transform-origin: center;
  }

  .dunes-sound-choice {
    position: absolute;
    left: 50%;
    top: calc(50% + 90px);
    width: 104px;
    height: 52px;
    padding: 4px;
    border: 1px solid rgba(255, 255, 255, .2);
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(17, 17, 17, .54);
    color: #fff;
    box-shadow: 0 12px 36px rgba(0, 0, 0, .16), inset 0 1px 0 rgba(255, 255, 255, .1);
    backdrop-filter: blur(18px) saturate(120%);
    -webkit-backdrop-filter: blur(18px) saturate(120%);
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -50%) scale(.72);
    transform-origin: 50% 50%;
    transition: opacity 180ms ease, transform 220ms var(--dunes-ease);
  }

  #dunes-sound-gate.is-choosing .dunes-sound-choice {
    opacity: 1;
    pointer-events: auto;
    transform: translate(-50%, -50%) scale(1);
  }

  .dunes-visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  .dunes-gate-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    margin: 0;
  }

  .dunes-gate-action {
    width: 44px;
    height: 44px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: #fff;
    transition: transform 120ms ease, background-color 160ms ease, opacity 160ms ease;
  }

  .dunes-gate-action:hover {
    background: rgba(255, 255, 255, .13);
  }

  .dunes-gate-action:active {
    transform: scale(.92);
  }

  .dunes-gate-action:focus-visible,
  .dunes-start-button:focus-visible,
  .dunes-control-button:focus-visible {
    outline: 2px solid rgba(255, 255, 255, .9);
    outline-offset: 3px;
  }

  .dunes-gate-action-primary {
    background: rgba(255, 255, 255, .14);
  }

  .dunes-gate-action-secondary {
    background: transparent;
    opacity: .72;
  }

  .dunes-gate-action-secondary:hover {
    opacity: 1;
  }

  .dunes-gate-action svg {
    width: 19px;
    height: 19px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.45;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  #dunes-sound-gate.is-choosing .dunes-gate-action-primary .dunes-choice-wave-far {
    animation: dunes-choice-wave 1.8s ease-in-out infinite;
  }

  .dunes-gate-action[disabled] {
    cursor: wait;
    opacity: .58;
    transform: none;
  }

  .dunes-gate-status {
    position: absolute;
    left: 50%;
    top: calc(100% + 9px);
    width: max-content;
    max-width: min(280px, calc(100vw - 32px));
    min-height: 0;
    margin: 0;
    color: rgba(255, 255, 255, .72);
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
    font-size: 10px;
    line-height: 1.35;
    text-align: center;
    transform: translateX(-50%);
  }

  #dunes-player-controls {
    position: absolute;
    left: 50%;
    bottom: max(20px, env(safe-area-inset-bottom));
    z-index: 2147482000;
    display: flex;
    align-items: center;
    gap: 2px;
    min-height: 46px;
    padding: 4px;
    border: 1px solid rgba(255, 255, 255, .18);
    border-radius: 999px;
    background: rgba(17, 17, 17, .52);
    color: #fff;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
    backdrop-filter: blur(18px) saturate(120%);
    -webkit-backdrop-filter: blur(18px) saturate(120%);
    opacity: 0;
    visibility: hidden;
    transform: translate(-50%, 8px);
    transition: opacity 180ms ease, transform 180ms ease, visibility 0s linear 180ms;
  }

  #dunes-player-controls.is-active.is-visible {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, 0);
    transition: opacity 180ms ease, transform 180ms ease, visibility 0s linear 0s;
  }

  .dunes-control-button {
    width: 36px;
    height: 36px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: transparent;
    color: inherit;
    transition: transform 120ms ease, background-color 160ms ease;
  }

  .dunes-control-button:hover {
    background: rgba(255, 255, 255, .12);
  }

  .dunes-chapter-button {
    opacity: .68;
  }

  .dunes-chapter-button:hover {
    opacity: 1;
  }

  .dunes-control-button:disabled {
    cursor: default;
    opacity: .22;
    transform: none;
  }

  .dunes-control-divider {
    width: 1px;
    height: 18px;
    margin: 0 2px;
    background: rgba(255, 255, 255, .16);
  }

  .dunes-control-button:active {
    transform: scale(.92);
  }

  .dunes-control-button svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .dunes-control-button .dunes-icon-fill {
    fill: currentColor;
    stroke: none;
  }

  #dunes-toggle-play .dunes-icon-pause,
  #dunes-toggle-sound .dunes-icon-sound-off,
  #dunes-fullscreen .dunes-icon-contract {
    display: none;
  }

  #dunes-toggle-play[data-state="pause"] .dunes-icon-play,
  #dunes-toggle-sound[data-muted="true"] .dunes-icon-sound-on,
  #dunes-fullscreen[data-fullscreen="true"] .dunes-icon-expand {
    display: none;
  }

  #dunes-toggle-play[data-state="pause"] .dunes-icon-pause,
  #dunes-toggle-sound[data-muted="true"] .dunes-icon-sound-off,
  #dunes-fullscreen[data-fullscreen="true"] .dunes-icon-contract {
    display: block;
  }

  .dunes-screen {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100dvh;
    min-height: 100dvh;
    overflow: hidden;
    scroll-snap-align: none;
    isolation: isolate;
    contain: layout paint style;
    transform-origin: 50% 0;
    backface-visibility: hidden;
  }

  .dunes-screen.is-covered {
    visibility: hidden;
    pointer-events: none;
  }

  #dunes-film-screen {
    z-index: 1;
    background: var(--dunes-bone);
  }

  .dunes-screen-next {
    position: absolute;
    right: max(34px, env(safe-area-inset-right));
    bottom: max(24px, env(safe-area-inset-bottom));
    z-index: 18;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: 0;
    display: grid;
    place-items: center;
    background: transparent;
    color: currentColor;
    font-family: var(--dunes-mono);
    font-size: 18px;
    line-height: 1;
    opacity: .58;
    cursor: pointer;
    transition: opacity .25s var(--dunes-ease);
  }

  .dunes-screen-next:hover {
    opacity: 1;
  }

  .dunes-screen-next:focus-visible,
  .dunes-action-link:focus-visible,
  .dunes-contact-link:focus-visible,
  .dunes-symbol-link:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: 8px;
  }

  .dunes-screen-next span {
    display: block;
  }

  #dunes-film-screen .dunes-screen-next {
    left: 50%;
    right: auto;
    bottom: max(18px, env(safe-area-inset-bottom));
    width: 34px;
    height: 66px;
    color: #fff;
    opacity: .78;
    mix-blend-mode: difference;
    text-shadow: none;
    transform: translateX(-50%);
    z-index: 2147483001;
  }

  #dunes-sound-gate.is-choosing:not(.is-dismissed) ~ .dunes-screen-next {
    opacity: 0;
    pointer-events: none;
  }

  #dunes-film-screen .dunes-screen-next::before {
    content: '';
    position: absolute;
    top: 1px;
    left: 50%;
    width: 1px;
    height: 36px;
    background: currentColor;
    transform: translateX(-50%) scaleY(.24);
    transform-origin: 50% 0;
  }

  #dunes-film-screen .dunes-screen-next span {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    font-size: 15px;
    font-weight: 300;
    text-align: center;
    transform: none;
  }

  #dunes-player-controls.is-active + .dunes-screen-next {
    left: auto;
    right: max(34px, env(safe-area-inset-right));
    bottom: max(24px, env(safe-area-inset-bottom));
    width: 40px;
    height: 40px;
    transform: none;
  }

  #dunes-player-controls.is-active + .dunes-screen-next::before {
    display: none;
  }

  #dunes-player-controls.is-active + .dunes-screen-next span {
    position: static;
    transform: none;
  }

  .dunes-screen-transition {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 14;
    height: clamp(62px, 10vh, 108px);
    overflow: hidden;
    pointer-events: none;
    opacity: .78;
    transform: translate3d(0, -48%, 0) scaleY(.82);
    transform-origin: 50% 0;
    will-change: transform, opacity;
  }

  .dunes-screen-transition::after {
    content: '';
    position: absolute;
    inset: 0;
    border-top: 1px solid rgba(255, 255, 255, .68);
    background: linear-gradient(180deg, rgba(255, 255, 255, .44), rgba(255, 255, 255, .11) 34%, rgba(255, 255, 255, 0) 100%);
  }

  #dunes-project-screen .dunes-screen-transition {
    background: linear-gradient(180deg, rgba(174, 184, 198, .78), rgba(232, 229, 222, .42) 42%, rgba(228, 220, 212, 0) 100%);
  }

  #dunes-contact-screen .dunes-screen-transition {
    background: linear-gradient(180deg, rgba(31, 50, 88, .88), rgba(63, 94, 158, .48) 42%, rgba(142, 157, 190, 0) 100%);
  }

  @supports (animation-timeline: scroll()) {
    #dunes-project-screen {
      animation: dunes-page-stack linear both;
      animation-timeline: scroll(root block);
      animation-range: 0% 50%;
    }

    #dunes-contact-screen {
      animation: dunes-page-stack linear both;
      animation-timeline: scroll(root block);
      animation-range: 50% 100%;
    }

    #dunes-project-screen .dunes-screen-transition {
      animation: dunes-page-edge linear both;
      animation-timeline: scroll(root block);
      animation-range: 0% 50%;
    }

    #dunes-contact-screen .dunes-screen-transition {
      animation: dunes-page-edge linear both;
      animation-timeline: scroll(root block);
      animation-range: 50% 100%;
    }
  }

  html.dunes-stack-fallback #dunes-project-screen,
  html.dunes-stack-fallback #dunes-contact-screen {
    transform: perspective(2200px) translate3d(0, 12vh, 0) rotateX(-7deg) scale(.985);
    transition: transform .82s cubic-bezier(.23, 1, .32, 1);
  }

  html.dunes-stack-fallback .dunes-screen.is-stack-active {
    transform: perspective(2200px) translate3d(0, 0, 0) rotateX(0deg) scale(1);
  }

  html.dunes-stack-fallback .dunes-screen.is-stack-active .dunes-screen-transition {
    opacity: 0;
    transform: translate3d(0, -100%, 0) scaleY(.3);
    transition: opacity .8s var(--dunes-ease), transform 1s cubic-bezier(.16, 1, .3, 1);
  }

  #dunes-project-screen {
    z-index: 2;
    color: var(--dunes-ink);
    background: linear-gradient(180deg, #aeb8c6 0%, #cfd0cd 18%, #e8e5de 42%, #e4dcd4 80%, #d7cfc5 100%);
    background-size: 120% 130%;
  }

  #dunes-project-screen::before {
    content: '';
    position: absolute;
    inset: -10%;
    z-index: -2;
    background:
      radial-gradient(72% 92% at 50% 6%, rgba(252, 252, 250, .86), rgba(252, 252, 250, 0) 72%),
      linear-gradient(90deg, rgba(255, 255, 253, 0) 20%, rgba(255, 255, 253, .38) 42%, rgba(255, 255, 253, 0) 58%);
    background-size: 100% 100%, 180% 100%;
  }

  #dunes-project-screen::after {
    content: 'THE DUNES';
    position: absolute;
    top: -7vh;
    right: -3vw;
    z-index: -1;
    color: rgba(0, 0, 0, .045);
    font-family: var(--dunes-serif);
    font-size: clamp(128px, 23vw, 360px);
    font-weight: 300;
    letter-spacing: .005em;
    line-height: .92;
    white-space: nowrap;
  }

  .dunes-project-inner {
    width: min(calc(100% - 128px), var(--dunes-page-max));
    height: 100%;
    margin: 0 auto;
    padding: clamp(64px, 9vh, 110px) 0 clamp(76px, 10vh, 120px);
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(340px, .82fr);
    gap: clamp(64px, 9vw, 150px);
    align-items: center;
  }

  .dunes-project-copy {
    align-self: center;
  }

  .dunes-project-title {
    margin: 0;
    max-width: 8ch;
    font-family: var(--dunes-serif);
    font-size: clamp(62px, 8.2vw, 118px);
    font-weight: 300;
    letter-spacing: .005em;
    line-height: .92;
  }

  .dunes-title-line {
    display: block;
    overflow: hidden;
    padding: .04em 0 .08em;
  }

  .dunes-title-line > span {
    display: block;
    transform: translate3d(0, 112%, 0);
    transition: transform 1.08s var(--dunes-ease);
  }

  .dunes-title-line:nth-child(2) > span {
    transition-delay: 90ms;
  }

  .dunes-screen.is-visible .dunes-title-line > span {
    transform: translate3d(0, 0, 0);
  }

  .dunes-project-lead {
    max-width: 36ch;
    margin: clamp(28px, 5vh, 54px) 0 0;
    font-family: var(--dunes-serif);
    font-size: clamp(17px, 1.55vw, 21px);
    font-weight: 300;
    line-height: 1.55;
  }

  .dunes-project-side {
    align-self: center;
  }

  .dunes-project-facts {
    margin: 0;
  }

  .dunes-project-fact {
    padding: 18px 0 20px;
    border-bottom: 1px solid rgba(0, 0, 0, .12);
    display: grid;
    grid-template-columns: minmax(92px, .72fr) 1fr;
    gap: 20px;
    align-items: baseline;
  }

  .dunes-project-fact:first-child {
    border-top: 1px solid rgba(0, 0, 0, .12);
  }

  .dunes-project-fact dt {
    font-family: var(--dunes-mono);
    font-size: 9px;
    font-weight: 400;
    letter-spacing: .30em;
    line-height: 1.9;
    text-transform: uppercase;
  }

  .dunes-project-fact dd {
    margin: 0;
    font-family: var(--dunes-serif);
    font-size: clamp(17px, 1.6vw, 21px);
    font-weight: 400;
    line-height: 1.2;
  }

  .dunes-action-link,
  .dunes-contact-link {
    width: max-content;
    max-width: 100%;
    padding: 0 0 6px;
    border-bottom: 1px solid currentColor;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: inherit;
    font-family: var(--dunes-mono);
    font-size: 10px;
    font-weight: 400;
    letter-spacing: .24em;
    line-height: 1.6;
    text-decoration: none;
    text-transform: uppercase;
    transition: gap .25s var(--dunes-ease);
  }

  .dunes-action-link:hover,
  .dunes-contact-link:hover {
    gap: 16px;
  }

  .dunes-download-link {
    margin-top: clamp(34px, 6vh, 64px);
  }

  .dunes-reveal {
    opacity: 0;
    transform: translate3d(0, 34px, 0);
    transition:
      opacity .8s var(--dunes-ease) var(--reveal-delay, 0ms),
      transform .9s var(--dunes-ease) var(--reveal-delay, 0ms);
  }

  .dunes-screen.is-visible .dunes-reveal {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .dunes-dune-line {
    position: absolute;
    left: -4%;
    right: -4%;
    bottom: 5vh;
    z-index: -1;
    width: 108%;
    height: 21vh;
    color: rgba(0, 0, 0, .26);
    transform: scaleX(0);
    transform-origin: 0 50%;
    transition: transform 1.9s var(--dunes-ease) .25s;
  }

  #dunes-project-screen.is-visible .dunes-dune-line {
    transform: scaleX(1);
  }

  .dunes-dune-line path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.2;
    vector-effect: non-scaling-stroke;
  }

  #dunes-contact-screen {
    z-index: 3;
    color: var(--dunes-cobalt-fg);
    background: linear-gradient(180deg, #1f3258 0%, #3f5e9e 30%, #8e9dbe 57%, #d9dbde 81%, #ffffff 100%);
    background-size: 120% 132%;
  }

  #dunes-contact-screen::before {
    content: '';
    position: absolute;
    top: -18%;
    bottom: -12%;
    left: 48%;
    z-index: -1;
    width: 18%;
    background: linear-gradient(180deg, rgba(234, 239, 248, 0), rgba(234, 239, 248, .08) 22%, rgba(234, 239, 248, .28) 48%, rgba(234, 239, 248, .08) 76%, rgba(255, 255, 255, 0));
    transform: translate3d(-50%, 2%, 0) rotate(5deg);
  }

  #dunes-contact-screen::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -2;
    background: radial-gradient(74% 68% at 50% 44%, rgba(201, 210, 224, .22), rgba(201, 210, 224, 0) 72%);
  }

  .dunes-contact-inner {
    width: min(calc(100% - 128px), var(--dunes-page-max));
    height: 100%;
    margin: 0 auto;
    padding: 8vh 0 max(82px, 11vh);
    display: grid;
    place-items: center;
  }

  .dunes-contact-content {
    width: 100%;
    text-align: center;
    transform: translateY(-2vh);
  }

  .dunes-thank-you {
    margin: 0;
    font-family: var(--dunes-serif);
    font-size: clamp(78px, 15vw, 220px);
    font-weight: 300;
    letter-spacing: .005em;
    line-height: .92;
    text-transform: uppercase;
  }

  .dunes-thank-you-word {
    display: inline-block;
    opacity: 0;
    transform: translate3d(0, 70%, 0);
    transition: opacity 1s var(--dunes-ease), transform 1.15s var(--dunes-ease);
  }

  .dunes-thank-you-word:last-child {
    transition-delay: 110ms;
  }

  #dunes-contact-screen.is-visible .dunes-thank-you-word {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .dunes-contact-line {
    margin: clamp(18px, 3vh, 34px) 0 0;
    font-family: var(--dunes-serif);
    font-size: clamp(23px, 3vw, 38px);
    font-style: italic;
    font-weight: 200;
    line-height: 1.1;
  }

  .dunes-contact-link {
    margin-top: clamp(30px, 5vh, 58px);
  }

  .dunes-final-footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    min-height: 82px;
    border-top: 1px solid rgba(22, 38, 74, .30);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    color: var(--dunes-cobalt-ink);
    font-family: var(--dunes-mono);
    font-size: 8px;
    font-weight: 400;
    letter-spacing: .30em;
    line-height: 1.9;
    text-transform: uppercase;
  }

  .dunes-final-footer > * {
    padding: 0 max(24px, 4vw);
  }

  .dunes-final-footer-center {
    text-align: center;
  }

  .dunes-final-footer-right {
    text-align: right;
  }

  .dunes-symbol-link {
    width: 32px;
    height: 31px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    text-decoration: none;
  }

  .dunes-symbol-link svg {
    width: 100%;
    height: 100%;
    display: block;
    overflow: visible;
    fill: currentColor;
  }

  .dunes-symbol-link rect {
    transform-box: fill-box;
    transform-origin: center;
  }

  @media (prefers-reduced-motion: no-preference) {
    .dunes-screen.is-current .dunes-screen-next span {
      animation: dunes-chevron-breath 2.8s var(--dunes-ease) infinite;
    }

    #dunes-film-screen.is-current .dunes-screen-next::before {
      animation: dunes-scroll-line 2.8s var(--dunes-ease) infinite;
    }

    #dunes-contact-screen.is-current .dunes-symbol-link rect {
      animation: dunes-symbol-breath 2.8s var(--dunes-ease) calc(var(--bar) * -72ms) infinite alternate;
    }

    html.dunes-handset .dunes-orientation-hint.is-visible svg {
      animation: dunes-phone-turn .72s cubic-bezier(.22, 1, .36, 1) both;
    }
  }

  @keyframes dunes-page-stack {
    0% {
      transform: perspective(2200px) translate3d(0, 12vh, 0) rotateX(-7deg) scale(.985);
    }
    52% {
      transform: perspective(2200px) translate3d(0, 3.5vh, 0) rotateX(-2.2deg) scale(.996);
    }
    100% {
      transform: perspective(2200px) translate3d(0, 0, 0) rotateX(0deg) scale(1);
    }
  }

  @keyframes dunes-boot-pulse {
    0%, 100% { opacity: .3; transform: translate3d(-50%, 0, 0) scaleX(.34); }
    50% { opacity: .8; transform: translate3d(-50%, 0, 0) scaleX(1); }
  }

  @keyframes dunes-page-edge {
    0% {
      opacity: 1;
      transform: translate3d(0, -24%, 0) scaleY(1.08);
    }
    58% {
      opacity: .48;
      transform: translate3d(0, -58%, 0) scaleY(.72);
    }
    100% {
      opacity: 0;
      transform: translate3d(0, -100%, 0) scaleY(.3);
    }
  }

  @keyframes dunes-symbol-breath {
    0% { transform: scaleY(.82); }
    100% { transform: scaleY(1); }
  }

  @keyframes dunes-scroll-line {
    0%, 100% {
      opacity: .24;
      transform: translateX(-50%) scaleY(.24);
    }
    46% {
      opacity: 1;
      transform: translateX(-50%) scaleY(1);
    }
  }

  @keyframes dunes-field-drift {
    from { background-position: 0% 46%; }
    to { background-position: 100% 54%; }
  }

  @keyframes dunes-light-drift {
    from { background-position: 0 0, 0% 0; }
    to { background-position: 0 0, 100% 0; }
  }

  @keyframes dunes-light-breath {
    from { transform: translate3d(-50%, 2%, 0) rotate(5deg); opacity: .46; }
    to { transform: translate3d(-46%, -2%, 0) rotate(5deg); opacity: .9; }
  }

  @keyframes dunes-chevron-breath {
    0%, 100% { transform: translate3d(0, -2px, 0); opacity: .42; }
    50% { transform: translate3d(0, 4px, 0); opacity: 1; }
  }

  @keyframes dunes-choice-wave {
    0%, 100% { opacity: .38; }
    50% { opacity: 1; }
  }

  @keyframes dunes-phone-turn {
    0%, 22% { transform: rotate(0deg); }
    100% { transform: rotate(-90deg); }
  }

  @media (max-width: 760px) and (orientation: portrait) {
    html.dunes-handset #dunes-film-screen {
      height: 100dvh;
      min-height: 100svh;
    }

    .dunes-start-button {
      width: 64px;
      height: 64px;
    }

    .dunes-sound-choice {
      width: 104px;
      height: 52px;
      padding: 4px;
      border-radius: 999px;
    }

    #dunes-player-controls {
      bottom: max(12px, env(safe-area-inset-bottom));
    }

    #dunes-film-screen .dunes-screen-next {
      left: 50%;
      right: auto;
      bottom: max(14px, env(safe-area-inset-bottom));
      transform: translateX(-50%);
    }

    #dunes-player-controls.is-active + .dunes-screen-next {
      left: auto;
      right: max(12px, env(safe-area-inset-right));
      bottom: calc(max(12px, env(safe-area-inset-bottom)) + 3px);
      transform: none;
    }

    .dunes-project-inner,
    .dunes-contact-inner {
      width: calc(100% - 40px);
    }

    .dunes-project-inner {
      padding: clamp(38px, 6vh, 58px) 0 clamp(64px, 9vh, 86px);
      grid-template-columns: 1fr;
      gap: clamp(26px, 5vh, 48px);
      align-content: center;
    }

    .dunes-project-title {
      max-width: 9ch;
      font-size: clamp(48px, 15vw, 72px);
      line-height: .92;
    }

    .dunes-project-lead {
      max-width: 30ch;
      margin-top: clamp(18px, 3vh, 28px);
      font-size: clamp(15px, 4.4vw, 18px);
      line-height: 1.48;
    }

    .dunes-project-fact {
      padding: 11px 0 12px;
      grid-template-columns: 82px 1fr;
      gap: 12px;
    }

    .dunes-project-fact dt {
      font-size: 8px;
      letter-spacing: .25em;
    }

    .dunes-project-fact dd {
      font-size: 16px;
    }

    .dunes-download-link {
      margin-top: clamp(20px, 3vh, 30px);
    }

    .dunes-action-link,
    .dunes-contact-link {
      font-size: 8px;
      letter-spacing: .20em;
    }

    #dunes-project-screen::after {
      top: 2vh;
      right: -12vw;
      font-size: 42vw;
    }

    .dunes-dune-line {
      bottom: 7vh;
      height: 16vh;
    }

    #dunes-project-screen > .dunes-screen-next {
      right: 50%;
      bottom: max(12px, env(safe-area-inset-bottom));
      transform: translateX(50%);
    }

    .dunes-contact-inner {
      padding: 6vh 0 max(70px, 10vh);
    }

    .dunes-contact-content {
      transform: translateY(-3vh);
    }

    .dunes-thank-you {
      font-size: clamp(62px, 20vw, 92px);
      line-height: .9;
    }

    .dunes-thank-you-word {
      display: block;
    }

    .dunes-contact-line {
      margin-top: 16px;
      font-size: clamp(22px, 7vw, 30px);
    }

    .dunes-contact-link {
      margin-top: clamp(28px, 5vh, 42px);
    }

    .dunes-final-footer {
      min-height: 66px;
      grid-template-columns: 1fr 1fr;
      font-size: 7px;
      letter-spacing: .20em;
    }

    .dunes-final-footer > * {
      padding: 0 18px;
    }

    .dunes-final-footer-center {
      display: none;
    }

    .dunes-symbol-link {
      width: 25px;
      height: 25px;
    }

  }

  @media (max-height: 620px) and (orientation: landscape) {
    .dunes-project-inner {
      width: calc(100% - 96px);
      padding: 28px 0 54px;
      gap: 44px;
    }

    .dunes-project-title {
      font-size: clamp(48px, 7vw, 76px);
    }

    .dunes-project-lead {
      margin-top: 16px;
      font-size: 15px;
    }

    .dunes-project-fact {
      padding: 8px 0 9px;
    }

    .dunes-download-link {
      margin-top: 18px;
    }

    .dunes-contact-inner {
      width: calc(100% - 96px);
      padding: 20px 0 56px;
    }

    .dunes-thank-you {
      font-size: clamp(70px, 12vw, 108px);
    }

    .dunes-contact-line {
      margin-top: 10px;
      font-size: 24px;
    }

    .dunes-contact-link {
      margin-top: 22px;
    }

    .dunes-final-footer {
      min-height: 52px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #dunes-sound-gate *,
    #dunes-player-controls,
    #dunes-sound-gate,
    .dunes-screen *,
    .dunes-screen::before,
    .dunes-screen::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }

    .dunes-reveal,
    .dunes-thank-you-word,
    .dunes-title-line > span {
      opacity: 1 !important;
      transform: none !important;
    }

    .dunes-dune-line {
      transform: scaleX(1) !important;
    }

    .dunes-screen-transition {
      display: none !important;
    }

    #dunes-project-screen,
    #dunes-contact-screen {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
      will-change: auto !important;
    }

    .dunes-project-inner,
    .dunes-contact-inner {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
</style>`;

const bodyInjection = String.raw`
<main id="dunes-landing">
<section class="dunes-screen is-current" id="dunes-film-screen" aria-label="The Dunes film">
  <audio id="dunes-soundtrack" preload="none" aria-hidden="true"></audio>
  <div id="dunes-ambient" aria-hidden="true">
    <div class="dunes-ambient-layer dunes-ambient-warm"></div>
    <div class="dunes-ambient-layer dunes-ambient-sand"></div>
    <div class="dunes-ambient-layer dunes-ambient-cool"></div>
  </div>
  <img id="dunes-film-poster" src="/media/the-dunes-poster-typewriting.webp" width="1920" height="1080" alt="" aria-hidden="true" decoding="async" fetchpriority="high">
  <video id="dunes-master-video" src="/media/the-dunes-film-4k.mp4" poster="/media/the-dunes-poster-typewriting.webp" preload="metadata" playsinline webkit-playsinline disablepictureinpicture aria-label="The Dunes film"></video>

  <section id="dunes-sound-gate" aria-label="Start film">
    <button class="dunes-start-button" id="dunes-open-sound-choice" type="button" aria-label="Play film" title="Play film">
      <svg viewBox="0 0 24 28" aria-hidden="true"><path d="M23 14 1 27V1l22 13Z"/></svg>
    </button>

    <div class="dunes-orientation-hint" id="dunes-orientation-hint" role="note" aria-hidden="true">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="6.1" y="3.2" width="7.8" height="13.6" rx="1.7"/>
        <path d="M8.7 5h2.6M9.4 14.9h1.2"/>
      </svg>
      <span>Turn your phone sideways to watch.</span>
    </div>

    <div class="dunes-sound-choice" id="dunes-sound-choice" role="group" aria-labelledby="dunes-sound-title">
      <h1 class="dunes-visually-hidden" id="dunes-sound-title">Choose how to play the film</h1>
      <div class="dunes-gate-actions" aria-label="Choose how to watch">
        <button class="dunes-gate-action dunes-gate-action-primary" id="dunes-play-sound" type="button" aria-label="Play with sound" title="Play with sound">
          <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 7h2.4L9 4.5v9L5.9 11H3.5V7Z"/><path d="M11.5 6.4a4 4 0 0 1 0 5.2"/><path class="dunes-choice-wave-far" d="M13.4 4.5a6.5 6.5 0 0 1 0 9"/></svg>
        </button>
        <button class="dunes-gate-action dunes-gate-action-secondary" id="dunes-play-muted" type="button" aria-label="Play without sound" title="Play without sound">
          <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 7h2.4L9 4.5v9L5.9 11H3.5V7Z"/><path d="m11.5 7 4 4M15.5 7l-4 4"/></svg>
        </button>
      </div>
      <p class="dunes-gate-status" id="dunes-gate-status" role="status" aria-live="polite"></p>
    </div>
  </section>

  <div id="dunes-player-controls" aria-label="Film controls">
    <button class="dunes-control-button dunes-chapter-button" id="dunes-previous-chapter" type="button" aria-label="Previous chapter" title="Previous chapter">
      <svg viewBox="0 0 18 18" aria-hidden="true"><path d="m11 4.5-4.5 4.5 4.5 4.5"/></svg>
    </button>
    <button class="dunes-control-button" id="dunes-toggle-play" type="button" data-state="pause" aria-label="Pause" title="Pause">
      <svg class="dunes-icon-play" viewBox="0 0 18 18" aria-hidden="true"><path class="dunes-icon-fill" d="m14.5 9-10 6V3l10 6Z"/></svg>
      <svg class="dunes-icon-pause" viewBox="0 0 18 18" aria-hidden="true"><path d="M6.25 4v10M11.75 4v10"/></svg>
    </button>
    <button class="dunes-control-button dunes-chapter-button" id="dunes-next-chapter" type="button" aria-label="Next chapter" title="Next chapter">
      <svg viewBox="0 0 18 18" aria-hidden="true"><path d="m7 4.5 4.5 4.5L7 13.5"/></svg>
    </button>
    <span class="dunes-control-divider" aria-hidden="true"></span>
    <button class="dunes-control-button" id="dunes-toggle-sound" type="button" data-muted="false" aria-label="Mute sound" title="Mute sound">
      <svg class="dunes-icon-sound-on" viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 7h2.4L9 4.5v9L5.9 11H3.5V7Z"/><path d="M11.5 6.4a4 4 0 0 1 0 5.2M13.4 4.5a6.5 6.5 0 0 1 0 9"/></svg>
      <svg class="dunes-icon-sound-off" viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 7h2.4L9 4.5v9L5.9 11H3.5V7Z"/><path d="m11.5 7 4 4M15.5 7l-4 4"/></svg>
    </button>
    <button class="dunes-control-button" id="dunes-fullscreen" type="button" data-fullscreen="false" aria-label="Enter full screen" title="Enter full screen">
      <svg class="dunes-icon-expand" viewBox="0 0 18 18" aria-hidden="true"><path d="M7 3.5H3.5V7M11 3.5h3.5V7M7 14.5H3.5V11M11 14.5h3.5V11"/></svg>
      <svg class="dunes-icon-contract" viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 7H7V3.5M14.5 7H11V3.5M3.5 11H7v3.5M14.5 11H11v3.5"/></svg>
    </button>
  </div>

  <button class="dunes-screen-next" type="button" data-scroll-target="dunes-project-screen" aria-label="View project information"><span aria-hidden="true">▾</span></button>
</section>

  <section class="dunes-screen" id="dunes-project-screen" aria-labelledby="dunes-project-title">
    <div class="dunes-screen-transition" aria-hidden="true"></div>
    <div class="dunes-project-inner">
      <div class="dunes-project-copy">
        <h2 class="dunes-project-title" id="dunes-project-title">
          <span class="dunes-title-line"><span>Sound shaped</span></span>
          <span class="dunes-title-line"><span>for the cut.</span></span>
        </h2>
        <p class="dunes-project-lead dunes-reveal" style="--reveal-delay: 230ms">Original score and sound design created around the rhythm of The Dunes.</p>
      </div>

      <div class="dunes-project-side">
        <dl class="dunes-project-facts">
          <div class="dunes-project-fact dunes-reveal" style="--reveal-delay: 180ms"><dt>Project</dt><dd>The Dunes</dd></div>
          <div class="dunes-project-fact dunes-reveal" style="--reveal-delay: 260ms"><dt>Partner</dt><dd>OUI</dd></div>
          <div class="dunes-project-fact dunes-reveal" style="--reveal-delay: 340ms"><dt>Format</dt><dd>Hero film, 30-45 seconds</dd></div>
        </dl>
        <a class="dunes-action-link dunes-download-link dunes-reveal" style="--reveal-delay: 440ms" href="downloads/FORMA-x-OUI-The-Dunes-Sound-Proposal.pdf" download="FORMA x OUI - The Dunes - Sound Proposal.pdf" aria-label="Download the FORMA x OUI sound proposal for The Dunes">Download proposal <span aria-hidden="true">↓</span></a>
      </div>
    </div>

    <svg class="dunes-dune-line" viewBox="0 0 1600 240" preserveAspectRatio="none" aria-hidden="true"><path d="M0 132 C190 124 270 82 455 92 C650 103 690 158 876 150 C1080 141 1180 75 1600 112"/></svg>
    <button class="dunes-screen-next" type="button" data-scroll-target="dunes-contact-screen" aria-label="View contact information"><span aria-hidden="true">▾</span></button>
  </section>

  <section class="dunes-screen" id="dunes-contact-screen" aria-labelledby="dunes-thank-you">
    <div class="dunes-screen-transition" aria-hidden="true"></div>
    <div class="dunes-contact-inner">
      <div class="dunes-contact-content">
        <h2 class="dunes-thank-you" id="dunes-thank-you"><span class="dunes-thank-you-word">Thank</span> <span class="dunes-thank-you-word">you</span></h2>
        <p class="dunes-contact-line dunes-reveal" style="--reveal-delay: 210ms">the shape of sound</p>
        <a class="dunes-contact-link dunes-reveal" style="--reveal-delay: 340ms" href="mailto:contact@formasound.co" aria-label="Email FORMA at contact@formasound.co">contact@formasound.co <span aria-hidden="true">→</span></a>
      </div>
    </div>

    <footer class="dunes-final-footer dunes-reveal" style="--reveal-delay: 480ms" aria-label="FORMA information">
      <div>
        <a class="dunes-symbol-link" href="https://formasound.co" aria-label="FORMA home">
          <svg viewBox="0 0 231 226" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" y="102" width="7" height="22" style="--bar: 0"/>
            <rect x="13" y="76" width="7" height="74" style="--bar: 1"/>
            <rect x="25" y="52" width="7" height="121" style="--bar: 2"/>
            <rect x="37" y="32" width="7" height="161" style="--bar: 3"/>
            <rect x="50" y="17" width="7" height="192" style="--bar: 4"/>
            <rect x="62" y="7" width="7" height="212" style="--bar: 5"/>
            <rect x="75" y="1" width="7" height="224" style="--bar: 6"/>
            <rect x="87" y="0" width="7" height="226" style="--bar: 7"/>
            <rect x="100" y="3" width="7" height="220" style="--bar: 8"/>
            <rect x="112" y="9" width="7" height="208" style="--bar: 9"/>
            <rect x="124" y="18" width="7" height="190" style="--bar: 10"/>
            <rect x="137" y="29" width="7" height="167" style="--bar: 11"/>
            <rect x="149" y="42" width="7" height="142" style="--bar: 12"/>
            <rect x="162" y="56" width="7" height="114" style="--bar: 13"/>
            <rect x="174" y="70" width="7" height="86" style="--bar: 14"/>
            <rect x="187" y="83" width="7" height="60" style="--bar: 15"/>
            <rect x="199" y="95" width="7" height="36" style="--bar: 16"/>
            <rect x="211" y="105" width="7" height="16" style="--bar: 17"/>
            <rect x="224" y="108" width="7" height="9" style="--bar: 18"/>
          </svg>
        </a>
      </div>
      <div class="dunes-final-footer-center">Private proposal for OUI</div>
      <div class="dunes-final-footer-right">© 2026 FORMA</div>
    </footer>
  </section>
</main>

<script id="dunes-player-script">
(() => {
  const resetScroll = window.__dunesResetScroll || (() => window.scrollTo(0, 0));
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  document.documentElement.classList.add('dunes-booting');
  resetScroll();

  const filmScreen = document.getElementById('dunes-film-screen');
  const gate = document.getElementById('dunes-sound-gate');
  const ambient = document.getElementById('dunes-ambient');
  const poster = document.getElementById('dunes-film-poster');
  const masterVideo = document.getElementById('dunes-master-video');
  const startButton = document.getElementById('dunes-open-sound-choice');
  const orientationHint = document.getElementById('dunes-orientation-hint');
  const withSound = document.getElementById('dunes-play-sound');
  const withoutSound = document.getElementById('dunes-play-muted');
  const status = document.getElementById('dunes-gate-status');
  const controls = document.getElementById('dunes-player-controls');
  const previousButton = document.getElementById('dunes-previous-chapter');
  const playButton = document.getElementById('dunes-toggle-play');
  const nextButton = document.getElementById('dunes-next-chapter');
  const soundButton = document.getElementById('dunes-toggle-sound');
  const fullscreenButton = document.getElementById('dunes-fullscreen');
  const choiceButtons = [withSound, withoutSound];
  const soundtrack = document.getElementById('dunes-soundtrack');
  let clock = null;
  let film = null;
  let stage = null;
  let nativePlayToggle = null;
  let nativeRestart = null;
  let hideControlsTimer = null;
  let resizeFrame = null;
  let stageResizeObserver = null;
  let paginationObserver = null;
  let paginationFrame = null;
  let chapterSeeking = false;
  let started = false;
  let bootReleased = false;
  let currentScreenIndex = -1;

  const portraitMedia = window.matchMedia('(orientation: portrait)');
  const handset = navigator.maxTouchPoints > 0 && Math.min(window.screen.width, window.screen.height) <= 600;
  document.documentElement.classList.toggle('dunes-handset', handset);
  document.documentElement.dataset.dunesStarted = 'false';

  const screens = Array.from(document.querySelectorAll('.dunes-screen'));

  const releaseBoot = () => {
    if (bootReleased) return;
    bootReleased = true;
    resetScroll();
    window.requestAnimationFrame(() => {
      resetScroll();
      window.requestAnimationFrame(() => {
        document.documentElement.classList.add('dunes-ready');
        document.documentElement.classList.remove('dunes-booting');
      });
    });
  };

  const setCurrentScreen = (nextIndex) => {
    const index = Math.max(0, Math.min(screens.length - 1, nextIndex));
    if (index === currentScreenIndex) return;
    currentScreenIndex = index;
    document.documentElement.dataset.dunesScreen = String(index + 1);
    screens.forEach((screen, screenIndex) => {
      screen.classList.toggle('is-current', screenIndex === index);
      screen.classList.toggle('is-covered', screenIndex < index);
      screen.inert = screenIndex !== index;
    });
    if (index > 0) {
      if (masterVideo && !masterVideo.paused) masterVideo.pause();
      if (clock && !clock.paused) clock.pause();
      if (soundtrack && !soundtrack.paused) soundtrack.pause();
    }
  };

  setCurrentScreen(0);

  const bootFailSafe = window.setTimeout(() => {
    status.textContent = 'The film is taking longer than expected to load.';
    releaseBoot();
  }, 15000);

  const setPlayState = (state, label) => {
    playButton.dataset.state = state;
    playButton.setAttribute('aria-label', label);
    playButton.title = label;
  };

  const setSoundState = (muted) => {
    soundButton.dataset.muted = String(muted);
    const label = muted ? 'Turn sound on' : 'Mute sound';
    soundButton.setAttribute('aria-label', label);
    soundButton.title = label;
  };

  const smoothstep = (start, end, value) => {
    const amount = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return amount * amount * (3 - 2 * amount);
  };

  const chapterStarts = [0, 3, 8.2, 16.8, 25.9, 35];
  const getPlaybackTime = () => masterVideo?.currentTime || 0;

  const getChapterIndex = (time) => {
    let index = 0;
    chapterStarts.forEach((start, candidate) => {
      if (time >= start - .12) index = candidate;
    });
    return index;
  };

  const updateChapterButtons = () => {
    if (!masterVideo) return;
    const index = getChapterIndex(getPlaybackTime());
    previousButton.disabled = index === 0;
    nextButton.disabled = index === chapterStarts.length - 1;
  };

  const updateAmbient = () => {
    if (!masterVideo || !ambient) return;
    const time = getPlaybackTime();
    const sandIn = smoothstep(9, 18, time);
    const coolIn = smoothstep(32, 39, time);
    const sandOut = 1 - smoothstep(30, 38, time);
    ambient.style.setProperty('--dunes-ambient-warm', String(1 - sandIn * .46 - coolIn * .54));
    ambient.style.setProperty('--dunes-ambient-sand', String(sandIn * sandOut * .72));
    ambient.style.setProperty('--dunes-ambient-cool', String(coolIn));
    updateChapterButtons();
  };

  const dispatchTimelineSeek = (target) => {
    const chrome = document.querySelector('[data-om-starter="animations-v3"] [data-omelette-chrome="true"]');
    const progress = chrome && chrome.children[3];
    if (!progress) return false;

    const previousChromeStyle = chrome.getAttribute('style') || '';
    chrome.style.setProperty('display', 'flex', 'important');
    chrome.style.setProperty('position', 'fixed', 'important');
    chrome.style.setProperty('top', '-220px', 'important');
    chrome.style.setProperty('left', '0', 'important');
    chrome.style.setProperty('width', '680px', 'important');
    chrome.style.setProperty('max-width', '680px', 'important');
    chrome.style.setProperty('visibility', 'hidden', 'important');
    chrome.style.setProperty('pointer-events', 'none', 'important');
    const rect = progress.getBoundingClientRect();
    if (!rect.width) {
      chrome.setAttribute('style', previousChromeStyle);
      return false;
    }
    const clientX = rect.left + (target / 42) * rect.width;
    const clientY = rect.top + rect.height / 2;
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((type) => {
      const EventType = type.startsWith('pointer') ? PointerEvent : MouseEvent;
      progress.dispatchEvent(new EventType(type, {
        bubbles: true,
        button: 0,
        buttons: type.endsWith('down') ? 1 : 0,
        clientX,
        clientY,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
      }));
    });
    window.requestAnimationFrame(() => chrome.setAttribute('style', previousChromeStyle));
    return true;
  };

  const seekToChapter = async (direction) => {
    if (!clock || !soundtrack || chapterSeeking) return;
    const currentIndex = getChapterIndex(getPlaybackTime());
    const targetIndex = Math.max(0, Math.min(chapterStarts.length - 1, currentIndex + direction));
    if (targetIndex === currentIndex) return;

    chapterSeeking = true;
    const targetTime = chapterStarts[targetIndex];
    const wasPaused = clock.paused;
    const didSeek = dispatchTimelineSeek(targetTime);
    if (!didSeek && film) {
      film.dispatchEvent(new CustomEvent('data-om-seek-to-time-frame', {
        detail: { time: targetTime, sync: true },
      }));
    }
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    soundtrack.currentTime = targetTime;
    await new Promise((resolve) => window.setTimeout(resolve, 40));
    if (wasPaused) {
      clock.pause();
      soundtrack.pause();
    } else if (clock.paused) {
      await clock.play();
    }
    if (!wasPaused && soundtrack.paused && !soundtrack.muted) {
      void playSoundtrack();
    }
    updateAmbient();
    showControls();
    chapterSeeking = false;
  };

  const hidePaginationLabels = () => {
    const starter = document.querySelector('[data-om-starter="animations-v3"]');
    if (!starter) return;
    starter.querySelectorAll('div, span, p, text, tspan').forEach((element) => {
      if (element.children.length > 0) return;
      const label = (element.textContent || '').replace(/\s+/g, ' ').trim();
      const chapterNumber = /^N[º°]\s*(?:0(?:[1-6])?)?$/i.test(label);
      const pageCounter = /^0[1-6]\s*[·•]\s*0?6$/i.test(label);
      if ((chapterNumber || pageCounter) && element.getAttribute('data-dunes-pagination') !== 'hidden') {
        element.setAttribute('data-dunes-pagination', 'hidden');
      }
    });
  };

  const schedulePaginationHide = () => {
    window.cancelAnimationFrame(paginationFrame);
    paginationFrame = window.requestAnimationFrame(hidePaginationLabels);
  };

  const setChoiceBusy = (busy) => {
    choiceButtons.forEach((button) => {
      button.disabled = busy;
      button.setAttribute('aria-busy', String(busy));
    });
  };

  const isNativeTimelinePlaying = () => Boolean(nativePlayToggle?.querySelector('rect'));

  const setNativeTimelinePlaying = (shouldPlay) => {
    if (!nativePlayToggle || isNativeTimelinePlaying() === shouldPlay) return;
    nativePlayToggle.click();
  };

  const fitFilm = () => {
    if (!film || !stage) return;
    const width = stage.clientWidth || document.documentElement.clientWidth || window.innerWidth;
    const height = stage.clientHeight || document.documentElement.clientHeight || window.innerHeight;
    const scaleX = width / 1920;
    const scaleY = height / 1080;
    const contain = Math.min(scaleX, scaleY);
    const cover = Math.max(scaleX, scaleY);
    const scale = handset ? ((!started || width > height) ? cover : contain) : contain;
    film.style.setProperty('transform', 'scale(' + scale + ')', 'important');
    poster.style.transform = 'translate3d(-50%, -50%, 0) scale(' + scale + ')';
  };

  const scheduleFilmFit = () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(fitFilm);
  };

  const syncOrientationUI = () => {
    const portraitPreview = handset && portraitMedia.matches && !started;
    const showHint = portraitPreview && !gate.classList.contains('is-choosing') && !gate.classList.contains('is-dismissed');
    filmScreen.classList.toggle('is-mobile-portrait-preview', portraitPreview);
    orientationHint.classList.toggle('is-visible', showHint);
    orientationHint.setAttribute('aria-hidden', String(!showHint));
    if (showHint) {
      startButton.setAttribute('aria-describedby', 'dunes-orientation-hint');
    } else {
      startButton.removeAttribute('aria-describedby');
    }
    scheduleFilmFit();
  };

  const setStartedState = (value) => {
    started = value;
    document.documentElement.dataset.dunesStarted = String(value);
    syncOrientationUI();
  };

  const handleViewportChange = () => syncOrientationUI();

  const prepareFilm = () => {
    const starter = document.querySelector('[data-om-starter="animations-v3"]');
    stage = starter && starter.firstElementChild;
    film = document.querySelector('svg[data-om-exportable-video-with-duration-secs="42"]');
    clock = document.querySelector('video[data-om-exportable-video-play-start]');
    nativePlayToggle = starter && starter.querySelector('button[title^="Play/pause"]');
    nativeRestart = starter && starter.querySelector('button[title^="Return to start"]');

    if (!starter || !stage || !film || !clock || !soundtrack || !nativePlayToggle || !nativeRestart) {
      window.setTimeout(prepareFilm, 40);
      return;
    }

    document.title = 'The Dunes | Sound Proposal';
    clock.pause();
    clock.currentTime = 0;
    clock.muted = true;
    clock.volume = 1;
    clock.loop = false;
    soundtrack.pause();
    soundtrack.currentTime = 0;
    soundtrack.muted = true;
    soundtrack.volume = 1;
    soundtrack.loop = false;
    nativeRestart.click();

    const dcRoot = document.getElementById('dc-root');
    filmScreen.appendChild(dcRoot || starter);

    if (dcRoot) {
      Object.assign(dcRoot.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        display: 'block',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: '1',
      });
    }

    Object.assign(starter.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
      overflow: 'hidden',
      background: 'transparent',
      zIndex: '1',
    });

    Object.assign(stage.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    });

    Array.from(starter.children).slice(1).forEach((sibling) => {
      sibling.style.display = 'none';
    });

    film.setAttribute('width', '1920');
    film.setAttribute('height', '1080');
    film.style.setProperty('width', '1920px', 'important');
    film.style.setProperty('height', '1080px', 'important');
    film.style.setProperty('display', 'block', 'important');
    film.style.setProperty('flex-shrink', '0', 'important');
    film.style.setProperty('transform-origin', 'center center', 'important');
    film.style.setProperty('box-shadow', 'none', 'important');
    fitFilm();

    clock.addEventListener('ended', (event) => {
      event.stopImmediatePropagation();
      clock.pause();
      soundtrack.pause();
      setPlayState('play', 'Replay');
      controls.classList.add('is-visible');
      updateAmbient();
    }, true);

    clock.addEventListener('play', () => {
      if (!started) {
        clock.pause();
        clock.currentTime = 0;
        soundtrack.pause();
        soundtrack.currentTime = 0;
        return;
      }
      setPlayState('pause', 'Pause');
    });

    clock.addEventListener('pause', () => {
      if (clock.currentTime < 41.95) setPlayState('play', 'Play');
    });

    clock.addEventListener('timeupdate', updateAmbient);
    clock.addEventListener('seeked', updateAmbient);
    soundtrack.addEventListener('timeupdate', updateAmbient);
    soundtrack.addEventListener('seeked', updateAmbient);
    soundtrack.addEventListener('ended', () => {
      if (!clock.ended && clock.currentTime < 41.7) return;
      clock.pause();
      setPlayState('play', 'Replay');
      controls.classList.add('is-visible');
      updateAmbient();
    });
    updateAmbient();

    stageResizeObserver = new ResizeObserver(scheduleFilmFit);
    stageResizeObserver.observe(stage);
    paginationObserver = new MutationObserver(schedulePaginationHide);
    paginationObserver.observe(starter, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    hidePaginationLabels();
    window.addEventListener('resize', handleViewportChange, { passive: true });
    window.addEventListener('orientationchange', handleViewportChange, { passive: true });
    if (typeof portraitMedia.addEventListener === 'function') {
      portraitMedia.addEventListener('change', handleViewportChange);
    } else if (typeof portraitMedia.addListener === 'function') {
      portraitMedia.addListener(handleViewportChange);
    }
    if (window.screen.orientation && typeof window.screen.orientation.addEventListener === 'function') {
      window.screen.orientation.addEventListener('change', handleViewportChange);
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange, { passive: true });
    }
    syncOrientationUI();
    window.clearTimeout(bootFailSafe);
    releaseBoot();
  };

  const showControls = () => {
    if (!started) return;
    controls.classList.add('is-visible');
    window.clearTimeout(hideControlsTimer);
    if (masterVideo && !masterVideo.paused && window.matchMedia('(min-width: 761px)').matches) {
      hideControlsTimer = window.setTimeout(() => controls.classList.remove('is-visible'), 2400);
    }
  };

  const syncSoundtrackToClock = () => {
    if (!clock || !soundtrack || !Number.isFinite(clock.currentTime)) return;
    if (Math.abs(soundtrack.currentTime - clock.currentTime) <= .14) return;
    try {
      soundtrack.currentTime = clock.currentTime;
    } catch (_) {}
  };

  const playSoundtrack = async () => {
    if (!clock || !soundtrack || soundtrack.muted) return false;
    syncSoundtrackToClock();
    try {
      await soundtrack.play();
      syncSoundtrackToClock();
      return true;
    } catch (_) {
      return false;
    }
  };

  const requestImmersiveLandscape = () => {
    if (!handset) return null;

    if (typeof filmScreen.requestFullscreen !== 'function') {
      if (typeof masterVideo.webkitEnterFullscreen === 'function') {
        try {
          masterVideo.webkitEnterFullscreen();
          return Promise.resolve();
        } catch (_) {}
      }
      return null;
    }

    let fullscreenRequest = Promise.resolve();
    if (!document.fullscreenElement) {
      try {
        fullscreenRequest = filmScreen.requestFullscreen({ navigationUI: 'hide' });
      } catch (_) {
        return null;
      }
    }

    return Promise.resolve(fullscreenRequest).then(() => {
      const orientation = window.screen.orientation;
      if (document.fullscreenElement === filmScreen && orientation && typeof orientation.lock === 'function') {
        try {
          const lockRequest = orientation.lock('landscape');
          if (lockRequest) void Promise.resolve(lockRequest).catch(() => {});
        } catch (_) {}
      }
    }).catch(() => {});
  };

  const releaseImmersiveLandscape = () => {
    if (!handset) return null;
    const orientation = window.screen.orientation;
    if (orientation && typeof orientation.unlock === 'function') {
      try {
        orientation.unlock();
      } catch (_) {}
    }
    if (document.fullscreenElement === filmScreen && typeof document.exitFullscreen === 'function') {
      return document.exitFullscreen().catch(() => {});
    }
    return null;
  };

  const startFilm = (muted) => {
    if (!masterVideo) {
      status.textContent = 'The film is still loading. Please try again in a moment.';
      return;
    }

    setChoiceBusy(true);
    status.textContent = '';
    masterVideo.pause();
    masterVideo.currentTime = 0;
    masterVideo.muted = muted;
    masterVideo.volume = 1;
    setStartedState(true);

    try {
      const playbackStart = masterVideo.play();
      const immersiveStart = requestImmersiveLandscape();
      gate.classList.add('is-dismissed');
      controls.classList.add('is-active', 'is-visible');
      setSoundState(muted);
      setPlayState('pause', 'Pause');
      showControls();
      if (immersiveStart) {
        const restoreStartedPlayback = () => {
          if (!started || !masterVideo || !masterVideo.paused) return;
          const resumedVideo = masterVideo.play();
          if (resumedVideo) void resumedVideo.catch(() => {});
        };
        void immersiveStart.then(() => {
          window.requestAnimationFrame(restoreStartedPlayback);
        });
        window.setTimeout(restoreStartedPlayback, 180);
      }
      if (playbackStart) {
        void playbackStart.catch(() => {
          if (masterVideo && masterVideo.currentTime > .05) return;
          setStartedState(false);
          void releaseImmersiveLandscape();
          gate.classList.remove('is-dismissed');
          controls.classList.remove('is-active', 'is-visible');
          status.textContent = 'Playback was blocked. Tap your choice once more.';
        });
      }
    } catch (error) {
      setStartedState(false);
      void releaseImmersiveLandscape();
      status.textContent = 'Playback was blocked. Tap your choice once more.';
    } finally {
      setChoiceBusy(false);
    }
  };

  startButton.addEventListener('click', () => {
    gate.classList.add('is-choosing');
    syncOrientationUI();
    window.setTimeout(() => withSound.focus({ preventScroll: true }), 180);
  });

  withSound.addEventListener('click', () => startFilm(false));
  withoutSound.addEventListener('click', () => startFilm(true));

  playButton.addEventListener('click', () => {
    if (!masterVideo) return;
    if (masterVideo.paused) {
      const playbackStart = masterVideo.play();
      if (playbackStart) void playbackStart.catch(() => {});
    } else {
      masterVideo.pause();
    }
    showControls();
  });

  const seekMasterChapter = (direction) => {
    if (!masterVideo) return;
    const currentIndex = getChapterIndex(masterVideo.currentTime);
    const targetIndex = Math.max(0, Math.min(chapterStarts.length - 1, currentIndex + direction));
    if (targetIndex === currentIndex) return;
    masterVideo.currentTime = chapterStarts[targetIndex];
    updateAmbient();
    showControls();
  };

  previousButton.addEventListener('click', () => seekMasterChapter(-1));
  nextButton.addEventListener('click', () => seekMasterChapter(1));

  soundButton.addEventListener('click', () => {
    if (!masterVideo) return;
    masterVideo.muted = !masterVideo.muted;
    setSoundState(masterVideo.muted);
    showControls();
  });

  masterVideo.addEventListener('play', () => setPlayState('pause', 'Pause'));
  masterVideo.addEventListener('pause', () => {
    if (!masterVideo.ended) setPlayState('play', 'Play');
  });
  masterVideo.addEventListener('ended', () => {
    setPlayState('play', 'Replay');
    controls.classList.add('is-visible');
    updateAmbient();
  });
  masterVideo.addEventListener('timeupdate', updateAmbient);
  masterVideo.addEventListener('seeked', updateAmbient);
  masterVideo.addEventListener('error', () => {
    status.textContent = 'The film could not be loaded. Please refresh and try again.';
  });

  fullscreenButton.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await filmScreen.requestFullscreen();
        const orientation = window.screen.orientation;
        if (handset && orientation && typeof orientation.lock === 'function') {
          try {
            await orientation.lock('landscape');
          } catch (_) {}
        }
      } else {
        const orientation = window.screen.orientation;
        if (handset && orientation && typeof orientation.unlock === 'function') {
          try {
            orientation.unlock();
          } catch (_) {}
        }
        await document.exitFullscreen();
      }
    } catch (error) {
      status.textContent = 'Full screen is not available in this browser.';
    }
    showControls();
  });

  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = Boolean(document.fullscreenElement);
    fullscreenButton.dataset.fullscreen = String(isFullscreen);
    const label = isFullscreen ? 'Exit full screen' : 'Enter full screen';
    fullscreenButton.setAttribute('aria-label', label);
    fullscreenButton.title = label;
    if (!isFullscreen && handset) {
      const orientation = window.screen.orientation;
      if (orientation && typeof orientation.unlock === 'function') {
        try {
          orientation.unlock();
        } catch (_) {}
      }
    }
    syncOrientationUI();
  });

  filmScreen.addEventListener('pointermove', showControls, { passive: true });
  filmScreen.addEventListener('pointerdown', showControls, { passive: true });
  controls.addEventListener('focusin', () => controls.classList.add('is-visible'));
  controls.addEventListener('mouseenter', () => window.clearTimeout(hideControlsTimer));
  controls.addEventListener('mouseleave', showControls);

  document.querySelectorAll('[data-scroll-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.scrollTarget);
      if (!target) return;
      const navigate = () => window.scrollTo({
          top: target.offsetTop,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
      if (filmScreen.contains(button)) {
        if (masterVideo && !masterVideo.paused) masterVideo.pause();
        if (clock && !clock.paused) clock.pause();
        if (soundtrack && !soundtrack.paused) soundtrack.pause();
        const immersiveExit = releaseImmersiveLandscape();
        if (immersiveExit) {
          void Promise.resolve(immersiveExit).finally(navigate);
          return;
        }
      }
      navigate();
    });
  });

  const stackTimelineSupported = Boolean(window.CSS && CSS.supports('animation-timeline: scroll()'));
  if (!stackTimelineSupported) document.documentElement.classList.add('dunes-stack-fallback');

  const screenObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const index = screens.indexOf(entry.target);
      if (entry.isIntersecting && entry.intersectionRatio >= .96) {
        entry.target.classList.add('is-visible');
      }
      if (index === 1 && entry.intersectionRatio >= .12 && masterVideo && !masterVideo.paused) {
        masterVideo.pause();
        clock.pause();
        if (soundtrack && !soundtrack.paused) soundtrack.pause();
      }
      if (!stackTimelineSupported && entry.target !== filmScreen && entry.intersectionRatio >= .12) {
        entry.target.classList.add('is-stack-active');
      }
      if (entry.intersectionRatio >= .96) {
        setCurrentScreen(index);
      } else if (
        index > 0 &&
        currentScreenIndex === index &&
        entry.boundingClientRect.top > 0 &&
        entry.intersectionRatio < .92
      ) {
        setCurrentScreen(index - 1);
      }
    });
  }, { threshold: [.12, .4, .72, .92, .96, 1] });

  screens.forEach((screen) => screenObserver.observe(screen));

  prepareFilm();
})();
</script>`;

template = template.replace("</head>", `${headInjection}\n</head>`);
template = template.replace("</body>", `${bodyInjection}\n</body>`);

const serializedTemplate = JSON.stringify(template).replace(/<\//g, "<\\u002F");
output = output.replace(templatePattern, `$1${serializedTemplate}$3`);
output = output.replace("<title>Bundled Page</title>", "<title>The Dunes | Sound Proposal</title>");

await Promise.all([
  fs.mkdir(downloadDirectoryPath, { recursive: true }),
  fs.mkdir(mediaDirectoryPath, { recursive: true }),
]);
await Promise.all([
  fs.writeFile(outputPath, output),
  fs.copyFile(pdfSourcePath, pdfOutputPath),
  fs.copyFile(audioPath, audioOutputPath),
]);

const pdfStat = await fs.stat(pdfOutputPath);

console.log(JSON.stringify({
  outputPath,
  pdfOutputPath,
  audioOutputPath,
  audioResourceId,
  sourceBytes: Buffer.byteLength(source),
  audioBytes: audio.length,
  pdfBytes: pdfStat.size,
  outputBytes: Buffer.byteLength(output),
}, null, 2));
