// src/rag/generator.js
import "dotenv/config";
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateAnswer(question, chunks) {
  const context = chunks
    .map((c, i) => `[${i + 1}] (page ${c.payload.page}) ${c.payload.chunk_text}`)
    .join("\n\n");

  const res = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Answer the question using ONLY the context below. Cite sources like [1], [2]. If the answer is not in the context, say \"I don't know based on the provided documents.\"",
      },
      { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` },
    ],
  });
  return res.choices[0].message.content;
}