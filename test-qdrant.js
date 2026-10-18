import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

console.log("URL:", process.env.QDRANT_URL);
console.log("KEY set:", !!process.env.QDRANT_API_KEY);

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  checkCompatibility: false,
});

try {
  console.log(await qdrant.getCollections());
} catch (e) {
  console.error("ERROR:", e.message);
}