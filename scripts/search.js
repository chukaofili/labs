// search.js
// A real RAG chatbot over your own docs, using the Gemini File Search tool.
//
// Unlike upload.js (which stuffs the whole document into context every call),
// File Search chunks + embeds your docs once, then retrieves ONLY the relevant
// pieces at query time and grounds the answer in them — with citations.
//
// Usage:   GEMINI_API_KEY=your_key  node search.js ./knowledge-base/01.md ./knowledge-base/02.md
//          (you can pass .md, .pdf, .txt, .docx, ... and as many files as you like)
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

async function run() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: node search.js <file1> [file2 ...]");
    process.exit(1);
  }

  // 1. Create a File Search store. This is the persistent container for the
  //    embeddings (it lives until you delete it — see cleanup note at the end).
  const store = await ai.fileSearchStores.create({
    config: {
      displayName: `kb-${Date.now()}`,
      embeddingModel: "models/gemini-embedding-2", // handles text + images
    },
  });
  console.log(`Created File Search store: ${store.name}`);

  // 2. Upload + index each file. File Search automatically chunks, embeds, and
  //    indexes the content. Indexing is async, so we poll the operation.
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

  // 3. Ask. The fileSearch tool retrieves the relevant chunks and grounds the
  //    answer. (Note: File Search can't currently be combined with Google
  //    Search grounding or URL context in the same call.)
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: QUESTION,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ fileSearch: { fileSearchStoreNames: [store.name] } }],
    },
  });

  console.log("--- Answer ---");
  console.log(response.text);

  // 4. Show citations: which document (and page) each piece of the answer came from.
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

  // Cleanup tip: stores persist and count toward your storage quota. To reuse a
  // store across runs, skip step 1-2 and pass its name. To delete this one:
  // await ai.fileSearchStores.delete({ name: store.name, config: { force: true } });
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
