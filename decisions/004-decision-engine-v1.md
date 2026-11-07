# Decision 004 — Decision Engine v1

**Status:** Proposed (all product decisions resolved 2026-11-07, including T1, T3, T14–T17; remaining technical decisions in spec §10)
**Date:** 2026-11-07
**Deciders:** Founder, Engineering
**Related:** [001](001-v1-memory-scope.md), [002](002-memory-ownership.md), [003](003-canonical-app-location.md), [005](005-user-initiated-memory-saves.md) (accepted)
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
exactly where inference would creep in. This record shows how the two
coexist, together with ADR-005 (accepted), which amends ADR-001 for one
narrow, user-initiated save action.

## Decision

Build **Decision Engine v1**: a secure server-side reasoning service
behind a conversational planning experience for **general leisure
travel**.

### Product decisions (resolved)

1. **Dream first, plan second, decided by intent and readiness**, per
   decision (destination, dates, party, where to stay, what to do,
   pace). Constraints are not commitments. One reply can mix modes.
   **The readiness states are internal and never shown to travelers.**
2. **General leisure travel.** Nothing in the engine is Disney-specific.
3. **Exploring is not committing.** Trip facts are understood
   conversationally and never re-asked. Ideas the traveler is
   considering are kept without interruption. **Only an explicit
   commitment is a decision.** Enthusiasm or casual agreement ("love
   it!", "sounds great") is never turned into a saved commitment.
   Confirmation is lightweight: an inline acknowledgement with undo, or
   one ignorable tap option. There are no repeated "save this?" prompts.
4. **Three separate layers of context:** conversation context, trip
   state, and Family Memory.
5. **Explore without signing in.** Anonymous explorations persist on the
   device across restarts, with a clear delete option. Sign-up offers to
   transfer the exploration into the account.
6. **Family Memory is account-only (T3).** Anonymous travelers have
   conversation and trip context, but no Family Memory. Family Memory is
   explicitly authored after sign-up. Transfer never creates Family
   Memory.
7. **What's shared in a trip stays in that trip (T14).** It stays there
   unless the traveler explicitly chooses "Save for future trips."
   Saving is obvious, easy, and delightful, through a visible,
   easy-to-discover action on eligible trip details plus an
   easy-to-reach Family Memory area. It is never automatic, never
   suggested by the AI, never repeated, and never interrupts. Governed by
   **ADR-005 (accepted)**.
8. **OpenAI, server-side,** with configurable model selection.
9. **Research architecture now, live research incrementally,** with
   claim-level verification: relevance, freshness, reliability, and
   stated uncertainty. Every claim is an inspiration, an estimate, or a
   verified fact.
10. **Privacy explained, sharing minimized,** under three distinct
    policies: what's **collected**, what's **retained** (locally or in
    the account), and what's **transmitted** to OpenAI or research
    providers.
    - **Names (T15):** traveler names and nicknames are **never
      intentionally sent to external AI providers in v1**. Code replaces
      them with role references, using a trip-scoped mapping from the
      trip's own party description. **No permanent family-member
      records** are created for this. A best-effort privacy check also
      looks for other identifying details in free text. Its limits are
      documented: it can miss things.
    - **Health (T16):** data minimization with **decision-level
      relevance**. Health-related memories and trip details are sent
      only when relevant to a decision in play. A food allergy counts
      for restaurant planning even if the latest message doesn't
      mention it. Health information is never sent wholesale on every
      turn. The original user-authored text stays private and editable.
      Trip health details are **never promoted automatically** to
      Family Memory.
11. **Account conversations are retained until the user deletes them.**
12. **Budget comes up naturally,** never as the first question.
13. **One meaningful question at a time.**
14. **No internal engineering terms in the UI.**

### Storage decision (T1, resolved)

- Anonymous explorations use **`@react-native-async-storage/async-storage`**
  behind a storage abstraction, on iOS, Android, and web.
- Stored documents are **versioned**, and large conversations are
  **chunked** to stay within platform limits.
- Exploration data is **excluded from Android backups**.
- **No application-level encryption** for ordinary trip-planning
  information in v1. Residual risks are documented in the spec (§3.6):
  iOS backups, web shared devices, and readable browser storage.
- **T17, iOS backups:** the residual risk is **accepted for prototype
  development only**. This is **not production approval.** A specific
  **privacy and backup review is a launch gate** before any public
  release (spec §14).
- Clear deletion controls, plus a **shared-device notice on web**.
- The package is approved but **not yet installed**. It is installed in
  M1.

### Architectural decisions

- **Deterministic shell, model in the middle.** Code assembles context,
  tracks readiness, applies commitment rules, verifies claims,
  pseudonymizes names, validates output, and persists results.
- **Two storage modes:** on-device (anonymous) and Supabase Postgres
  with RLS (account).
- **The traveler decides.** The engine suggests. It never books.

### Naming

"Decision Engine" is the internal name of the reasoning layer. It
contains no memory lifecycle (ADR-001's "No Engine" for memory still
holds), and the word never appears in the UI.

## Reconciliation with ADR-001

ADR-001 stays in force, **as amended by ADR-005** (guardrail 3: three
user-initiated write paths; no AI memory suggestions). The engine is a
**reader** of Family Memory, never a writer.

### The three layers

| Layer | What it holds | Scope | Who writes it | Anonymous? | Lifetime |
| --- | --- | --- | --- | --- | --- |
| **Conversation context** | What was said in one planning conversation | One conversation | Traveler and engine, as messages | Yes, on device | Until deleted |
| **Trip state** | Trip facts (considering or decided) and trip details (the group's preferences, needs, and traditions in the traveler's words) | One trip | Engine records details and considering facts; decided facts only on explicit commitment | Yes, on device | Until the trip is deleted |
| **Family Memory** | Durable statements authored by the traveler | Account (ADR-002) | **Only the traveler**, through the three write paths (ADR-001 as amended by ADR-005) | **No** | Until edited or deleted |

### Rules

| ADR-001 rule | How the engine complies |
| --- | --- |
| Limited write paths | The engine has **no write access** to memory (read-only server role, tested). "Save for future trips" is a traveler action handled by the app, not the engine (ADR-005). |
| The app never suggests a memory | The AI never proposes memories, never offers to remember, and never selects what's worth saving. The validator rejects such language. Save actions appear by a fixed rule on every eligible detail (ADR-005), never chosen by the AI. |
| Chat never writes to memory | Conversation goes to conversation storage. Trip details go to trip state. |
| No inference | Signals are logged append-only. Nothing reads them to shape advice in v1. |
| No hidden profile | The engine sees only what the traveler can see. No hidden summaries, embeddings, or cross-trip profiles. |
| Deleted means gone | Deletes remove data from all future model inputs. |

### Why understanding trip details is not inference

The Memory v1 spec classifies party, dates, and reservations as **trip
context, not memory**. "My son loves waterslides" is recorded as a
**trip detail** of this trip, in the traveler's words. It's used for
this trip only and never shapes another trip. It reaches Family Memory
only if the traveler taps "Save for future trips" and approves the text
(ADR-005).

## Deferred (not removed)

- Moving the morning briefing onto the engine
- In-trip real-time suggestions
- Bookings, inventory prices, affiliate links
- Learning from behavior or suggesting memories (requires superseding ADR-001)
- Multi-destination routing
- Shared trips across accounts (ADR-002)
- Application-level encryption of local data (revisit if local data grows more sensitive)

## How we'll know it worked

- Testers never feel interrupted by save prompts, and never find a
  decision or a memory recorded that they didn't make.
- Families save useful preferences for future trips without being asked.
- Replies feel inspiring where the traveler is open and practical where
  they're ready.
- Spot audits find no verified label on an unsupported claim.
- Zero memory writes from engine code paths. No anonymous Family Memory.
- No names or nicknames in model inputs or research queries.
- Anonymous explorations survive restarts. Transfer loses nothing and
  duplicates nothing.

## Revisit when

- We want the engine to learn across trips or suggest memories
  (supersede ADR-001).
- The best-effort identifying-detail check proves too unreliable for
  the privacy promise (T15).
- Public launch approaches: run the privacy and backup review (T17).
- Local data starts holding information that warrants encryption.
- Claim verification cost or latency makes the staged rollout
  impractical.
- In-trip use becomes the main surface.
- Server code needs to share code with `mobile/` (ADR-003 record).
