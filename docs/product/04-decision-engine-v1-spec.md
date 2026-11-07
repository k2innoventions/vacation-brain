# Decision Engine v1 — Implementation Specification

**Version:** 0.3 (revised after PR #6 review; technical decisions open)
**Status:** Proposed
**Governing decisions:** [ADR-004](../../decisions/004-decision-engine-v1.md) (proposed), [ADR-001](../../decisions/001-v1-memory-scope.md), [ADR-002](../../decisions/002-memory-ownership.md), [ADR-003](../../decisions/003-canonical-app-location.md)
**Implements:** blueprint layer 4 (Reasoning Engine), `intelligence/01-decision-framework.md`
**Acceptance scenarios:** `scenarios/decision-engine/`

---

## Framing

The Decision Engine answers one question, from the Thinking Model:

> What is the best next decision for this traveler right now?

In v1, "right now" means **before the trip**. Sometimes the best next
step is a spark. Sometimes it's practical. Often it's both in the same
reply, because families are rarely equally ready on every part of a
trip.

It is not an itinerary generator, a booking tool, or a general chatbot.
A good session leaves the traveler **more excited and less burdened**.

"Decision Engine" is an internal name. **No internal engineering terms
appear in the UI** (§7).

---

## 1. Conversation behavior

### 1.1 Dreaming and planning, by intent and readiness

Mode isn't one switch for the whole conversation. It's decided **per
decision**, from what the traveler is asking for and how ready they are
to decide.

**Decisions tracked:** destination, dates, travel party, where to stay,
what to do, pace. Budget is tracked only once the traveler raises it or
it becomes relevant (§1.3).

**Readiness per decision:**

| Readiness | Traveler signals (examples) | Engine response for that decision |
| --- | --- | --- |
| **Open** | Nothing said yet, or "no idea" | Inspire: a few contrasting possibilities, each with a reason |
| **Exploring** | "Maybe…", "what about…", asks for ideas, reacts to options | Inspire and widen gently. Reflect what they seem drawn to |
| **Leaning** | Compares ("which is better…"), narrows ("probably the beach"), asks practical questions about one option | Narrow: compare tradeoffs, recommend with reasons |
| **Decided** | Commits in words ("let's do Dec 27–31") or taps a choice | Plan around it. Don't re-open it unless the traveler does |

Rules:

- **Constraints are not commitments.** "Sometime between Dec 26 and Jan
  2" tells the engine the dates are *leaning* within a window, not
  *decided*. "Gatlinburg" may be decided while "what to do" is still
  open.
- **Mixed-mode replies are normal.** One reply can be practical about a
  leaning decision and inspiring about an open one. It still has ≤3
  suggestions and ≤1 question in total.
- **Readiness can move backward.** "Actually, maybe somewhere warmer?"
  moves destination back to exploring. The earlier decided value stays
  visible until the traveler commits to something new or clears it.
- **How readiness is determined:** each turn, the model reports intent
  signals per decision (`wants_ideas`, `comparing`, `committing`,
  `reopening`), each with the quoted traveler words that support it.
  Code applies the readiness rules. **Only code can move a decision to
  Decided**, and only on a commitment (§2.1). *Signal definitions and
  thresholds are unresolved (§10, T7).*

### 1.2 One meaningful question at a time

- At most **one** question per turn, and only when the answer would
  change what the engine suggests. Prefer the question that unblocks
  the decision closest to being made.
- **Never re-ask for anything already provided** in the conversation,
  the trip, or Family Memory (account only).
- When an answer isn't essential, proceed with a stated assumption.

### 1.3 Budget

- **Never the automatic first question.**
- Comes up naturally when relevant (choosing between options of
  different cost, where to stay) or when the traveler raises it.
- If it's already known (from the conversation, the trip, or an
  account's Family Memory), use it and don't ask.
- Cost statements follow claim labels (§4). A price is never stated as
  fact without a verified source.

### 1.4 Suggestions

Internally a **Recommendation** (from `intelligence/01-decision-framework.md`).
Shown in plain language, never with internal labels.

```ts
type Recommendation = {
  id: string;
  tripId: string;
  decision: DecisionKey;          // which decision it serves
  kind: 'action' | 'delay' | 'avoid' | 'discover';   // internal only
  title: string;
  body: string;
  reason: string;                 // understandable by a ten-year-old
  confidence: 'high' | 'medium' | 'low';             // internal only
  claims: ClaimRef[];             // each factual statement with its label (§4.3)
  citedMemoryIds: string[];       // account mode only
  alternatives?: string[];        // ≤2
  status: 'proposed' | 'accepted' | 'dismissed';
};
```

Rules:

1. **Tradeoff priority:** safety → time-sensitive commitments →
   emotional well-being → physical well-being → long-term memories →
   convenience → efficiency.
2. **At most 3 suggestions per turn**, and **at most 3 destination
   ideas** at once.
3. **Every suggestion has a reason.** If Family Memory shaped it, the
   reason cites the memory naturally.
4. **Confidence controls presence.** High: suggest plainly. Medium:
   suggest with the assumption stated. Low: don't push it.
5. **The traveler decides.** A dismissed suggestion isn't repeated in
   the same conversation unless something changes.
6. **Stories over statistics.**

---

## 2. Three layers of context

Separate in storage, in code, and in model inputs (each layer is a
labeled section). See ADR-004 § Reconciliation.

| Layer | Holds | Anonymous | Account | Engine access |
| --- | --- | --- | --- | --- |
| **Conversation context** | Messages in one planning conversation | On device | Postgres | Read; appends replies |
| **Trip state** | Trip facts, each *considering* or *decided* | On device | Postgres | Records *considering*; sets *decided* only on commitment (§2.1) |
| **Family Memory** | Durable user-authored statements (≤30) | **None** | Postgres | **Read only.** Injected verbatim. Never written or suggested |

**Anonymous travelers have no Family Memory** (ADR-004, decision 6).
Their advice draws on conversation context and trip state only.

### 2.1 Exploring vs. committing

Each trip fact has a state:

```ts
type TripFact<T> =
  | { state: 'considering'; options: T[]; updatedAt: string }   // ≥1 option, e.g. a shortlist or a window
  | { state: 'decided'; value: T; decidedAt: string; via: 'words' | 'tap' };
```

**Considering (exploration).** As the traveler explores, the engine
records what they're considering: a shortlist, a date window, a rough
party size.

- **No confirmation prompt.** It's exploration, not a decision.
- Visible on the trip in a calm "what you're considering" area (copy
  is a design task), and easy to clear.
- Never drives briefings or reminders.

**Decided (commitment).** A trip fact becomes decided only when the
traveler commits:

1. **In words.** "Let's do Dec 27–31." "We're going with the second
   one." The engine records it right away and shows a quiet **inline
   acknowledgement with undo** ("Dates set: Dec 27–31 · Undo"). It does
   not ask a question.
2. **By tap.** When the traveler seems close to a decision but hasn't
   made it, the reply may include **one inline option** ("Go with Dec
   27–31"). Ignoring it is fine. It isn't repeated unless the context
   changes, and it never blocks the conversation.

Lightweight-confirmation rules:

- **At most one** pending inline option per reply.
- Several commitments in one message produce **one** combined
  acknowledgement.
- Vague agreement ("sounds good", "nice") about a list is **not** a
  commitment.
- Undo is available on the acknowledgement. Decided facts can always be
  edited on the trip screen.
- Validator rule: the engine can't output a decided change unless the
  latest traveler message contains a supporting commitment quote, or the
  change came from a tap.
- Briefings and reminders use **decided** facts only.

*Commitment-signal detection and how long undo stays available are
unresolved (§10, T7).*

### 2.2 Trip shape

```ts
type DateValue =
  | { kind: 'exact'; start: string; end: string }
  | { kind: 'window'; earliest: string; latest: string; nights?: number }
  | { kind: 'duration'; nights: number; notes?: string };

type Trip = {
  destination?: TripFact<string>;     // considering: shortlist ≤3; decided: one
  dates?: TripFact<DateValue>;        // a window is "considering"; decided needs exact dates
  party?: TripFact<string>;           // description, e.g. "2 adults, kids 6 and 9, grandparent"
  stay?: TripFact<string>;
  goals?: string;
  status: 'planning' | 'booked' | 'active' | 'complete';
};
```

Briefings (and the existing preview) need a decided destination and
decided exact dates.

---

## 3. Architecture

```
mobile/ (Expo)                               server (Supabase)
┌───────────────────────────────┐  HTTPS   ┌──────────────────────────────────────────┐
│ Planning conversation         │ ───────▶ │ functions/decision-engine                │
│ Trip (considering / decided)  │          │  1. Assemble context     (code)          │
│ Family Memory (account only)  │ ◀─────── │  2. Known facts          (code)          │
│ Local exploration store (T1)  │          │  3. Minimize             (code)          │
└──────────────┬────────────────┘          │  4. Generate             (OpenAI)        │
               │ account mode (RLS)        │  5. Readiness + commits  (code)          │
               ▼                           │  6. Verify claims        (research, §4)  │
        Postgres (account data) ◀───────── │  7. Validate             (code)          │
                                           │  8. Persist / return     (code)          │
                                           └──────────────────────────────────────────┘
```

### 3.1 Storage modes

| | Anonymous exploration | Account |
| --- | --- | --- |
| Data | Conversation and trip, **no Family Memory** | Conversation, trip, Family Memory |
| Where | On the device (T1) | Supabase Postgres, RLS per account |
| Survives restart | Yes | Yes, across devices |
| Delete | Clear "Delete this exploration": removes all local data | Delete conversation, trip, or account (§5.3) |
| Server retention | *Unresolved (T2)* | Until the user deletes it (§5.3) |

**Transfer on sign-up.** The app offers to move the exploration into the
new account. Conversation becomes an account conversation, and the trip
(considering and decided facts) becomes an account trip. **Family Memory
starts empty** and is authored by the traveler afterward. Afterward
there is exactly one copy and nothing is lost. Declining leaves the
exploration on the device. *Mechanics are unresolved (T4).*

### 3.2 Turn pipeline

1. **Assemble context (code).** The three layers for this trip (Family
   Memory in account mode only), plus relevant source records.
2. **Known facts (code).** Merge what's known from all layers. This
   enforces "never re-ask."
3. **Minimize (code).** Remove what this turn doesn't need (§5.2).
4. **Generate (OpenAI).** One structured call returns
   `{ reply, recommendations[], question?, intentSignals[], tripChanges[], claims[] }`.
5. **Readiness and commitments (code).** Apply intent signals to
   readiness (§1.1). Accept *considering* changes. Accept *decided*
   changes only with a commitment quote or tap (§2.1).
6. **Verify claims (research, §4).** Check each claim that needs
   verification. Downgrade or remove what fails. The reply is adjusted
   to match.
7. **Validate (code).** Retry once, then degrade to a plain, honest
   reply, if any of these fail:
   - schema; ≤3 suggestions; ≤3 destination ideas; ≤1 question; ≤1
     inline option;
   - every suggestion has a reason;
   - every cited memory id and claim check exists in this turn;
   - every claim shown as verified passed claim-level verification (§4.2);
   - no memory proposals or "I'll remember that" language;
   - no question about a known fact;
   - no URLs outside stored source records;
   - no internal terms in user-facing text (§7).
8. **Persist and return (code).** Account mode: save everything and log
   events. Anonymous: return everything to the device.

### 3.3 Model integration (OpenAI)

- Server-only. The API key lives in server secrets.
- The model is configurable without an app release. The default is
  unresolved (T5).
- One small provider interface wraps the integration.

### 3.4 Placement

- App code stays in `mobile/` (ADR-003). Server code goes in
  `supabase/migrations/` and `supabase/functions/decision-engine/`.
  Sharing code needs an ADR-003 record (T12).
- The rule-based briefing stays as-is in v1 and later becomes the
  fallback.

### 3.5 Failure behavior

| Failure | Behavior |
| --- | --- |
| Model unavailable | Saved conversation and trip still show; a calm "briefly unavailable." Input is never lost. |
| Research unavailable | Continue. Claims that would need verification become estimates or explicit uncertainty. |
| Validation fails twice | Plain, honest reply with no suggestions; logged. |
| Offline | Read-only local or cached view. Messages wait until online. |

---

## 4. Research and claim verification

### 4.1 Architecture (designed now)

- **Research interface:** `research(query, claimType) → SourceDocument[]`.
  Providers plug in behind it (T6).
- Queries are built from **destination, topic, and timeframe only**,
  never from family details.
- Verification is **claim-level**. A source being on-topic is not
  enough.

```ts
type SourceDocument = {
  id: string;
  publisher: string;
  publisherType: 'official' | 'primary_operator' | 'editorial' | 'user_generated';
  url: string;                 // retrieved, never generated
  publishedOrUpdatedAt: string | null;
  retrievedAt: string;
};

type ClaimCheck = {
  id: string;
  claim: string;               // the exact sentence shown to the traveler
  claimType: 'closure' | 'hours' | 'price' | 'event_date' | 'seasonal_pattern'
           | 'crowd_pattern' | 'distance_time' | 'policy' | 'general';
  appliesTo: { place: string; dates?: DateValue };
  support: { sourceId: string; excerpt: string }[];   // passages that support this claim
  relevance: 'direct' | 'partial' | 'none';
  freshness: 'current' | 'stale' | 'unknown';
  reliability: 'sufficient' | 'insufficient';
  conflicts: { sourceId: string; excerpt: string }[];
  verdict: 'verified' | 'unconfirmed' | 'conflicting' | 'unsupported';
  uncertaintyNote?: string;    // plain language, shown when not verified
};
```

### 4.2 Verification rules

A claim is **verified** only if **all** of these hold:

1. **Relevance.** A stored excerpt **directly supports this specific
   claim**, for this place and this timeframe. Numbers, dates, and
   names must match the excerpt. A claim combining several facts needs
   support for each part.
2. **Freshness.** The source is current enough for the claim type and
   applies to the trip's dates. For example, a closure notice from last
   season doesn't verify a closure next month. *Windows per claim type
   are unresolved (T6).*
3. **Reliability.** The publisher type is appropriate for the claim
   type: official or primary operator for closures, hours, prices,
   policies and event dates; reputable editorial is acceptable for
   patterns. User-generated content never verifies a claim on its own.
   *The exact tier matrix and corroboration rules are unresolved (T6).*
4. **No unresolved conflict.** If reliable sources disagree, the
   verdict is **conflicting**, and the traveler sees the disagreement in
   plain language.

Otherwise the claim is downgraded:

| Verdict | Shown as |
| --- | --- |
| verified | **Verified fact**: publisher and date visible, and the supporting excerpt is viewable |
| unconfirmed / conflicting | **Estimate** with an uncertainty note, and attribution where it helps ("One travel guide says it gets busy; worth checking closer to your dates") |
| unsupported | Removed, or rewritten as an estimate or inspiration |

**Predictions are never verified facts.** Future weather and crowds can
only be estimates. A historical pattern can be verified *as a pattern*
("historically busiest around New Year's Eve"), but its future
application stays an estimate.

How relevance is checked (model-based entailment, rules, or both) is
unresolved (T13).

### 4.3 Claim labels

| Label | Meaning | Example |
| --- | --- | --- |
| **Inspiration** | An idea, not a claim | "A cabin with a view could make mornings special." |
| **Estimate** | Approximate, unconfirmed, or a prediction | "About a 4-hour drive." "Probably quieter than beach towns that week." |
| **Verified fact** | Passed §4.2 | "Roads into the park can close for ice in winter (National Park Service, updated Oct 2026, checked Nov 7)." |

Wording in the UI is a design task (§7). The three must be clearly
distinguishable.

### 4.4 Staged activation

| Stage | What's live | Ships with |
| --- | --- | --- |
| **R0** | Interfaces, claim checks, labels, and UI. No live retrieval: claims that need verification are estimates or explicit uncertainty | M2 |
| **R1** | First live provider with claim-level verification for official and primary sources (T6) | M4 |
| **R2** | Broader sources, corroboration, and freshness-based caching | M4+ |

---

## 5. Privacy

### 5.1 Explain

- Before the first planning message, one or two plain sentences on
  what's shared with the planning service and why, with a link to more.
- A privacy page covers what's stored, where, for how long, and how to
  delete it, for both modes. It also says that anonymous explorations
  have no Family Memory.

### 5.2 Minimize

- Send only what this turn needs: ages and needs, not names, emails, or
  exact addresses. No account identifiers.
- No personal or family details in research queries.
- *Exact rules and mechanism are unresolved (T9).*

### 5.3 Retention and safeguards

- Account conversations are retained until the user deletes them, which
  is a hard delete of the content.
- Users can delete a conversation, a trip, or their account. Deletion
  removes data from all future model inputs immediately.
- Safeguards to document before launch: RLS, model-input snapshot
  retention, provider-side retention, backups, account deletion. *See
  T2, T5, T10.*
- Anonymous explorations stay on the device until deleted or the app is
  uninstalled.

---

## 6. Persistent data (account mode)

| Table | Purpose | Notes |
| --- | --- | --- |
| `trips` | One row per trip | `status`, plus trip facts with considering/decided state |
| `memories` | Family Memory | Memory v1 spec. **Engine server role: read only.** Account-only |
| `conversations` | One per trip in v1 | Hard delete of messages on delete |
| `conversation_messages` | Traveler and engine turns | Engine turns link to their model-input snapshot |
| `recommendations` | Suggestions | §1.4 |
| `source_documents` | Retrieved sources | §4.1 |
| `claim_checks` | Claim-level verification results | §4.1 |
| `model_inputs` | Audit snapshot per generation | Retention per §5.3 |
| `events` | Append-only log | Memory v1 events plus §8 |

The anonymous on-device store mirrors trips, conversations, and
suggestions, with no memories (T1).

---

## 7. Interface language

- **No internal engineering terms in the UI.** Not allowed: engine,
  decision engine, trip state, conversation context, memory store,
  evidence, source record, claim check, verdict, claim label,
  confidence, category, readiness, intent, prompt, model, token, and the
  recommendation kind names (action, delay, avoid, discover).
- Inspiration, estimates, and verified facts must be distinguishable.
  Wording is a design task.
- "Family Memory" is the user-facing name of explicit memory. It's
  shown only to signed-in travelers.
- The planning experience's name and the "what you're considering" copy
  are design tasks.

---

## 8. Events (account mode, append-only, unprocessed in v1)

| event_type | payload |
| --- | --- |
| `planning_message_sent` | conversation_id, message_id |
| `engine_turn_completed` | model_inputs_id, recommendation_ids, readiness_snapshot, research_stage, latency_ms |
| `engine_validation_failed` | model_inputs_id, failed_rules |
| `recommendation_accepted` / `recommendation_dismissed` | recommendation_id, kind, confidence |
| `trip_fact_decided` / `trip_fact_undone` | trip_id, fact, via (words/tap) |
| `claim_checked` | claim_check_id, claim_type, verdict |
| `exploration_transferred` | trip_id (no content) |
| `conversation_deleted` | conversation_id (no content) |

**Nothing reads events to shape advice in v1** (ADR-001).

---

## 9. Milestones

| # | Milestone | Delivers | Exit criteria |
| --- | --- | --- | --- |
| **M0** | Decisions and docs | ADR-004 accepted; domain model updated (§11); §10 decisions resolved or assigned | Founder sign-off |
| **M1** | Local exploration | Trip (considering/decided facts) and conversation persist on the device; "Delete this exploration"; no Family Memory in anonymous mode (see T14) | Restart restores everything; delete removes everything |
| **M2** | Planning conversation | Server function with the full pipeline; OpenAI with configurable model; per-decision readiness and mixed-mode replies; exploring vs. committing with inline acknowledgement and undo; minimization; privacy explanation; claim checks at **R0**; scenario eval harness | Both scenarios pass, except account and verified-fact steps; zero memory writes |
| **M3** | Accounts and transfer | Supabase auth; account tables and RLS; transfer on sign-up; Family Memory as an account-only feature; retention and deletion | Scenario transfer, restoration, and account steps pass; RLS test passes; Memory v1 criteria 2, 4, 6, 8 pass |
| **M4** | Live research | R1, then R2; claim-level verification; sources and excerpts viewable | Scenario verified-fact criteria pass; audit finds no verified label on an unsupported claim |
| **M5** | Briefing on the engine | The morning briefing uses the engine; rule-based fallback | The 12 existing briefing scenarios pass |

---

## 10. Technical decisions

### Resolved

| # | Decision | Resolution |
| --- | --- | --- |
| T3 | Family Memory before sign-up | **No persistent Family Memory for anonymous travelers.** Family Memory is account-owned and explicitly authored after sign-up. Transfer moves conversation and trip only. (ADR-004, decision 6) |

### Unresolved

This spec deliberately leaves these unanswered.

| # | Decision | Needed by |
| --- | --- | --- |
| **T1** | On-device storage for anonymous explorations: mechanism per platform, encryption at rest, backup exposure, size limits. A dependency choice needs explicit approval. | M1 |
| **T2** | Anonymous server access (authentication, rate limiting) and whether anonymous turns or snapshots are stored server-side, and for how long. | M2 |
| **T4** | Transfer mechanics: idempotency, retries, an account that already has trips, and the local copy after success. | M3 |
| **T5** | OpenAI configuration: default model or models, API surface, structured output, streaming, cost and rate limits, provider retention settings. | M2 |
| **T6** | Research provider; publisher reliability tiers per claim type; corroboration requirements; freshness windows per claim type; caching. | M4 (interfaces in M2) |
| **T7** | Intent and commitment signals: definitions, detection, readiness thresholds, ambiguous agreement, and how long undo stays available. | M2 |
| **T8** | Long conversations vs. "no hidden summaries" (ADR-001) and model context limits. | M2 |
| **T9** | Minimization rules: exact fields per turn, redaction mechanism, and tests. | M2 |
| **T10** | Deletion cascade, backup retention, model-input snapshot retention, export. | M3 |
| **T11** | Eval harness: judging method, where it runs, and merge gating. | M2 |
| **T12** | Shared code between `mobile/` and the server (ADR-003 record). | M2 |
| **T13** | How relevance (claim-to-excerpt support), time-sensitive claims, and internal terms are detected and validated, and acceptable error rates. | M2 (relevance by M4) |
| **T14** | **The prototype's "About your trip" chip screen.** It stores chip selections as memories today. Under T3, anonymous travelers have no Family Memory. Many chips ("This group includes kids", "Slow mornings") look like trip context, and others ("Food allergies") may belong in Family Memory after sign-up. How each chip maps to trip facts or account Family Memory needs a product decision. | M1 |

---

## 11. Domain model changes (to apply to `docs/product/01-domain-model.md` in M0)

- **Trip:** facts carry a state, *considering* or *decided*. Add
  `status`: planning → booked → active → complete.
- **New: Conversation.** The planning dialogue for one trip. It is
  context, not memory.
- **New: Exploration.** An anonymous trip and conversation on the
  device, with no Family Memory, until deleted or transferred.
- **New: Source document** and **Claim check** (§4.1).
- **Memory:** clarify that Family Memory exists only for accounts and is
  authored only by the traveler.
- **Recommendation** (existing term): gains decision, reason, kind,
  confidence, claims, citations, and status. Still "not an itinerary."

---

## 12. Acceptance criteria

1. A trip can exist with an unknown destination and unknown dates.
2. Mode is chosen per decision from intent and readiness. Constraints
   alone don't skip inspiration for decisions that are still open.
   Mixed-mode replies occur when readiness differs.
3. ≤1 question per turn. Known facts are never asked again.
4. Budget is never the first question.
5. Considering-state changes never prompt. Decided changes happen only
   on a commitment in words (with an inline acknowledgement and undo) or
   a tap. ≤1 inline option per reply, not repeated. Vague agreement is
   never treated as a commitment.
6. Every claim is labeled inspiration, estimate, or verified. Every
   verified claim passed relevance, freshness, reliability, and
   conflict checks, with publisher, date, and excerpt available.
   Predictions are never verified. No price as fact without
   verification.
7. The engine's server role cannot write Family Memory (tested). No
   reply offers to remember something.
8. Anonymous travelers have no Family Memory. Transfer creates none.
   After sign-up, Family Memory contains only what the traveler writes.
9. Anonymous explorations survive restarts. Delete removes all local
   data.
10. Transfer yields exactly one trip and conversation, with nothing
    lost.
11. Account conversations persist across devices until deleted.
12. Model inputs contain no names, emails, or account identifiers.
    Research queries contain no family details.
13. No internal terms in user-facing text.
14. Both acceptance scenarios pass.

---

## 13. Out of scope for v1

Bookings and payments; inventory prices; affiliate links; real-time
in-trip guidance; multi-destination routing; shared trips across
accounts; learning from behavior; memory suggestions; anonymous Family
Memory; push notifications.
