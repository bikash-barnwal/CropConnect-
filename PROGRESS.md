# PROGRESS

## 2026-07-04 — Loop-kit adapted to CropConnect

### Done
- `.claude/config.json` rewritten for this repo: sourceRoots `Backend` + `Frontend/src`, JS-only
  sourceExts, verify pipeline (`node --check` + Frontend lint/build), profile `personal`
  (no human checkpoints), auth middleware protected.
- Root `.gitignore` fixed — it ignored the whole `.claude/` dir, hiding the kit from git and
  making the review/commit gates impossible to satisfy for kit changes. Now tracked.
- Stale `plan.json` from the kit's source repo removed from state.
- `.claude/context/architecture.md` — repo map + known debt list.
- `CURRENT-FOCUS.md` — epic "farmer lists crop → vendor buys crop", 5 tasks with acceptance criteria.
- Backend + Frontend `npm ci` done.

### Verification
- node --check Backend/server.js: PASS
- npm --prefix Frontend run build: PASS (33s; 784kB chunk warning — code-split later)
- npm --prefix Frontend run lint: FAIL (23 errors, pre-existing) — deliberately NOT in
  config.verify yet; Task 1 fixes them and adds lint + tests to the pipeline.

### Next
- CURRENT-FOCUS.md Task 1: fix eslint errors (2 are real bugs: ProfileImage.jsx saveRes,
  Signup.jsx err), add test + lint infrastructure, extend `config.verify`.

### Open questions
- none
