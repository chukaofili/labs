// search.js
// Query a Gemini File Search store — the retrieval step of RAG.
//
// File Search retrieves ONLY the relevant chunks of your indexed docs and grounds
// the answer in them, with citations — instead of stuffing whole files into context.
//
// Setup: copy .env.example to .env, then set GEMINI_API_KEY and FILE_SEARCH_STORE
// (both loaded via dotenv). Build the store first with upload.js, which prints
// the FILE_SEARCH_STORE id to paste into .env. This script only queries — it
// never indexes.
//
// Usage:
//   node search.js "What is our refund window for annual plans?"
//
//   # With no question, it falls back to a default demo question.

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// dotenv loads .env; the SDK then reads GEMINI_API_KEY (or GOOGLE_API_KEY).
const ai = new GoogleGenAI({});

const MODEL = "gemini-3.5-flash"; // supports File Search (current as of June 2026)

// Take the question from the command line (everything after the script name),
// falling back to a default demo question when none is given.
const QUESTION =
  process.argv.slice(2).join(" ").trim() ||
  "What is our refund window for annual plans?";

const SYSTEM_INSTRUCTION =
  "You are a support assistant. Answer ONLY using the provided documents. " +
  "If the answer is not in them, say you don't know — do not guess. " +
  "Mention which document the answer came from.";

async function run() {
  // Query a store that upload.js already built. Indexing lives in upload.js.
  const storeName = process.env.FILE_SEARCH_STORE;
  if (!storeName) {
    console.error(
      "Set FILE_SEARCH_STORE in .env to the store you built with upload.js."
    );
    process.exit(1);
  }
  console.log(`Querying store: ${storeName}`);
  console.log(`Question: ${QUESTION}\n`);

  // Ask. The fileSearch tool retrieves the relevant chunks and grounds the answer.
  // (Note: File Search can't be combined with Google Search grounding or URL
  // context in the same call.)
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: QUESTION,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ fileSearch: { fileSearchStoreNames: [storeName] } }],
    },
  });

  console.log("--- Answer ---");
  console.log(response.text);

  // Citations: which document (and page) each piece of the answer came from.
  const chunks =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  if (chunks.length) {
    console.log("\n--- Sources ---");
    const seen = new Set();
    for (const c of chunks) {
      const ctx = c.retrievedContext;
      if (!ctx) continue;
      const page = ctx.pageNumber ? ` (p.${ctx.pageNumber})` : "";
      const label = `${ctx.title || ctx.uri || "document"}${page}`;
      if (!seen.has(label)) {
        seen.add(label);
        console.log(`• ${label}`);
      }
    }
  }
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
