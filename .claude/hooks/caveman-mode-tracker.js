#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
const prompt = (input.prompt || '').trim();

if (prompt !== '/caveman-stats') {
  process.stdout.write(JSON.stringify({ decision: 'continue' }));
  process.exit(0);
}

const transcriptPath = input.transcript_path;

if (!transcriptPath || !fs.existsSync(transcriptPath)) {
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: 'caveman-stats: transcript not found',
  }));
  process.exit(0);
}

const computeStats = require(path.join(__dirname, 'caveman-stats.js'));

process.stdout.write(JSON.stringify({
  decision: 'block',
  reason: computeStats(transcriptPath),
}));
