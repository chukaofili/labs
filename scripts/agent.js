import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const __dirname = dirname(fileURLToPath(import.meta.url));

// System instruction lives in docs/prompts/step_5.txt so it stays in sync with
// the prompt taught in the codelab (Step 5).
const systemInstruction = readFileSync(
  join(__dirname, "../docs/prompts/step_5.txt"),
  "utf-8"
).trim();

// Stream one user message through the chat session and print the reply as it
// arrives. The `chat` object keeps the running history for us, so follow-up
// messages stay in context automatically.
async function send(chat, message) {
  const stream = await chat.sendMessageStream({ message });
  output.write("\nAssistant: ");
  for await (const chunk of stream) {
    if (chunk.text) output.write(chunk.text);
  }
  output.write("\n");
}

async function main() {
  const ai = new GoogleGenAI({});

  // ai.chats.create() is the SDK's chat harness — it tracks conversation
  // history so each sendMessage builds on the previous turns.
  const chat = ai.chats.create({
    model: "gemini-3.5-flash",
    config: {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MEDIUM,
      },
      tools: [{ googleSearch: {} }],
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
  console.log('Chat with the Interstellar Labs assistant. Type "exit" to quit.');
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
