# Decisions

This directory contains decision records — choices with real consequences, written down so they cannot drift or be re-litigated by accident.

Each record captures:

- **Context** — why a decision was needed
- **Decision** — what was chosen
- **Deferred** — what was consciously postponed (not removed)
- **How we'll know it worked** — the validation signal
- **Revisit when** — the conditions that should reopen it

Records are numbered in order (`001-`, `002-`, ...) and never deleted. A superseded decision is marked `Status: Superseded by 00X` and left in place — history is part of the record.

If implementation and a decision record disagree, stop and resolve it explicitly. Neither should be changed casually.

## Index

- [001 — V1 Memory Scope](001-v1-memory-scope.md): explicit, user-controlled memory in v1; inference deferred *(guardrail 3 amended by 005)*
- [002 — Memory Ownership in V1](002-memory-ownership.md): memories belong to the account; traveler-level ownership deferred
- [003 — Canonical App Location](003-canonical-app-location.md): `/mobile` is the canonical Expo app root; `v2/` was an evaluation artifact
- [004 — Decision Engine v1](004-decision-engine-v1.md) *(accepted)*: dream-first planning for general leisure travel, by intent and readiness; only explicit commitments are decisions; claim-level verification; on-device anonymous storage; Family Memory is account-only and never written by the engine
- [005 — User-Initiated Saves to Family Memory](005-user-initiated-memory-saves.md) *(accepted; amends 001)*: a deterministic, user-controlled "Save for future trips" action on trip details; AI memory suggestions remain prohibited
