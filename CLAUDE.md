# Why Quran Blog - Project Context

## Overview

This is an Astro static site for Why Quran, a Quran tafsir and Islamic lecture website. The site aggregates video content from the Why Quran YouTube channel.

## Single Source of Truth

**`src/data/series.yaml`** is the authoritative data source for all video series and episodes. All pages are generated directly from this file at build time.

The YAML structure:
- `channel`: YouTube channel info
- `series[]`: Array of video series, each containing:
  - `id`: URL-friendly identifier (e.g., `the-life-of-prophet-muhammad`)
  - `title`, `description`, `speaker`
  - `playlist_id`, `playlist_url`: YouTube playlist info
  - `podcast_url`: Main podcast feed URL
  - `thumbnail_video_id`: Video ID for series thumbnail
  - `has_dedicated_page`: Whether series has its own page on the site
  - `episodes[]`: Array of episodes with:
    - `video_id`, `title`, `url`: YouTube data
    - `description`: Video description
    - `podcast_episode_url`: Individual podcast episode link
    - `slides_url`: Downloadable slides (pptx/pdf)
    - `published_date`: Original publication date

## Content Architecture

- **Homepage** (`src/pages/index.astro`): Shows all series as cards
- **Series pages** (e.g., `/the-life-of-prophet-muhammad/`): Lists all episodes in a series
- **Blog pages** (`src/pages/blog/[...slug].astro`): Individual episode pages generated from YAML

Blog page slugs are generated from episode titles: `[58] Khandaq: Digging the Trench - Pt 2` becomes `58-khandaq-digging-the-trench-pt-2`.

## Data Flow

1. YouTube metadata (video IDs, titles, descriptions) is fetched using `uvx yt-dlp`
2. Data is stored in `src/data/series.yaml`
3. All pages are generated from YAML at build time (no markdown content files)

## Key Decisions

- **No play icon overlays**: Removed due to CSS positioning issues causing giant icons
- **Internal links preferred**: Series pages link to blog posts (not YouTube) when available
- **YouTube thumbnails**: Use `https://img.youtube.com/vi/{VIDEO_ID}/mqdefault.jpg`
- **Site name**: "Why Quran" (not "why-quran.org")
- **No Tasneem Institute branding**: Removed from footer and pages
- **Hosting**: GitHub Pages (static only, no server-side redirects)
- **No content collections**: Pages are generated directly from YAML, not from markdown files

## Legacy URL Redirects

The old WordPress site used `?p=` URLs (e.g., `why-quran.org/?p=746`). YouTube video descriptions still link to these.

Client-side redirects are implemented in `src/layouts/BaseLayout.astro` via JavaScript. The redirect map was built from a WordPress URL export.

The legacy site is still accessible at `https://whyquran.azurewebsites.net` for reference.

## Tech Stack

- Astro 5.x
- TypeScript
- js-yaml for YAML parsing
- YouTube thumbnails via img.youtube.com

## Commands

```bash
npm run dev     # Start dev server (usually port 4321 or 4322)
npm run build   # Build for production
```

## Scripts

- `scripts/fetch-video-descriptions.js` - Fetches video descriptions from YouTube using yt-dlp and updates series.yaml. Skips episodes that already have descriptions.
- `scripts/add-podcast-urls.cjs` - Adds podcast episode URLs to series.yaml
- `scripts/add-slides-urls.cjs` - Adds slides download URLs to series.yaml
- `scripts/add-publication-dates.cjs` - Adds publication dates to series.yaml

## Future Work

- Add remaining series episode descriptions (Surah Fatir, Surah Hujurat incomplete)
