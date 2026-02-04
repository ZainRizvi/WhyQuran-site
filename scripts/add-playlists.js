#!/usr/bin/env node
/**
 * Fetches playlist data from YouTube and outputs YAML for series.yaml
 */

import { execFileSync } from 'child_process';
import yaml from 'js-yaml';

const playlists = [
  { id: 'PLpkB0iwLgfTY0yynbzhVmHLn70oixiYof', surah: 2, title: 'Surah Baqarah', speaker: null },
  { id: 'PLpkB0iwLgfTYkIWHLiRcRaSnXnwfjFQhC', surah: 6, title: 'Surah An\'am', speaker: 'Sheikh Azhar Nasser' },
  { id: 'PLpkB0iwLgfTYXQw-nxc9LFKCy44NFvuSW', surah: 12, title: 'Surah Yusuf', speaker: 'Sheikh Jaffer H. Jaffer' },
  { id: 'PLpkB0iwLgfTYzrz_xusVs3RS94c5j4AzX', surah: 36, title: 'Surah Yasin', speaker: 'Molana Sayyid Muhammad Rizvi' },
  { id: 'PLpkB0iwLgfTZRLsFdSpmCt6MxlR_uagIv', surah: 44, title: 'Surah Dukhan', speaker: 'Sayyid Muhammad Rizvi' },
  { id: 'PLpkB0iwLgfTYz7QtT_Eu8iZt5uHNYDSuG', surah: 45, title: 'Surah Jathiya', speaker: 'Sayyid Muhammad Rizvi' },
  { id: 'PLpkB0iwLgfTYPCbkE5nTUGo_iHiDC3IP3', surah: 53, title: 'Surah Najm', speaker: 'Sheikh Azhar Nasser' },
  { id: 'PLpkB0iwLgfTZlig1DJQAxhLCyVnq9zP2h', surah: 55, title: 'Surah Rahman', speaker: 'Maulana Syed Muhammad Rizvi' },
  { id: 'PLpkB0iwLgfTYHjOQoNsYZJp0YyNIGg17c', surah: 57, title: 'Surah Al-Hadid', speaker: 'Sayyid Muhammad Rizvi' },
  { id: 'PLpkB0iwLgfTZIuc7UCXQIKiEm4CHEw516', surah: 65, title: 'Surah at-Talaq', speaker: 'Molana Sayyid Muhammad Rizvi' },
  { id: 'PLpkB0iwLgfTaOp2fZkRehj4MZhen5aBtD', surah: 67, title: 'Surah Al-Mulk', speaker: 'Syed Muhammad Rizvi' },
];

function fetchPlaylist(playlistId) {
  try {
    const result = execFileSync(
      'uvx',
      ['yt-dlp', '--flat-playlist', '-j', `https://www.youtube.com/playlist?list=${playlistId}`],
      { encoding: 'utf8', timeout: 60000, maxBuffer: 10 * 1024 * 1024 }
    );
    return result.trim().split('\n').map(line => JSON.parse(line));
  } catch (e) {
    console.error(`Failed to fetch playlist ${playlistId}: ${e.message}`);
    return [];
  }
}

function extractDescription(fullDesc) {
  if (!fullDesc) return null;
  const paragraphs = fullDesc.split(/\n\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('http')) continue;
    if (trimmed.toLowerCase().includes('subscribe')) continue;
    if (trimmed.toLowerCase().includes('live classes')) continue;
    if (trimmed.toLowerCase().includes('telegram')) continue;
    return trimmed;
  }
  return null;
}

function fetchVideoDescription(videoId) {
  try {
    const result = execFileSync(
      'uvx',
      ['yt-dlp', '--print', '%(description)s', `https://www.youtube.com/watch?v=${videoId}`],
      { encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'ignore'] }
    );
    return extractDescription(result);
  } catch (e) {
    return null;
  }
}

async function main() {
  const series = [];

  for (const playlist of playlists) {
    console.error(`Fetching: ${playlist.title} (#${playlist.surah})...`);

    const videos = fetchPlaylist(playlist.id);
    if (videos.length === 0) {
      console.error(`  Skipping - no videos found`);
      continue;
    }

    const episodes = [];
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      console.error(`  [${i + 1}/${videos.length}] ${video.title}`);

      const desc = fetchVideoDescription(video.id);

      const episode = {
        video_id: video.id,
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
      };
      if (desc) {
        episode.description = desc;
      }
      episodes.push(episode);
    }

    const seriesEntry = {
      id: playlist.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      title: playlist.title,
      surah_number: playlist.surah,
      description: `Tafsir of ${playlist.title} (Surah #${playlist.surah})`,
      playlist_id: playlist.id,
      playlist_url: `https://www.youtube.com/playlist?list=${playlist.id}`,
      thumbnail_video_id: videos[0].id,
      episodes,
    };

    if (playlist.speaker) {
      seriesEntry.speaker = playlist.speaker;
    }

    series.push(seriesEntry);
  }

  // Output as YAML
  console.log(yaml.dump(series, { lineWidth: -1, quotingType: '"' }));
}

main();
