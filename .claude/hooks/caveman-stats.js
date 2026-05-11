#!/usr/bin/env node
'use strict';

const fs = require('fs');

// Sonnet 4.x pricing per token
const PRICE = {
  input:      3.00  / 1e6,
  output:     15.00 / 1e6,
  cacheWrite: 3.75  / 1e6,
  cacheRead:  0.30  / 1e6,
};

function computeStats(transcriptPath) {
  const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);

  let inputTokens      = 0;
  let outputTokens     = 0;
  let cacheWriteTokens = 0;
  let cacheReadTokens  = 0;
  let apiCalls         = 0;

  for (const line of lines) {
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }

    const usage = obj?.message?.usage;
    if (!usage) continue;

    inputTokens      += usage.input_tokens                  || 0;
    outputTokens     += usage.output_tokens                 || 0;
    cacheWriteTokens += usage.cache_creation_input_tokens   || 0;
    cacheReadTokens  += usage.cache_read_input_tokens       || 0;
    apiCalls++;
  }

  const cost =
    inputTokens      * PRICE.input      +
    outputTokens     * PRICE.output     +
    cacheWriteTokens * PRICE.cacheWrite +
    cacheReadTokens  * PRICE.cacheRead;

  // savings vs paying full input price for every cache-read token
  const savings = cacheReadTokens * (PRICE.input - PRICE.cacheRead);

  const fmt = (n) => n.toLocaleString('en-US');
  const usd = (n) => '$' + n.toFixed(4);

  const pad = (label, value) => label.padEnd(22) + value;

  return [
    'Session token usage',
    '─'.repeat(36),
    pad('Input tokens:',        fmt(inputTokens)),
    pad('Output tokens:',       fmt(outputTokens)),
    pad('Cache writes:',        fmt(cacheWriteTokens)),
    pad('Cache reads:',         fmt(cacheReadTokens)),
    pad('API calls:',           fmt(apiCalls)),
    '─'.repeat(36),
    pad('Estimated cost:',      usd(cost)),
    pad('Cache savings:',       usd(savings)),
  ].join('\n');
}

// Allow both require() and direct execution
if (require.main === module) {
  const path = process.argv[2];
  if (!path) { console.error('Usage: caveman-stats.js <transcript.jsonl>'); process.exit(1); }
  console.log(computeStats(path));
} else {
  module.exports = computeStats;
}
