# Build a "Chat With Your Docs" Assistant. No Code, in Google AI Studio

**Workshop:** 2026 GFSAA - Build with Gemini and Google's generative language models  
**Format:** ~45 min hands-on, no coding required  
**You'll need:** A Google account, a laptop with a browser, and 1–3 documents about your startup (pitch deck, FAQ, product doc, policy - PDF, Google Doc, or text).

---

## What you'll build

A chatbot that answers questions **using only your own documents** - your pricing, your FAQ, your onboarding guide, instead of making things up. This pattern is called **RAG (Retrieval-Augmented Generation)** or **Document Grounding**: the model looks at _your_ specific content, then writes an answer grounded in it.

By the end you'll have a working assistant ready for prototyping, plus a clear mental model of how to hand this off to your engineering team.

**Why this matters:** This is the fastest way to turn a pile of company docs into a support bot, an internal "ask-me-anything," or a customer-facing assistant - without hiring an ML team.

---

## Before we start: the 3 ideas behind Grounding

1. **The model is smart but doesn't know _your_ business.** Gemini wasn't trained on your internal pricing or your refund policy.
2. **Grounding fixes this.** You give it a knowledge source. When a user asks a question, the system looks at the relevant information and hands it to the model _with_ the question.
3. **Grounded answers cite their source.** Good answers point back to the document they came from - so you can trust and verify them.

Keep this picture in mind: **Your docs → uploaded to context → user asks → Gemini answers strictly from your docs.**

---

## Step 0: Open Google AI Studio (2 min)

1. Go to **aistudio.google.com** and sign in with your Google account.
2. If prompted, accept the terms. You're now in the studio - free to experiment.
3. In the left navigation panel under **EXPLORE**, ensure you are on the **Playground** tab.
4. Look at the center of the screen. Next to "Explore Google models," make sure the toggle is set to **Models** (not Agents).

   _(Note: The "Agents" mode spins up a persistent coding sandbox; "Models" is the correct mode for building a chat interface)._

**Checkpoint:** You can see the AI Studio interface with a chat/prompt area at the bottom and a right panel for settings.

---

## Step 1: Try the model raw, so you feel the problem (5 min)

Before adding your docs, let's prove _why_ we need grounding by testing the raw brain of the model.

1. Look at the **Run settings** panel on the right side of the screen under **Tools**.
2. **Crucial:** Ensure that **Grounding with Google Search** is toggled **OFF**. We don't want it looking up your website just yet.
3. Locate the main text box at the very bottom of the screen that says **"Start typing a prompt..."**
4. Ask something only your company would know, e.g.: _"What is [Your Startup]'s refund window for annual plans?"_
5. Click the **Run** button on the far right of that bottom text box.

**What happens:** The model either says it doesn't know, or it **makes up** a plausible-sounding answer. That confident-but-wrong behavior is exactly what grounding prevents.

---

## Step 2: Set the assistant's behavior with System Instructions (5 min)

System instructions tell the model _who it is_ and _how to behave_ for the whole conversation.

1. Look at the **Run settings** panel on the right side of your screen.
2. Locate the **System instructions** input field.
3. Paste this starter (edit the brackets for your startup):

   > You are the support assistant for [Your Startup]. Answer ONLY using the information in the provided documents. If the answer is not in the documents, say: "I don't have that in our docs yet - I'll flag it for the team.".
   > Be concise, friendly, and never invent prices, dates, or policies. When possible, mention which document the answer came from.

4. In the model selector dropdown (top of the right panel), choose the latest **Flash** model (e.g., Gemini 3.5 Flash for fast, cheap chat) or **Pro** model (for deeper reasoning).

**Why this matters:** The "only answer from the documents" rule is what keeps your bot honest. This single instruction is doing a lot of work.

---

## Step 3: Give it your knowledge (10 min)

Now we give the model access to your private company truth.

1. Look back down at the prompt box at the bottom of the screen.
2. Click the **+ (plus) icon** next to the microphone to upload your documents.
3. Select and upload your 1–3 startup documents (PDFs, text files, etc.).
4. Gemini's massive context window will now read the whole document and use it as a direct knowledge base.

**Checkpoint:** Your documents are uploaded and visible in the chat context.

---

## Step 4: Ask the same question again (5 min)

1. Re-enter your exact Step 1 question in the bottom text box: _"What is [Your Startup]'s refund window for annual plans?"_ 2. Click **Run**.

**What happens now:** The answer comes straight from your document - correct, specific, and citing the source file.

Try a few more:

- A question whose answer **is** in your docs → should answer correctly.
- A question whose answer is **not** in your docs → should say "I don't have that in our docs yet," _not_ invent one.

**This is the whole game.** Same model, same question - but now it's grounded in your truth.

---

## Step 5: Add live web facts with Grounding (optional, 5 min)

Some questions need _fresh_ info (today's FX rate, a competitor's latest launch, or industry news).

1. Go back to the **Tools** section in your right-hand settings panel.
2. Toggle ON **Grounding with Google Search**.
3. **Tighten your prompt:** When you give an AI access to the entire internet, it can get distracted and ignore your uploaded files. To fix this, go back to your **System instructions** and replace them with this tightened version:

   > You are the support assistant for [Your Startup].
   >
   > PRIMARY RULE: You must check the provided documents FIRST for any answers regarding [Your Startup]'s pricing, policies, features, or internal operations. Answer using the provided documents if the information exists there.
   >
   > SECONDARY RULE: If the user asks a general market question, requests a currency conversion, or asks about current events outside the company documents, you may use Google Search to provide an accurate, up-to-date answer.
   >
   > Be concise, friendly, and never invent prices, dates, or policies. Always clarify if your answer came from internal docs or the web.

4. **Test it out:** Ask a document question (_"What is our refund policy?"_) and a web question (_"What is the current exchange rate for USD to EUR?"_). The bot will now dynamically switch between your private truth and the public web!

---

## Step 6: Make it real: hand it off to your engineers (5 min)

Now that your assistant is working perfectly in the playground (since Google AI Studio is a prototyping sandbox), it’s time to move it into your actual product.

1. Look in the top right corner of AI Studio and click **</> Get code**.
2. Look at the code snippet generated. Notice how everything you just built via clicking around your System Instructions and your Google Search tool is perfectly translated into API code.
3. Click the **Get API key** button (usually in the left navigation menu) to generate a secure key for your workspace.
4. **The Handoff:** Copy that code snippet, your API key, and the raw PDF files. Hand them to your developer.

**Note on your Uploaded Files:** When you click "Get Code," AI Studio does not download the PDFs you uploaded. Your developer will need to re-upload them into your app's environment with the Gemini API. This Codelab repo ships two ready-to-run Node.js scripts in [`scripts/`](../scripts/) that do exactly that, using the current `@google/genai` SDK and the **File Search** tool - the same retrieval-with-citations you built in the playground.

The flow is two steps:

1. **[`scripts/upload.js`](../scripts/upload.js)** - indexes your documents into a File Search store once.
2. **[`scripts/search.js`](../scripts/search.js)** - queries that store for grounded, cited answers as many times as you like.

Hand your developer this repo and point them at [`scripts/`](../scripts/):

```bash
cd scripts
npm install             # installs @google/genai and dotenv
cp .env.example .env    # then set GEMINI_API_KEY (get one at aistudio.google.com/apikey)

# 1. Index the documents into a File Search store
node upload.js ../knowledge-base/pdfs/*.pdf

# 2. Paste the FILE_SEARCH_STORE id it prints into .env, then ask a question
node search.js "What is our refund window for annual plans?"
```

Unlike stuffing a whole PDF into every request, File Search retrieves **only the relevant chunks** and returns **citations** - so the answer stays grounded and your token costs stay low as the knowledge base grows. See [`scripts/upload.js`](../scripts/upload.js) and [`scripts/search.js`](../scripts/search.js) for the full, commented source.

**Developer Reference for Bulk Uploads:**
If you have a massive folder of documents, tell your developers to review the **[Gemini API File Search Guide](https://ai.google.dev/gemini-api/docs/file-search)** and the **[File API documentation](https://ai.google.dev/api/files)**. The API allows up to 20GB of stored files per project, and developers can easily extend [`scripts/upload.js`](../scripts/upload.js) to bulk-index an entire directory of company data at once.

---

## Step 7: Advanced: Connect to live databases with MCP (Roadmap)

Right now, your bot answers from static PDFs and public Google Searches. But what if you want it to check a live user's account balance in Stripe, read a live Jira ticket, or pull data from your private Slack channels?

To do this, your engineering team can use the **Model Context Protocol (MCP)**.

**What is MCP?**
It is an open-source standard that acts like a secure, universal plug adapter between AI models and your company's private data sources. Instead of manually uploading PDFs, an MCP server lets the AI safely query your actual databases or internal APIs in real-time.

**Next Step:**
Setting up MCP requires backend engineering. When you are ready to move beyond static document grounding and into live system integration, give your engineering team this objective:

> _"Look into setting up an MCP server for our internal APIs. We want to give our Gemini bot secure tool-access to our live databases."_

---

## You did it 🎉

You built a grounded "chat with your docs" assistant with **zero code**. You now understand:

- Why a raw model can't answer business-specific questions
- How to write strong System Instructions to prevent hallucination
- How to upload your documents directly into the model's long context
- How to turn live web grounding on and off
- The path from prototype → exact code → engineering handoff
- How to scale into live database connections using MCP
