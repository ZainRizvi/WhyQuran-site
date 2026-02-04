#!/usr/bin/env node
/**
 * Merges new playlists with existing series.yaml, sorted by surah number
 */

import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const EXISTING_YAML = path.join(process.cwd(), 'src/data/series.yaml');
const NEW_PLAYLISTS = '/tmp/remaining-playlists.yaml';

// Load existing series
const existingData = yaml.load(fs.readFileSync(EXISTING_YAML, 'utf8'));
const newPlaylists = yaml.load(fs.readFileSync(NEW_PLAYLISTS, 'utf8'));

// Get existing playlist IDs to avoid duplicates
const existingPlaylistIds = new Set(
  existingData.series.map(s => s.playlist_id)
);

// Filter out duplicates and merge
const newSeries = newPlaylists.filter(s => !existingPlaylistIds.has(s.playlist_id));
const allSeries = [...existingData.series, ...newSeries];

// Sort:
// 1. Life of Prophet Muhammad first (no surah_number, specific id)
// 2. Special series without surah_number (Bismillah, Ayat-ul-Kursi) at the end
// 3. Everything else by surah_number
allSeries.sort((a, b) => {
  // Prophet Muhammad always first
  if (a.id === 'the-life-of-prophet-muhammad') return -1;
  if (b.id === 'the-life-of-prophet-muhammad') return 1;

  // Series with surah numbers come before special series
  const aHasSurah = a.surah_number != null;
  const bHasSurah = b.surah_number != null;

  if (aHasSurah && !bHasSurah) return -1;
  if (!aHasSurah && bHasSurah) return 1;

  // Both have surah numbers - sort by number
  if (aHasSurah && bHasSurah) {
    return a.surah_number - b.surah_number;
  }

  // Both are special series - sort alphabetically
  return a.title.localeCompare(b.title);
});

// Build final data structure
const finalData = {
  channel: existingData.channel,
  series: allSeries
};

// Output
console.log(yaml.dump(finalData, {
  lineWidth: -1,
  quotingType: '"',
  noRefs: true
}));
