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
//
// Idempotent: re-running skips any file already indexed in the store (matched by
// display name), so you won't get duplicate copies of the same document.

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
  //    The store persists until you delete it.
  let storeName = process.env.FILE_SEARCH_STORE;
  const indexedNames = new Set();
  if (storeName) {
    console.log(`Using existing store: ${storeName}`);
    // List what's already indexed so re-runs don't create duplicate documents.
    // (uploadToFileSearchStore always adds a new doc — it never dedupes.)
    for await (const doc of await ai.fileSearchStores.documents.list({
      parent: storeName,
    })) {
      if (doc.displayName) indexedNames.add(doc.displayName);
    }
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

  // 2. Upload + index each file, skipping any already present. Indexing is
  //    async, so we poll the operation until it reports done.
  let indexed = 0;
  let skipped = 0;
  for (const file of files) {
    const displayName = file.split("/").pop();
    if (indexedNames.has(displayName)) {
      console.log(`Skipping ${displayName} — already indexed.`);
      skipped++;
      continue;
    }

    console.log(`Indexing ${file} ...`);
    let op = await ai.fileSearchStores.uploadToFileSearchStore({
      file,
      fileSearchStoreName: storeName,
      config: { displayName },
    });
    while (!op.done) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      op = await ai.operations.get({ operation: op });
    }
    indexedNames.add(displayName); // guard against duplicate basenames in one run
    indexed++;
  }

  console.log(
    `\nIndexed ${indexed} file(s)${skipped ? `, skipped ${skipped} already present` : ""}.`,
  );
  console.log(`\nSet this in your .env, then query with search.js or agent.js:`);
  console.log(`  FILE_SEARCH_STORE=${storeName}`);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
