# Why Quran Blog - Project Context

## Overview

This is an Astro static site for Why Quran, a Quran tafsir and Islamic lecture website. The site aggregates video content from the Why Quran YouTube channel.

## Single Source of Truth

**`src/data/series.yaml`** is the authoritative data source for all video series and episodes. All pages should read from this file rather than duplicating data.

The YAML structure:
- `channel`: YouTube channel info
- `series[]`: Array of video series, each containing:
  - `id`: URL-friendly identifier (e.g., `the-life-of-prophet-muhammad`)
  - `title`, `description`, `speaker`
  - `playlist_id`, `playlist_url`: YouTube playlist info
  - `thumbnail_video_id`: Video ID for series thumbnail
  - `has_dedicated_page`: Whether series has its own page on the site
  - `episodes[]`: Array of episodes with `video_id`, `title`, `url`

## Content Architecture

- **Homepage** (`src/pages/index.astro`): Shows all series as cards, reads from YAML
- **Series pages** (e.g., `/the-life-of-prophet-muhammad/`): Lists all episodes in a series
- **Blog posts** (`src/content/blog/*.md`): Individual episode pages with embedded video

Blog posts link to YAML data via `episode` number in frontmatter. The series page looks up blog permalinks by episode number.

## Data Flow

1. YouTube metadata (video IDs, titles, descriptions) is fetched using `uvx yt-dlp`
2. Data is stored in `src/data/series.yaml`
3. Pages read from YAML at build time
4. Blog posts are created for episodes that need dedicated pages

## Key Decisions

- **No play icon overlays**: Removed due to CSS positioning issues causing giant icons
- **Internal links preferred**: Series pages link to blog posts (not YouTube) when available
- **YouTube thumbnails**: Use `https://img.youtube.com/vi/{VIDEO_ID}/mqdefault.jpg`
- **Site name**: "Why Quran" (not "why-quran.org")
- **No Tasneem Institute branding**: Removed from footer and pages

## Missing Content

Episode 89 has no blog post. When blog posts are missing, the series page falls back to linking directly to YouTube.

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

## Future Work

- Create missing blog posts (episode 89) - or generate from YAML data
- Add remaining series episode descriptions (Surah Fatir, Surah Hujurat incomplete)
