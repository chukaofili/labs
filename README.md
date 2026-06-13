# labs

Hands-on **codelabs** written by [Chuka Ofili](https://iamchuka.com).
Browse them live at **<https://chukaofili.github.io/labs/>**.

## Codelabs

| Codelab                                                                                              | What you build                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Build a "Chat With Your Docs" Assistant (RAG)](https://chukaofili.github.io/labs/chatbot-with-rag/) | A grounded "chat with your docs" assistant — no code in Google AI Studio, then to production with the Gemini API + File Search. Source: [`codelabs/chatbot-with-rag/`](codelabs/chatbot-with-rag/) |

## Repository layout

```
labs/
├── codelabs/                       # source for the hosted site (chukaofili.github.io/labs/)
│   ├── index.html                  # landing page that lists the codelabs
│   ├── README.md                   # how the site is built & hosted (claat)
│   └── chatbot-with-rag/           # one self-contained codelab
│       ├── codelab.md              # claat source
│       ├── README.md               # the codelab's own README
│       ├── img/                    # screenshots
│       ├── docs/                   # speaker notes + system-instruction prompts
│       ├── knowledge-base/         # sample documents to ingest
│       └── scripts/                # Gemini API code samples (Node.js)
└── .github/workflows/              # GitHub Pages deploy (claat export)
```

## Building & hosting

The site is built from `codelabs/` with [claat](https://github.com/googlecodelabs/tools)
and published to GitHub Pages by a GitHub Actions workflow — pushing changes under
`codelabs/**` to `main` rebuilds and redeploys. See
[`codelabs/README.md`](codelabs/README.md) for details and how to add a codelab.

## License

Workshop materials © Chuka Ofili. Sample knowledge-base data is fictional.
