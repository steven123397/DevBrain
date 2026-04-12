# DevBrain MVP Implementation Plan

> **Execution note:** Read `docs/index.md` first; keep boundary changes in design docs, task breakdown in plan docs, and live progress in `docs/status/project-status.md`.

**Goal:** Build a local-first programmer second-brain MVP that supports fast capture, structured digestion, search, filtering, and rule-based related-note recall.

**Architecture:** Use a single-repo full-stack web app so the first version stays operationally simple. Keep the canonical knowledge model in SQLite via Drizzle ORM, expose data access through server-side actions/routes, and render a small set of focused pages for capture, list, detail, and editing workflows. Design the schema and service layer so embeddings and knowledge-graph edges can be added later without rewriting the core note model. For the single-user phase, local SQLite remains the canonical source of truth. The UI should stay thin enough that a future desktop shell, repo indexing pipeline, and context-aware recall engine can be added without rewriting the note workflows.

**Tech Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + SQLite + Drizzle ORM + Zod + Vitest + Playwright

---

## 0. Planning Guardrails

### In scope for MVP
- Single-user local-first web app
- Structured notes with inbox/digested lifecycle
- SQLite persistence
- Full-text search
- Tag and stack filters
- Rule-based related note recommendations

### Explicitly out of scope for MVP
- Team collaboration
- Cloud sync
- Graph visualization
- Embedding search
- Browser extension / automatic ingestion
- Agent-first workflows

### Recommended repository layout

```text
/home/liangjiaqi/projects/devbrain/
├─ docs/
│  ├─ index.md
│  ├─ codex-kickoff-brief.md
│  ├─ product-requirements.md
│  ├─ implementation-plan.md
│  ├─ future-data-model.md
│  ├─ design/
│  │  └─ template.md
│  ├─ plan/
│  │  ├─ template.md
│  │  └─ history.md
│  └─ status/
│     ├─ project-status.md
│     └─ code-review-status.md
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ notes/
│  │  │  ├─ page.tsx
│  │  │  ├─ new/page.tsx
│  │  │  ├─ [id]/page.tsx
│  │  │  └─ [id]/edit/page.tsx
│  ├─ components/
│  ├─ db/
│  │  ├─ client.ts
│  │  ├─ schema.ts
│  │  ├─ queries/
│  │  └─ migrations/
│  ├─ features/
│  │  └─ notes/
│  │     ├─ note.types.ts
│  │     ├─ note.schemas.ts
│  │     ├─ note.service.ts
│  │     ├─ note.search.ts
│  │     └─ note.related.ts
│  ├─ lib/
│  └─ styles/
├─ tests/
│  ├─ unit/
│  └─ e2e/
├─ drizzle.config.ts
├─ package.json
└─ README.md
```

### Canonical domain model

```ts
export type NoteStatus = 'inbox' | 'digested' | 'archived';
export type NoteConfidence = 'draft' | 'tested' | 'trusted';
export type SourceType = 'manual' | 'article' | 'chat' | 'terminal' | 'doc' | 'other';

export interface KnowledgeNote {
  id: string;
  title: string;
  rawInput: string;
  summary: string | null;
  problem: string | null;
  solution: string | null;
  why: string | null;
  commands: string | null;
  references: string | null;
  stack: string | null;
  status: NoteStatus;
  confidence: NoteConfidence;
  sourceType: SourceType;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Test strategy
- Unit tests for schema validation, repository methods, search behavior, and related-note scoring.
- E2E tests for the happy path: create inbox note -> edit -> mark digested -> search -> open related note.
- Minimal regression coverage for empty states and invalid input.

### Future entity reserve (do not implement in MVP yet)
The MVP should keep room for future entities without over-modeling them now. Likely later additions include:
- `concepts`
- `relations`
- `decisions`
- `evidence`
- `projects`
- `repos`
- `files`
- `contexts`
- `recall_events`

These are reminders for schema/service extensibility, not current deliverables.
Detailed long-term modeling notes live in `docs/future-data-model.md`.

---

### Task 1: Bootstrap the application shell

**Objective:** Create a runnable Next.js application with baseline tooling and deterministic local scripts.

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `README.md`
- Create: `tests/unit/smoke.test.ts`

**Step 1: Generate the app scaffold**

Run:
```bash
mkdir -p /home/liangjiaqi/projects/devbrain
cd /home/liangjiaqi/projects/devbrain
pnpm create next-app@latest . --ts --eslint --tailwind --app --src-dir --use-pnpm --import-alias '@/*'
```

Expected: a bootable Next.js app exists in the project root.

**Step 2: Install runtime and test dependencies**

Run:
```bash
pnpm add drizzle-orm better-sqlite3 zod clsx date-fns
pnpm add -D drizzle-kit vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test
```

Expected: install completes without peer dependency errors.

**Step 3: Write a failing smoke test**

Create `tests/unit/smoke.test.ts`:
```ts
import { describe, expect, it } from 'vitest';

describe('app bootstrap', () => {
  it('defines the project name', () => {
    expect('DevBrain').toBe('DevBrain');
  });
});
```

**Step 4: Wire the scripts**

Ensure `package.json` contains:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "lint": "next lint"
  }
}
```

**Step 5: Verify the bootstrap**

Run:
```bash
pnpm test
pnpm build
```

Expected: tests pass and the app builds successfully.

**Step 6: Optional checkpoint (only on explicit request)**

If the user asks for a checkpoint commit, use a focused commit such as:
```bash
git add .
git commit -m "chore: bootstrap devbrain app shell"
```
Otherwise keep moving and let `docs/status/project-status.md` reflect the current state.

---

### Task 2: Create the database schema and migrations

**Objective:** Establish the canonical storage model for notes, tags, and note-tag relations.

**Files:**
- Create: `drizzle.config.ts`
- Create: `src/db/client.ts`
- Create: `src/db/schema.ts`
- Create: `src/db/migrations/`
- Create: `tests/unit/db-schema.test.ts`

**Step 1: Write a failing schema test**

Create `tests/unit/db-schema.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { noteStatusValues, noteConfidenceValues } from '@/features/notes/note.types';

describe('note enums', () => {
  it('supports inbox and digested states', () => {
    expect(noteStatusValues).toEqual(['inbox', 'digested', 'archived']);
    expect(noteConfidenceValues).toEqual(['draft', 'tested', 'trusted']);
  });
});
```

**Step 2: Define exact tables**

Implement `src/db/schema.ts` with:
- `notes`
- `tags`
- `note_tags`
- created/updated timestamps
- unique tag names
- indexes on `status`, `stack`, `updated_at`

Recommended schema excerpt:
```ts
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  rawInput: text('raw_input').notNull().default(''),
  summary: text('summary'),
  problem: text('problem'),
  solution: text('solution'),
  why: text('why'),
  commands: text('commands'),
  references: text('references'),
  stack: text('stack'),
  status: text('status', { enum: ['inbox', 'digested', 'archived'] }).notNull().default('inbox'),
  confidence: text('confidence', { enum: ['draft', 'tested', 'trusted'] }).notNull().default('draft'),
  sourceType: text('source_type', { enum: ['manual', 'article', 'chat', 'terminal', 'doc', 'other'] }).notNull().default('manual'),
  sourceUrl: text('source_url'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
```

**Step 3: Generate and inspect migration**

Run:
```bash
pnpm drizzle-kit generate
```

Expected: a migration file is created under `src/db/migrations/`.

**Step 4: Verify the test**

Run:
```bash
pnpm test
```

Expected: enum/schema tests pass.

**Step 5: Optional checkpoint (only on explicit request)**

If the user asks for a checkpoint commit, use a focused commit such as:
```bash
git add drizzle.config.ts src/db tests/unit/db-schema.test.ts
git commit -m "feat: define devbrain sqlite schema"
```
Otherwise keep progressing and update `docs/status/project-status.md` when the milestone lands.

---

### Task 3: Add note types, validation, and repository methods

**Objective:** Create a stable service layer so UI code never talks to raw database shapes directly.

**Files:**
- Create: `src/features/notes/note.types.ts`
- Create: `src/features/notes/note.schemas.ts`
- Create: `src/features/notes/note.service.ts`
- Create: `tests/unit/note-schemas.test.ts`
- Create: `tests/unit/note-service.test.ts`

**Step 1: Write failing validation tests**

Add tests for:
- title is required
- inbox note can be minimal
- digested note may still allow partial fields, but status must be valid
- source URL must be a valid URL when present

Example:
```ts
it('accepts a minimal inbox payload', () => {
  const result = createNoteSchema.safeParse({ title: 'pnpm peer dep fix', rawInput: 'used overrides', status: 'inbox' });
  expect(result.success).toBe(true);
});
```

**Step 2: Implement Zod schemas**

Create:
- `createNoteSchema`
- `updateNoteSchema`
- `noteFiltersSchema`

**Step 3: Implement repository methods**

Add service methods:
- `createNote`
- `getNoteById`
- `listNotes`
- `updateNote`
- `deleteNote`
- `listRecentNotes`

**Step 4: Verify unit tests**

Run:
```bash
pnpm test
```

Expected: repository and validation tests pass.

**Step 5: Optional checkpoint (only on explicit request)**

If the user asks for a checkpoint commit, use a focused commit such as:
```bash
git add src/features/notes tests/unit
git commit -m "feat: add note validation and repository layer"
```
Otherwise keep progressing and update `docs/status/project-status.md` when the milestone lands.

---

### Task 4: Build the dashboard and note list page

**Objective:** Give users a useful landing page and a searchable list before building the full edit workflow.

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/notes/page.tsx`
- Create: `src/components/note-list.tsx`
- Create: `src/components/filter-bar.tsx`
- Create: `tests/unit/list-notes.test.ts`
- Create: `tests/e2e/dashboard.spec.ts`

**Step 1: Write failing list tests**

Cover:
- notes can be sorted by `updatedAt desc`
- status filter returns only inbox or digested
- tag filter narrows results

**Step 2: Implement list query and UI**

Dashboard must show:
- total notes
- inbox count
- digested count
- recently updated notes
- quick link to create note

Notes page must show:
- search box
- status filter
- tag filter
- stack filter
- result count

**Step 3: Verify dashboard behavior**

Run:
```bash
pnpm test
pnpm test:e2e
```

Expected: the homepage and list page render correctly with seeded sample data.

**Step 4: Optional checkpoint (only on explicit request)**

If the user asks for a checkpoint commit, use a focused commit such as:
```bash
git add src/app src/components tests
git commit -m "feat: add dashboard and note listing views"
```
Otherwise keep progressing and update `docs/status/project-status.md` when the milestone lands.

---

### Task 5: Build fast capture via the new-note flow

**Objective:** Make it trivial to create an inbox note in under 30 seconds.

**Files:**
- Create: `src/app/notes/new/page.tsx`
- Create: `src/components/note-form.tsx`
- Create: `src/app/actions/create-note.ts`
- Create: `tests/unit/create-note-action.test.ts`
- Modify: `tests/e2e/dashboard.spec.ts`

**Step 1: Write the failing action test**

Cover:
- minimal inbox payload succeeds
- invalid title fails
- valid source URL is persisted when present

**Step 2: Implement the form**

Required visible fields for quick capture:
- title
- raw input
- tags
- stack
- source type
- source URL

Default values:
- `status = inbox`
- `confidence = draft`

**Step 3: Add post-submit redirect**

After successful creation, redirect to `/notes/[id]`.

**Step 4: Verify the flow**

Run:
```bash
pnpm test
pnpm test:e2e
```

Expected: user can create a note and land on the detail page.

**Step 5: Optional checkpoint (only on explicit request)**

If the user asks for a checkpoint commit, use a focused commit such as:
```bash
git add src/app/notes/new src/components src/app/actions tests
git commit -m "feat: add inbox note capture flow"
```
Otherwise keep progressing and update `docs/status/project-status.md` when the milestone lands.

---

### Task 6: Build note detail and edit/digest workflow

**Objective:** Let users turn rough inbox notes into reusable knowledge cards.

**Files:**
- Create: `src/app/notes/[id]/page.tsx`
- Create: `src/app/notes/[id]/edit/page.tsx`
- Create: `src/app/actions/update-note.ts`
- Create: `src/components/note-detail.tsx`
- Create: `tests/unit/update-note-action.test.ts`
- Create: `tests/e2e/digest-note.spec.ts`

**Step 1: Write failing tests**

Cover:
- updating summary/problem/solution/why persists correctly
- switching status from inbox to digested works
- updating confidence works

**Step 2: Implement detail page**

Detail page must display:
- title
- status badge
- confidence badge
- summary
- problem
- solution
- why
- raw input
- commands
- references
- tags / stack / source metadata

**Step 3: Implement edit page**

Edit page must support both:
- quick edit for minor correction
- full digestion for filling structured fields

**Step 4: Verify the digest flow**

Run:
```bash
pnpm test
pnpm test:e2e
```

Expected: an inbox note can be updated into a digested note from the browser.

**Step 5: Optional checkpoint (only on explicit request)**

If the user asks for a checkpoint commit, use a focused commit such as:
```bash
git add src/app/notes src/components src/app/actions tests
git commit -m "feat: add note detail and digestion workflow"
```
Otherwise keep progressing and update `docs/status/project-status.md` when the milestone lands.

---

### Task 7: Implement full-text search and filter persistence

**Objective:** Make retrieval strong enough that the product already feels useful before AI exists.

**Files:**
- Create: `src/features/notes/note.search.ts`
- Modify: `src/features/notes/note.service.ts`
- Modify: `src/app/notes/page.tsx`
- Create: `tests/unit/note-search.test.ts`
- Create: `tests/e2e/search-notes.spec.ts`

**Step 1: Write failing search tests**

Cover:
- title matches are returned
- raw input matches are returned
- problem/solution text is searchable
- filters compose with search

**Step 2: Implement SQLite FTS**

Preferred option:
- create an FTS virtual table tied to note content
- update FTS rows on create/update/delete

Fallback option if time-constrained:
- centralize multi-field `LIKE` search, but treat it as temporary and document the compromise

Example target fields for search index:
```text
title, raw_input, summary, problem, solution, why, commands, references
```

**Step 3: Persist filter state in the URL**

Query params should support:
- `q`
- `status`
- `tag`
- `stack`
- `sort`

**Step 4: Verify search quality**

Run:
```bash
pnpm test
pnpm test:e2e
```

Expected: search results are stable, filterable, and shareable by URL.

**Step 5: Optional checkpoint (only on explicit request)**

If the user asks for a checkpoint commit, use a focused commit such as:
```bash
git add src/features/notes src/app/notes tests
git commit -m "feat: add full text search and persistent filters"
```
Otherwise keep progressing and update `docs/status/project-status.md` when the milestone lands.

---

### Task 8: Add rule-based related-note recommendations

**Objective:** Provide useful recall expansion without waiting for embeddings or a graph database.

**Files:**
- Create: `src/features/notes/note.related.ts`
- Modify: `src/features/notes/note.service.ts`
- Modify: `src/app/notes/[id]/page.tsx`
- Create: `tests/unit/note-related.test.ts`

**Step 1: Write failing scoring tests**

Cover scoring contributions from:
- shared tags
- same stack
- title token overlap
- command token overlap

Example expectation:
```ts
it('ranks notes with shared tags above unrelated notes', () => {
  expect(scoreRelated(base, withSharedTag)).toBeGreaterThan(scoreRelated(base, unrelated));
});
```

**Step 2: Implement a transparent scoring function**

Recommended weighting:
- shared tag: +3 each
- same stack: +2
- title token overlap: +1 per meaningful token
- command token overlap: +1 per token
- exact self match: exclude

**Step 3: Render the related-note panel**

Detail page should show:
- note title
- why it was recommended (shared tags / same stack / similar terms)
- link to open the related note

**Step 4: Verify recommendation behavior**

Run:
```bash
pnpm test
```

Expected: recommendations are deterministic and explainable.

**Step 5: Optional checkpoint (only on explicit request)**

If the user asks for a checkpoint commit, use a focused commit such as:
```bash
git add src/features/notes src/app/notes/[id]/page.tsx tests/unit
git commit -m "feat: add rule based related note recommendations"
```
Otherwise keep progressing and update `docs/status/project-status.md` when the milestone lands.

---

### Task 9: Add empty states, deletion, and demo seed data

**Objective:** Make the product reviewable and resilient in real usage, not only in the happy path.

**Files:**
- Create: `src/db/seed.ts`
- Create: `src/app/actions/delete-note.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/app/notes/page.tsx`
- Create: `tests/e2e/empty-states.spec.ts`
- Create: `tests/e2e/delete-note.spec.ts`

**Step 1: Write failing end-to-end tests**

Cover:
- empty dashboard on first launch
- empty search result state
- deleting a note removes it from the list

**Step 2: Implement clear empty states**

Pages must show explicit UX copy for:
- no notes yet
- no inbox notes
- no search results
- deleted note not found

**Step 3: Add optional seed script**

Run:
```bash
pnpm tsx src/db/seed.ts
```

Expected: demo notes are created for manual review.

**Step 4: Verify**

Run:
```bash
pnpm test
pnpm test:e2e
pnpm build
```

Expected: the app behaves correctly in empty, demo, and deletion scenarios.

**Step 5: Optional checkpoint (only on explicit request)**

If the user asks for a checkpoint commit, use a focused commit such as:
```bash
git add src/db src/app tests
git commit -m "feat: add resilient empty states and demo seed flow"
```
Otherwise keep progressing and update `docs/status/project-status.md` when the milestone lands.

---

### Task 10: Final polish and handoff documentation

**Objective:** Leave the codebase ready for product review, further implementation, and future graph/AI expansion.

**Files:**
- Modify: `README.md`
- Modify: `docs/product-requirements.md`
- Modify: `docs/implementation-plan.md`
- Create: `tests/e2e/happy-path.spec.ts`

**Step 1: Add a final end-to-end happy path test**

Happy path:
1. create inbox note
2. search it
3. open it
4. digest it
5. open related note

**Step 2: Update README**

README must document:
- local setup
- database path
- migration command
- test commands
- product scope
- explicit non-goals

**Step 3: Run final verification**

Run:
```bash
pnpm test
pnpm test:e2e
pnpm build
```

Expected: green build and a reproducible local review flow.

**Step 4: Optional checkpoint (only on explicit request)**

If the user asks for a checkpoint commit, use a focused commit such as:
```bash
git add .
git commit -m "docs: finalize devbrain mvp handoff"
```
Otherwise keep `docs/status/project-status.md` and `docs/plan/history.md` up to date as the handoff record.

---

## Suggested implementation order summary

1. Bootstrap app shell
2. Lock schema and migrations
3. Lock service layer and validation
4. Build listing and capture
5. Build detail and digestion
6. Add search
7. Add related-note rules
8. Add resilience and polish

## Product acceptance checklist for Hermes

Before calling MVP complete, verify all of the following:
- [ ] A note can be created in inbox mode with minimal friction.
- [ ] A note can be digested into a structured knowledge card.
- [ ] Search works across core knowledge fields.
- [ ] Filtering by status/tag/stack works.
- [ ] Related-note recommendations are visible and understandable.
- [ ] Empty states are explicit, not broken or blank.
- [ ] The app runs locally with a documented setup path.
- [ ] The schema clearly leaves room for embeddings and graph edges later.

## Future-ready extension points

When MVP is stable, future work should extend — not replace — the following seams:
- `note.related.ts` -> swap/add hybrid recall, embeddings, and reranking
- new `note.graph.ts` -> explicit relation edges
- new `note.entities.ts` -> extract concept / problem / solution / procedure candidates
- new `decision.service.ts` -> store decisions, factors, evidence, and applicability
- new `context.service.ts` -> collect project / repo / file / task context
- new `repo-indexer.ts` -> git / tree-sitter / ripgrep based repository indexing
- new ingestion pipelines -> browser/chat/terminal imports
- review scheduler -> spaced repetition or proactive recall
- future desktop runtime seam -> move the same domain/service layer under a local desktop shell if needed

### Future local-first technical candidates
These are not part of MVP delivery, but the codebase should not block them:
- Tauri for a future desktop shell
- tree-sitter for code structure extraction
- git CLI or libgit2 for repository history signals
- ripgrep for fast project search
- Ollama or local model adapters for structured extraction
- sqlite-vec for later hybrid retrieval

Plan complete and saved. Ready for execution with Codex under Hermes product supervision.
