# Decision Engine v1 — Implementation Specification

**Version:** 0.2 (product decisions resolved; technical decisions open)
**Status:** Proposed
**Governing decisions:** [ADR-004](../../decisions/004-decision-engine-v1.md) (proposed), [ADR-001](../../decisions/001-v1-memory-scope.md), [ADR-002](../../decisions/002-memory-ownership.md), [ADR-003](../../decisions/003-canonical-app-location.md)
**Implements:** blueprint layer 4 (Reasoning Engine), `intelligence/01-decision-framework.md`
**Acceptance scenarios:** `scenarios/decision-engine/`

---

## Framing

The Decision Engine answers one question, from the Thinking Model:

> What is the best next decision for this traveler right now?

In v1, "right now" means **before the trip**. Sometimes the best next
step is a spark ("what about the Outer Banks before the crowds?").
Sometimes it's practical ("arrive the 27th and you'll miss the New
Year's rush"). The engine knows the difference.

It is not an itinerary generator, a booking tool, or a general chatbot.
A good session ends with the traveler **more excited and less
burdened**: fewer open questions and one clear next step.

"Decision Engine" is an internal name. **No internal engineering terms
appear in the UI** (§7).

---

## 1. Conversation behavior

### 1.1 Dream first, plan second

The engine works in two modes, chosen in code from what's known (§3.2):

| Mode | When | What the engine does |
| --- | --- | --- |
| **Dreaming** | No practical constraints yet (no destination, no dates, no party) | Inspires. Offers a few contrasting ideas, each with a short "why this could be wonderful for you." Explores what the traveler is drawn to. Does not narrow prematurely. |
| **Planning** | The traveler has given practical constraints: a destination, dates or a window, a party, a drive limit, a budget | Narrows. Recommends with reasons, flags tradeoffs, proposes saving consequential trip changes. |

- A single message can move straight to Planning ("Gatlinburg, Dec
  26–Jan 2, with Grandma").
- Planning can move back to Dreaming if the traveler reopens the
  question ("Actually, maybe somewhere warmer?").

### 1.2 One meaningful question at a time

- At most **one** question per turn, and only when the answer would
  change what the engine suggests.
- **Never re-ask for anything already provided** in the conversation,
  the trip state, or Family Memory. Before asking, the engine checks all
  three (§3.2, the "known facts" step).
- When an answer isn't essential, the engine proceeds with a stated
  assumption ("Assuming you'd drive, since you mentioned leaving from
  Charlotte…").

### 1.3 Budget

- Budget is **never the automatic first question**.
- It comes up naturally when it's relevant: choosing between options
  with different costs, lodging, or when the traveler raises it.
- If Family Memory or the conversation already mentions budget, the
  engine uses that and doesn't ask.
- Cost statements follow the claim labels (§4.3). The engine never
  states a price as fact without a verified source.

### 1.4 Suggestions

Derived from `intelligence/01-decision-framework.md`. Internally a
**Recommendation**. Shown to travelers in plain language, never with
internal labels.

```ts
type Recommendation = {
  id: string;
  tripId: string;
  kind: 'action' | 'delay' | 'avoid' | 'discover';   // internal only
  title: string;
  body: string;
  reason: string;                 // understandable by a ten-year-old
  confidence: 'high' | 'medium' | 'low';             // internal only
  claimLabels: ClaimLabel[];      // §4.3 — what kind of statement each claim is
  citedMemoryIds: string[];       // must exist in this turn's model inputs
  sourceIds: string[];            // verified facts only
  alternatives?: string[];        // ≤2
  status: 'proposed' | 'accepted' | 'dismissed';
};
```

Rules:

1. **Tradeoff priority:** safety → time-sensitive commitments →
   emotional well-being → physical well-being → long-term memories →
   convenience → efficiency.
2. **At most 3 suggestions per turn**, and **at most 3 destination
   ideas** at once. Fewer is better.
3. **Every suggestion has a reason.** If a Family Memory shaped it, the
   reason cites the memory naturally.
4. **Confidence controls presence.** High: suggest plainly. Medium:
   suggest with the assumption stated. Low: don't push it.
5. **The traveler decides.** A dismissed suggestion isn't repeated in
   the same conversation unless something changes.
6. **Stories over statistics.** Never optimize for "seeing everything."

---

## 2. Three layers of context

These stay separate in storage, in code, and in model inputs (each
layer is a labeled section of the input). See ADR-004 § Reconciliation.

| Layer | Holds | Engine access |
| --- | --- | --- |
| **Conversation context** | The messages in one planning conversation | Read; appends its own replies |
| **Trip state** | Saved facts about one trip | Read; writes **non-consequential** updates directly, **consequential** updates only after confirmation |
| **Family Memory** | Durable user-authored statements (≤30) | **Read only.** Injected verbatim. Never written, never suggested (ADR-001) |

### 2.1 Understanding trip facts

- The engine recognizes trip facts in natural conversation: party,
  ages, home base, travel mode, dates, destination interest, goals,
  budget mentions.
- Recognized facts are **known immediately** for the rest of the
  conversation. That's what prevents re-asking.
- **Consequential changes** to saved trip state require a lightweight
  confirmation before saving ("Save Dec 27–31 as your dates?").
  Consequential means it changes the destination or dates, removes or
  overwrites something the traveler previously saved, or would change
  what a briefing or reminder says.
  *The exact field-by-field classification is unresolved (§10, T7).*
- **Non-consequential additions** may be saved to the trip without a
  confirmation prompt, as long as they're visible and editable on the
  trip.
- **Trip facts never become Family Memory.** Something said in one
  trip's conversation never shapes another trip unless the traveler
  saves it through Family Memory's own write paths.

### 2.2 Trip shape: flexible dates, open destinations

```ts
type DateIntent =
  | { kind: 'exact'; start: string; end: string }
  | { kind: 'window'; earliest: string; latest: string; nights?: number }
  | { kind: 'duration'; nights: number; notes?: string }
  | { kind: 'unknown' };

type DestinationIntent =
  | { kind: 'chosen'; name: string }
  | { kind: 'shortlist'; candidates: string[] }   // ≤3
  | { kind: 'unknown' };
```

- Briefings (and the existing preview) need `exact` dates and a
  `chosen` destination. Before that, the home screen shows planning,
  not a briefing.
- Narrowing a window to exact dates, or choosing from a shortlist, is a
  consequential change, so it's confirmed.

---

## 3. Architecture

```
mobile/ (Expo)                               server (Supabase)
┌───────────────────────────────┐  HTTPS   ┌──────────────────────────────────────────┐
│ Planning conversation         │ ───────▶ │ functions/decision-engine                │
│ Trip · Family Memory          │          │  1. Assemble context    (code)           │
│ Local exploration store       │ ◀─────── │  2. Known facts + mode  (code)           │
│ (anonymous, on device)        │          │  3. Minimize            (code)           │
└──────────────┬────────────────┘          │  4. Research            (staged, §4)     │
               │ account mode (RLS)        │  5. Generate            (OpenAI, §3.3)   │
               ▼                           │  6. Validate            (code)           │
        Postgres (account data) ◀───────── │  7. Persist / return    (code)           │
                                           └──────────────────────────────────────────┘
```

### 3.1 Storage modes

| | Anonymous exploration | Account |
| --- | --- | --- |
| Where data lives | On the device | Supabase Postgres, RLS per account (ADR-002) |
| Survives app restart | Yes | Yes, and across devices |
| Delete | Clear "Delete this exploration" control, which removes all local trip and conversation data | Delete conversation, trip, or account (§5.3) |
| Server retention | *Unresolved (§10, T2)* | Until the user deletes it (§5.3) |

**Transfer on sign-up.** When an anonymous traveler signs up, the app
offers to move the exploration into the new account:

- Conversation → account conversation. Trip → account trip.
- **Nothing from the conversation becomes Family Memory** during
  transfer (ADR-001).
- The transfer is all-or-nothing from the traveler's point of view:
  afterward there is exactly one copy of the trip, and nothing is lost.
- Declining leaves the exploration on the device, still deletable.
- *Conflict handling, retries, and what happens to the local copy are
  unresolved (§10, T4).*

### 3.2 Turn pipeline

1. **Assemble context (code).** Load the three layers for this trip,
   plus unexpired sources. Write a model-input snapshot for audit
   (account mode; anonymous handling per T2).
2. **Known facts and mode (code).** Merge facts from trip state,
   conversation, and Family Memory into a "known" set. Compute the mode
   (Dreaming or Planning) and what's still missing. This is what
   enforces "never re-ask" and "one meaningful question."
3. **Minimize (code).** Remove what this turn doesn't need (§5.2).
4. **Research (staged).** See §4. Research queries never contain
   personal or family details.
5. **Generate (OpenAI).** One structured-output call returns
   `{ reply, recommendations[], question?, tripUpdates[] }`, with claim
   labels on factual statements.
6. **Validate (code).** Retry once, then degrade to a plain, honest
   reply with no suggestions, if any of these fail:
   - output matches the schema; ≤3 suggestions; ≤3 destination ideas;
     ≤1 question;
   - every suggestion has a reason;
   - every cited memory id and source id exists in this turn's inputs;
   - every "verified" claim has a source; no time-sensitive claim
     without a source or estimate/uncertainty framing;
   - no memory proposals or "I'll remember that" language;
   - no question about a fact already known;
   - no URLs that aren't in stored sources;
   - no internal terms in user-facing text (§7).
7. **Persist and return (code).** Account mode: save the message,
   suggestions, source links, trip updates, and events. Anonymous mode:
   return everything to the device for local storage.

### 3.3 Model integration (OpenAI)

- Calls happen **only on the server**. The API key lives in server
  secrets.
- **The model is configurable** (by environment or server config)
  without an app release. The default model is unresolved (§10, T5).
- One small provider interface wraps the integration, so the
  Intelligence stays implementation-independent.

### 3.4 Placement

- App code stays in `mobile/` (ADR-003).
- Server code goes in the root `supabase/` folder:
  `supabase/migrations/` and `supabase/functions/decision-engine/`. This
  is a backend, not a second app root. Sharing code or types between
  `mobile/` and the server needs a decision record per ADR-003 (§10,
  T12).
- The existing rule-based briefing (`mobile/lib/briefing/generate.ts`)
  stays as-is in v1, and later becomes the offline fallback.

### 3.5 Failure behavior

| Failure | Behavior |
| --- | --- |
| Model unavailable | Saved conversation and trip still show. A calm "planning help is briefly unavailable." User input is never lost. |
| Research unavailable | Continue. Time-sensitive claims become estimates or explicit uncertainty. |
| Validation fails twice | A plain, honest reply with no suggestions. The failure is logged. |
| Offline | Read-only view of local or cached data. Messages wait until online. |

---

## 4. Research

### 4.1 Architecture (designed now)

- One **research interface** in the server: `research(query, claimType)
  → Source[]`. Providers plug in behind it.
- **Sources are stored records:**

```ts
type Source = {
  id: string;
  claim: string;              // "Newfound Gap Road can close for snow and ice in winter."
  publisher: string;          // "National Park Service"
  url: string | null;         // only URLs actually retrieved, never generated
  publisherType: 'official' | 'editorial' | 'user_provided';
  retrievedAt: string;
  expiresAt: string | null;   // freshness window by claim type
};
```

- Research is called only when a suggestion depends on a time-sensitive
  claim.
- Queries are built from **destination and topic only** ("Gatlinburg
  winter road closures"), never from family details.

### 4.2 Staged activation

| Stage | What's live | Ships with |
| --- | --- | --- |
| **R0** | Interface, source storage, claim labels, and UI for sources. No live calls: time-sensitive claims are framed as estimates or uncertainty | M2 |
| **R1** | First live source type (provider and allowlist unresolved, T6) | M4 |
| **R2** | Broader research and freshness-based caching | M4+ |

### 4.3 Claim labels: inspiration, estimate, verified

Every factual statement the traveler sees is one of three kinds, and
the UI makes the difference clear (exact wording is a design task, §7):

| Label | Meaning | Example | Requirement |
| --- | --- | --- | --- |
| **Inspiration** | An idea or possibility, not a claim | "A cabin with a mountain view could make mornings special." | Must not contain hidden factual claims |
| **Estimate** | Approximate, from general knowledge or calculation | "About a 4-hour drive." "Usually quieter than beach towns." | Shown as approximate. Never a price stated as fact |
| **Verified fact** | Backed by a stored source | "Roads into the park can close for ice (National Park Service, checked Nov 7)." | Source and date visible |

Time-sensitive claims (prices, hours, availability, closures, weather,
crowds, event dates) can only be **verified** (with a fresh source) or
**estimate/uncertain**, with a "check before you book" note where it
matters.

---

## 5. Privacy

### 5.1 Explain

- Before the first planning message, the app explains in one or two
  plain sentences what's shared with the planning service and why, with
  a link to more detail.
- A privacy page explains what's stored, where, for how long, and how
  to delete it, for both anonymous and account modes.

### 5.2 Minimize

- Send the model **only what this turn needs.** For example, ages and
  needs ("a 6-year-old who gets carsick"), not names, email addresses,
  or exact home addresses.
- **Research queries never include personal or family details.**
- No account identifiers in model inputs.
- *The exact minimization rules and mechanism are unresolved (§10, T9).*

### 5.3 Retention and safeguards

- **Account conversations are retained until the user deletes them.**
  Deletion is a hard delete of the message content.
- Users can delete a single conversation, a trip, or their whole
  account.
- Deletion removes the data from all future model inputs immediately.
- Safeguards to document before launch: access controls (RLS), what
  model inputs are stored and for how long, provider-side retention,
  backup retention, and account deletion behavior. *Several are
  unresolved (§10, T2, T5, T10).*
- Anonymous explorations stay on the device until the traveler deletes
  them (or uninstalls the app).

---

## 6. Persistent data (account mode)

| Table | Purpose | Notes |
| --- | --- | --- |
| `trips` | One row per trip | `status` (planning/booked/active/complete), `destination_intent`, `date_intent`, `party_description`, `goals` |
| `memories` | Family Memory | As in the Memory v1 spec. **Engine server role: read only.** |
| `conversations` | One per trip in v1 | Hard delete of messages on delete |
| `conversation_messages` | Traveler and engine turns | Engine turns link to their model-input snapshot |
| `recommendations` | Suggestions | §1.4 |
| `sources` | Research results | §4.1 |
| `model_inputs` | Audit snapshot per generation | What the model saw: layer contents, memory ids, source ids. Retention per §5.3 |
| `trip_updates` | Consequential changes awaiting confirmation | pending / confirmed / declined |
| `events` | Append-only log | Memory v1 events plus §8 |

Anonymous mode keeps the equivalent trip, conversation, and suggestion
data on the device. The storage mechanism is unresolved (§10, T1).

---

## 7. Interface language

- **No internal engineering terms in the UI.** Not allowed: engine,
  decision engine, trip state, conversation context, memory store,
  evidence, source record, claim label, confidence, category, intent,
  prompt, model, token, recommendation kind names (action, delay,
  avoid, discover).
- The three claim kinds (§4.3) must be distinguishable in the UI. Their
  exact wording is a design task.
- "Family Memory" is the user-facing name of explicit memory (Memory v1
  spec).
- The planning experience's user-facing name is a design task.

---

## 8. Events (append-only, unprocessed in v1)

| event_type | payload |
| --- | --- |
| `planning_message_sent` | conversation_id, message_id |
| `engine_turn_completed` | model_inputs_id, recommendation_ids, mode, research_stage, latency_ms |
| `engine_validation_failed` | model_inputs_id, failed_rules |
| `recommendation_accepted` / `recommendation_dismissed` | recommendation_id, kind, confidence |
| `trip_update_confirmed` / `trip_update_declined` | trip_update_id, fields |
| `source_retrieved` | source_id, publisher_type |
| `exploration_transferred` | trip_id (no content) |
| `conversation_deleted` | conversation_id (no content) |

Account mode only. **Nothing reads events to shape advice in v1**
(ADR-001).

---

## 9. Milestones

Each milestone is shippable alone and keeps the app working.

| # | Milestone | Delivers | Exit criteria |
| --- | --- | --- | --- |
| **M0** | Decisions and docs | ADR-004 accepted; domain model updated (§11); technical decisions in §10 resolved or assigned | Founder sign-off |
| **M1** | Local exploration | Trip (flexible dates, open destination) and conversation persist on the device across restarts; "Delete this exploration" | Restart restores everything; delete removes everything; Memory v1 behavior unchanged |
| **M2** | Planning conversation | Server function with the full turn pipeline; OpenAI with configurable model; dream-first and planning modes; known-facts check; minimization; privacy explanation; claim labels with research at **R0**; scenario eval harness | Both acceptance scenarios pass, except account steps; zero memory writes from the engine |
| **M3** | Accounts and transfer | Supabase auth; account tables and RLS; sign-up offers exploration transfer; account retention and deletion | Scenario transfer and restoration steps pass; second-account RLS test passes; Memory v1 criteria 2, 4, 6, 8 pass |
| **M4** | Live research | R1, then R2; sources shown with dates; freshness rules | Scenario verified-fact criteria pass with live research |
| **M5** | Briefing on the engine | The morning briefing is generated through the engine; the rule-based generator becomes the fallback | The 12 existing briefing scenarios pass |

---

## 10. Unresolved technical decisions

These need an owner and an answer before the milestone listed. This
spec deliberately does not answer them.

| # | Decision | Needed by |
| --- | --- | --- |
| **T1** | **On-device storage for anonymous explorations.** Which mechanism on iOS, Android, and web, and whether family details stored on the device need encryption at rest. Any choice may add a dependency, which needs explicit approval. | M1 |
| **T2** | **Anonymous server access and retention.** How the server authenticates and rate-limits anonymous requests (Supabase anonymous auth, a device token, or something else). Whether anonymous turns or model-input snapshots are stored server-side at all, and for how long. | M2 |
| **T3** | **Family Memory before sign-up.** Can anonymous travelers keep Family Memory on the device? If so, does it transfer on sign-up? ADR-002 assigns memories to an account. | M1/M3 |
| **T4** | **Transfer mechanics.** What transfers, idempotency and retries, handling an account that already has trips, and what happens to the local copy after success. | M3 |
| **T5** | **OpenAI configuration.** Default model or models, the config mechanism, API surface and structured-output approach, streaming, cost and rate limits, and provider-side data retention settings. | M2 |
| **T6** | **Research provider.** Which provider or tool, a source allowlist, freshness windows per claim type, and caching. | M4 (interface in M2) |
| **T7** | **Consequential vs. non-consequential trip fields.** The field-by-field classification for confirmation (§2.1). | M2 |
| **T8** | **Long conversations.** "No hidden summaries" (ADR-001) and model context limits pull against each other. Options include truncation, a summary the traveler can see, or something else. | M2 |
| **T9** | **Minimization rules.** Exactly which fields are sent per turn, and how removal or redaction works and is tested. | M2 |
| **T10** | **Deletion and backups.** Account deletion cascade, backup retention windows, model-input snapshot retention, and data export. | M3 |
| **T11** | **Eval harness.** How scenario runs are judged (deterministic checks plus a judge model?), where they run, and whether they gate merges. | M2 |
| **T12** | **Shared code between `mobile/` and the server.** Duplicated types vs. a shared package (ADR-003 decision record). | M2 |
| **T13** | **How validation detects time-sensitive claims and internal terms.** Pattern rules, model self-labeling, or both, and the acceptable false-positive rate. | M2 |

---

## 11. Domain model changes (to apply to `docs/product/01-domain-model.md` in M0)

- **Trip:** destination and dates become intents that may be undecided
  (§2.2). Add `status`: planning → booked → active → complete.
- **New: Conversation.** The planning dialogue for one trip. It is
  context, not memory.
- **New: Exploration.** An anonymous trip and conversation kept on the
  device until deleted or transferred.
- **New: Source.** A dated, attributed claim about the world.
- **New: Trip update.** A consequential change suggested by the engine
  and saved only on confirmation.
- **Recommendation** (existing term): gains reason, kind, confidence,
  claim labels, citations, and status. It is still "not an itinerary."

---

## 12. Acceptance criteria

1. A trip can exist with an unknown destination and unknown dates.
2. With no practical constraints, the first reply inspires (≤3
   contrasting ideas, each with a reason) before asking anything
   practical. With constraints, it plans.
3. ≤1 question per turn. The engine never asks for a fact already
   present in the conversation, trip state, or Family Memory.
4. Budget is never the first question. It comes up only when relevant
   or when the traveler raises it.
5. Every suggestion has a reason. Every claim is labeled inspiration,
   estimate, or verified. Every verified claim shows its source and
   date. No price is stated as fact without a source.
6. Consequential trip changes are saved only after confirmation.
7. The engine's server role cannot write Family Memory (tested). No
   reply offers to remember something. Transfer creates no Family
   Memory.
8. Anonymous explorations survive app restarts. "Delete this
   exploration" removes all local data.
9. Sign-up offers transfer. After transfer, the account has exactly one
   copy of the trip and conversation, and nothing is lost.
10. Account conversations persist across devices until the user deletes
    them. Deletion removes them from all future model inputs.
11. Model inputs contain no names, emails, or account identifiers.
    Research queries contain no family details.
12. No internal engineering terms appear in user-facing text.
13. Both acceptance scenarios pass:
    `scenarios/decision-engine/001-gatlinburg-holiday-family.md` and
    `002-spring-break-destination-unknown.md`.

---

## 13. Out of scope for v1

Bookings and payments; inventory prices; affiliate links; real-time
in-trip guidance; multi-destination routing; shared trips across
accounts; learning from behavior; memory suggestions; push
notifications.
