# Decision 001 — V1 Memory Scope

**Status:** Accepted
**Date:** 2026-07-04
**Deciders:** Founder, Engineering

---

## Context

The Memory Model and Memory Engine documents (`intelligence/02-memory-model.md`, `intelligence/02-memory-engine.md`) describe a full memory lifecycle: observation, evaluation, confidence scoring, strengthening, decay, ritual detection, and conflict resolution.

That system depends on behavioral data accumulated across multiple trips. A family takes one or two trips per year, so inference-based memory cannot be validated within the first year of the product — let alone within a 90-day MVP window.

At the same time, memory is not optional. The product promise depends on the app feeling like it understands the family. Without memory, Vacation Brain is a briefing app with a nice tone, and the identity of the product is lost.

The resolution: v1 memory is **context persistence, not inference**.

## Decision

V1 ships explicit, transparent, user-controlled memory:

- Store what the user directly tells us ("Our youngest hates loud rides," "Grandma needs afternoon breaks").
- Show every memory back to the user in a single visible list.
- Let the user edit or delete any memory at any time.
- Use memories to improve the briefing, recommendations, and chat.
- Support "remember this" moments captured during the trip, reflected in the next day's briefing.

Implementation guardrails:

1. **No "Engine."** V1 is a memories table, a CRUD screen, and prompt injection. No lifecycle stages. The product name is "Family Memory"; the codebase name is "memory store." The engine is what we earn later.
2. **Schema built for the future.** Every memory record carries the metadata fields from the Memory Model (type, source, created date, associated trip, etc.) even though v1 logic ignores most of them. In v1, `source` is always `explicit`. The eventual inference engine writes into this same table — no migration.
3. **Two write paths only.** The user taps "remember this" or edits the family memory screen. The app never *suggests* a memory in v1 — that is inference's front door.
4. **Capped and visible.** Roughly 20–30 short memories, shown as a scrollable list. "Do not remember everything — remember what matters" is enforced by design, not by algorithm.

## Deferred (not removed)

- Behavioral inference and observation evaluation
- Confidence scoring and reinforcement
- Memory decay and forgetting
- Ritual detection and promotion
- Conflict resolution
- The memory relationship graph

Event logging starts on day one (append-only, unprocessed) so the future engine has raw material. Deferring the engine does not mean throwing away the fuel.

## How we'll know it worked

Validated within a single trip, per beta family:

- **Adoption:** % of families who add at least one memory unprompted.
- **Trust:** corrections made — a user who corrects the app believes the memory matters.
- **The loop:** "remember this" used on day N visibly improves the briefing on day N+1.
- Qualitative: do users understand what is stored and why recommendations reference it?

## Guiding line

> Ship the briefing. Store what they tell you. Log everything. Earn the right to infer.
