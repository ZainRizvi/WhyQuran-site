#!/usr/bin/env node
/**
 * Fetches video descriptions from YouTube and updates the series.yaml file.
 * Run with: node scripts/fetch-video-descriptions.js
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const YAML_PATH = path.join(process.cwd(), 'src/data/series.yaml');

// Load current YAML
const fileContents = fs.readFileSync(YAML_PATH, 'utf8');
const data = yaml.load(fileContents);

// Function to get first meaningful paragraph from description
function extractDescription(fullDesc) {
  if (!fullDesc) return null;

  // Split by double newlines to get paragraphs
  const paragraphs = fullDesc.split(/\n\n+/);

  // Get first paragraph that's not a URL or boilerplate
  for (const para of paragraphs) {
    const trimmed = para.trim();
    // Skip if it's a URL, empty, or boilerplate
    if (!trimmed) continue;
    if (trimmed.startsWith('http')) continue;
    if (trimmed.includes('downloadable at')) continue;
    if (trimmed.toLowerCase().includes('life of prophet muhammad by')) continue;
    if (trimmed.toLowerCase().includes('live classes')) continue;
    if (trimmed.toLowerCase().includes('get notified')) continue;
    if (trimmed.toLowerCase().includes('subscribe for email')) continue;
    if (trimmed.toLowerCase().includes('past classes')) continue;
    if (trimmed.toLowerCase().includes('join us on telegram')) continue;

    return trimmed;
  }

  return null;
}

// Function to fetch video description using execFileSync (safer than exec)
function fetchVideoDescription(videoId) {
  try {
    const result = execFileSync(
      'uvx',
      ['yt-dlp', '--print', '%(description)s', `https://www.youtube.com/watch?v=${videoId}`],
      { encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'ignore'] }
    );
    return extractDescription(result);
  } catch (e) {
    console.error(`Failed to fetch description for ${videoId}: ${e.message}`);
    return null;
  }
}

// Process each series
for (const series of data.series) {
  console.log(`\nProcessing series: ${series.title}`);

  for (let i = 0; i < series.episodes.length; i++) {
    const episode = series.episodes[i];

    // Skip if already has description
    if (episode.description) {
      console.log(`  [${i + 1}/${series.episodes.length}] ${episode.title} - already has description`);
      continue;
    }

    console.log(`  [${i + 1}/${series.episodes.length}] Fetching: ${episode.title}`);
    const desc = fetchVideoDescription(episode.video_id);

    if (desc) {
      episode.description = desc;
      console.log(`    -> "${desc.substring(0, 60)}..."`);
    } else {
      console.log(`    -> No description found`);
    }

    // Save after each fetch in case of interruption
    if (i % 10 === 0) {
      fs.writeFileSync(YAML_PATH, yaml.dump(data, { lineWidth: -1, quotingType: '"' }));
    }
  }
}

// Final save
fs.writeFileSync(YAML_PATH, yaml.dump(data, { lineWidth: -1, quotingType: '"' }));
console.log('\nDone! Updated', YAML_PATH);
