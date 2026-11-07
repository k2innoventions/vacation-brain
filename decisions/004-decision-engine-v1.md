# Decision 004 — Decision Engine v1

**Status:** Proposed (product decisions resolved 2026-11-07; technical decisions open — see spec §10)
**Date:** 2026-11-07
**Deciders:** Founder, Engineering
**Related:** [001](001-v1-memory-scope.md), [002](002-memory-ownership.md), [003](003-canonical-app-location.md)
**Specification:** [docs/product/04-decision-engine-v1-spec.md](../docs/product/04-decision-engine-v1-spec.md)

---

## Context

The prototype in `mobile/` proves the tone and the memory loop, but its
briefing is keyword-matched against fixture data. It can't help a
family dream up or plan a trip. It can't hold a trip whose dates or
destination aren't decided yet. And it loses everything on reload.

The technical blueprint defines a **Reasoning Engine** layer (layer 4).
The Decision Framework (`intelligence/01-decision-framework.md`) defines
how that layer should judge. Neither is implemented yet.

The next product step is the start of the journey: **Dreaming →
Planning**. A family should be able to say "Spring Break, no idea
where" and be inspired, or "Gatlinburg over the holidays with Grandma"
and get calm, practical help.

ADR-001 forbids automatic memory inference. A conversational planner is
exactly where inference would creep in. This record has to show how the
two coexist.

## Decision

Build **Decision Engine v1**: a secure server-side reasoning service
behind a conversational planning experience for **general leisure
travel**.

### Product decisions (resolved)

1. **Dream first, plan second.** The engine inspires and explores
   before narrowing options. When the traveler already gives practical
   constraints (a destination, dates, a party), it skips ahead and
   plans.
2. **General leisure travel.** Nothing in the engine is Disney-specific.
   Destination knowledge comes from research and labeled general
   knowledge, not hardcoded fixtures.
3. **Trip facts are understood conversationally.** The engine picks up
   facts from natural conversation and never re-asks for something
   already provided. Consequential changes to the saved trip are
   confirmed before they're saved.
4. **Three separate layers of context:**
   **conversation context**, **trip state**, and **explicit long-term
   memory** (Family Memory). They are stored, scoped, and governed
   separately. ADR-001 applies in full to memory.
5. **Explore without signing in.** Anonymous explorations persist
   locally on the device across app restarts, with a clear delete
   option. When the traveler signs up, the app offers to transfer the
   exploration into the account.
6. **OpenAI, server-side.** Model calls go through a secure server-side
   integration with configurable model selection. Keys never ship in
   the app, and the app never calls the provider directly.
7. **Research architecture now, live research incrementally.** The
   research interface and the source records are designed from the
   start. Live research is switched on in stages. Every claim the
   traveler sees is clearly an **inspiration**, an **estimate**, or a
   **verified fact**.
8. **Privacy explained, sharing minimized.** The traveler is told
   plainly what is shared and why. Only the personal and family
   information needed for the current turn is sent to the model, and
   none of it goes into research queries.
9. **Account conversations are retained until the user deletes them**,
   under documented privacy safeguards.
10. **Budget comes up naturally** when it's relevant, never
    automatically as the first question.
11. **One meaningful question at a time.**
12. **No internal engineering terms in the UI.** For example: engine,
    trip state, memory store, evidence, confidence, category, prompt.

### Architectural decisions

- **Deterministic shell, model in the middle.** Code assembles context,
  works out what's known and what's missing, validates output, and
  persists results. The model drafts the reply and the suggestions.
  Guardrails are code, not prompt wishes.
- **Two storage modes.** Anonymous explorations live on the device.
  Account data lives in Supabase Postgres with row-level security,
  scoped to the account (ADR-002).
- **The traveler decides.** The engine suggests. It never books and
  never acts on the traveler's behalf.

### Naming

ADR-001 says "No 'Engine'" for **memory**. That stays true. "Decision
Engine" is the internal name of the reasoning layer only. It contains no
memory lifecycle, and the word does not appear in the UI.

## Reconciliation with ADR-001

ADR-001 stays in force unchanged. It is not superseded. The engine is a
**reader** of Family Memory, never a writer.

### The three layers

| Layer | What it holds | Scope | Who writes it | Lifetime |
| --- | --- | --- | --- | --- |
| **Conversation context** | What was said in one planning conversation | One conversation | The traveler and the engine, as messages | Anonymous: until deleted on the device. Account: until the user deletes it |
| **Trip state** | Saved facts about one trip: destination, dates, party, goals | One trip | The traveler directly, or the engine with confirmation for consequential changes | Until the trip is deleted |
| **Family Memory** | Durable, user-authored statements | The account (ADR-002) | **Only the traveler**, through ADR-001's two write paths | Until the user edits or deletes it |

### Rules

| ADR-001 rule | How the engine complies |
| --- | --- |
| Two write paths only | The engine has **no write access** to memory. The server role has read-only access to that table, and a test asserts it. |
| The app never suggests a memory | The engine never offers to remember something and never drafts memory text. Its output format has no field for memory, and the validator rejects "I'll remember that"-style language. |
| Chat never writes to memory | Conversation writes go to conversation storage only. Trip facts go to trip state, never to memory. |
| No inference | Accept/dismiss signals are logged as append-only events. Nothing reads them to shape advice in v1. |
| No hidden profile | The engine sees only what the traveler can see: Family Memory, the trip, the conversation, and stored sources. **No hidden summaries, embeddings, or cross-trip profiles.** Each generation stores a snapshot of exactly what the model saw. |
| Deleted means gone | Deleting a memory, conversation, or exploration removes it from all future model inputs. |

### Why understanding trip facts is not inference

The Memory v1 spec already classifies party, dates, and reservations as
**trip context, not memory**. Understanding "Grandma's coming" inside a
trip's own conversation, and saving it to that trip (with confirmation
when consequential), is planning, not learning. These facts:

- stay inside the trip they belong to;
- are never promoted into Family Memory automatically;
- never shape a different trip, unless the traveler saves something
  through one of ADR-001's two write paths.

**Account transfer** moves an anonymous exploration's conversation and
trip into the account **as conversation and trip data**. Nothing said
in the conversation becomes Family Memory during transfer.

Any future feature that learns across trips or suggests memories
requires a new ADR superseding 001.

## Deferred (not removed)

- Moving the morning briefing onto the engine (later milestone)
- In-trip real-time suggestions (location, wait times, live weather)
- Bookings, inventory prices, affiliate links
- Learning from accepted or dismissed suggestions (requires superseding ADR-001)
- Multi-destination routing
- Shared trips across accounts (ADR-002)

## How we'll know it worked

- In both acceptance scenarios, testers can tell which statements are
  inspiration, estimates, or verified facts, and can trace every
  suggestion to something they said, a saved trip fact, a Family
  Memory, or a cited source.
- Zero memory writes from engine code paths, verified by a database
  role test and an audit of events.
- Anonymous explorations survive app restarts. Transfer into an account
  loses nothing and duplicates nothing.
- Testers are never asked for something they already said.
- Qualitative: the planner feels inspiring when dreaming, practical when
  planning, and never "remembers" something the traveler didn't choose
  to save.

## Revisit when

- We want the engine to learn across trips or suggest memories
  (supersede ADR-001 first).
- Live research cost, latency, or reliability makes the staged rollout
  impractical.
- In-trip use becomes the main surface.
- Server code needs to share code with `mobile/`. ADR-003 requires a
  new record for monorepo or workspace layout.
