// cleanup.js
// Tear down (or empty) the Gemini File Search store you built with upload.js.
//
// Useful for resetting between workshop runs or clearing the duplicate documents
// that pile up if you re-index the same files into a store.
//
// Setup: copy .env.example to .env and set GEMINI_API_KEY and FILE_SEARCH_STORE.
//
// Usage:
//   # Dry run — lists what WOULD be deleted, changes nothing:
//   node cleanup.js
//
//   # Delete the whole store (the FILE_SEARCH_STORE id becomes invalid afterwards):
//   node cleanup.js --yes
//
//   # Keep the store but delete every document inside it (id stays valid):
//   node cleanup.js --docs --yes

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function run() {
  const storeName = process.env.FILE_SEARCH_STORE;
  if (!storeName) {
    console.error("Set FILE_SEARCH_STORE in .env to the store you want to clean up.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const confirmed = args.includes("--yes") || args.includes("-y");
  const docsOnly = args.includes("--docs");

  // List the documents in the store so we can report (and, for --docs, delete) them.
  const docs = [];
  for await (const doc of await ai.fileSearchStores.documents.list({
    parent: storeName,
  })) {
    docs.push(doc);
  }

  console.log(`Store: ${storeName}`);
  console.log(`Documents: ${docs.length}`);
  for (const doc of docs) console.log(`  • ${doc.displayName || doc.name}`);

  const action = docsOnly
    ? `delete ${docs.length} document(s), keeping the store`
    : "delete the entire store and everything in it";

  if (!confirmed) {
    console.log(`\nDry run — would ${action}.`);
    console.log("Re-run with --yes to actually delete.");
    return;
  }

  if (docsOnly) {
    for (const doc of docs) {
      console.log(`Deleting ${doc.displayName || doc.name} ...`);
      // force: true also removes the document's chunks.
      await ai.fileSearchStores.documents.delete({ name: doc.name, config: { force: true } });
    }
    console.log(`\nDeleted ${docs.length} document(s). Store ${storeName} is now empty.`);
  } else {
    // force: true deletes the store even though it still contains documents.
    await ai.fileSearchStores.delete({ name: storeName, config: { force: true } });
    console.log(`\nDeleted store ${storeName}.`);
    console.log("Remove FILE_SEARCH_STORE from .env (or run upload.js to build a new store).");
  }
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
