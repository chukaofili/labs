# Hostable codelab

[`codelab.md`](codelab.md) is the canonical [Google Codelabs](https://github.com/googlecodelabs/tools) (claat) source for the workshop — in the claat Markdown format so it can be exported to a self-contained, hostable codelab site (stepped UI, per-step timers, progress, table of contents). [`docs/codelab.md`](../docs/codelab.md) is just a pointer here.

## Prerequisites

[claat](https://github.com/googlecodelabs/tools/tree/main/claat) (the Codelabs command-line tool), which needs [Go](https://go.dev/dl/):

```bash
go install github.com/googlecodelabs/tools/claat@latest
# ensure your Go bin dir is on PATH, e.g.:
export PATH="$PATH:$(go env GOPATH)/bin"
```

## Build and preview

```bash
cd codelabs

# Export the markdown to a static codelab. This generates a folder named after
# the `id` in the metadata header: ./build-rag-chatbot-ai-studio/
claat export codelab.md

# Serve it locally (opens http://localhost:9090)
claat serve
```

`claat export` writes a self-contained static site (HTML + assets) into `build-rag-chatbot-ai-studio/`. Open that folder's `index.html`, or use `claat serve` for the full experience.

> Note: when viewing the exported `index.html` directly from disk, a few icons (Next/Back, timer) may not render — they work once the site is served over HTTP.

## Host it

The exported folder is plain static content, so host it anywhere:

- **GitHub Pages** — commit the generated `build-rag-chatbot-ai-studio/` folder (or build it in CI) and point Pages at it.
- **Netlify / Vercel / Cloud Storage** — drop the exported folder in as a static site.
- **A full codelabs landing page** (like [codelabs.developers.google.com](https://codelabs.developers.google.com)) — see the [claat site tooling](https://github.com/googlecodelabs/tools/blob/main/site/README.md).

The generated output is build artifact — it's git-ignored by default (see [`.gitignore`](.gitignore)). Remove that ignore line if you'd rather commit the built site for GitHub Pages.

## Editing

Edit [`codelab.md`](codelab.md) and re-run `claat export`. Format reference: the [claat Markdown parser docs](https://github.com/googlecodelabs/tools/tree/main/claat/parser/md) and the [format guide](https://github.com/googlecodelabs/tools/blob/main/FORMAT-GUIDE.md).

This is the single source of truth for the codelab content — [`docs/codelab.md`](../docs/codelab.md) only points here.
