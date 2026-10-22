import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanMarkdown, splitIntoSentences, formatCounter, splitMarkdownToThread, PRESETS } from '../src/index.js';

test('cleanMarkdown: removes headers, bold, links and hr', () => {
  const md = `# Title\n\nThis is **bold** and *italic*.\n\n[Visit Us](https://postready.org)\n\n---\n\n- Bullet 1\n- Bullet 2`;
  const cleaned = cleanMarkdown(md);
  assert.equal(cleaned.includes('# Title'), false);
  assert.equal(cleaned.includes('Title'), true);
  assert.equal(cleaned.includes('**bold**'), false);
  assert.equal(cleaned.includes('bold and italic'), true);
  assert.equal(cleaned.includes('[Visit Us]'), false);
  assert.equal(cleaned.includes('Visit Us: https://postready.org'), true);
  assert.equal(cleaned.includes('• Bullet 1'), true);
});

test('splitIntoSentences: correctly segments sentences', () => {
  const text = 'First sentence here. Second sentence starts! Does the third one work? Absolutely.';
  const sentences = splitIntoSentences(text);
  assert.equal(sentences.length, 4);
  assert.equal(sentences[0], 'First sentence here.');
  assert.equal(sentences[1], 'Second sentence starts!');
});

test('formatCounter: renders formats properly', () => {
  assert.equal(formatCounter(1, 5, 'fraction'), '1/5\n\n');
  assert.equal(formatCounter(2, 5, 'thread'), '🧵 2/5\n\n');
  assert.equal(formatCounter(3, 5, 'brackets'), '[3/5]\n\n');
  assert.equal(formatCounter(4, 5, 'parens'), '(4/5)\n\n');
  assert.equal(formatCounter(5, 5, 'suffix'), '\n\n(5/5)');
  assert.equal(formatCounter(1, 1), '');
});

test('splitMarkdownToThread: splits text within character limits', () => {
  const longText = `
# How We Built an AI Content Studio

Content repurposing is often misunderstood. Many creators simply copy and paste the same paragraph everywhere, expecting identical results across different social platforms.

However, X (formerly Twitter) favors concise, punchy lines with provocative hooks, whereas LinkedIn demands narrative depth, professional context, and career-related lessons.

When we designed PostReady, our primary objective was to ensure each piece of long-form content naturally adapts to the algorithmic nuances of each platform without sounding like generic robotic slop.

By analyzing thousands of top-performing viral posts, we identified recurring structural patterns: opening contrarian thesis, data validation, personal anecdote, and a memorable closing takeaway.
`;

  const thread = splitMarkdownToThread(longText, { limit: 280, counter: true, counterFormat: 'fraction' });
  assert.ok(thread.length >= 2, 'Should create multiple posts');
  
  thread.forEach((post, i) => {
    assert.ok(post.charCount <= 280, `Post ${i + 1} exceeds 280 chars (was ${post.charCount})`);
    assert.equal(post.total, thread.length);
    assert.equal(post.index, i + 1);
  });
});

test('splitMarkdownToThread: supports platform presets', () => {
  const sample = 'A'.repeat(400);
  const threadsPreset = splitMarkdownToThread(sample, { limit: 'threads', counter: false });
  assert.equal(threadsPreset.length, 1);
  assert.ok(threadsPreset[0].charCount <= PRESETS['threads']);
});
