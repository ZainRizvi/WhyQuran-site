#!/usr/bin/env node
/**
 * Fetches remaining playlist data from YouTube and outputs YAML
 */

import { execFileSync } from 'child_process';
import yaml from 'js-yaml';

const playlists = [
  { id: 'PLpkB0iwLgfTbqe-EgEHRQ6Bl69bN70mm3', surah: 1, title: 'Surahs Fateha & Al-Taghabun', speaker: null },
  { id: 'PLpkB0iwLgfTbkKzoxFnEqDb1Yv5KZ1plq', surah: 7, title: 'Surah Al-Araf', speaker: 'Sheikh Murtaza Alidina', partial: true },
  { id: 'PLpkB0iwLgfTZuuzfj8pqRfGYeZnsxIhn1', surah: 13, title: 'Surah ar-Raad', speaker: 'Sheikh Jaffer H. Jaffer', partial: true },
  { id: 'PLpkB0iwLgfTY_lX4vSt-tZsZAmQftNYuM', surah: 37, title: 'Surah As-Saffat', speaker: null },
  { id: 'PLpkB0iwLgfTah73Pmrk4Iq-_4gbPBgV6I', surah: 48, title: 'Surah Fath', speaker: 'Sayyid Muhammad Rizvi' },
  { id: 'PLpkB0iwLgfTaKs5yAfZtxlWaXBG_-ar2c', surah: 51, title: 'Surah az-Zariyat', speaker: 'Maulana Syed Muhammad Rizvi' },
  { id: 'PLpkB0iwLgfTYl9xz_P_bxW4vlFY9-j8CX', surah: 52, title: 'Surah at-Tur', speaker: null, partial: true },
  { id: 'PLpkB0iwLgfTZfK5tSvZX8EtdyVqDb57Y6', surah: 56, title: 'Surah Waqiah', speaker: 'Sheikh Murtaza Alidina' },
  { id: 'PLpkB0iwLgfTYYH8suI1vwQD-MBNazq-Pq', surah: 62, title: 'Surah Al-Jumuah', speaker: null, partial: true },
  { id: 'PLpkB0iwLgfTYdTSYPPn_duwsg8XsCTNIX', surah: 71, title: 'Surah Nuh', speaker: null },
  { id: 'PLpkB0iwLgfTb7hrIzbi-bp3HXvHAx60Co', surah: 75, title: 'Surah Qiyamah', speaker: 'Sheikh Murtaza Alidina' },
  { id: 'PLpkB0iwLgfTY4Iv2UJqVHiBlCCwpENl9l', surah: 87, title: 'Surah Al-Ala', speaker: null },
  { id: 'PLpkB0iwLgfTZyJjxZg8k-lpZ0pLTTgtVw', surah: 93, title: 'Surah Ad-Duha', speaker: null },
  // Special non-surah series
  { id: 'PLpkB0iwLgfTY5_dddDv_Gl-Ams-S8VwO8', surah: null, title: 'Ayat-ul-Kursi', speaker: null, special: 'ayat-ul-kursi' },
  { id: 'PLpkB0iwLgfTbdQeNLiymYkRhXuRgsm9ip', surah: null, title: 'Bismillah Tafsir', speaker: 'H.I. Abbas Ayleya', special: 'bismillah' },
];

function fetchPlaylist(playlistId) {
  try {
    const result = execFileSync(
      'uvx',
      ['yt-dlp', '--flat-playlist', '-j', `https://www.youtube.com/playlist?list=${playlistId}`],
      { encoding: 'utf8', timeout: 60000, maxBuffer: 10 * 1024 * 1024 }
    );
    return result.trim().split('\n').filter(l => l).map(line => JSON.parse(line));
  } catch (e) {
    console.error(`Failed to fetch playlist ${playlistId}: ${e.message}`);
    return [];
  }
}

function fetchVideoDescription(videoId) {
  try {
    const result = execFileSync(
      'uvx',
      ['yt-dlp', '--print', '%(description)s', `https://www.youtube.com/watch?v=${videoId}`],
      { encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'ignore'] }
    );
    // Get first meaningful paragraph
    const paragraphs = result.split(/\n\n+/);
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
  } catch (e) {
    return null;
  }
}

async function main() {
  const series = [];

  for (const playlist of playlists) {
    console.error(`Fetching: ${playlist.title}...`);

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

    const id = playlist.special || playlist.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const seriesEntry = {
      id,
      title: playlist.title,
      description: playlist.surah
        ? `Tafsir of ${playlist.title} (Surah #${playlist.surah})${playlist.partial ? ' - Partial' : ''}`
        : `Tafsir of ${playlist.title}`,
      playlist_id: playlist.id,
      playlist_url: `https://www.youtube.com/playlist?list=${playlist.id}`,
      thumbnail_video_id: videos[0].id,
      episodes,
    };

    if (playlist.surah) {
      seriesEntry.surah_number = playlist.surah;
    }
    if (playlist.speaker) {
      seriesEntry.speaker = playlist.speaker;
    }

    series.push(seriesEntry);
  }

  // Output as YAML
  console.log(yaml.dump(series, { lineWidth: -1, quotingType: '"' }));
}

main();
