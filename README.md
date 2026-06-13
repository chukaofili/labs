# chatbot-with-rag

A hands-on, **no-code workshop** for building a grounded "chat with your docs" assistant (RAG) using **Google AI Studio** and Gemini, built for the **2026 GFSAA** session _"Build with Gemini and Google's generative language models."_

RAG (Retrieval-Augmented Generation) connects a great model to _your_ content so it answers from your documents instead of guessing. This repo has everything to run the session: the workshop materials, a ready-made sample knowledge base to point File Search at, and code samples that do the same thing with the Gemini API.

## What's inside

```
chatbot-with-rag/
├── docs/                                       # Run-the-session materials
│   ├── Build_with_Gemini_RAG_Workshop.pptx     # 10-slide deck
│   ├── codelab_rag_chatbot_ai_studio.md        # Step-by-step hands-on guide
│   └── facilitator_notes.md                    # Minute-by-minute run of show
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
    ├── package.json                            # @google/genai dependency + npm scripts
    └── .env.example                            # API key + optional question override
```

## The knowledge base

The `knowledge-base/` folder is a fictional-but-realistic dataset for **Interstellar Labs**, used as the demo company. The docs are intentionally cross-referenced (e.g. the 14-day annual refund policy appears in pricing and is referenced from support) so the bot can give precise, citable answers. The same four documents are provided as both Markdown (`markdowns/`) and PDF (`pdfs/`) so you can demo ingesting either format.

> ⚠️ Sample data for demonstration only - not real company policy.

## Run the workshop

1. Open [Google AI Studio](https://aistudio.google.com) and sign in.
2. Add a system instruction telling the model to answer **only** from the provided documents.
3. Enable the **File Search** tool and upload the files in `knowledge-base/`.
4. Ask questions — the bot answers from the docs and cites its source.

Full walkthrough: [`docs/codelab_rag_chatbot_ai_studio.md`](docs/codelab_rag_chatbot_ai_studio.md).

## Run the code samples (optional)

Prefer code over the UI? The `scripts/` folder does the same RAG flow with the Gemini API and the `@google/genai` SDK.

```bash
cd scripts
npm install
cp .env.example .env          # then add your GEMINI_API_KEY

# 1. Index the knowledge base into a File Search store
npm run upload -- ../knowledge-base/markdowns/*.md

# 2. Query the store (use the FILE_SEARCH_STORE printed by step 1)
FILE_SEARCH_STORE=fileSearchStores/kb-123 npm run search
```

- [`scripts/upload.js`](scripts/upload.js) — creates (or reuses) a File Search store and indexes the files you pass it.
- [`scripts/search.js`](scripts/search.js) — queries the store, prints a grounded answer and the source documents it cited. Override the prompt with the `QUESTION` env var.

Get an API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Try these demo questions

- "What's Interstellar Labs' refund window for annual plans?"
- "How much is Flagship's Growth plan annually?"
- "What are the support response targets for an Enterprise customer?"
- "How many days of paid time off do employees get?"
- "Something not in the docs" → the bot should decline instead of inventing.

## License

Workshop materials © Interstellar Labs. Sample knowledge-base data is fictional.
