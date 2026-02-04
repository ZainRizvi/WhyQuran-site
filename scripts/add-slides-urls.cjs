#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Slides URLs extracted from markdown files
const slidesUrls = {
  1: '/downloads/seerah-1.pptx',
  2: '/downloads/seerah-2.pptx',
  3: '/downloads/seerah-3.pptx',
  4: '/downloads/seerah-4.pptx',
  5: '/downloads/seerah-5.pptx',
  6: '/downloads/seerah-6.pptx',
  7: '/downloads/seerah-7.pptx',
  8: '/downloads/seerah-8.pptx',
  9: '/downloads/seerah-9.pptx',
  10: '/downloads/seerah-10.pptx',
  11: '/downloads/seerah-11.pptx',
  12: '/downloads/seerah-12.pptx',
  13: '/downloads/seerah-13.pptx',
  14: '/downloads/seerah-14.pptx',
  15: '/downloads/seerah-15.pptx',
  16: '/downloads/seerah-16.pptx',
  17: '/downloads/seerah-17.pptx',
  18: '/downloads/seerah-18.pptx',
  19: '/downloads/seerah-19.pptx',
  20: '/downloads/seerah-20.pptx',
  21: '/downloads/seerah-21.pptx',
  22: '/downloads/seerah-22.pptx',
  23: '/downloads/seerah-23.pptx',
  24: '/downloads/seerah-24.pptx',
  25: '/downloads/seerah-25.pptx',
  26: '/downloads/seerah-26.pptx',
  27: '/downloads/seerah-27.pptx',
  28: '/downloads/seerah-28.pptx',
  29: '/downloads/seerah-29.pptx',
  30: '/downloads/seerah-30.pptx',
  31: '/downloads/seerah-31.pptx',
  32: '/downloads/seerah-32.pptx',
  33: '/downloads/mediaimagesseerah-33.pptx',
  34: '/downloads/mediaimagesseerah-34.pptx',
  35: '/downloads/mediaimagesseerah-35.pptx',
  36: '/downloads/mediaimagesseerah-36.pptx',
  37: '/downloads/mediaimagesseerah-37.pptx',
  38: '/downloads/mediaimagesseerah-38.pptx',
  39: '/downloads/mediaimagesseerah-39.pptx',
  40: '/downloads/mediaimagesseerah-40.pptx',
  41: '/downloads/mediaimagesseerah-41.pptx',
  42: '/downloads/mediaimagesseerah-42.pptx',
  43: '/downloads/mediaimagesseerah-43.pptx',
  44: '/downloads/mediaimagesseerah-44.pptx',
  45: '/downloads/mediadownloadsseerah-45-1.pptx',
  46: '/downloads/mediadownloadsseerah-46.pptx',
  47: '/downloads/mediadownloadsseerah-47.pptx',
  48: '/downloads/mediadownloadsseerah-48.pptx',
  49: '/downloads/mediadownloadsseerah-49.pptx',
  50: '/downloads/mediadownloadsseerah-50.pptx',
  51: '/downloads/mediadownloadsseerah-51.pptx',
  52: '/downloads/mediadownloadsseerah-52.pptx',
  53: '/downloads/mediadownloadsseerah-53.pptx',
  54: '/downloads/mediadownloadsseerah-54-2.pptx',
  55: '/downloads/mediadownloadsseerah-55.pptx',
  56: '/downloads/mediadownloadsseerah-56-1.pptx',
  57: '/downloads/mediadownloadsseerah-57-1.pptx',
  58: '/downloads/mediadownloadsseerah-58.pptx',
  59: '/downloads/mediadownloadsseerah-59.pptx',
  60: '/downloads/mediadownloadsseerah-60.pptx',
  61: '/downloads/mediadownloadsseerah-61.pptx',
  62: '/downloads/mediadownloadsseerah-62.pptx',
  63: '/downloads/mediadownloadsseerah-63.pptx',
  64: '/downloads/mediadownloadsseerah-64.pptx',
  65: '/downloads/mediadownloadsseerah-65.pptx',
  66: '/downloads/mediadownloadsseerah-66.pptx',
  67: '/downloads/mediadownloadsseerah-67.pptx',
  68: '/downloads/mediadownloadsseerah-68.pptx',
  69: '/downloads/mediadownloadsseerah-69.pptx',
  70: '/downloads/mediadownloadsseerah-70.pptx',
  71: '/downloads/mediadownloadsseerah-71-1.pptx',
  72: '/downloads/mediadownloadsseerah-72.pdf',
  73: '/downloads/mediadownloadsseerah-73-1.pdf',
  74: '/downloads/mediadownloadsseerah-74-1.pptx',
  75: '/downloads/mediadownloadsseerah-75.pdf',
  76: '/downloads/mediadownloadsseerah-76.pptx',
  77: '/downloads/mediadownloadsseerah-77.pptx',
  78: '/downloads/mediadownloadsseerah-78.pptx',
  79: '/downloads/mediadownloadsseerah-79.pptx',
  80: '/downloads/mediadownloadsseerah-80.pptx',
  81: '/downloads/mediadownloadsseerah-81.pptx',
  82: '/downloads/mediadownloadsseerah-82.pptx',
  83: '/downloads/mediadownloadsseerah-83.pptx',
  84: '/downloads/mediadownloadsseerah-84.pptx',
  85: '/downloads/mediadownloadsseerah-85.pptx',
  86: '/downloads/mediadownloadsseerah-86-2.pptx',
  87: '/downloads/mediadownloadsseerah-87.pptx',
  88: '/downloads/mediadownloadsseerah-88-1.pptx',
  90: '/downloads/mediadownloadsseerah-90.pptx',
  91: '/downloads/mediadownloadsseerah-91.pptx',
  92: '/downloads/mediadownloadsseerah-92.pptx',
  93: '/downloads/mediadownloadsseerah-93.pptx',
  94: '/downloads/mediadownloadsseerah-94.pptx',
  95: '/downloads/mediadownloadsseerah-95.pptx',
  96: '/downloads/mediadownloadsseerah-96.pptx',
  97: '/downloads/mediadownloadsseerah-97-1.pptx',
  98: '/downloads/mediadownloadsseerah-98.pptx',
  99: '/downloads/mediadownloadsseerah-99.pptx',
  100: '/downloads/mediadownloadsseerah-100.pptx',
  101: '/downloads/mediadownloadsseerah-101.pptx',
  102: '/downloads/mediadownloadsseerah-102.pptx',
  103: '/downloads/mediadownloadsseerah-103-1.pptx',
};

const yamlPath = path.join(__dirname, '..', 'src/data/series.yaml');
const content = fs.readFileSync(yamlPath, 'utf8');
const data = yaml.load(content);

// Find the Prophet Muhammad series
const series = data.series.find(s => s.id === 'the-life-of-prophet-muhammad');
if (!series) {
  console.error('Series not found');
  process.exit(1);
}

// Add slides URLs to episodes
let count = 0;
series.episodes.forEach(ep => {
  const match = ep.title.match(/^\[(\d+)\]/);
  if (match) {
    const epNum = parseInt(match[1]);
    if (slidesUrls[epNum]) {
      ep.slides_url = slidesUrls[epNum];
      count++;
    }
  }
});

console.log(`Added slides URLs to ${count} episodes`);

// Write back with proper YAML formatting
const output = yaml.dump(data, {
  lineWidth: -1,
  noRefs: true,
  quotingType: '"',
  forceQuotes: false,
});
fs.writeFileSync(yamlPath, output);
console.log('Done');
