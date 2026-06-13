# chatbot-with-rag

A hands-on, **no-code workshop** for building a grounded "chat with your docs" assistant (RAG) using **Google AI Studio** and Gemini, built for the **2026 GFSAA** session _"Build with Gemini and Google's generative language models."_

RAG (Retrieval-Augmented Generation) connects a great model to _your_ content so it answers from your documents instead of guessing. This repo has everything to run the session: the workshop materials, a ready-made sample knowledge base to point File Search at, and code samples that do the same thing with the Gemini API.

## What's inside

```
chatbot-with-rag/
├── codelab.md                                  # Hostable codelab source (claat) — the walkthrough
├── README.md                                   # This file
├── img/                                        # Screenshots used by the codelab
├── docs/                                       # Presenter materials
│   ├── speaker-notes.md                        # Minute-by-minute run of show
│   └── prompts/                                # System-instruction prompts from the codelab
│       ├── step_2.txt                          # Docs-only support assistant (Step 2)
│       └── step_5.txt                          # Docs-first + Google Search grounding (Step 5)
├── knowledge-base/                             # Sample docs to ingest into the RAG
│   ├── markdowns/                              # Markdown source documents
│   │   ├── 01_Company_Overview_FAQ.md
│   │   ├── 02_Products_and_Pricing.md
│   │   ├── 03_Customer_Support_SLA.md
│   │   └── 04_People_and_Culture_Handbook.md
│   └── pdfs/                                   # Same documents as PDFs
│       ├── 01_Company_Overview_FAQ.pdf
│       ├── 02_Products_and_Pricing.pdf
│       ├── 03_Customer_Support_SLA.pdf
│       └── 04_People_and_Culture_Handbook.pdf
└── scripts/                                    # Gemini API code samples (Node.js)
    ├── upload.js                               # Index docs into a File Search store
    ├── search.js                               # Query the store with grounded, cited answers
    ├── agent.js                                # Interactive multi-turn chat agent
    ├── cleanup.js                              # Delete the store or clear its documents
    ├── package.json                            # @google/genai dependency + npm scripts
    └── .env.example                            # API key + File Search store id
```

## The knowledge base

The `knowledge-base/` folder is a fictional-but-realistic dataset for **Interstellar Labs**, used as the demo company. The docs are intentionally cross-referenced (e.g. the 14-day annual refund policy appears in pricing and is referenced from support) so the bot can give precise, citable answers. The same four documents are provided as both Markdown (`markdowns/`) and PDF (`pdfs/`) so you can demo ingesting either format.

> ⚠️ Sample data for demonstration only - not real company policy.

## Run the workshop

1. Open [Google AI Studio](https://aistudio.google.com) and sign in.
2. Add a system instruction telling the model to answer **only** from the provided documents (see [`docs/prompts/step_2.txt`](docs/prompts/step_2.txt)).
3. Attach the files from `knowledge-base/` with the **+** button so the model is grounded in them.
4. Ask questions — the bot answers from the docs and cites its source.

Full walkthrough: the [live codelab](https://chukaofili.github.io/labs/chatbot-with-rag/) (source: [`codelab.md`](codelab.md), authored as a hostable [Google Codelabs](https://github.com/googlecodelabs/tools) site). Presenter materials: [slide deck (Google Slides)](https://docs.google.com/presentation/d/1cFVxBTA-jEGInwmGqipLam65ZoXknT5oC2-ZhiJptMU/edit?usp=sharing) and [`docs/speaker-notes.md`](docs/speaker-notes.md).

## Run the code samples (optional)

Prefer code over the UI? The `scripts/` folder does the same RAG flow with the Gemini API and the `@google/genai` SDK.

```bash
cd scripts
npm install
cp .env.example .env          # then set GEMINI_API_KEY (loaded automatically via dotenv)

# 1. Index the knowledge base into a File Search store
npm run upload -- ../knowledge-base/pdfs/*.pdf

# 2. Paste the FILE_SEARCH_STORE id printed by step 1 into .env, then ask a question
npm run search -- "What is our refund window for annual plans?"
```

The scripts load your `.env` via [dotenv](https://github.com/motdotla/dotenv), so once `GEMINI_API_KEY` and `FILE_SEARCH_STORE` are set there you don't need to pass them on the command line.

- [`scripts/upload.js`](scripts/upload.js) — creates (or reuses) a File Search store and indexes the files you pass it, then prints the store id for `.env`.
- [`scripts/search.js`](scripts/search.js) — queries the store in `FILE_SEARCH_STORE` with the question you pass on the command line (`npm run search -- "your question"`), prints a grounded answer and the source documents it cited.
- [`scripts/agent.js`](scripts/agent.js) — a mini multi-turn chat agent: a conversational version of `search.js`. Built on the SDK's chat-session helper, it grounds answers in the same `FILE_SEARCH_STORE` (with citations) using the docs-only prompt from [`docs/prompts/step_2.txt`](docs/prompts/step_2.txt), and keeps conversation history so follow-up questions stay in context. Build the store with `upload.js` first.

```bash
# Interactive chat (type "exit" to quit):
npm run agent

# Or one-shot:
npm run agent -- "What is your refund policy?"
```

- [`scripts/cleanup.js`](scripts/cleanup.js) — tears down the `FILE_SEARCH_STORE` to reset between runs or clear duplicate documents. Safe by default: with no flags it's a **dry run** that lists what would be deleted. Pass `--yes` to delete the whole store, or `--docs --yes` to empty it but keep the store id valid.

```bash
# Preview what's in the store (deletes nothing):
npm run cleanup

# Delete the whole store:
npm run cleanup -- --yes

# Keep the store, just remove its documents:
npm run cleanup -- --docs --yes
```

Get an API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Try these demo questions

- "What's Interstellar Labs' refund window for annual plans?"
- "How much is Flagship's Growth plan annually?"
- "What are the support response targets for an Enterprise customer?"
- "How many days of paid time off do employees get?"
- "Something not in the docs" → the bot should decline instead of inventing.

## License

Workshop materials © Interstellar Labs. Sample knowledge-base data is fictional.
