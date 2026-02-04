#!/usr/bin/env node

import fetch from 'node-fetch';
import TurndownService from 'turndown';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const WP_BASE = 'http://www.why-quran.org';
const WP_API = `${WP_BASE}/wp-json/wp/v2`;

// Allow redirects but with a custom handler
const fetchOptions = {};
const CONTENT_DIR = 'src/content/blog';
const DOWNLOADS_DIR = 'public/downloads';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Custom rule to handle YouTube iframes - extract video ID
turndown.addRule('youtube', {
  filter: (node) => {
    if (node.nodeName === 'IFRAME') {
      const src = node.getAttribute('src') || '';
      return src.includes('youtube.com') || src.includes('youtu.be');
    }
    return false;
  },
  replacement: (content, node) => {
    // We'll extract YouTube IDs separately, just remove the iframe from markdown
    return '';
  },
});

// Remove empty paragraphs
turndown.addRule('emptyP', {
  filter: (node) => {
    return node.nodeName === 'P' && !node.textContent.trim();
  },
  replacement: () => '',
});

function extractYoutubeId(html) {
  // Match YouTube iframe src
  const patterns = [
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractEpisodeNumber(title) {
  // Match patterns like "[103]", "[12 ]" (with space), "Episode 1:", etc.
  const patterns = [
    /\[(\d+)\s*\]/,               // [103] or [12 ] format
    /Episode\s*(\d+)/i,
    /Ep\.?\s*(\d+)/i,
    /Part\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return parseInt(match[1], 10);
  }
  return null;
}

function extractSlideLinks(html) {
  const slides = [];
  // Match links to PowerPoint and PDF files
  const linkPattern = /<a[^>]+href=["']([^"']+\.(pptx?|pdf))["'][^>]*>([^<]*)</gi;
  let match;

  while ((match = linkPattern.exec(html)) !== null) {
    const url = match[1];
    const ext = match[2];
    let name = match[3].trim() || path.basename(url);

    slides.push({ url, name, ext });
  }

  return slides;
}

async function downloadFile(url, destPath) {
  try {
    // Make relative URLs absolute
    const absoluteUrl = url.startsWith('/') ? `${WP_BASE}${url}` : url;
    const response = await fetch(absoluteUrl);
    if (!response.ok) {
      console.error(`  Failed to download ${absoluteUrl}: ${response.status}`);
      return false;
    }

    await pipeline(response.body, createWriteStream(destPath));
    return true;
  } catch (err) {
    console.error(`  Error downloading ${url}:`, err.message);
    return false;
  }
}

async function fetchAllPosts() {
  const posts = [];
  let page = 1;
  let hasMore = true;

  console.log('Fetching posts from WordPress API...');

  while (hasMore) {
    const url = `${WP_API}/posts?per_page=100&page=${page}&_embed`;
    console.log(`  Fetching page ${page}...`);

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      if (response.status === 400) {
        hasMore = false;
        continue;
      }
      throw new Error(`API error: ${response.status}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', text.substring(0, 200));
      throw e;
    }

    if (data.length === 0) {
      hasMore = false;
    } else {
      posts.push(...data);
      page++;
    }
  }

  console.log(`  Found ${posts.length} posts`);
  return posts;
}

async function fetchAllPages() {
  console.log('Fetching pages from WordPress API...');

  const response = await fetch(`${WP_API}/pages?per_page=100&_embed`, fetchOptions);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const pages = await response.json();
  console.log(`  Found ${pages.length} pages`);
  return pages;
}

function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

async function processPost(post) {
  const title = post.title.rendered
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '');

  const slug = post.slug;
  const date = new Date(post.date);
  const content = post.content.rendered;

  const youtubeId = extractYoutubeId(content);
  const episode = extractEpisodeNumber(title);
  const slideLinks = extractSlideLinks(content);

  // Convert HTML to Markdown
  let markdown = turndown.turndown(content);

  // Clean up markdown
  markdown = markdown
    // Remove YouTube URL lines (we have it in frontmatter)
    .replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=[^\s\n]+/g, '')
    .replace(/https?:\/\/(www\.)?youtu\.be\/[^\s\n]+/g, '')
    // Remove slide download links (they'll be in frontmatter)
    .replace(/\[([^\]]*)\]\([^)]+\.(pptx?|pdf)\)/gi, '')
    // Remove multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Download slides and update links (dedupe by URL)
  const slides = [];
  const seenUrls = new Set();
  for (const slide of slideLinks) {
    const filename = sanitizeFilename(path.basename(slide.url));
    const localPath = `/downloads/${filename}`;

    // Skip duplicates
    if (seenUrls.has(localPath)) continue;
    seenUrls.add(localPath);

    const fullPath = path.join(DOWNLOADS_DIR, filename);

    // Check if already downloaded
    try {
      await fs.access(fullPath);
      console.log(`  Slide already exists: ${filename}`);
    } catch {
      console.log(`  Downloading: ${slide.url}`);
      await downloadFile(slide.url, fullPath);
    }

    // Use a cleaner name if the slide text is just "Download"
    const name = slide.name === 'Download' ? `Lecture ${episode || ''} Slides`.trim() : slide.name;

    slides.push({
      name,
      url: localPath,
    });
  }

  // Create frontmatter
  const frontmatter = {
    title,
    slug,
    date: date.toISOString().split('T')[0],
    ...(episode && { episode }),
    ...(youtubeId && { youtubeId }),
    ...(slides.length > 0 && { slides }),
  };

  // Build markdown file content
  const frontmatterYaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (key === 'slides') {
        const slidesYaml = value.map(s => `  - name: "${s.name}"\n    url: "${s.url}"`).join('\n');
        return `slides:\n${slidesYaml}`;
      }
      if (typeof value === 'string') {
        // Escape quotes in strings
        return `${key}: "${value.replace(/"/g, '\\"')}"`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');

  const fileContent = `---\n${frontmatterYaml}\n---\n\n${markdown}\n`;

  // Write to file
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  await fs.writeFile(filePath, fileContent, 'utf-8');

  return { title, slug, episode, youtubeId, slides: slides.length };
}

async function savePagesInfo(pages) {
  // Save page info to a JSON file for reference
  const pageInfo = pages.map(page => ({
    title: page.title.rendered.replace(/<[^>]+>/g, ''),
    slug: page.slug,
    content: page.content.rendered,
  }));

  await fs.writeFile(
    'scripts/pages-data.json',
    JSON.stringify(pageInfo, null, 2),
    'utf-8'
  );

  console.log('  Saved page data to scripts/pages-data.json');
}

async function main() {
  console.log('WordPress to Astro Migration Script\n');

  // Ensure directories exist
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.mkdir(DOWNLOADS_DIR, { recursive: true });

  // Fetch all content
  const posts = await fetchAllPosts();
  const pages = await fetchAllPages();

  console.log('\nProcessing posts...');
  const results = [];

  for (const post of posts) {
    console.log(`Processing: ${post.title.rendered.substring(0, 50)}...`);
    const result = await processPost(post);
    results.push(result);
  }

  // Save pages data for manual processing
  await savePagesInfo(pages);

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total posts processed: ${results.length}`);
  console.log(`Posts with YouTube videos: ${results.filter(r => r.youtubeId).length}`);
  console.log(`Posts with slides: ${results.filter(r => r.slides > 0).length}`);

  // List episodes
  const episodes = results
    .filter(r => r.episode)
    .sort((a, b) => a.episode - b.episode);

  console.log(`\nEpisodes found: ${episodes.length}`);

  // Find gaps
  if (episodes.length > 0) {
    const maxEp = Math.max(...episodes.map(e => e.episode));
    const foundEps = new Set(episodes.map(e => e.episode));
    const missing = [];
    for (let i = 1; i <= maxEp; i++) {
      if (!foundEps.has(i)) missing.push(i);
    }
    if (missing.length > 0) {
      console.log(`Missing episodes: ${missing.join(', ')}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
