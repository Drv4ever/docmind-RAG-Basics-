// src/rag/vectorStore.js
import "dotenv/config";
import { randomUUID } from "crypto";
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  checkCompatibility: false,
});

const COLLECTION = "docmind";

export async function ensureCollection() {
  const { collections } = await qdrant.getCollections();
  if (collections.some((c) => c.name === COLLECTION)) return;

  await qdrant.createCollection(COLLECTION, {
    vectors: { size: 384, distance: "Cosine" },
  });
  // index for fast filtering by user later
  await qdrant.createPayloadIndex(COLLECTION, {
    field_name: "user_id",
    field_schema: "keyword",
  });
}

export async function upsertChunks({ userId, docId, chunks, vectors }) {
  const points = chunks.map((c, i) => ({
    id: randomUUID(), // Qdrant IDs must be UUIDs or unsigned ints
    vector: vectors[i],
    payload: {
      user_id: userId,
      doc_id: docId,
      page: c.page,
      chunk_text: c.text,
    },
  }));
  await qdrant.upsert(COLLECTION, { wait: true, points });
}

export async function search(queryVector, userId, limit = 5) {
  const res = await qdrant.query(COLLECTION, {
    query: queryVector,
    limit,
    with_payload: true,
    filter: { must: [{ key: "user_id", match: { value: userId } }] },
  });
  return res.points; // each point has: id, score, payload
}