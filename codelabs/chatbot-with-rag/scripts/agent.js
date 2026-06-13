import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import ora from "ora";

const __dirname = dirname(fileURLToPath(import.meta.url));

// System instruction lives in docs/prompts/step_2.txt so it stays in sync with
// the docs-only prompt taught in the codelab (Step 2). File Search grounds the
// answers in the knowledge base, so we use the docs-only prompt (not the Step 5
// web-grounding one).
const systemInstruction = readFileSync(
  join(__dirname, "../docs/prompts/step_2.txt"),
  "utf-8",
).trim();

// Stream one user message through the chat session and print the reply as it
// arrives. The `chat` object keeps the running history for us, so follow-up
// messages stay in context automatically.
async function send(chat, message) {
  // Spin while we wait for the model. Streaming means the promise resolves
  // before all tokens arrive, so we keep spinning until the FIRST chunk of text
  // lands, then stop and start printing.
  output.write("\n");
  const spinner = ora("Thinking").start();
  try {
    const stream = await chat.sendMessageStream({ message });
    let started = false;
    for await (const chunk of stream) {
      if (!chunk.text) continue;
      if (!started) {
        spinner.stop();
        output.write("Assistant: ");
        started = true;
      }
      output.write(chunk.text);
    }
    if (!started) spinner.stop(); // empty response — clear the spinner anyway
    output.write("\n");
  } catch (err) {
    spinner.stop();
    throw err;
  }
}

async function main() {
  const ai = new GoogleGenAI({});
  const MODEL = "gemini-3.5-flash";
  const storeName = process.env.FILE_SEARCH_STORE;
  if (!storeName) {
    console.error(
      "Set FILE_SEARCH_STORE in .env to the store you built with upload.js.",
    );
    process.exit(1);
  }
  console.log(`Using existing store: ${storeName}`);

  // ai.chats.create() is the SDK's chat harness — it tracks conversation
  // history so each sendMessage builds on the previous turns.
  const chat = ai.chats.create({
    model: MODEL,
    config: {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MEDIUM,
      },
      tools: [{ fileSearch: { fileSearchStoreNames: [storeName] } }],
      systemInstruction: [{ text: systemInstruction }],
    },
  });

  // One-shot mode: a message passed on the command line is answered and we exit.
  const inlineMessage = process.argv.slice(2).join(" ").trim();
  if (inlineMessage) {
    await send(chat, inlineMessage);
    return;
  }

  // Interactive mode: chat back and forth until the user exits.
  const rl = createInterface({ input, output });
  console.log(
    'Chat with the Interstellar Labs assistant. Type "exit" to quit.',
  );
  try {
    while (true) {
      const message = (await rl.question("\nYou: ")).trim();
      if (!message || message === "exit" || message === "quit") break;
      await send(chat, message);
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
