import fs from "fs";
import { parsePdf } from "./src/ingest/parser.js";
import { chunkPages } from "./src/ingest/chunker.js";
import { embedTexts, embedQuery } from "./src/rag/embedder.js";
import { ensureCollection, upsertChunks, search } from "./src/rag/vectorStore.js";

const pages = await parsePdf(fs.readFileSync("AI-Review2.pdf"));
const chunks = chunkPages(pages);
console.log(chunks.length, "chunks");

const vectors = await embedTexts(chunks.map((c) => c.text));
await ensureCollection();
await upsertChunks({ userId: "demo", docId: "doc1", chunks, vectors });
console.log("stored");

const qv = await embedQuery("What is this document about?");
const results = await search(qv, "demo", 3);
for (const r of results) {
  console.log(r.score.toFixed(3), "page", r.payload.page, r.payload.chunk_text.slice(0, 100));
}