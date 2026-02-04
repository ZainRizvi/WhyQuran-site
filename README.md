# Why Quran

Quran tafsirs and Islamic lectures based on the teachings of the Ahlul Bayt.

## About

This is the source code for [why-quran.org](https://why-quran.org), a website hosting Quran tafsir video series and the Life of Prophet Muhammad lecture series by Sheikh Azhar Nasser.

## Content

- **The Life of Prophet Muhammad** - A comprehensive 103-episode seerah series
- **Surah Tawbah Tafsir** - Verse-by-verse commentary
- **Surah Al-Anbiya Tafsir** - Verse-by-verse commentary
- **Surah Ar-Rum Tafsir** - Verse-by-verse commentary
- **Surah Fatir Tafsir** - Verse-by-verse commentary
- **Surah Hujurat Tafsir** - Verse-by-verse commentary

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- TypeScript
- YouTube embeds for video content

## Data Structure

All video series data is stored in `src/data/series.yaml` as the single source of truth. This includes:
- Series metadata (title, description, speaker, playlist URLs)
- Episode data (video IDs, titles, descriptions)
- Podcast links where available

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Scripts

- `scripts/fetch-video-descriptions.js` - Fetches video descriptions from YouTube metadata

## License

Content is property of Why Quran / Sheikh Azhar Nasser.
