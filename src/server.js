import "dotenv/config";
import express from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { parsePdf } from "./ingest/parser.js";
import { chunkPages } from "./ingest/chunker.js";
import { embedTexts, embedQuery } from "./rag/embedder.js";
import { ensureCollection, upsertChunks, search } from "./rag/vectorStore.js";
import { generateAnswer } from "./rag/generator.js";

const app = express();
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

const USER_ID = "demo"; // hardcoded for now, auth comes later

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const pages = await parsePdf(req.file.buffer);
    const chunks = chunkPages(pages);
    if (chunks.length === 0) {
      return res.status(400).json({ error: "No text found (scanned PDF?)" });
    }

    const vectors = await embedTexts(chunks.map((c) => c.text));
    const docId = randomUUID();
    await upsertChunks({ userId: USER_ID, docId, chunks, vectors });

    res.json({ docId, pages: pages.length, chunks: chunks.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "question is required" });

    const qv = await embedQuery(question);
    const hits = await search(qv, USER_ID, 5);
    const answer = await generateAnswer(question, hits);

    res.json({
      answer,
      sources: hits.map((h) => ({
        page: h.payload.page,
        score: h.score,
        snippet: h.payload.chunk_text.slice(0, 150),
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

await ensureCollection();
app.listen(3000, () => console.log("DocMind running on http://localhost:3000"));

// '{"question":"waht is the current pdf about?"}' | Out-File -Encoding ascii q.json
// curl.exe -X POST -H "Content-Type: application/json" -d "@q.json" http://localhost:3000/chat