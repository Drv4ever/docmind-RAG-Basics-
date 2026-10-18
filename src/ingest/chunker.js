// src/ingest/chunker.js
export function chunkPages(pages, chunkSize = 800, overlap = 150) {
  const chunks = [];

  for (const { page, text } of pages) {
    if (!text) continue;
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push({ page, text: text.slice(start, end) });
      if (end === text.length) break;
      start = end - overlap;
    }
  }
  return chunks;
}