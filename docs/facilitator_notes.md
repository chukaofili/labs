# Facilitator Notes — Build with Gemini (RAG chatbot, no-code)

**Session:** 2026 GFSAA — Build with Gemini and Google's generative language models
**Slot:** Mon June 15, 10:00–11:00 (60 min)
**Audience:** Mixed GFSAA founders & builders, varied coding levels
**Goal:** Every attendee leaves with a working, grounded "chat with your docs" assistant built in Google AI Studio — and the mental model to take it to their product.

---

## Run of show (60 min)

| Time | Min | Segment | What you do |
|------|-----|---------|-------------|
| 10:00 | 5 | **Hook + intro** | Open with the problem: a chatbot that confidently lies about your business. Show the GenAI landscape slide. Frame today: build a bot that *only* speaks truth from your docs. |
| 10:05 | 5 | **The Gemini landscape** | Quick tour: Gemini 3.5 Flash (fast, cheap default) and 3.1 Pro (deep reasoning), multimodal, grounding, File Search. Keep it light — founders care about *what it unlocks*, not model specs. |
| 10:10 | 5 | **What is RAG (1 slide)** | The 3 ideas: model doesn't know your business → retrieval → grounded answers. Use the diagram. No jargon. |
| 10:15 | 5 | **Live: the problem (Step 1)** | Open AI Studio on the projector. Ask a company-specific question. Let it hallucinate. Big "aha" moment — let it land. |
| 10:20 | 10 | **Live build: system prompt + upload (Steps 2–3)** | Paste the system instruction, pick Gemini 3.5 Flash, then attach your demo docs with the **+** button so the model is grounded in them. Narrate every click. Attendees follow on their laptops. |
| 10:30 | 8 | **Live: grounded answers (Step 4)** | Re-ask the question — now correct. Ask an out-of-scope question — it declines instead of inventing. This is the payoff; pause here. |
| 10:38 | 7 | **Hands-on: their turn** | Attendees upload their *own* doc and ask their *own* question. Walk the room (or watch chat). This is the stickiest part — protect the time. |
| 10:45 | 5 | **Make it real (Step 6)** | Show "Get API key / code" → the bridge to production. Point at the repo's runnable `scripts/` (`upload.js` indexes docs into File Search, `search.js` returns grounded, cited answers) as the exact handoff your engineer ships. Founders need to see the path to their product. |
| 10:50 | 5 | **Use cases + grounding (Step 5)** | Support bot, internal AMA, customer assistant. Show live web grounding briefly. Tie to their businesses. If technical, tease **Step 7 (MCP)** — connecting the bot to live databases/APIs. |
| 10:55 | 5 | **Q&A + resources** | Share the codelab link, AI Studio link, and this repo (sample knowledge base + scripts). Invite them to keep building. |

> Buffer is built in: if hands-on runs long, drop Step 5 (grounding) — it's marked optional.

---

## Pre-flight checklist (do the morning of)

- [ ] **Dry run the entire build** in AI Studio on the actual venue wifi. UI labels change weekly — confirm where the **+ attach**, **Tools / Grounding**, and **Get code** controls live *today*.
- [ ] Confirm your demo docs are ready. The repo ships a ready-made sample knowledge base for the fictional **Interstellar Labs** (`knowledge-base/markdowns/` and `knowledge-base/pdfs/`) — use it as-is or as a backup if your own docs aren't ready.
- [ ] Have your **demo question** picked, where the raw model hallucinates but your doc has the answer. The repo's `README.md` lists tested demo questions (e.g. *"What's Interstellar Labs' refund window for annual plans?"* → 14 days).
- [ ] Sign in to AI Studio on the presenting machine; clear any old prompts.
- [ ] Screen mirror tested; font size bumped so the back row can read the prompt box.
- [ ] Phone hotspot ready as wifi backup.
- [ ] Have the codelab link short-URL'd / QR-coded on a slide.

---

## Talking points that land with founders

- **"Same model, same question — the only thing that changed is what it can see."** This is the single clearest way to explain RAG.
- **"You just built the core of a support bot in 10 minutes with no code."** Reinforces speed-to-value.
- **"What you did by hand maps 1:1 to the API call your engineer ships."** Removes the "but is this a toy?" doubt.
- **"The bot saying 'I don't know' is a feature, not a bug."** Trust > coverage for customer-facing tools.

---

## Common pitfalls & fixes

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Bot still hallucinates after upload | System instruction too weak | Strengthen: "Answer ONLY from the documents. If not present, say you don't know." |
| Attach (+) button missing or greyed out | UI moved, or unsupported file type | Confirm the file type is supported; try the Markdown version from `knowledge-base/markdowns/` instead of the PDF. |
| Answers ignore the doc | File still loading, or doc is an image-only scan | Wait for the file to finish attaching; for scanned PDFs, note Gemini reads them but quality varies. |
| Grounding pulls web instead of docs | Search grounding overriding docs | Tighten instruction to prefer documents; only use search for external facts. |
| Attendee can't sign in | Corp Google account restrictions | Use a personal Google account; no billing needed for the workshop. |
| Wifi dies mid-demo | Venue network | Switch to hotspot; or show the pre-recorded/screenshot fallback on slides. |

---

## Backup plan (if live build fails entirely)

Have **screenshots of each step** in your back pocket (or in the appendix of the deck). Walk through the flow on the slides, then share the codelab so attendees can complete it after. The learning objective survives even without a live connection.

---

## Adapting on the fly

- **Room skews non-technical?** Spend more time on Steps 1 and 4 (the problem and the payoff), less on Step 6 (API).
- **Room skews technical?** Compress the build, spend the saved time on the API/production path and File Search internals (chunking, embeddings, retrieval).
- **Running short on time?** The must-keep arc is Steps 1 → 3 → 4. Everything else is enhancement.
