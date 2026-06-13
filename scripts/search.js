// search.js
// Query a Gemini File Search store — the retrieval step of RAG.
//
// File Search retrieves ONLY the relevant chunks of your indexed docs and grounds
// the answer in them, with citations — instead of stuffing whole files into context.
//
// Usage:
//   # Query an existing store built by upload.js (recommended):
//   GEMINI_API_KEY=your_key  FILE_SEARCH_STORE=fileSearchStores/kb-123  node search.js
//
//   # Or do everything in one shot: index the given files, then query:
//   GEMINI_API_KEY=your_key  node search.js ./knowledge-base/*.md
//
//   # Override the question with the QUESTION env var.
// Install: npm install @google/genai

import { GoogleGenAI } from "@google/genai";

// The SDK reads GEMINI_API_KEY (or GOOGLE_API_KEY) from the environment.
const ai = new GoogleGenAI({});

const MODEL = "gemini-3.5-flash"; // supports File Search (current as of June 2026)

const QUESTION =
  process.env.QUESTION ||
  "What is our refund window for annual plans? " +
  "If it is not in the documents, say you don't know.";

const SYSTEM_INSTRUCTION =
  "You are a support assistant. Answer ONLY using the provided documents. " +
  "If the answer is not in them, say you don't know — do not guess. " +
  "Mention which document the answer came from.";

async function indexFiles(files) {
  const store = await ai.fileSearchStores.create({
    config: {
      displayName: `kb-${Date.now()}`,
      embeddingModel: "models/gemini-embedding-2", // handles text + images
    },
  });
  console.log(`Created File Search store: ${store.name}`);

  for (const file of files) {
    console.log(`Indexing ${file} ...`);
    let op = await ai.fileSearchStores.uploadToFileSearchStore({
      file,
      fileSearchStoreName: store.name,
      config: { displayName: file.split("/").pop() },
    });
    while (!op.done) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      op = await ai.operations.get({ operation: op });
    }
  }
  console.log("All files indexed.\n");
  return store.name;
}

async function run() {
  // Use a pre-built store if provided, otherwise index the files passed as args.
  let storeName = process.env.FILE_SEARCH_STORE;
  if (!storeName) {
    const files = process.argv.slice(2);
    if (files.length === 0) {
      console.error(
        "Provide files to index, or set FILE_SEARCH_STORE to query an existing store."
      );
      console.error("Usage: node search.js <file1> [file2 ...]");
      process.exit(1);
    }
    storeName = await indexFiles(files);
  } else {
    console.log(`Querying store: ${storeName}\n`);
  }

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
