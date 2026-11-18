# AGENTS.md

## Gadget
- Agent name: Gadget (chief of staff). Run project init with the `gadget_init` tool or `/gadget-init`.
- RAG first: use open-codebase-index tools (codebase_context, codebase_search, implementation_lookup, call_graph) before reading whole files. Keep `.opencode/codebase-index.json` set to Ollama embeddings.
- Memory graph: keep OpenCode running with `webServerEnabled` (opencode-mem on 127.0.0.1:4747); use the Memory Graph extension and Retry.
- Preflight: pre-commit hooks (husky + lint-staged + prettier) must pass; run `setup-pre-commit` when adding a JS/TS project.
- Skills: grill-with-docs, codebase-design, domain-modeling, improve-codebase-architecture, ponytail, scaffold-exercises, wayfinder, writing-for-agents.
- Git: every project is a git repo; commit with Conventional Commits; keep imports synced via .github/workflows/gadget-sync.yml.
