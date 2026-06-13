// upload.js
// Ingest documents into a Gemini File Search store (the indexing step of RAG).
//
// File Search chunks, embeds, and indexes each file so it can be retrieved later.
// Run this once to build your knowledge base, then query it with search.js.
//
// Setup: copy .env.example to .env and set GEMINI_API_KEY (loaded via dotenv).
//
// Usage:
//   # Create a new store and index files into it:
//   node upload.js ./knowledge-base/pdfs/*.pdf
//
//   # Add files to an existing store (reuse it across runs):
//   node upload.js ./new-doc.pdf

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// dotenv loads .env; the SDK then reads GEMINI_API_KEY (or GOOGLE_API_KEY) & FILE_SEARCH_STORE.
const ai = new GoogleGenAI({});

async function run() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: node upload.js <file1> [file2 ...]");
    process.exit(1);
  }

  // 1. Reuse an existing store if one was passed, otherwise create a new one.
  //    The store persists until you delete it (raw files expire after 48h).
  let storeName = process.env.FILE_SEARCH_STORE;
  if (storeName) {
    console.log(`Using existing store: ${storeName}`);
  } else {
    const store = await ai.fileSearchStores.create({
      config: {
        displayName: `kb-${Date.now()}`,
        embeddingModel: "models/gemini-embedding-2", // text + image capable
      },
    });
    storeName = store.name;
    console.log(`Created File Search store: ${storeName}`);
  }

  // 2. Upload + index each file. Indexing is async, so we poll the operation
  //    until it reports done.
  for (const file of files) {
    console.log(`Indexing ${file} ...`);
    let op = await ai.fileSearchStores.uploadToFileSearchStore({
      file,
      fileSearchStoreName: storeName,
      config: { displayName: file.split("/").pop() },
    });
    while (!op.done) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      op = await ai.operations.get({ operation: op });
    }
  }

  console.log(`\nIndexed ${files.length} file(s).`);
  console.log(`\nQuery this knowledge base with:`);
  console.log(`  FILE_SEARCH_STORE=${storeName} node search.js`);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
