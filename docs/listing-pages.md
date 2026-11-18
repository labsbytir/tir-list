# Listing detail pages

The UI uses the existing forest-green palette, system body font, and monospace headings. One shared shell serves all six category routes; `servers` is displayed as “MCP Servers.”

## Content and layout

The reading order is identity/actions, overview, category facts, setup, pricing, data handling/support, sources/evidence, alternatives, and discussion. Astro passes existing model facts/FAQ into the specifications slot and charts/releases/vendor links into the evidence slot, preserving their rendering boundaries. On desktop, setup appears beside the main facts; on mobile it follows them.

Use `details`, `categoryDetails`, and `evidence` according to `openspec/changes/listing-page-content/design.md`. Existing minimum entries remain valid. Missing decision-critical facts read “Not provided”; absent optional subsections are omitted. Zero prices and explicitly unsupported capabilities remain visible.

Copy controls use the supplied command/configuration, never execute it, and report clipboard failure without removing selectable text. Marketing URLs and slugs are not treated as MCP endpoints or package names. Setup instructions require their documentation source.

Review persistence is not implemented. The previous unsaved star control is removed; discussion remains. GitHub popularity, issue summaries, and security/benchmark evidence are not user ratings.

Known claims show “Not verified” until the field is covered by an explicitly scoped check. Fact source links open the relevant source disclosure; checking setup does not mark pricing, offline support, or accessibility verified.

## Commercial placements

Advertising is not activated. Future listing-page placements belong in separately labeled sponsored areas near the header or alternatives. Use “Sponsored” for paid listing placement and “Advertisement” for display ads, with sponsor identity available. Payment must not change organic alternatives, factual metadata, security evidence, or reviews. Unconfigured placements produce no blank panels or external ad requests.

## Verification

Run:

```bash
npm test
npm run validate:data
npm run build
openspec validate listing-page-content --strict
```

`npm run test:ui` renders real React components server-side, without a new test runner. `npm run test:contract` checks metadata validation and category fixtures.

For hydrated component checks without adding fake listings to the public catalog, run these in separate terminals:

```bash
npm run dev -- --host 127.0.0.1 --port 4329
```

```bash
node tests/listing-browser.ts
```

Open `http://127.0.0.1:4330/?category=servers`; replace the category with `skills`, `agents`, `containers`, `models`, or `tools`. Add `&clipboard-failure=1` to exercise failure feedback. The harness binds only to localhost, consumes test fixtures, and is not a deployed Astro route. It depends on Astro's development module endpoints; it is not a production preview server.

Checks performed during implementation:

- All six populated fixture pages rendered in the browser at 390-pixel mobile width without console errors.
- MCP configuration copy succeeded; forced clipboard denial produced manual-copy guidance.
- A real sparse listing rendered on desktop (1440 pixels) and mobile; its section navigation worked.
- Render tests cover sparse/complete fields, category isolation, zero/false values, escaped examples, media links without embeds, evidence attribution, and category-plus-slug alternatives.

Not established by these checks: a complete keyboard audit, exact 360-pixel viewport behavior, live enrichment, new persisted reviews, or live production cache state. Keep the corresponding integration acceptance task open until those checks are completed.

Environment findings outside this change's implementation scope: existing comment-adapter type errors in `src/lib/comments.ts` and `src/pages/api/comments/[...path].ts`; `npm audit --omit=dev` reports 14 high-severity dependency findings in the Astro/Vite/picomatch dependency chain. Do not run breaking automated audit fixes as part of listing-page work.
