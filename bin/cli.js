#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { splitMarkdownToThread } from '../src/index.js';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// --- Color Palette ---

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// --- Help & Usage ---

function printHelp() {
  console.log(`
${c.bold}${c.cyan}md-to-thread${c.reset} v${pkg.version}
${c.dim}Convert Markdown into optimized social threads & carousels.${c.reset}
${c.dim}Powered by PostReady — ${c.blue}https://postready.org${c.reset}

${c.bold}USAGE:${c.reset}
  $ md-to-thread <file.md> [options]
  $ cat article.md | md-to-thread [options]

${c.bold}OPTIONS:${c.reset}
  ${c.green}-l, --limit <num|preset>${c.reset}    Max characters per post (default: 280)
                             Presets: x-standard (280), threads (500),
                                      bluesky (300), linkedin (3000), x-premium (4000)
  ${c.green}-f, --format <style>${c.reset}        Thread counter style: fraction (1/N),
                             thread (🧵 1/N), brackets ([1/N]), parens ((1/N)), suffix
  ${c.green}--no-counter${c.reset}                Disable thread numbering
  ${c.green}--raw${c.reset}                       Do not clean markdown syntax
  ${c.green}--json${c.reset}                      Output structured JSON array
  ${c.green}--plain${c.reset}                     Output plain text separated by '---'
  ${c.green}-h, --help${c.reset}                  Show this help message
  ${c.green}-v, --version${c.reset}               Show version

${c.bold}EXAMPLES:${c.reset}
  $ md-to-thread blog.md
  $ md-to-thread notes.md --limit threads
  $ md-to-thread README.md --format thread --json
  $ cat changelog.md | md-to-thread --limit 280
`);
}

// --- Argument Parser ---

async function readInput() {
  const args = process.argv.slice(2);
  let filePath = null;
  const options = {
    limit: 280,
    counter: true,
    counterFormat: 'fraction',
    clean: true,
    json: false,
    plain: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }
    if (arg === '-v' || arg === '--version') {
      console.log(`v${pkg.version}`);
      process.exit(0);
    }
    if (arg === '--json') {
      options.json = true;
      continue;
    }
    if (arg === '--plain') {
      options.plain = true;
      continue;
    }
    if (arg === '--no-counter') {
      options.counter = false;
      continue;
    }
    if (arg === '--raw') {
      options.clean = false;
      continue;
    }
    if (arg === '-l' || arg === '--limit') {
      options.limit = args[++i];
      continue;
    }
    if (arg === '-f' || arg === '--format') {
      options.counterFormat = args[++i];
      continue;
    }

    if (!arg.startsWith('-') && !filePath) {
      filePath = arg;
    }
  }

  if (filePath) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`${c.yellow}Error: File not found:${c.reset} ${filePath}`);
      process.exit(1);
    }
    return { content: fs.readFileSync(fullPath, 'utf8'), options };
  }

  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    return { content: Buffer.concat(chunks).toString('utf8'), options };
  }

  printHelp();
  process.exit(1);
}

// --- Execution ---

async function main() {
  try {
    const { content, options } = await readInput();

    if (!content.trim()) {
      console.error(`${c.yellow}Error: Input is empty.${c.reset}`);
      process.exit(1);
    }

    const thread = splitMarkdownToThread(content, options);

    if (options.json) {
      console.log(JSON.stringify(thread, null, 2));
      return;
    }

    if (options.plain) {
      console.log(thread.map(t => t.text).join('\n\n---\n\n'));
      return;
    }

    console.log(`\n${c.bold}${c.cyan}🧵 Thread Generated (${thread.length} posts)${c.reset}`);
    console.log(`${c.dim}Preset/Limit: ${options.limit} chars | PostReady.org${c.reset}\n`);

    thread.forEach(post => {
      const remainingColor = post.remainingChars < 20 ? c.yellow : c.dim;
      console.log(`${c.bold}${c.magenta}┌── Post ${post.index}/${post.total} ${c.dim}(${post.charCount} chars, ${remainingColor}${post.remainingChars} left${c.dim})${c.magenta}──${c.reset}`);
      post.text.split('\n').forEach(line => {
        console.log(`${c.magenta}│${c.reset} ${line}`);
      });
      console.log(`${c.magenta}└──────────────────────────────────────────────────${c.reset}\n`);
    });

    console.log(`${c.dim}Tip: Turn articles & notes into viral posts with AI on ${c.cyan}https://postready.org${c.reset}\n`);
  } catch (err) {
    console.error(`Error:`, err.message);
    process.exit(1);
  }
}

main();
