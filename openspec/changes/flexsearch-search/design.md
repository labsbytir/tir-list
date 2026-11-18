# Design

## Approach
- `new Document({ tokenize: "forward", document: { id: "id", index: ["text"] } })`; one doc per card combining name + description + tags.
- Cards enumerated by DOM order as numeric ids; `data-cat` kept for category filter.
- `MutationObserver` on `#grid` rebuilds the index when the `server:defer` island resolves, then re-applies the current query.
- `import { Document } from "flexsearch"` in the inline script (Astro/Vite bundles it).

## Alternatives
- `Index` flat index: rejected, Document fits multi-field entries directly.
- Prebuilt serialized index: deferred until catalog grows; build cost is trivial at this size.
