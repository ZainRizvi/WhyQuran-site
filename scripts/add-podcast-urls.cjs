#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Complete podcast URLs scraped from podcast.lifeofprophetmuhammad.com
const podcastUrls = {
  1: 'https://podcast.lifeofprophetmuhammad.com/1488736/6630823',
  2: 'https://podcast.lifeofprophetmuhammad.com/1488736/6686876',
  3: 'https://podcast.lifeofprophetmuhammad.com/1488736/6824479',
  4: 'https://podcast.lifeofprophetmuhammad.com/1488736/6951359',
  5: 'https://podcast.lifeofprophetmuhammad.com/1488736/7028995',
  6: 'https://podcast.lifeofprophetmuhammad.com/1488736/7140931',
  7: 'https://podcast.lifeofprophetmuhammad.com/1488736/7271509',
  8: 'https://podcast.lifeofprophetmuhammad.com/1488736/7469224',
  9: 'https://podcast.lifeofprophetmuhammad.com/1488736/7647031',
  10: 'https://podcast.lifeofprophetmuhammad.com/1488736/7988008',
  11: 'https://podcast.lifeofprophetmuhammad.com/1488736/7988305',
  12: 'https://podcast.lifeofprophetmuhammad.com/1488736/8108353',
  13: 'https://podcast.lifeofprophetmuhammad.com/1488736/8115825',
  14: 'https://podcast.lifeofprophetmuhammad.com/1488736/8141879',
  15: 'https://podcast.lifeofprophetmuhammad.com/1488736/8266612',
  // Episode 16 not found on podcast site
  17: 'https://podcast.lifeofprophetmuhammad.com/1488736/8616758',
  18: 'https://podcast.lifeofprophetmuhammad.com/1488736/8736340',
  19: 'https://podcast.lifeofprophetmuhammad.com/1488736/8736695',
  20: 'https://podcast.lifeofprophetmuhammad.com/1488736/8736715',
  21: 'https://podcast.lifeofprophetmuhammad.com/1488736/8855307',
  22: 'https://podcast.lifeofprophetmuhammad.com/1488736/8891083',
  23: 'https://podcast.lifeofprophetmuhammad.com/1488736/8892194',
  24: 'https://podcast.lifeofprophetmuhammad.com/1488736/9059227',
  25: 'https://podcast.lifeofprophetmuhammad.com/1488736/9059246',
  26: 'https://podcast.lifeofprophetmuhammad.com/1488736/9151745',
  27: 'https://podcast.lifeofprophetmuhammad.com/1488736/9179436',
  28: 'https://podcast.lifeofprophetmuhammad.com/1488736/9239576',
  29: 'https://podcast.lifeofprophetmuhammad.com/1488736/9260203',
  30: 'https://podcast.lifeofprophetmuhammad.com/1488736/9359766',
  31: 'https://podcast.lifeofprophetmuhammad.com/1488736/9360316',
  32: 'https://podcast.lifeofprophetmuhammad.com/1488736/9404872',
  33: 'https://podcast.lifeofprophetmuhammad.com/1488736/9481746',
  34: 'https://podcast.lifeofprophetmuhammad.com/1488736/9516988',
  35: 'https://podcast.lifeofprophetmuhammad.com/1488736/9643793',
  36: 'https://podcast.lifeofprophetmuhammad.com/1488736/9688122',
  37: 'https://podcast.lifeofprophetmuhammad.com/1488736/9737875',
  38: 'https://podcast.lifeofprophetmuhammad.com/1488736/9745091',
  39: 'https://podcast.lifeofprophetmuhammad.com/1488736/9858730',
  40: 'https://podcast.lifeofprophetmuhammad.com/1488736/9879592',
  41: 'https://podcast.lifeofprophetmuhammad.com/1488736/9930883',
  42: 'https://podcast.lifeofprophetmuhammad.com/1488736/9943808',
  43: 'https://podcast.lifeofprophetmuhammad.com/1488736/10128057',
  44: 'https://podcast.lifeofprophetmuhammad.com/1488736/10131353',
  45: 'https://podcast.lifeofprophetmuhammad.com/1488736/10185407',
  46: 'https://podcast.lifeofprophetmuhammad.com/1488736/10195906',
  47: 'https://podcast.lifeofprophetmuhammad.com/1488736/10497961',
  48: 'https://podcast.lifeofprophetmuhammad.com/1488736/10637943',
  49: 'https://podcast.lifeofprophetmuhammad.com/1488736/10678387',
  50: 'https://podcast.lifeofprophetmuhammad.com/1488736/10736399',
  51: 'https://podcast.lifeofprophetmuhammad.com/1488736/10789217',
  52: 'https://podcast.lifeofprophetmuhammad.com/1488736/10984567',
  53: 'https://podcast.lifeofprophetmuhammad.com/1488736/11014851',
  54: 'https://podcast.lifeofprophetmuhammad.com/1488736/11051406',
  55: 'https://podcast.lifeofprophetmuhammad.com/1488736/11131794',
  56: 'https://podcast.lifeofprophetmuhammad.com/1488736/11206691',
  57: 'https://podcast.lifeofprophetmuhammad.com/1488736/11247418',
  58: 'https://podcast.lifeofprophetmuhammad.com/1488736/11570701',
  59: 'https://podcast.lifeofprophetmuhammad.com/1488736/11583001',
  60: 'https://podcast.lifeofprophetmuhammad.com/1488736/11688490',
  61: 'https://podcast.lifeofprophetmuhammad.com/1488736/11786761',
  62: 'https://podcast.lifeofprophetmuhammad.com/1488736/11794277',
  63: 'https://podcast.lifeofprophetmuhammad.com/1488736/11822084',
  64: 'https://podcast.lifeofprophetmuhammad.com/1488736/11854475',
  65: 'https://podcast.lifeofprophetmuhammad.com/1488736/12114906',
  66: 'https://podcast.lifeofprophetmuhammad.com/1488736/12174571',
  67: 'https://podcast.lifeofprophetmuhammad.com/1488736/12200069',
  68: 'https://podcast.lifeofprophetmuhammad.com/1488736/12381669',
  69: 'https://podcast.lifeofprophetmuhammad.com/1488736/12381894',
  70: 'https://podcast.lifeofprophetmuhammad.com/1488736/12680765',
  71: 'https://podcast.lifeofprophetmuhammad.com/1488736/12752227',
  72: 'https://podcast.lifeofprophetmuhammad.com/1488736/12908573',
  73: 'https://podcast.lifeofprophetmuhammad.com/1488736/13085723',
  74: 'https://podcast.lifeofprophetmuhammad.com/1488736/13089245',
  75: 'https://podcast.lifeofprophetmuhammad.com/1488736/13183729',
  76: 'https://podcast.lifeofprophetmuhammad.com/1488736/13455330',
  77: 'https://podcast.lifeofprophetmuhammad.com/1488736/13670398',
  78: 'https://podcast.lifeofprophetmuhammad.com/1488736/13756012',
  79: 'https://podcast.lifeofprophetmuhammad.com/1488736/13799813',
  80: 'https://podcast.lifeofprophetmuhammad.com/1488736/13886696',
  81: 'https://podcast.lifeofprophetmuhammad.com/1488736/13958070',
  82: 'https://podcast.lifeofprophetmuhammad.com/1488736/13975670',
  83: 'https://podcast.lifeofprophetmuhammad.com/1488736/13993261',
  84: 'https://podcast.lifeofprophetmuhammad.com/1488736/14458624',
  85: 'https://podcast.lifeofprophetmuhammad.com/1488736/14544301',
  86: 'https://podcast.lifeofprophetmuhammad.com/1488736/15063912',
  87: 'https://podcast.lifeofprophetmuhammad.com/1488736/15121815',
  88: 'https://podcast.lifeofprophetmuhammad.com/1488736/15195827',
  89: 'https://podcast.lifeofprophetmuhammad.com/1488736/15242067',
  90: 'https://podcast.lifeofprophetmuhammad.com/1488736/15355311',
  91: 'https://podcast.lifeofprophetmuhammad.com/1488736/15616769',
  92: 'https://podcast.lifeofprophetmuhammad.com/1488736/15704888',
  93: 'https://podcast.lifeofprophetmuhammad.com/1488736/15935380',
  94: 'https://podcast.lifeofprophetmuhammad.com/1488736/16016417',
  95: 'https://podcast.lifeofprophetmuhammad.com/1488736/16022911',
  96: 'https://podcast.lifeofprophetmuhammad.com/1488736/16034759',
  97: 'https://podcast.lifeofprophetmuhammad.com/1488736/16148536',
  98: 'https://podcast.lifeofprophetmuhammad.com/1488736/16149648',
  99: 'https://podcast.lifeofprophetmuhammad.com/1488736/16149857',
  100: 'https://podcast.lifeofprophetmuhammad.com/1488736/16149934',
  101: 'https://podcast.lifeofprophetmuhammad.com/1488736/16267281',
  102: 'https://podcast.lifeofprophetmuhammad.com/1488736/16304898',
  103: 'https://podcast.lifeofprophetmuhammad.com/1488736/16319654',
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

// Add podcast URLs to episodes
let count = 0;
series.episodes.forEach(ep => {
  const match = ep.title.match(/^\[(\d+)\]/);
  if (match) {
    const epNum = parseInt(match[1]);
    if (podcastUrls[epNum]) {
      ep.podcast_episode_url = podcastUrls[epNum];
      count++;
    }
  }
});

console.log(`Added podcast URLs to ${count} episodes`);

// Write back with proper YAML formatting
const output = yaml.dump(data, {
  lineWidth: -1,
  noRefs: true,
  quotingType: '"',
  forceQuotes: false,
  styles: {
    '!!str': 'literal'  // Use literal block style for multiline strings
  }
});
fs.writeFileSync(yamlPath, output);
console.log('Done');
