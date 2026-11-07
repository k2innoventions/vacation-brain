# Memory v1 Specification — Explicit Context Persistence

**Version:** 1.1 (aligned with ADR-005 and ADR-004 T15/T16, 2026-11-07)
**Status:** Ready to build
**Governing decisions:** [ADR-001](../../decisions/001-v1-memory-scope.md) (as amended by [ADR-005](../../decisions/005-user-initiated-memory-saves.md)), [ADR-002](../../decisions/002-memory-ownership.md), [ADR-004](../../decisions/004-decision-engine-v1.md)

> **v1.1 changes:** (1) a third write path, "Save for future trips"
> (ADR-005), in §3; (2) memories sent to an external AI provider are
> minimized: names become role references (T15), and health-related
> memories are sent only when relevant to a decision in play (T16), in
> §4. Original text is always kept, unchanged, for the user.
> (3) Family Memory is account-only; anonymous travelers have none
> (ADR-004, T3).
**Data model:** `memories` table + `events` table (see Supabase schema)

---

## Framing

V1 memory is **context persistence, not inference**.

The user tells Vacation Brain what matters. Vacation Brain stores it,
shows it back, and uses it everywhere advice is generated. Nothing is
learned behind the user's back.

The long-term Memory Engine described in `intelligence/02-memory-model.md`
and `intelligence/02-memory-engine.md` is **deferred, not removed**. This
spec is the version we ship first and the foundation that engine will
later build on.

In the product this is called **Family Memory**. The word "engine" does
not appear in v1 code or UI.

---

## 1. What counts as memory in v1

A memory is a **short, durable, user-authored statement** that should
influence future advice. One sentence, roughly under 200 characters.

Qualifying examples:

- Needs and constraints: "Our youngest hates loud rides." "Grandma
  needs afternoon breaks." "Nut allergy — always check menus."
- Preferences: "We are not rope drop people." "We'd rather eat well
  than ride more."
- Traditions the user declares: "We always get Dole Whips on the
  first day."
- Durable logistics: "We never rent a car." "Naps are non-negotiable
  until 2pm."
- In-trip lessons via "remember this": "Everyone melted down after
  2pm today — plan afternoon breaks."

Every memory has exactly one author: the user. `source` is always
`explicit` in v1 (enforced by a database check constraint).

## 2. What does not count as memory yet

- **Anything the app observed or inferred.** Behavior, patterns,
  repeated choices — logged as events, never stored as memory.
- **Anything said in chat that the user didn't explicitly save.**
  Chat is a conversation, not a collection funnel.
- **Trip data.** Reservations, dates, and party description are
  *context*, stored in their own tables. Memory is what persists
  when the trip is over.
- **Briefing feedback.** Thumbs up/down is a signal (events), not
  a memory.
- **Detected rituals, confidence scores, decayed preferences.**
  Deferred per ADR-001; requires a new ADR to introduce.

## 3. How users add, edit, and delete memories

**Three write paths. Exactly three.** (ADR-001 tripwire, as amended by ADR-005)

1. **Family Memory screen** — a single scrollable list of all
   memories, newest first. Add (text field + save), edit in place,
   delete with one confirm. No categories, no folders, no tags in
   the UI.
2. **"Remember this" button** — available during an active trip
   (briefing screen and chat screen). Opens one text field, saves
   with `trip_id` set to the current trip.
3. **"Save for future trips"** (ADR-005) — a visible control on every
   eligible, traveler-stated trip detail (preference, need,
   tradition). Opens a sheet pre-filled with the traveler's own words,
   editable. Saves only when the traveler taps Save, with `trip_id`
   set to the originating trip. Never shown in the conversation and
   never chosen by AI.

All three paths require an account. Anonymous travelers have no
Family Memory (ADR-004, T3).

Rules:

- **Cap: 30 memories.** At the cap, adding prompts the user to edit
  or remove one first. The cap is a product rule (app-enforced), not
  a database constraint.
- **Delete is a hard delete.** The row is removed. The deletion event
  logs the memory `id` and `memory_type` only — **never the content**.
  When a user deletes a memory, the words are actually gone from our
  systems, not archived. This is the trust promise, kept literally.
- **Edit updates in place** (`updated_at` refreshed). No version
  history in v1.
- The `memory_type` column exists in the schema but the **UI never
  asks users to classify**. It stays null in v1.

## 4. How memories influence briefings, recommendations, and chat

One mechanism everywhere: memories are injected into every generation
prompt (briefing and chat), with **minimization** applied by code
before anything leaves our systems (v1.1):

- **Names and nicknames** are replaced with role references (T15). The
  original text is kept unchanged for the user.
- **Health-related memories** (allergies, conditions, mobility,
  medication, motion sickness and similar) are sent **only when
  relevant to a decision in play**, not on every turn (T16). Relevance
  is decision-level, not keyword-level. A food allergy is relevant
  whenever dining or food is part of what's being planned, even if the
  latest message doesn't mention it. When in doubt about safety
  relevance, include it.
- **All other memories** are injected in full. At ≤30 short entries the
  list fits, with no retrieval, ranking, or embeddings.

How health-relatedness and decision relevance are determined is a
technical decision tracked in the Decision Engine spec (§10). It must
be deterministic, auditable, and conservative, and must never create a
stored profile.

Prompt rules for the model:

1. Treat memories as facts about this family. Never contradict them.
2. When a memory shapes a recommendation, **cite it naturally**:
   "Since the kids tend to fade after 2pm, today's plan front-loads
   the must-dos." Users should be able to trace advice back to
   something they said.
3. Memories with a `trip_id` matching the current trip carry extra
   weight for that trip's advice.
4. **Never invent, assume, or extrapolate a memory** that isn't in
   the list. If the model doesn't know, it doesn't know.
5. Never mention the memory system itself unless the user asks.

The briefing's `prompt_inputs` snapshot records exactly which
memories the model saw — every piece of advice is auditable.

## 5. How to avoid creepy inference

Hard rules, enforceable in code review:

- **The app never suggests a memory.** Not in chat ("want me to
  remember that?"), not after patterns, not from reservations. The
  moment the app proposes what to remember, we've built inference's
  front door (ADR-001). The "Save for future trips" control (ADR-005)
  is not a suggestion: it appears on every eligible detail by a fixed
  rule, is never chosen or worded by AI, and saves only the traveler's
  own approved words.
- **Chat never writes to the memories table.** Only the three write
  paths do.
- **Trip health details are never promoted automatically.** They
  reach Family Memory only through an explicit save.
- **The memory list is the whole truth.** There is no hidden profile,
  no shadow context, no "we also noticed…" The user can read 100% of
  what the model is told about their family.
- **Deleted means gone** — from the table, from the next generation's
  prompt, and (content-wise) from the event log.
- **The model references only stored memories.** A briefing that
  says "you usually…" about something the user never wrote is a
  bug of the highest severity.

## 6. Events to log now (fuel for future inferred memory)

Logged to the append-only `events` table, never processed in v1:

| event_type            | payload                                        |
| --------------------- | ---------------------------------------------- |
| `memory_created`      | memory_id, content, trip_id, entry_point       |
| `memory_edited`       | memory_id, old_content, new_content            |
| `memory_deleted`      | memory_id, memory_type — **no content**        |
| `remember_this_used`  | memory_id, screen it was invoked from          |
| `briefing_feedback`   | briefing_id, thumbs                            |
| `briefing_opened`     | briefing_id, local time of open                |
| `chat_message_sent`   | message_id (content already in chat_messages)  |
| `reservation_created` | reservation_id, reservation_type               |

Edits and deletions are the highest-signal events we own: a
correction tells the future engine what mattered enough to fix.

## 7. Example user flows

**Flow A — Onboarding.** Sarah creates a trip, then lands on Family
Memory with two example placeholder hints (not pre-filled entries).
She adds: "Kids are 4 and 7." "Ben (4) is afraid of dark rides."
"We're celebrating Maya's birthday on Wednesday." Next morning her
briefing opens with the weather, flags that Space Mountain is dark
and intense for Ben, and asks nothing — but Wednesday's briefing
leads with the birthday.

**Flow B — Remember this.** Tuesday, 4pm, meltdown. Sarah taps
"Remember this" on the briefing screen: "Everyone fell apart after
2pm — we need pool breaks." Wednesday's briefing schedules the
must-dos before noon and suggests the resort pool at 1:30, citing
her own words. Sarah checks the Family Memory screen: the entry is
there, editable, hers.

**Flow C — Deletion.** After the trip, Sarah deletes "Ben is afraid
of dark rides" — he conquered Haunted Mansion. The row is gone. The
next generation prompt no longer contains it. The event log records
that memory `abc-123` (type: null) was deleted, and nothing more.

## 8. Acceptance criteria

1. All memories are visible on one screen; add, edit, and delete
   each work and are reflected in the next generated briefing and
   the next chat response.
2. `source = 'explicit'` on every row; the check constraint rejects
   anything else.
3. A memory added via "Remember this" on trip day N is referenced
   (when relevant) in the day N+1 briefing.
4. Deleting a memory removes its content from the database and from
   all subsequent prompts; the deletion event contains no content.
5. The 31st memory cannot be added; the cap UX offers edit/remove.
6. No code path outside the three write paths inserts into `memories`.
7. Grep test: generated briefings/chat never assert a family fact
   absent from `prompt_inputs`.
8. RLS: a second test account cannot read or write the first
   account's memories.

## 9. What Cursor should build first

In order, each shippable alone:

1. **`memories` table + RLS** (migration in `supabase/migrations/`).
2. **Prompt injection** — wire the memory list into the existing
   briefing walking skeleton. Proves the value before any UI exists
   (fixture memories are fine).
3. **Family Memory screen** — list, add, edit, delete, cap UX.
4. **"Remember this"** — the button on briefing/chat screens,
   writing with `trip_id`.
5. **Event logging** for the table in section 6, wired into each of
   the above as it lands.

Steps 1–2 belong in the walking-skeleton phase. A briefing that
visibly uses a fixture memory ("since Ben avoids dark rides…") is
the earliest possible proof that memory is the product.
