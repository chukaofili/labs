// upload.js
// Ask a question grounded in a single PDF, using the Gemini Files API.
//
// Usage:   GEMINI_API_KEY=your_key  node upload.js ./path/to/startup_handbook.pdf
// Install: npm install @google/genai
//
// Note: this sends the whole document as context on each call ("RAG-lite").
// For many/large docs, use the managed File Search tool for true retrieval.

import { GoogleGenAI, createPartFromUri } from "@google/genai";

// The SDK automatically reads GEMINI_API_KEY (or GOOGLE_API_KEY) from the env.
const ai = new GoogleGenAI({});

const MODEL = "gemini-3.5-flash"; // GA model (current as of June 2026)
const QUESTION =
  "What is our refund window for annual plans? " +
  "If it is not in the document, say you don't know.";

async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Error: please provide a file path.");
    console.error("Usage: node upload.js <path-to-document.pdf>");
    process.exit(1);
  }

  // 1. Upload the document. mimeType is inferred from the extension, but we set
  //    it explicitly so it also works for files without a clear .pdf name.
  console.log(`Uploading ${filePath}...`);
  let file = await ai.files.upload({
    file: filePath,
    config: { mimeType: "application/pdf" },
  });
  console.log(`Uploaded. File ID: ${file.name}`);

  // 2. Wait for the file to finish PROCESSING before using it in a request.
  while (file.state === "PROCESSING") {
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    file = await ai.files.get({ name: file.name });
  }
  if (file.state === "FAILED") {
    throw new Error("File processing failed.");
  }
  console.log(`\nFile is ${file.state}.`);

  // 3. Ask the model. Pass the file as a proper Part (file first, prompt after).
  console.log("Asking the model a question based on the document...");
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [createPartFromUri(file.uri, file.mimeType), QUESTION],
  });

  console.log("\n--- AI Response ---");
  console.log(response.text);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
