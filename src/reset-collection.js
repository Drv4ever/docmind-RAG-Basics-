import { qdrant } from "./rag/vectorStore.js";

try {
  await qdrant.deleteCollection("docmind");
  console.log("deleted");
} catch (e) {
  console.log("nothing to delete:", e.message);
}