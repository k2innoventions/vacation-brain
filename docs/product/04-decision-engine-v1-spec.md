# Decision Engine v1 — Implementation Specification

**Version:** 1.0 (all product decisions resolved; remaining technical decisions in §10)
**Status:** Accepted — M0 complete; ready for M1
**Governing decisions:** [ADR-004](../../decisions/004-decision-engine-v1.md) (accepted), [ADR-005](../../decisions/005-user-initiated-memory-saves.md) (accepted), [ADR-001](../../decisions/001-v1-memory-scope.md) (as amended), [Memory v1 spec](03-memory-v1-spec.md) (v1.1), [ADR-002](../../decisions/002-memory-ownership.md), [ADR-003](../../decisions/003-canonical-app-location.md)
**Implements:** blueprint layer 4 (Reasoning Engine), `intelligence/01-decision-framework.md`
**Acceptance scenarios:** `scenarios/decision-engine/`

---

## Framing

The Decision Engine answers one question, from the Thinking Model:

> What is the best next decision for this traveler right now?

In v1, "right now" means **before the trip**. Sometimes the best next
step is a spark. Sometimes it's practical. Often it's both, because
families are rarely equally ready on every part of a trip.

It is not an itinerary generator, a booking tool, or a general chatbot.
A good session leaves the traveler **more excited and less burdened**.

"Decision Engine" is an internal name. **No internal engineering terms
appear in the UI** (§7).

---

## 1. Conversation behavior

### 1.1 Dreaming and planning, by intent and readiness

Mode is decided **per decision**, from what the traveler is asking for
and how ready they are.

**Decisions tracked:** destination, dates, travel party, where to stay,
what to do, pace. Budget is tracked once raised or relevant (§1.3).

**Readiness per decision (internal only, never shown to travelers):**

| Readiness | Traveler signals (examples) | Engine response for that decision |
| --- | --- | --- |
| **Open** | Nothing said, or "no idea" | Inspire: a few contrasting possibilities, each with a reason |
| **Exploring** | "Maybe…", "what about…", asks for ideas, reacts with enthusiasm | Inspire and widen gently. Reflect what they're drawn to |
| **Leaning** | Compares, narrows ("probably the beach"), asks practical questions about one option | Narrow: compare tradeoffs, recommend with reasons |
| **Decided** | **Explicit commitment** in words or a tap | Plan around it. Don't re-open it unless the traveler does |

Rules:

- **Constraints are not commitments.** A date window means dates are
  leaning, not decided.
- **Enthusiasm is not commitment.** "Love it!", "Sounds amazing",
  "Yes!!" in response to options shows interest. At most it moves a
  decision to exploring or leaning. **It never creates a decided fact.**
- **Mixed-mode replies are normal**, still with ≤3 suggestions and ≤1
  question in total.
- **Readiness can move backward** ("Actually, maybe somewhere warmer?").
  The earlier decided value stays until the traveler commits to
  something new or clears it.
- **How it's determined:** each turn the model reports intent signals
  per decision (`wants_ideas`, `comparing`, `committing`, `reopening`),
  each with the quoted traveler words. Code applies the rules, and
  **only code can move a decision to Decided**, only on an explicit
  commitment (§2.1). *Signal definitions are unresolved (T7).*

### 1.2 One meaningful question at a time

- At most **one** question per turn, only when the answer would change
  the suggestion. Prefer the question that unblocks the decision closest
  to being made.
- **Never re-ask** anything provided in the conversation, the trip, or
  (account only) Family Memory.
- When an answer isn't essential, proceed with a stated assumption.

### 1.3 Budget

- **Never the automatic first question.** It comes up when relevant or
  when the traveler raises it. If it's already known, it isn't asked.
- A price is never stated as fact without verification (§4).

### 1.4 Suggestions

Internally a **Recommendation**. Shown in plain language.

```ts
type Recommendation = {
  id: string;
  tripId: string;
  decision: DecisionKey;
  kind: 'action' | 'delay' | 'avoid' | 'discover';   // internal only
  title: string;
  body: string;
  reason: string;                 // understandable by a ten-year-old
  confidence: 'high' | 'medium' | 'low';             // internal only
  claims: ClaimRef[];             // §4.3
  citedMemoryIds: string[];       // account mode only
  citedDetailIds: string[];       // trip details used (§2.2)
  alternatives?: string[];        // ≤2
  status: 'proposed' | 'accepted' | 'dismissed';
};
```

Rules: tradeoff priority from safety down to efficiency; ≤3
suggestions and ≤3 destination ideas per turn; every suggestion has a
reason that cites what shaped it naturally; confidence controls
presence; a dismissed suggestion isn't repeated unless something
changes; stories over statistics.

---

## 2. Three layers of context

| Layer | Holds | Anonymous | Account | Engine access |
| --- | --- | --- | --- | --- |
| **Conversation context** | Messages in one planning conversation | On device | Postgres | Read; appends replies |
| **Trip state** | Trip facts (§2.1) and trip details (§2.2) | On device | Postgres | Records details and considering facts; decided facts only on explicit commitment |
| **Family Memory** | Durable statements authored by the traveler (≤30) | **None** | Postgres | **Read only.** Never written or suggested |

### 2.1 Trip facts: exploring vs. committing

```ts
type TripFact<T> =
  | { state: 'considering'; options: T[]; updatedAt: string }
  | { state: 'decided'; value: T; decidedAt: string; via: 'words' | 'tap' };
```

- **Considering** is recorded quietly, with no prompt. It's visible in a
  calm "what you're considering" area (copy is a design task) and easy
  to clear. It never drives briefings.
- **Decided** happens only on an **explicit commitment**:
  1. **In words** ("Let's do Dec 27–31"): recorded at once, with one
     quiet inline acknowledgement and undo. No question.
  2. **By tap**: at most one inline option per reply. It can be ignored
     and isn't repeated unless the context changes.
- Vague agreement or enthusiasm never commits. Several commitments in
  one message share one acknowledgement. Decided facts are editable on
  the trip screen.
- Validator: no decided change without a commitment quote in the latest
  traveler message, or a tap.
- Briefings and reminders use decided facts only.

### 2.2 Trip details

What the traveler shares about the group ("My son loves waterslides",
"Grandma can't do long walks") becomes a **trip detail**:

```ts
type TripDetail = {
  id: string;
  kind: 'preference' | 'need' | 'tradition' | 'party' | 'logistics';
  display: string;           // shown on the trip screen
  travelerWords: string;     // the traveler's original quote, kept verbatim
  personRole?: string;       // trip-scoped role reference, e.g. "child, 9" (§5.4); names never sent to external AI
  savedMemoryId?: string;    // set if the traveler saved it to Family Memory
};
```

- Used **naturally in the current trip** ("since your son loves
  waterslides…").
- **Stays in this trip.** It never shapes another trip on its own.
- **Practical needs, not diagnoses.** For health-related details, the
  engine records the practical need ("needs short, flat walks") rather
  than a medical condition, even if the traveler mentioned one. The
  original words remain only in the conversation, which is deletable.
- Shown on the trip screen in a calm "about your group" area. Editable
  and deletable.

### 2.3 Saving to Family Memory (T14; ADR-005, accepted)

**What's shared in a trip stays in that trip, unless the traveler
chooses to save it for future trips.**

**The contextual save action.**

- Every trip detail of kind `preference`, `need`, or `tradition` that the
  **traveler stated** shows a visible, easy-to-discover **"Save for future trips"**
  action on the trip screen.
- **Eligibility is a fixed rule** (ADR-005). The AI sorts details into
  kinds for planning, but has no signal for "worth remembering" and
  can't add or hide the action on any single detail.
- **Visible, consistent placement.** The action sits in the same place
  on every eligible detail, so travelers learn where it is. It's not
  hidden in menus or settings.
- **Never in the conversation stream.** No banners, badges, pop-ups,
  animations, or reminders. Always available, never pushed.
- **Health details** follow the same rule. They're never promoted
  automatically, only through this explicit tap and Save.

**Saving (signed in).**

1. The traveler taps "Save for future trips."
2. A small sheet opens, pre-filled with the traveler's **own words**
   (`travelerWords`), editable.
3. Nothing is saved until they tap **Save**. Cancel saves nothing.
4. A gentle confirmation follows: "Saved for future trips" with a
   one-tap link to Family Memory. The detail now shows a quiet "Saved"
   mark.
5. At the 30-memory cap, the sheet explains the cap and links to Family
   Memory to make room.

**Anonymous travelers.**

- The action is visible. Tapping it opens a short sheet: Family Memory
  is kept with an account; create one to save this for future trips.
  Options: **Create account** and **Not now**.
- "Not now" returns them exactly where they were. Nothing else prompts
  them about memory, then or later.
- If they create an account from the sheet, the exploration transfer is
  offered (§3.1). Then they return to the same save sheet, and **still
  have to tap Save**.
- Exploring never requires an account.

**The Family Memory area.**

- **One tap from the home screen**, and linked from every save
  confirmation.
- Lists all memories, newest first. Add in your own words, edit in
  place, delete with one confirm (Memory v1 spec).
- Anonymous travelers see a short explanation and a "Create account"
  option. That's the only place, besides tapping a save action, where
  memory and accounts are connected.

**Never:**

- automatic saves;
- the AI proposing, drafting, ranking, or highlighting memories;
- conversation text like "Want me to remember that?";
- repeated or timed prompts.

### 2.4 Trip shape

```ts
type DateValue =
  | { kind: 'exact'; start: string; end: string }
  | { kind: 'window'; earliest: string; latest: string; nights?: number }
  | { kind: 'duration'; nights: number; notes?: string };

type Trip = {
  destination?: TripFact<string>;     // considering: shortlist ≤3
  dates?: TripFact<DateValue>;        // decided requires exact dates
  party?: TripFact<string>;
  stay?: TripFact<string>;
  details: TripDetail[];
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
│ Trip: facts + details         │          │  1. Assemble context     (code)          │
│ Family Memory (account only)  │ ◀─────── │  2. Known facts          (code)          │
│ Exploration store (AsyncStor.)│          │  3. Minimize + pseudonymize (code)       │
└──────────────┬────────────────┘          │  4. Generate             (OpenAI)        │
               │ account mode (RLS)        │  5. Readiness + commits  (code)          │
               ▼                           │  6. Verify claims        (research, §4)  │
        Postgres (account data) ◀───────── │  7. Validate             (code)          │
                                           │  8. Re-personalize, persist / return     │
                                           └──────────────────────────────────────────┘
```

### 3.1 Storage modes

| | Anonymous exploration | Account |
| --- | --- | --- |
| Data | Conversation and trip (facts and details). **No Family Memory** | Conversation, trip, Family Memory |
| Where | On the device (§3.6) | Supabase Postgres, RLS per account |
| Survives restart | Yes | Yes, across devices |
| Delete | "Delete this exploration": removes all local data | Delete conversation, trip, memory, or account |
| Server retention | *Unresolved (T2)* | Until the user deletes it |

**Transfer on sign-up.** The app offers to move the exploration into the
account: conversation, trip facts, and trip details (including the
locally stored names in §5.4). **Family Memory starts empty**, and
nothing is saved to it unless the traveler uses a save action or the
Family Memory area. Afterward there is exactly one copy and nothing is
lost. *Mechanics are unresolved (T4).*

### 3.2 Turn pipeline

1. **Assemble context (code):** the three layers (Family Memory in
   account mode only), plus relevant source records.
2. **Known facts (code):** enforces "never re-ask."
3. **Minimize and pseudonymize (code):**
   - keep health-related memories and details only when relevant to a
     decision in play (§5.5);
   - replace known names and nicknames with trip-scoped role references
     (§5.4);
   - run the best-effort identifying-detail check on everything about to
     be sent (§5.4).
4. **Generate (OpenAI):** returns
   `{ reply, recommendations[], question?, intentSignals[], tripChanges[], tripDetails[], claims[] }`.
5. **Readiness and commitments (code):** §1.1, §2.1.
6. **Verify claims (research):** §4.
7. **Validate (code).** Retry once, then degrade to a plain reply, if
   any of these fail:
   - schema; ≤3 suggestions or ideas; ≤1 question; ≤1 inline option;
   - every suggestion has a reason;
   - every citation exists in this turn's inputs;
   - verified claims passed §4.2;
   - no memory proposals, offers to remember, or "worth saving"
     language;
   - no question about a known fact;
   - no URLs outside stored source records;
   - no internal terms in user-facing text.
8. **Re-personalize and persist (code):** substitute role references
   back to the traveler's names **on the device or server, after the
   model call**. Then save (account mode) or return to the device
   (anonymous).

### 3.3 Model integration (OpenAI)

Server-only. The key lives in server secrets. The model is configurable
without an app release. One small provider interface wraps it. *Default
model and settings are unresolved (T5).*

### 3.4 Placement

App code stays in `mobile/` (ADR-003). Server code goes in
`supabase/migrations/` and `supabase/functions/decision-engine/`.
Sharing code needs an ADR-003 record (T12). The rule-based briefing
stays and later becomes the fallback.

### 3.5 Failure behavior

| Failure | Behavior |
| --- | --- |
| Model unavailable | Saved data still shows; calm "briefly unavailable." Input is never lost. |
| Research unavailable | Claims needing verification become estimates or explicit uncertainty. |
| Validation fails twice | Plain, honest reply; logged. |
| Offline | Read-only local or cached view. Messages wait until online. |
| Local storage full or failing | Keep the conversation usable. Tell the traveler plainly that older messages may not be kept on this device. Never lose decided trip facts or details silently. |

### 3.6 On-device exploration storage (T1, resolved)

- **Library:** `@react-native-async-storage/async-storage` (approved;
  installed in M1 via `npx expo install` for SDK compatibility). It
  supports iOS, Android, and web (browser storage) and works in Expo Go.
- **Abstraction:** an `ExplorationStore` interface (`load`, `save`,
  `appendMessages`, `deleteAll`). The app never calls AsyncStorage
  directly, so the backend can change later.
- **Versioned documents:** one exploration document with
  `schemaVersion`, migrated on load. An unknown future version is never
  overwritten.
- **Large conversations:** messages are stored in **chunks** under
  separate keys, with an index. Chunk size and the total cap stay within
  Android's default storage limits and per-entry limits. *Exact sizes
  are set during M1 implementation.* When near the cap, the oldest
  messages are trimmed with the notice in §3.5. Trip facts and details
  are never trimmed.
- **Android backups:** exploration data is excluded from Android backups.
  *Mechanism (app-wide `allowBackup: false` vs. scoped backup rules) is
  an implementation detail for M1.*
- **No application-level encryption** for ordinary trip-planning
  information in v1.
- **Deletion:** "Delete this exploration" removes every key the store
  owns, including chunks and index, and is verified to leave nothing.
- **Web:** a short **shared-device notice** when an exploration starts
  on web ("This plan is saved in this browser. On a shared computer,
  delete it when you're done."), plus the same delete control.

**Residual security considerations (accepted for v1, documented):**

| Risk | Why it remains | Mitigation |
| --- | --- | --- |
| **iOS device and iCloud backups** may include exploration data | AsyncStorage doesn't expose iOS backup exclusion; excluding would need native code | Minimization (§5), with practical needs rather than diagnoses in trip details; delete control. **Accepted for prototype development only (T17); a privacy and backup review is a launch gate (§14)** |
| **Web browser storage is unencrypted** and readable by any script on the app's origin | Platform property | Shared-device notice; delete control; strict script policy on the web build (implementation detail) |
| **Rooted or jailbroken devices** can read app storage | No app-level encryption | Minimization; accepted for ordinary trip-planning data |
| **Conversation text keeps the traveler's raw words**, including any medical mention | Needed for continuity | Trip details store practical needs, not diagnoses; conversation is deletable; the privacy page explains this |

---

## 4. Research and claim verification

### 4.1 Architecture (designed now)

- `research(query, claimType) → SourceDocument[]`. Providers plug in
  (T6).
- Queries are built from **destination, topic, and timeframe only**.
  Never names, family details, or health details.

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
  claim: string;
  claimType: 'closure' | 'hours' | 'price' | 'event_date' | 'seasonal_pattern'
           | 'crowd_pattern' | 'distance_time' | 'policy' | 'general';
  appliesTo: { place: string; dates?: DateValue };
  support: { sourceId: string; excerpt: string }[];
  relevance: 'direct' | 'partial' | 'none';
  freshness: 'current' | 'stale' | 'unknown';
  reliability: 'sufficient' | 'insufficient';
  conflicts: { sourceId: string; excerpt: string }[];
  verdict: 'verified' | 'unconfirmed' | 'conflicting' | 'unsupported';
  uncertaintyNote?: string;
};
```

### 4.2 Verification rules

A claim is **verified** only if **all** of these hold:

1. **Relevance:** an excerpt directly supports this exact claim, for
   this place and timeframe. Numbers, dates, and names match. Each part
   of a compound claim is supported.
2. **Freshness:** current enough for the claim type, and applicable to
   the trip's dates (T6 windows).
3. **Reliability:** the publisher type fits the claim type. Official or
   primary operator for closures, hours, prices, policies, and event
   dates; reputable editorial is acceptable for patterns.
   User-generated content never verifies a claim alone (T6 matrix).
4. **No unresolved conflict:** disagreement between reliable sources
   means **conflicting**, stated plainly.

Otherwise:

| Verdict | Shown as |
| --- | --- |
| verified | **Verified fact**: publisher, date, and viewable excerpt |
| unconfirmed / conflicting | **Estimate** with an uncertainty note, attributed where helpful |
| unsupported | Removed, or rewritten as an estimate or inspiration |

**Predictions are never verified facts.** Historical patterns can be
verified as patterns, but their future application stays an estimate.
*How relevance is checked is unresolved (T13).*

### 4.3 Claim labels

| Label | Meaning | Example |
| --- | --- | --- |
| **Inspiration** | An idea, not a claim | "A cabin with a view could make mornings special." |
| **Estimate** | Approximate, unconfirmed, or a prediction | "About a 4-hour drive." |
| **Verified fact** | Passed §4.2 | "Roads into the park can close for ice in winter (National Park Service, updated Oct 2026, checked Nov 7)." |

### 4.4 Staged activation

| Stage | What's live | Ships with |
| --- | --- | --- |
| **R0** | Interfaces, claim checks, labels, and UI. No retrieval | M2 |
| **R1** | First live provider; claim-level verification for official and primary sources | M4 |
| **R2** | Broader sources, corroboration, caching | M4+ |

---

## 5. Privacy

Three separate policies, each explained in plain language on a privacy
page, with a one- or two-sentence summary before the first planning
message.

### 5.1 Collection: what we ask for and accept

| | Anonymous | Account |
| --- | --- | --- |
| **We ask for** | Only what changes a suggestion: rough party (ages, roles), timing, interests, practical needs | Same, plus email for sign-in |
| **We never ask for** | Full names, birthdates, exact addresses, medical diagnoses, government IDs, payment details | Same |
| **We accept if volunteered** | Anything the traveler writes. Health mentions are recorded in trip details as practical needs, not conditions | Same |

### 5.2 Retention: what's kept, where, for how long

| Data | Anonymous | Account |
| --- | --- | --- |
| Conversation | On this device until deleted or uninstalled | Until the user deletes it (hard delete) |
| Trip facts and details | On this device until deleted | Until the trip is deleted |
| Names and nicknames (§5.4) | On this device only | In the account only |
| Family Memory | None | Until the user edits or deletes it |
| Model-input snapshots (audit) | *T2* | *T10* |
| Backups | Excluded on Android; iOS residual risk (§3.6) | Supabase backup retention *T10* |
| Events | None | Append-only; deletion events carry no content |

### 5.3 Transmission: what leaves the device or account

| Recipient | Sent | Never sent |
| --- | --- | --- |
| **OpenAI** (via our server) | What this turn needs: conversation excerpts, trip facts, trip details, and (account) Family Memory, after minimization and pseudonymization | **Names and nicknames** (replaced by role references), emails, account identifiers, exact addresses; health details beyond the practical need |
| **Research providers** | Destination, topic, timeframe | Anything personal or family-related |
| **Anyone else** | Nothing | No advertising, data sale, or affiliate sharing |

Provider-side retention settings are unresolved (T5).

### 5.4 Names and nicknames (T15, resolved)

**Rule: traveler names and nicknames are never intentionally sent to
external AI providers in v1.**

- Travelers may use names ("Max", "Nana"). The app keeps them where
  the traveler's data already lives (on the device, or in the account)
  so replies can feel personal.
- **Role references.** Before each model call, code replaces known names
  with role references ("child, 9", "grandparent"). After the call, code
  substitutes the names back for display.
- **Trip-scoped mapping, no member records.** The name-to-role mapping
  is part of the trip's own party fact. It's derived from how the
  traveler described the party and lives and dies with that trip.
  **No permanent family-member records** are created (ADR-002's deferral
  stands). A name in Family Memory text that isn't in the current
  trip's party becomes a generic reference ("a family member").
- **Best-effort identifying-detail check.** Before sending, code checks
  outgoing text for identifying details beyond known names: other
  likely names, email addresses, phone numbers, street addresses,
  school or employer names, and similar. It replaces or removes what it
  finds. The traveler's stored text is never altered.
- **Documented limitations** (shown in the privacy explanation, in plain
  language):
  - it can miss names it doesn't recognize: unusual spellings, names in
    other languages, nicknames never stated as names;
  - it may not recognize names that are also ordinary words ("Hope",
    "Summer");
  - it can't catch every contextual identifier (a unique job, a small
    town plus a rare detail);
  - it may sometimes remove something harmless.

  It reduces exposure. It is not a guarantee, so the privacy page says
  so.
- *Detection method and accuracy targets are a technical decision (T15
  technical, §10).*

### 5.5 Health and other sensitive details (T16, resolved)

**Rule: data minimization with decision-level relevance.**

- **Trip details record practical needs, not diagnoses** (§2.2).
- **Health-related Family Memory entries and trip details are sent only
  when relevant to a decision in play**, not on every turn.
- **Relevance is decision-level, not keyword-level.** It depends on
  what's being planned, not on whether the latest message mentions the
  topic. Examples:
  - a food allergy is relevant whenever dining, restaurants, snacks, or
    food are part of the decision, even if the latest message doesn't
    mention it;
  - a mobility need is relevant to activities, where to stay, pace, and
    getting around;
  - motion sickness is relevant to driving routes, scenic drives, boats,
    and rides.
- **Safety first:** when it's unclear whether a health detail is
  relevant to a decision with safety implications, include it.
- **Original text stays private and editable.** What's sent is the
  minimum needed. The traveler's own words are kept unchanged in their
  Family Memory or trip and can be edited at any time.
- **Never automatically promoted.** Trip health details reach Family
  Memory only through an explicit "Save for future trips" (ADR-005).
- Sensitive classification and relevance must be deterministic,
  auditable, and conservative, and must never create a stored profile.
  *Mechanism (sensitivity rules and the decision-to-topic map) is a
  technical decision (T16 technical, §10).*
- This refines the Memory v1 spec's injection rule (now v1.1, §4):
  non-sensitive memories are still sent in full.

---

## 6. Persistent data (account mode)

| Table | Purpose | Notes |
| --- | --- | --- |
| `trips` | One row per trip | Status; trip facts with considering/decided state. The party fact holds the trip-scoped name-to-role mapping (§5.4); no separate people table |
| `trip_details` | Group preferences, needs, traditions | `travelerWords` verbatim; `saved_memory_id` |
| `memories` | Family Memory | Memory v1 spec. **Engine server role: read only.** Path-3 saves set `trip_id` (ADR-005) |
| `conversations` / `conversation_messages` | Planning dialogue | Hard delete on delete |
| `recommendations` | Suggestions | §1.4 |
| `source_documents` / `claim_checks` | Research and verification | §4.1 |
| `model_inputs` | Audit snapshots (pseudonymized) | Retention T10 |
| `events` | Append-only log | §8 |

The anonymous on-device store mirrors trips, details, conversations,
suggestions, and local names. It holds no memories.

---

## 7. Interface language and visibility

- **No internal engineering terms in the UI.** Not allowed: engine,
  decision engine, trip state, conversation context, memory store,
  evidence, source record, claim check, verdict, claim label,
  confidence, category, readiness, intent, prompt, model, token, role
  reference, pseudonym, and the recommendation kind names.
- **Readiness states (open, exploring, leaning, decided) are never
  shown.** Travelers see their plan (decided facts), what they're
  considering, and the details about their group.
- Inspiration, estimates, and verified facts are clearly distinguishable
  (wording is a design task).
- User-facing names: **Family Memory**, **Save for future trips**. Other
  copy ("what you're considering", "about your group", the planning
  experience's name) is a design task.

---

## 8. Events (account mode, append-only, unprocessed in v1)

| event_type | payload |
| --- | --- |
| `planning_message_sent` | conversation_id, message_id |
| `engine_turn_completed` | model_inputs_id, recommendation_ids, readiness_snapshot, research_stage, latency_ms |
| `engine_validation_failed` | model_inputs_id, failed_rules |
| `recommendation_accepted` / `recommendation_dismissed` | recommendation_id, kind, confidence |
| `trip_fact_decided` / `trip_fact_undone` | trip_id, fact, via |
| `claim_checked` | claim_check_id, claim_type, verdict |
| `memory_created` | memory_id, content, trip_id, **entry_point** (`family_memory` / `remember_this` / `trip_detail`) |
| `exploration_transferred` | trip_id (no content) |
| `conversation_deleted` | conversation_id (no content) |

**Nothing reads events to shape advice in v1** (ADR-001).

---

## 9. Milestones

| # | Milestone | Delivers | Exit criteria |
| --- | --- | --- | --- |
| **M0** | Decisions and docs | **Done:** ADR-004 and ADR-005 accepted; ADR-001 amendment noted; Memory v1 spec v1.1; domain model v1.1 | Founder sign-off (2026-11-07) |
| **M1** | Local exploration | AsyncStorage behind `ExplorationStore`; versioned, chunked documents; Android backup exclusion; delete control; web shared-device notice; prototype "About your trip" chips become trip details (no anonymous memory) | Restart restores everything; delete leaves nothing; large-conversation test passes |
| **M2** | Planning conversation | Server pipeline; OpenAI with configurable model; per-decision readiness; exploring vs. committing; trip details; minimization with decision-level health relevance; trip-scoped pseudonymization; best-effort identifying-detail check; three-policy privacy explanation, including the check's limitations; claims at R0; eval harness | Scenarios pass, except account and verified-fact steps; zero memory writes; no known names in model inputs |
| **M3** | Accounts, transfer, Family Memory | Supabase auth and RLS; transfer; Family Memory area (account-only); "Save for future trips" (ADR-005); retention and deletion | Scenario account, transfer, and save steps pass; RLS test; Memory v1 criteria 2, 4, 6, 8 |
| **M4** | Live research | R1, then R2; claim-level verification | Verified-fact criteria pass; audit finds no verified label on an unsupported claim |
| **M5** | Briefing on the engine | The briefing uses the engine; rule-based fallback | The 12 existing briefing scenarios pass |

---

## 10. Decisions

### Resolved

| # | Decision | Resolution |
| --- | --- | --- |
| **T1** | On-device storage | **Resolved.** AsyncStorage behind `ExplorationStore`; versioned, chunked documents; iOS, Android, and web; Android backup exclusion; no application-level encryption in v1; minimization; delete controls; web shared-device notice. Residual risks in §3.6. Package approved, not yet installed. |
| **T3** | Family Memory before sign-up | **Resolved.** None for anonymous travelers. Account-owned, authored after sign-up. |
| **T14** | Family Memory experience | **Resolved.** Trip details stay in their trip unless the traveler saves them, through a visible, deterministic "Save for future trips" action plus an easy-to-reach Family Memory area (§2.3). ADR-005 accepted. |
| **ADR-005** | Amendment to ADR-001 | **Accepted.** Three user-initiated write paths; AI memory suggestions remain prohibited. An amendment note was added to ADR-001. |
| **T15** | Names and nicknames | **Resolved.** Never intentionally sent to external AI providers in v1. Trip-scoped role references, with no permanent member records. Best-effort identifying-detail check with documented limitations (§5.4). |
| **T16** | Health memories and details | **Resolved.** Data minimization with decision-level relevance; never sent wholesale every turn; original text kept private and editable; never promoted automatically (§5.5). Memory v1 spec updated to v1.1. |
| **T17** | iOS backup residual risk | **Accepted for prototype development only.** Not production approval. A privacy and backup review is a launch gate (§14). |

### Needs founder input

None open at this time. ADR-004 accepted 2026-11-07.

### Unresolved technical decisions

| # | Decision | Needed by |
| --- | --- | --- |
| T2 | Anonymous server access (authentication, rate limiting) and server-side retention of anonymous turns | M2 |
| T4 | Transfer mechanics: idempotency, existing trips, local copy after success, pending save after sign-up | M3 |
| T5 | OpenAI configuration: default model, API surface, structured output, streaming, cost, provider retention | M2 |
| T6 | Research provider; reliability tiers; corroboration; freshness windows; caching | M4 (interfaces M2) |
| T7 | Intent and commitment signal definitions, ambiguous agreement, undo window | M2 |
| T8 | Long conversations vs. "no hidden summaries" and context limits | M2 |
| T9 | Minimization rules per turn, and tests | M2 |
| T10 | Deletion cascade, backup and snapshot retention, export | M3 |
| T11 | Eval harness: judging, where it runs, merge gating | M2 |
| T12 | Shared code between `mobile/` and the server (ADR-003 record) | M2 |
| T13 | Detecting relevance, time-sensitive claims, internal terms, and memory-proposal language; error rates | M2 |
| T15-tech | Identifying-detail check: detection method (rules, a local model, or both), accuracy targets, test set, re-substitution reliability, and how the party mapping is parsed from the traveler's words | M2 |
| T16-tech | Health sensitivity rules (how a memory or detail is recognized as health-related, conservatively, without a stored profile) and the decision-to-topic relevance map | M2 |

---

## 11. Domain model changes (applied in [domain model v1.1](01-domain-model.md))

- **Trip:** facts are *considering* or *decided*. Add trip details.
  Status lifecycle: planning → booked → active → complete.
- **New: Trip detail.** A preference, need, or tradition about the
  group, in the traveler's words, scoped to one trip.
- **New: Conversation**, **Exploration** (anonymous, on device, no
  Family Memory), **Source document**, **Claim check**.
- **Memory:** account-only, authored by the traveler. Three write paths
  per ADR-001 as amended by ADR-005.
- **Party** (within Trip): may hold a trip-scoped name-to-role mapping.
  This is not a Member entity (ADR-002).
- **Recommendation:** gains decision, reason, kind, confidence, claims,
  citations, and status.

---

## 12. Acceptance criteria

1. A trip can exist with an unknown destination and unknown dates.
2. Mode is chosen per decision from intent and readiness. Mixed-mode
   replies occur. Readiness states never appear in the UI.
3. ≤1 question per turn. Known facts are never asked again.
4. Budget is never the first question.
5. Only explicit commitments create decided facts, with an inline
   acknowledgement and undo or a tap. Enthusiasm and casual agreement
   never do. ≤1 inline option per reply, not repeated.
6. Claims are labeled. Verified claims pass §4.2. Predictions are never
   verified.
7. The engine cannot write Family Memory. No AI output proposes,
   drafts, or highlights a memory.
8. Trip details are used in their trip and never shape another trip
   unless saved.
9. "Save for future trips" (ADR-005) appears visibly, in a consistent
   place, on every eligible traveler-stated detail by a fixed rule. It
   is never in the conversation, opens a sheet pre-filled with the
   traveler's words, and saves only on Save.
10. Anonymous travelers: no Family Memory. A save action explains that
    an account is needed, and "Not now" returns them without further
    prompts.
11. The Family Memory area is one tap from home, and supports add, edit,
    and delete.
12. Anonymous explorations survive restarts. Delete leaves nothing. A
    large conversation doesn't break storage. Web shows the
    shared-device notice.
13. Transfer yields exactly one trip and conversation, and creates no
    Family Memory.
14. No known names or nicknames, emails, or account identifiers in model
    inputs. The identifying-detail check runs on every outgoing request.
    No family details in research queries. Trip details record practical
    needs, not diagnoses.
15. Health-related memories and details are sent only when relevant to a
    decision in play (e.g. an allergy during dining decisions, even if
    unmentioned), and are absent otherwise. They are never promoted to
    Family Memory without an explicit save.
16. No internal terms in user-facing text.
17. Both acceptance scenarios pass.

---

## 13. Out of scope for v1

Bookings and payments; inventory prices; affiliate links; real-time
in-trip guidance; multi-destination routing; shared trips; learning
from behavior; AI memory suggestions; anonymous Family Memory;
permanent family-member records; application-level local encryption;
push notifications.

---

## 14. Launch gates (before any public release)

Prototype development may proceed without these. Public launch may not.

1. **Privacy and backup review (T17).** A specific review of local
   storage exposure, including iOS device and iCloud backups, Android
   backup exclusion, web storage, and whether native backup exclusion or
   encryption is required. **Accepting the residual risk for prototype
   development is not production approval.**
2. **Privacy policy published** covering the three policies (§5.1–5.3),
   including the documented limitations of the identifying-detail check.
3. **Provider retention settings confirmed** for OpenAI and research
   providers (T5, T6).
4. **Deletion and backup retention verified** end to end (T10).
