# Codelabs

This folder is the source for the hosted codelabs site at
**<https://chukaofili.github.io/labs/>**, built with
[Google Codelabs](https://github.com/googlecodelabs/tools) (claat).

## Layout

```
codelabs/
├── index.html               # landing page that lists the codelabs (served at /labs/)
├── template.html            # custom claat HTML template (adds the "About this codelab" block)
└── chatbot-with-rag/         # one self-contained codelab (served at /labs/chatbot-with-rag/)
    ├── codelab.md            # claat Markdown source; `id:` sets the URL path
    ├── README.md             # the codelab's own README
    ├── img/                  # screenshots referenced by the codelab
    ├── docs/                 # speaker notes + prompts
    ├── knowledge-base/       # sample documents
    └── scripts/              # Gemini API code samples
```

Only `codelab.md` (and the images it references) is exported to the site; the
other folders are companion material linked from the codelab.

Each `codelabs/<name>/codelab.md` is exported to its own folder named after the
`id:` field in its metadata header.

## Prerequisites

[claat](https://github.com/googlecodelabs/tools/tree/main/claat) (the Codelabs
CLI), which needs [Go](https://go.dev/dl/):

```bash
go install github.com/googlecodelabs/tools/claat@latest
export PATH="$PATH:$(go env GOPATH)/bin"
```

## Build and preview the whole site

```bash
# from the repo root
mkdir -p _site
cp codelabs/index.html _site/index.html
for dir in codelabs/*/; do
  [ -f "${dir}codelab.md" ] || continue
  (cd "$dir" && claat export -f ../template.html -o "$PWD/../../_site" codelab.md)
done

# serve _site at http://localhost:8000
cd _site && python3 -m http.server 8000
```

`_site/` is git-ignored — it's a build artifact. (CI runs the same steps; see
[`.github/workflows/deploy-codelab.yml`](../.github/workflows/deploy-codelab.yml).)

To preview a single codelab quickly, `cd codelabs/chatbot-with-rag && claat serve`.

## Add a new codelab

1. Create `codelabs/<new-name>/codelab.md` with a claat metadata header (give it a
   unique `id:` — that becomes its URL path).
2. Add a card for it in [`index.html`](index.html) (copy the existing one).
3. Push to `main` — the workflow rebuilds and redeploys the whole site.

## Hosting

Deployment is automatic: pushing changes under `codelabs/**` to `main` triggers
the [GitHub Pages workflow](../.github/workflows/deploy-codelab.yml), which builds
the site and publishes it. Pages is configured in "GitHub Actions" mode.

Format reference: the
[claat Markdown parser docs](https://github.com/googlecodelabs/tools/tree/main/claat/parser/md)
and the [format guide](https://github.com/googlecodelabs/tools/blob/main/FORMAT-GUIDE.md).
Note: info boxes use the blockquote form `> aside positive` / `> aside negative`.
