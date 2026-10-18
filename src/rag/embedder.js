// src/rag/embedder.js
import { pipeline } from "@xenova/transformers";

let extractor;
async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractor;
}

export async function embedTexts(texts, batchSize = 32) {
  const ext = await getExtractor();
  const vectors = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const out = await ext(batch, { pooling: "mean", normalize: true });
    vectors.push(...out.tolist());
  }
  return vectors;
}

export async function embedQuery(text) {
  const [vector] = await embedTexts([text]);
  return vector;
}