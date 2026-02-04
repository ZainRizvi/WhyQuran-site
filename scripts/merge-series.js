#!/usr/bin/env node
/**
 * Merges new playlists with existing series.yaml, sorted by surah number
 * (Life of Prophet Muhammad first, then surahs in numerical order)
 */

import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const EXISTING_YAML = path.join(process.cwd(), 'src/data/series.yaml');
const NEW_PLAYLISTS = '/tmp/new-playlists.yaml';

// Load existing series
const existingData = yaml.load(fs.readFileSync(EXISTING_YAML, 'utf8'));
const newPlaylists = yaml.load(fs.readFileSync(NEW_PLAYLISTS, 'utf8'));

// Get existing playlist IDs to avoid duplicates
const existingPlaylistIds = new Set(
  existingData.series.map(s => s.playlist_id)
);

// Add speaker to Surah Baqarah
const baqarah = newPlaylists.find(s => s.surah_number === 2);
if (baqarah) {
  baqarah.speaker = 'Shaykh Bahmanpour';
}

// Filter out duplicates and merge
const newSeries = newPlaylists.filter(s => !existingPlaylistIds.has(s.playlist_id));
const allSeries = [...existingData.series, ...newSeries];

// Sort: Prophet Muhammad first (no surah_number), then by surah_number
allSeries.sort((a, b) => {
  // No surah_number means it should come first
  if (!a.surah_number && !b.surah_number) return 0;
  if (!a.surah_number) return -1;
  if (!b.surah_number) return 1;
  return a.surah_number - b.surah_number;
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
