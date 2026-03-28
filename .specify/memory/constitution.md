<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0 (minor: added Principle X, expanded VI/III/VIII)
- Modified principles:
  - II. Server-First React Router — added client-only exception for progressive enhancement
  - III. Clean Prisma/PostgreSQL Data Modeling — added join table/event log exception for timestamps, softened raw SQL to SHOULD with performance justification
  - IV. Responsive & Polished UI — allowed rare escape hatches from Tailwind-only
  - V. Small Diffs — allowed coupled refactor when strictly necessary for the feature
  - VI. Clear Service Boundaries — added third-party API adapter requirement
  - VIII. Phased Delivery — added end-to-end slice allowance for small features
- Added principles:
  - X. Configuration & Secrets Discipline
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ no updates needed
  - .specify/templates/spec-template.md — ✅ no updates needed
  - .specify/templates/tasks-template.md — ✅ no updates needed
  - .specify/templates/commands/*.md — ✅ no command files exist yet
- Follow-up TODOs: none
-->

# Reprise Constitution

## Core Principles

### I. Strong TypeScript Safety

All application code MUST be written in TypeScript with `strict` mode enabled.
Explicit typing is required for function signatures, component props, and
service boundaries. The `any` type is prohibited except in narrowly scoped
interoperability or type-narrowing utility code with an explanatory comment.
Prisma-generated types and React Router's built-in type inference MUST be
used rather than hand-rolled duplicates. The `typecheck` script MUST pass
with zero errors before any PR is merged.

**Rationale**: Type safety catches integration bugs at compile time and
serves as living documentation of data shapes across the full stack.

### II. Server-First React Router

Data fetching and mutation MUST use React Router loaders and actions as the
primary mechanism whenever the data can be loaded or mutated on the server.
Client-side `useEffect` fetch patterns SHOULD be avoided for route-critical
data and used only when progressive enhancement or explicitly client-only
behavior is required (e.g., WebSockets, `window`-dependent logic, analytics).
Route modules MUST co-locate `loader` and/or `action` functions with the
component. Form submissions MUST prefer React Router's `<Form>` component
or `useSubmit`/`useFetcher` hooks over manual `fetch` calls. Optimistic UI
is permitted only after the server-first path is working and tested.

**Rationale**: Server-first patterns reduce client/server sync bugs, improve
initial page load, and keep route modules self-contained.

### III. Clean Prisma/PostgreSQL Data Modeling

The database schema MUST be defined through Prisma schema files and managed
via Prisma Migrate. Persistent domain models MUST include explicit `id`,
`createdAt`, and `updatedAt` fields unless the table is a narrow join table,
event log, or other justified exception documented in the schema with a
comment. Relations MUST use Prisma's relation syntax with explicit foreign
keys. Raw SQL SHOULD be avoided unless Prisma Client cannot express the
query or a measurable performance issue justifies it; such exceptions MUST
include a comment explaining why. Migration files MUST NOT be manually
edited after generation without code review approval.

**Rationale**: A single source of truth for the schema prevents drift
between the database and application types while allowing practical
exceptions.

### IV. Responsive & Polished UI

All user-facing pages MUST be usable on viewports from 375px (mobile) to
1440px+ (desktop). Tailwind CSS is the primary styling mechanism. Inline
styles, custom CSS, or other styling approaches SHOULD be rare and used
only when Tailwind or the component library cannot reasonably express the
need. shadcn/ui and Radix primitives MUST be used for interactive
components (dialogs, dropdowns, popovers, sheets) rather than custom
implementations. Visual consistency MUST be maintained through the
project's design tokens (colors, spacing, typography via Inter font).
Animations MUST respect `prefers-reduced-motion`.

**Rationale**: A polished, responsive UI builds user trust and reduces
maintenance cost by leveraging a shared component system.

### V. Small Diffs

Each pull request SHOULD target fewer than 400 lines of meaningful code
changes, excluding generated files and lock files. When a feature exceeds
this threshold, it MUST be decomposed into stacked PRs or sequential
increments. Each PR MUST be independently reviewable, buildable, and
MUST NOT leave the application in a broken state on `main`. Refactoring
and feature work MUST NOT be combined in the same PR unless the refactor
is strictly necessary to deliver the feature, in which case the PR
description MUST explain the coupling.

**Rationale**: Small diffs reduce review fatigue, minimize merge conflicts,
and make bisecting regressions straightforward.

### VI. Clear Service Boundaries

Business logic MUST reside in service modules (`app/services/`) separate
from route handlers and UI components. Route loaders/actions orchestrate
services but MUST NOT contain domain logic directly. Services MUST NOT
import from route modules or UI components. Database access (Prisma Client
calls) MUST be confined to service modules or dedicated data-access
helpers — never in loaders, actions, or components directly.

All third-party API integrations MUST be isolated behind service adapters.
External response shapes MUST be mapped into internal application types
before they reach route modules or UI components.

**Rationale**: Separating concerns makes business logic independently
testable and prevents tight coupling between external APIs, persistence,
and the UI.

### VII. Testing Discipline

Every service module MUST have unit tests covering its public API. Loader
and action functions MUST have integration tests that exercise the full
request/response cycle. Tests MUST NOT mock the database when an in-memory
or test-container PostgreSQL instance is feasible. Test files MUST be
co-located with the module they test or in a parallel `tests/` directory
mirroring the source tree. CI MUST run the full test suite and typecheck
before a PR can merge.

**Rationale**: Tests that hit real infrastructure catch the bugs that
mocks hide; co-location keeps tests discoverable.

### VIII. Phased Delivery

Features MUST be delivered incrementally. Preferred order is:
(1) data model and migrations,
(2) service logic with tests,
(3) route loaders/actions,
(4) UI components and pages.
Each phase MUST be a separate PR (or a clearly scoped commit within a
stacked PR series) that can be reviewed and merged independently. Small
end-to-end slices MAY combine adjacent phases when doing so keeps the
work simpler and more reviewable, but the PR description MUST note which
phases are combined and why.

**Rationale**: Phased delivery reduces risk per deploy and surfaces design
issues early in the stack.

### IX. MVP Scope Guard

AI features, MCP (Model Context Protocol) integrations, and any
machine-learning-powered functionality MUST NOT be included in MVP
milestones unless the feature specification explicitly scopes them with
acceptance criteria and a dedicated user story. Speculative or exploratory
AI/MCP work MUST be tracked separately and MUST NOT block MVP delivery.
If a spec mentions AI/MCP without acceptance criteria, it MUST be flagged
as out of scope during the `/speckit.plan` constitution check.

**Rationale**: Premature AI integration adds unpredictable complexity and
delays core product delivery.

### X. Configuration & Secrets Discipline

Secrets MUST be stored in environment variables or approved
secret-management systems and MUST NOT be committed to source control.
Configuration required for local development MUST be documented in
`.env.example` or equivalent project documentation. New configuration
values MUST be introduced deliberately with clear naming and documented
in the PR that adds them.

**Rationale**: Clear configuration discipline prevents credential leaks
and reduces setup confusion across environments.

## Technology Constraints

- **Runtime**: Node.js with React Router v7 (framework mode)
- **Language**: TypeScript 5.x, `strict: true`
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS v4, shadcn/ui, Radix primitives
- **Package Manager**: Yarn 4 (Berry)
- **Build**: Vite 7
- **Deployment**: `react-router-serve` (Node server) — SSR by default
- **Font**: Inter (via `@fontsource-variable/inter`)

New runtime dependencies MUST be justified in the PR description. Prefer
platform APIs and existing dependencies over adding new packages.

## Development Workflow

1. **Branch from `main`**: Feature branches follow `feature/<name>` or
   `<issue-number>-<short-description>` naming.
2. **Typecheck before commit**: `yarn typecheck` MUST pass locally.
3. **One concern per PR**: Bug fixes, refactors, and features are separate
   PRs.
4. **PR description required**: Every PR MUST include a summary, test plan,
   and link to the relevant spec or issue.
5. **No force-push to `main`**: History on `main` MUST remain linear and
   intact.
6. **Commit messages**: Use conventional commits (`feat:`, `fix:`,
   `refactor:`, `docs:`, `test:`, `chore:`).

## Governance

This constitution is the highest-authority document for architectural and
process decisions in the Reprise project. All specifications, plans, task
lists, and implementation work MUST comply with these principles.

### How Principles Guide Artifacts

- **Specs** (`/speckit.specify`): User stories MUST NOT include AI/MCP
  functionality unless explicitly scoped (Principle IX). Requirements MUST
  reference Prisma models by name where applicable (Principle III).
- **Plans** (`/speckit.plan`): The Constitution Check section MUST verify
  compliance with all ten principles before research begins. Plans MUST
  use the phased delivery structure (Principle VIII) and identify service
  boundaries (Principle VI).
- **Tasks** (`/speckit.tasks`): Task decomposition MUST respect the small
  diff principle (Principle V). Each task MUST map to a single concern and
  a single PR where feasible.
- **Implementation** (`/speckit.implement`): Code MUST pass typecheck
  (Principle I), use server-first patterns (Principle II), and include
  tests (Principle VII) before a task is marked complete. Secrets MUST
  follow configuration discipline (Principle X).

### Amendment Procedure

1. Propose the change in a PR modifying this file.
2. Describe the principle being added, changed, or removed, with rationale.
3. Increment the version per semantic versioning:
   - **MAJOR**: Principle removed or redefined incompatibly.
   - **MINOR**: New principle added or existing principle materially expanded.
   - **PATCH**: Wording clarification or typo fix.
4. Update `LAST_AMENDED_DATE` to the merge date.
5. Run the consistency propagation checklist (see `/speckit.constitution`
   command) to verify templates remain aligned.

### Compliance Review

Every PR review MUST include a check against the applicable principles.
When a principle is intentionally violated, the PR description MUST
document the violation, the justification, and a plan to resolve it.

**Version**: 1.1.0 | **Ratified**: 2026-03-26 | **Last Amended**: 2026-03-26
