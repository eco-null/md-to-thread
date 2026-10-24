# md-to-thread

> Convert Markdown and long-form articles into optimized X (Twitter) threads, LinkedIn carousels, and Threads drafts.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](https://github.com/postready/md-to-thread)
[![Powered by PostReady](https://img.shields.io/badge/Powered%20by-PostReady.org-purple.svg)](https://postready.org)

`md-to-thread` is a lightweight, zero-dependency CLI tool and Node.js library that parses long Markdown text or blog posts and breaks them into clean, platform-optimized social media threads with natural sentence boundaries and automated numbering.

Part of the **[PostReady.org](https://postready.org)** open-source content repurposing toolkit.

---
## Features

- **Natural Boundary Splitting:** Splits on paragraph and sentence boundaries without cutting mid-sentence.
- **Social Presets:** Built-in limits for X Standard (280), Threads (500), Bluesky (300), LinkedIn (3000), and X Premium (4000).
- **Custom Thread Numbering:** `1/N`, ` 1/N`, `[1/N]`, `(1/N)`, or suffix formats.
- **Clean Formatting:** Strips noisy Markdown headers, raw links, and horizontal rules into clean social copy.
- **Flexible I/O:** Run on files, pipe via `stdin`, or export as formatted terminal cards, plain text (`---`), or structured JSON.
- **Zero Runtime Dependencies:** Native Node.js ESM.

---
## Quick Start (CLI)

Run directly with `npx`:

```bash
# Split a markdown file with default X limit (280 chars)
npx md-to-thread article.md

# Pipe from cat or git diff
cat blog-draft.md | npx md-to-thread

# Target Threads (500 chars) with thread emoji counter
npx md-to-thread README.md --limit threads --format thread

# Output clean JSON for automation pipelines
npx md-to-thread post.md --json > thread.json
```

Or install globally:

```bash
npm install -g md-to-thread
```

---
## CLI Options

```text
USAGE:
  $ md-to-thread <file.md> [options]
  $ cat article.md | md-to-thread [options]

OPTIONS:
  -l, --limit <num|preset>    Max characters per post (default: 280)
                             Presets: x-standard (280), threads (500),
                                      bluesky (300), linkedin (3000), x-premium (4000)
  -f, --format <style>        Thread counter style: fraction (1/N),
                             thread ( 1/N), brackets ([1/N]), parens ((1/N)), suffix
  --no-counter                Disable thread numbering
  --raw                       Do not clean markdown syntax
  --json                      Output structured JSON array
  --plain                     Output plain text separated by '---'
  -h, --help                  Show help
  -v, --version               Show version
```

---
## Programmatic API

Install locally:

```bash
npm install md-to-thread
```

Usage in Node.js / TypeScript:

```javascript
import { splitMarkdownToThread } from 'md-to-thread';

const markdown = `
# Building in Public

Shipping open-source tools is the best distribution engine for SaaS founders.
When you solve real developer problems with lightweight CLI utilities, adoption follows naturally.
`;

const thread = splitMarkdownToThread(markdown, {
  limit: 280,
  counter: true,
  counterFormat: 'thread'
});

console.log(thread);
/*
[
  {
    index: 1,
    total: 2,
    text: ' 1/2\n\nBuilding in Public\n\nShipping open-source tools...',
    charCount: 165,
    remainingChars: 115
  },
  ...
]
*/
```

---
## About PostReady

This tool was created by **[PostReady.org](https://postready.org)** — an AI content repurposing studio that turns blog articles, podcasts, and developer notes into editable X threads, LinkedIn posts, and newsletter drafts.

Check out our free web tools:
- [Hook Generator](https://postready.org/en/tools/hook-generator)
- [Tweet to LinkedIn Converter](https://postready.org/en/tools/tweet-to-linkedin)
- [Thread Splitter Web UI](https://postready.org/en/tools/thread-splitter)
- [LinkedIn Text Formatter](https://postready.org/en/tools/linkedin-text-formatter)

---
## License

MIT © [eco-null](https://github.com/eco-null)
