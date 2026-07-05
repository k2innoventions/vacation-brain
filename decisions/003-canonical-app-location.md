# Decision 003 — Canonical App Location

**Status:** Accepted
**Date:** 2026-07-04
**Deciders:** Founder, Engineering

---

## Context

At one point the repository contained three competing Expo app scaffolds:

1. An unmerged root-level scaffold on the `cursor/expo-rn-foundation-3bee` branch.
2. `mobile/` — an untracked Expo Router + TypeScript scaffold with a theme system and brand-consistent configuration.
3. `v2/` — a scaffold created by Claude Code as part of an engineering evaluation and comparison task, committed on the `v2-foundation-and-decisions` branch (PR #2).

Multiple app roots violate the project's core documentation principle: one concept, one name. A single canonical location must be chosen so that all future work, tooling, and documentation point at the same place.

A comparison of `v2/` and `mobile/` found them functionally near-identical, with `mobile/` a superset (theming, splash/icon branding, asset organization). `mobile/` was verified on Expo SDK 54: `tsc --noEmit` passes and `npx expo export --platform web` bundles all routes successfully.

## Decision

- **`/mobile` is the canonical Expo app root.** All future app implementation happens inside `/mobile` unless explicitly instructed otherwise by a new decision record.
- **`v2/` was an evaluation artifact** from the Claude Code comparison task. It is not the app. It remains in git history for reference but receives no further development.
- **PR #2 must not be merged as-is** while it ships `v2/` as an app root. The parts of that branch that remain wanted (the `decisions/` records and root `.gitignore`) will be preserved when the branch is reworked or replaced.
- **No duplicate app roots.** Creating a second app scaffold anywhere in the repository requires a new decision record and explicit approval first.

## Deferred (not removed)

Cleanup is intentionally split into small, reviewable steps. Still pending, each requiring its own approval:

- Deleting `v2/` from the working tree and branch.
- Reworking or closing PR #2.
- Deleting the `cursor/expo-rn-foundation-3bee` remote branch.
- Removing the empty root-level placeholder directories (`app/`, `components/`, `assets/`, `scripts/`).
- Repointing local dev tooling (e.g., preview launch configuration) at `/mobile`.

## How we'll know it worked

- Exactly one directory in the repository contains an `app.json`.
- A new engineer (or agent) reading the repo can identify the app location without asking.
- No future session recreates a scaffold because the canonical one was untracked or ambiguous.

## Revisit when

- The project adopts a monorepo layout with multiple deployables (e.g., a web app or backend service alongside mobile) — at which point naming and workspace tooling should be decided together in a new record.
