# Forma Audio — Brand Design System Spec

**Date:** 2026-04-02
**Status:** Approved
**Author:** Marco + Claude

---

## 1. Overview

Complete brand design system for Forma Audio. Deliverables: high-quality asset files (SVG, PNG multi-resolution), brand manual (HTML, exportable to PDF), application mockups, and templates.

**Brand identity established in session:**
- Font: Crude (display/wordmark)
- Symbol: Flag V3 (rectangle with inward V-notch + horizontal divider)
- Wordmark: "forma" lowercase in Crude font (SVG outlines, fixed viewBox)
- Typography: Space Grotesk (headings), Space Mono (data/mono), Crude (display only)
- Theme: Dark-first (#0c0c0e), warm white (#f0eee8), gold accent (#8b7355)
- Alternative palette: Steel Blue (#A1AAC8)

---

## 2. File Structure

```
forma/
  brand-manual.html
  assets/
    logo/
      forma-wordmark-light-on-dark.svg
      forma-wordmark-light-on-dark@1x.png   (580x73)
      forma-wordmark-light-on-dark@2x.png   (1160x146)
      forma-wordmark-light-on-dark@4x.png   (2320x292)
      forma-wordmark-dark-on-light.svg
      forma-wordmark-dark-on-light@1x.png
      forma-wordmark-dark-on-light@2x.png
      forma-wordmark-dark-on-light@4x.png
    symbol/
      forma-symbol-light-on-dark.svg
      forma-symbol-light-on-dark@1x.png     (300x180)
      forma-symbol-light-on-dark@2x.png     (600x360)
      forma-symbol-light-on-dark@4x.png     (1200x720)
      forma-symbol-dark-on-light.svg
      forma-symbol-dark-on-light@1x.png
      forma-symbol-dark-on-light@2x.png
      forma-symbol-dark-on-light@4x.png
    lockup/
      forma-lockup-horizontal-light-on-dark.svg
      forma-lockup-horizontal-light-on-dark@1x.png
      forma-lockup-horizontal-light-on-dark@2x.png
      forma-lockup-horizontal-light-on-dark@4x.png
      forma-lockup-vertical-light-on-dark.svg
      forma-lockup-vertical-light-on-dark@1x.png
      forma-lockup-vertical-light-on-dark@2x.png
      forma-lockup-vertical-light-on-dark@4x.png
      (dark-on-light variants for all lockups)
    favicon/
      favicon-16.png
      favicon-32.png
      favicon-192.png
      favicon-512.png
    patterns/
      square-wave-pattern.svg
      dot-grid-pattern.svg
      crude-blocks-pattern.svg
    applications/
      business-card-front.png
      business-card-back.png
      social-avatar.png       (400x400)
      social-cover.png        (1500x500)
      email-signature.html
    templates/
      proposal-template.html
      invoice-template.html
    fonts/
      Crude.otf
      VogjerDemo.otf
```

---

## 3. Color System

### Palette A — Gold (Default)

| Token | Hex | Role |
|-------|-----|------|
| Black | #0c0c0e | Primary background |
| White | #f0eee8 | Primary text, logo on dark |
| Gold | #8b7355 | Accent, dividers, highlights |
| Surface | #141414 | Cards, elevated surfaces |
| Surface Light | #1a1a1a | Subtle fills, backgrounds |
| Border | #1e1e1e | Borders, separators |
| Text Dim | #8a8a8a | Secondary text |
| Text Muted | #6b6b6b | Labels, captions |
| Text Ghost | #3a3a3a | Metadata, page numbers |
| Gold Dim | rgba(139,115,85,0.15) | Gold at low opacity fills |

### Palette B — Steel (Alternative)

| Token | Hex | Role |
|-------|-----|------|
| Steel Blue | #A1AAC8 | Accent (replaces Gold) |
| Steel Dim | #7a8199 | Muted accent |
| Steel Ghost | #3d4155 | Ultra-subtle backgrounds |

**Rule:** Never mix Palette A and B in the same material. Choose one per piece.

### Light Mode (Minimal)

| Token | Hex | Role |
|-------|-----|------|
| Light BG | #f5f3ef | Background |
| Dark Text | #1a1714 | Primary text, logo |
| Gold | #8b7355 | Accent (unchanged) |

Light mode is for logo on light backgrounds only. Not a full design system.

---

## 4. Typography

| Role | Family | Weight | Size Range | Tracking |
|------|--------|--------|------------|----------|
| Display / Wordmark | Crude | Regular | 40px+ | 0 |
| Headings | Space Grotesk | 700 (Bold) | 32-64px | -0.02em |
| Subheadings | Space Grotesk | 600 (SemiBold) | 14-20px | 0.08em uppercase |
| Body | Space Grotesk | 300 (Light) | 13-16px | 0 |
| Data / Numbers | Space Mono | 700 (Bold) | 11-28px | 0 |
| Labels | Space Mono | 400 | 10-12px | 0.15-0.2em uppercase |

---

## 5. Symbol — Flag V3

Constructed from two polygons (inward V-notch):
```
Top half:  polygon points="0,0 300,0 253,87 0,87"
Bottom half: polygon points="0,93 253,93 300,180 0,180"
```

Proportions: 300:180 (5:3 ratio)
Gap: 6 units at y=87-93
Notch depth: 47 units from right edge (300-253)

---

## 6. Wordmark

Crude font "forma" lowercase, SVG outlines.
ViewBox: `0 0 4550 882` (corrected for full "f" ascender)
Transform: `scale(1,-1) translate(0,-881.89)`

5 glyphs: f, o, r, m, a — each as individual path with translate.

---

## 7. Lockups

### Horizontal
Symbol (left) + gap (28px at 1x) + wordmark (right), vertically centered.

### Vertical
Symbol (top, centered) + gap (20px at 1x) + wordmark (below, centered).

---

## 8. Clear Space

Minimum clear space = height of the symbol (the "flag"). No other elements within this boundary.

Minimum size:
- Wordmark: 120px wide (digital), 30mm (print)
- Symbol: 24px wide (digital), 8mm (print)
- Favicon: symbol only at 16px+

---

## 9. Graphic Patterns

Three reusable patterns documented with SVG source:

1. **Square Wave** — Horizontal line pattern referencing sound waveforms. Gold at low opacity on dark.
2. **Dot Grid** — Radial gradient circles at 30px intervals. Texture fill for empty areas.
3. **Crude Blocks** — Rectangular blocks mimicking Crude font letterforms. Decorative corners/backgrounds.

---

## 10. Applications

### Business Card (90x50mm)
- Front: Dark bg, symbol centered, "forma.audio" below
- Back: Dark bg, wordmark top-left, contact info bottom-left, Crude blocks pattern bottom-right

### Social Avatar (400x400)
- Symbol only, centered on dark bg, with padding

### Social Cover (1500x500)
- Horizontal lockup left-aligned, square wave pattern right side

### Email Signature (HTML)
- Inline HTML, symbol + "forma.audio" + services line

---

## 11. Do's and Don'ts

**Do:**
- Use provided SVG/PNG files
- Maintain clear space
- Use on approved backgrounds (dark primary, light minimal)

**Don't:**
- Stretch or distort
- Change colors outside the palette
- Place on busy/photo backgrounds without overlay
- Mix Palette A and B
- Recreate the wordmark in a different font
- Use the symbol rotated

---

## 12. Motion Guidelines

- Transitions: opacity 0 to 1, y: 12px to 0. Duration: 250ms. Ease: cubic-bezier(0.25, 0.46, 0.45, 0.94)
- Symbol reveal: two halves slide in from opposite sides (top half from left, bottom half from right)
- No bounce, no spring, no overshoot
- Preferred: cut, fade, slide. Never: spin, zoom, elastic

---

## 13. Audio Branding

Specs for the sonic logo / audio signature:

- **Duration:** 2-4 seconds
- **Tonal center:** Dm or Am (warm minor keys)
- **Texture:** Nylon guitar (classical) + analog pad swell
- **Character:** Organic, warm, intimate. Not synthetic or aggressive.
- **Mood descriptors:** Liminal, tactile, grounded, ethereal
- **Frequency focus:** 200-800Hz warmth, gentle high-end shimmer above 4kHz
- **Dynamic:** Starts near silence, single gesture, dissolves

---

## 14. Templates

### Proposal (HTML)
- Cover page with lockup + project title
- Content pages following pitch deck grid (80px margins, same type hierarchy)
- Close page with symbol + contact

### Invoice (HTML)
- Minimal: lockup top-left, invoice data in Space Mono, items in Space Grotesk
- Footer: forma.audio + services

---

## 15. Implementation Plan

### Phase 1: Asset Generation (Python/Pillow)
1. Generate all SVGs (wordmark, symbol, lockups, patterns) with correct viewBoxes
2. Render PNGs at 1x, 2x, 4x with transparent backgrounds
3. Generate favicons from symbol

### Phase 2: Brand Manual (HTML)
4. Build brand-manual.html with all 12 sections
5. Embed visual examples inline (SVG + rendered)
6. Include both palettes with swatches

### Phase 3: Applications
7. Render business card (front + back)
8. Render social assets (avatar, cover)
9. Build email signature HTML
10. Build proposal + invoice templates

### Phase 4: Package & Commit
11. Organize file structure
12. Commit to git, push to GitHub
