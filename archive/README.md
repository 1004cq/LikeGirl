# Constant Archive

Museum-grade private couple archive — **Astro + TypeScript + Tailwind CSS v4**.

Warm editorial minimalism (Kinfolk / Cereal / Aperture). Islands Architecture keeps the page static by default; Canvas orbit and soundscape hydrate as lightweight client scripts.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Astro 5 (static SSG, Islands) |
| Language | TypeScript (strict) |
| Styles | Tailwind CSS v4 + editorial CSS |
| Motion | Lenis smooth scroll |
| Visual | HTML5 Canvas 2D gravitational orbit |
| Audio | Web Audio API (consent-first, no autoplay) |

## Develop

```bash
cd archive
npm install
npm run dev
```

## Build / preview

```bash
npm run build
npm run preview
```

Static output lands in `dist/`.

## Architecture

```
src/
  components/   Astro islands & sections
  data/         Typed chapter + voice content
  lib/          orbit.ts · soundscape.ts · archive.ts
  layouts/      BaseLayout
  pages/        index.astro
  styles/       Tailwind theme + editorial system
public/images/  Chapter photography
```

## Modules

1. **Ambient Physics Hero** — dual celestial particles, archival day index
2. **Curated Chapters** — magazine splits, EXIF stamps, mono→color hover
3. **Polyphonic Monologue** — dual perspective at one timestamp
4. **Soundscape** — glassmorphic capsule, never autoplays
