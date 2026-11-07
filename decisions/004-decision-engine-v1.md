# Decision 004 — Decision Engine v1

**Status:** Proposed (product decisions resolved 2026-11-07; revised after PR #6 review; technical decisions open — see spec §10)
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
and get help that's practical where they're ready and inspiring where
they're not.

ADR-001 forbids automatic memory inference. A conversational planner is
exactly where inference would creep in. This record has to show how the
two coexist.

## Decision

Build **Decision Engine v1**: a secure server-side reasoning service
behind a conversational planning experience for **general leisure
travel**.

### Product decisions (resolved)

1. **Dream first, plan second, decided by intent and readiness.**
   Whether the engine inspires or narrows depends on what the traveler
   is asking for and how ready they are to decide, **per decision**
   (destination, dates, lodging, activities…). Merely mentioning a
   constraint doesn't make someone ready to decide. One conversation,
   and even one reply, can **mix modes**: practical about dates that
   are nearly settled, inspiring about activities that are wide open.
2. **General leisure travel.** Nothing in the engine is Disney-specific.
3. **Exploring is not committing.** Trip facts are understood
   conversationally and never re-asked. Ideas the traveler is
   *considering* are kept without interruption. Only a **commitment**
   (the traveler deciding) changes a decided trip fact, and the
   confirmation for that is lightweight: an inline acknowledgement with
   undo, or a single tappable option the traveler can ignore. There are
   no repeated "save this?" prompts.
4. **Three separate layers of context:** conversation context, trip
   state, and Family Memory. They are stored, scoped, and governed
   separately. ADR-001 applies in full.
5. **Explore without signing in.** Anonymous explorations persist
   locally on the device across app restarts, with a clear delete
   option. Sign-up offers to transfer the exploration into the account.
6. **Family Memory is account-only (resolves T3).** Anonymous travelers
   have conversation context and trip state, but **no persistent Family
   Memory**. Family Memory belongs to the account (ADR-002) and is
   **explicitly authored after sign-up**, through ADR-001's two write
   paths. Transfer never creates Family Memory.
7. **OpenAI, server-side,** with configurable model selection. Keys
   never ship in the app.
8. **Research architecture now, live research incrementally.** Every
   claim the traveler sees is an **inspiration**, an **estimate**, or a
   **verified fact**. Source attribution alone is not verification.
   A claim is verified only when a source **supports that specific
   claim**, is **fresh** for the trip's dates, is **reliable** enough
   for the kind of claim, and any conflict or gap is stated as
   uncertainty.
9. **Privacy explained, sharing minimized.** Only what the current turn
   needs is sent to the model. No personal or family details go into
   research queries.
10. **Account conversations are retained until the user deletes them**,
    under documented safeguards.
11. **Budget comes up naturally** when relevant, never automatically as
    the first question.
12. **One meaningful question at a time.**
13. **No internal engineering terms in the UI.**

### Architectural decisions

- **Deterministic shell, model in the middle.** Code assembles context,
  tracks decision readiness, validates output, verifies claims, and
  persists results. The model drafts replies and suggestions, and
  reports what it read of the traveler's intent. Guardrails are code.
- **Two storage modes.** Anonymous explorations live on the device
  (mechanism: T1). Account data lives in Supabase Postgres with RLS,
  scoped to the account.
- **The traveler decides.** The engine suggests. It never books and
  never acts on the traveler's behalf.

### Naming

ADR-001 says "No 'Engine'" for **memory**. That stays true. "Decision
Engine" is the internal name of the reasoning layer only. It contains no
memory lifecycle, and the word never appears in the UI.

## Reconciliation with ADR-001

ADR-001 stays in force unchanged. It is not superseded. The engine is a
**reader** of Family Memory, never a writer.

### The three layers

| Layer | What it holds | Scope | Who writes it | Anonymous? | Lifetime |
| --- | --- | --- | --- | --- | --- |
| **Conversation context** | What was said in one planning conversation | One conversation | Traveler and engine, as messages | Yes, on the device | Until deleted |
| **Trip state** | Facts about one trip, each *considering* or *decided* | One trip | *Considering:* recorded by the engine as the traveler explores. *Decided:* only on the traveler's commitment | Yes, on the device | Until the trip is deleted |
| **Family Memory** | Durable, user-authored statements | The account (ADR-002) | **Only the traveler**, through ADR-001's two write paths | **No** | Until the user edits or deletes it |

### Rules

| ADR-001 rule | How the engine complies |
| --- | --- |
| Two write paths only | The engine has **no write access** to memory. The server role has read-only access to that table, and a test asserts it. |
| The app never suggests a memory | The engine never offers to remember something and never drafts memory text. Its output has no field for memory, and the validator rejects "I'll remember that"-style language. Inviting an anonymous traveler to sign up is allowed, but the invitation never proposes specific memory content. |
| Chat never writes to memory | Conversation writes go to conversation storage. Trip facts go to trip state. |
| No inference | Accept/dismiss and commit/undo signals are logged as append-only events. Nothing reads them to shape advice in v1. |
| No hidden profile | The engine sees only what the traveler can see. No hidden summaries, embeddings, or cross-trip profiles. Each generation stores a snapshot of exactly what the model saw (account mode). |
| Deleted means gone | Deleting a memory, conversation, or exploration removes it from all future model inputs. |

### Why understanding trip facts is not inference

The Memory v1 spec classifies party, dates, and reservations as **trip
context, not memory**. Recording that a family is *considering* Dec
27–31, or *decided* on Gatlinburg, inside that trip is planning, not
learning. Trip facts stay inside their trip, are never promoted into
Family Memory, and never shape another trip.

**Transfer** moves an anonymous exploration's conversation and trip
into the account, **as conversation and trip data only**. After
sign-up, Family Memory starts empty and is filled only by the traveler.

Any future feature that learns across trips or suggests memories
requires a new ADR superseding 001.

## Deferred (not removed)

- Moving the morning briefing onto the engine (later milestone)
- In-trip real-time suggestions
- Bookings, inventory prices, affiliate links
- Learning from accepted or dismissed suggestions (requires superseding ADR-001)
- Multi-destination routing
- Shared trips across accounts (ADR-002)

## How we'll know it worked

- Testers never feel interrupted by save prompts, and never find a
  decision recorded that they didn't make.
- Replies feel inspiring where the traveler is open and practical where
  they're ready, including within the same reply.
- Every claim shown as verified is supported by the cited source for
  that exact claim, current for the trip's dates, and from an
  appropriate publisher. Spot audits find no "verified" label on an
  unsupported claim.
- Zero memory writes from engine code paths. No anonymous Family Memory.
- Anonymous explorations survive app restarts. Transfer loses nothing
  and duplicates nothing.
- Testers are never asked for something they already said.

## Revisit when

- We want the engine to learn across trips or suggest memories
  (supersede ADR-001 first).
- Claim verification cost or latency makes the staged rollout
  impractical.
- Anonymous travelers strongly want lasting preferences before signing
  up (revisit decision 6 with a privacy review).
- In-trip use becomes the main surface.
- Server code needs to share code with `mobile/` (ADR-003 record).
