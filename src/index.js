export const PRESETS = {
  'x-standard': 280,
  'x-premium': 4000,
  'threads': 500,
  'linkedin': 3000,
  'bluesky': 300
};

// --- Markdown Cleaner ---

export function cleanMarkdown(md) {
  if (!md) return '';

  return md
    .replace(/<[^>]*>/g, '')
    .replace(/^(\s*[-*_]){3,}\s*$/gm, '')
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1: $2')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// --- Sentence Splitter ---

export function splitIntoSentences(text) {
  if (!text) return [];
  const pattern = /(?<=[.?!])\s+(?=[A-Z0-9"“'‘•—])/g;
  return text.split(pattern).map(s => s.trim()).filter(Boolean);
}

// --- Counter Formatter ---

export function formatCounter(current, total, format = 'fraction') {
  if (total <= 1) return '';
  switch (format) {
    case 'thread':
      return `🧵 ${current}/${total}\n\n`;
    case 'brackets':
      return `[${current}/${total}]\n\n`;
    case 'parens':
      return `(${current}/${total})\n\n`;
    case 'suffix':
      return `\n\n(${current}/${total})`;
    case 'fraction':
    default:
      return `${current}/${total}\n\n`;
  }
}

// --- Main Thread Splitter ---

export function splitMarkdownToThread(markdown, options = {}) {
  const {
    limit = 280,
    counter = true,
    counterFormat = 'fraction',
    clean = true,
    hashtag = ''
  } = options;

  const maxChars = typeof limit === 'string' && PRESETS[limit] ? PRESETS[limit] : Number(limit) || 280;
  const processed = clean ? cleanMarkdown(markdown) : markdown.trim();
  if (!processed) return [];

  const paragraphs = processed.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const counterReserve = counter ? 12 : 0;
  const effectiveMax = maxChars - counterReserve;

  const chunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const candidate = currentChunk ? `${currentChunk}\n\n${para}` : para;
    if (candidate.length <= effectiveMax) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
      currentChunk = '';
    }

    if (para.length <= effectiveMax) {
      currentChunk = para;
      continue;
    }

    const sentences = splitIntoSentences(para);
    for (const sentence of sentences) {
      const sentenceCandidate = currentChunk ? `${currentChunk} ${sentence}` : sentence;
      if (sentenceCandidate.length <= effectiveMax) {
        currentChunk = sentenceCandidate;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }

        if (sentence.length > effectiveMax) {
          const words = sentence.split(/\s+/);
          for (const word of words) {
            const wordCandidate = currentChunk ? `${currentChunk} ${word}` : word;
            if (wordCandidate.length <= effectiveMax) {
              currentChunk = wordCandidate;
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = word;
            }
          }
        } else {
          currentChunk = sentence;
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  const total = chunks.length;

  return chunks.map((chunk, idx) => {
    const index = idx + 1;
    let text = chunk;

    if (counter && total > 1) {
      if (counterFormat === 'suffix') {
        text = `${chunk}${formatCounter(index, total, 'suffix')}`;
      } else {
        text = `${formatCounter(index, total, counterFormat)}${chunk}`;
      }
    }

    if (hashtag && (index === 1 || index === total)) {
      text += `\n\n${hashtag.startsWith('#') ? hashtag : '#' + hashtag}`;
    }

    return {
      index,
      total,
      text: text.trim(),
      charCount: text.trim().length,
      remainingChars: maxChars - text.trim().length
    };
  });
}
