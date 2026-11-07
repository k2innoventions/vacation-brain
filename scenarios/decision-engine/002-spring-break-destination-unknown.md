# Decision Engine Scenario 002 — Spring Break, Destination Unknown

## Purpose

Validate **dream first** when the traveler is truly open, a shift into
narrowing as intent changes (still exploring, not committing), budget
raised naturally, lightweight commitment, claim-level verification with
stale and conflicting sources, anonymous restoration and deletion, and
transfer into an account with no Family Memory carried over.

---

## Starting State

- Not signed in. No saved trip. No Family Memory (anonymous).
- Research at stage R0 unless noted.

## Source Fixtures (test data, not real-world claims; used in Phase E)

| Id | Publisher type | Updated | Excerpt |
| --- | --- | --- | --- |
| S1 | editorial (travel magazine) | 2026-02-10 | "Beach Town B draws large college spring break crowds in mid-March." |
| S2 | editorial (local news) | 2026-03-20 | "This year's spring break crowds in Beach Town B were noticeably smaller than usual." |
| S3 | official (state tourism) | 2026-08-01 | "Atlantic water along this coast in mid-March is typically cool for swimming." |
| S4 | editorial (blog) | 2023-03-01 | "Beach Town B's kite festival is held the third weekend of March." |

No price sources exist.

---

## Phase A — Dreaming (truly open)

**Traveler:** "Spring Break with my teens. No idea where. Ideas?"

Readiness: everything **open**.

Expected:

- Inspires: **≤3 contrasting ideas** (e.g. a beach town, a mountain
  town, a city weekend), each with a short, vivid reason for a parent
  and teens. Labeled as **inspiration**; any factual aside is an
  **estimate**.
- Nothing is recorded as decided. Nothing prompts.
- **No budget question.** At most one light, open question about what
  sounds appealing.

## Phase B — Exploring with constraints (not committing)

**Traveler:** "Ooh, my 16-year-old really wants a beach. We're in
Charlotte, the kids are 13 and 16, and I'd rather not drive more than
about 6 hours. Break is March 15–19, but we could leave Friday the
12th."

Readiness: destination moves **open → leaning** (a beach, but which
one?), party **decided**, dates **considering** (window), drive limit
known.

Expected:

- Narrows **within** the beach idea: **≤3 beach destinations** within
  the drive limit, each with a reason tied to what was said. Drive times
  are **estimates**.
- Shortlist and date window are recorded as **considering**, with **no
  confirmation prompts**. Party may be acknowledged inline once.
- Asks nothing already answered.

**Traveler:** "These sound nice."

Expected:

- Vague agreement, not a commitment. Nothing becomes decided. No
  prompt.

**Traveler:** "We need to keep this pretty affordable."

Expected:

- Budget enters because the traveler raised it. It isn't asked
  separately.
- Says which options tend to be more affordable **as estimates** only.
  No prices or "deals" as fact. Suggests checking lodging for the exact
  dates.
- No memory proposal. "Affordable" stays conversation context (and trip
  context, if recorded).

## Phase C — App restart (anonymous restoration)

The traveler closes and reopens the app, still not signed in.

Expected:

- The conversation, the shortlist and window as considering, and the
  decided party are restored.
- The next turn knows the ages, the drive limit, the beach preference,
  and the budget concern, and asks for none of them.
- No Family Memory appears.

## Phase D1 — Delete (run A)

The traveler taps "Delete this exploration" and confirms.

Expected:

- All local trip and conversation data is gone. The next launch starts
  fresh with no trace of the exploration.

## Phase D2 — Sign-up and transfer (run B, alternative to D1)

From the end of Phase C, the traveler creates an account and accepts
the transfer.

Expected:

- Exactly one trip (shortlist and window as considering, party decided)
  and the full conversation. Nothing is lost and nothing is duplicated.
- **Family Memory is empty.** Beach preference and budget concern are
  not in it.

## Phase E — Choosing (account, sources S1–S4 available)

**Traveler:** "Tell me about Beach Town B. Is it a party place? Anything
fun happening while we're there?"

Expected:

- **Crowds:** S1 and S2 are both reliable editorial sources but point
  different ways. The verdict is **conflicting**. The engine says so
  plainly ("It's had a spring break party reputation, though a local
  report says crowds were smaller last year; hard to predict for
  yours"). It's **not** shown as verified in either direction.
- **Water:** "typically cool for swimming in mid-March" is a **verified
  fact** as a seasonal pattern (S3: official, current), with no exact
  temperatures invented.
- **Kite festival:** S4 is from 2023 and is a blog. That's stale and
  insufficient for an event date, so this **can't be verified**. At
  most: "There's been a kite festival in past years; worth checking
  whether it's on this year."

**Traveler:** "Let's go with Beach Town B, leaving Saturday the 13th and
back the 19th."

Expected:

- Destination and dates become **decided** from the traveler's words.
  **One** combined inline acknowledgement with undo. **No confirmation
  question.**

---

## Things That Should NOT Happen

- Practical or budget questions before any inspiration in Phase A.
- Treating "beach" or "These sound nice" as choosing a destination.
- Confirmation prompts for considering-state changes (shortlist, window).
- A confirmation *question* after an explicit decision, or separate
  acknowledgements for destination and dates.
- More than 3 ideas or destinations at once. Options beyond the drive
  limit (unless flying comes up).
- Prices, availability, or "cheap" presented as fact.
- Re-asking for ages, home city, drive limit, dates, beach preference,
  or budget.
- Any memory proposal. Any Family Memory before sign-up, or created by
  the engine or the transfer.
- A **verified** label on the crowd claim (conflicting), the festival
  date (stale and insufficient), or any prediction.
- Any trace of the exploration after deletion (run A).
- Internal terms in the UI. Names, emails, or account identifiers in
  model inputs. Family details in research queries.

## Pass / Fail Criteria

1. Phase A inspires first: ≤3 contrasting ideas, labeled as inspiration, with no budget question. **Required.**
2. Phase B narrows within the beach idea while the destination stays leaning. Shortlist and window are considering, without prompts. **Required.**
3. Vague agreement never creates a decided fact. The explicit decision creates one combined acknowledgement with undo and no question. **Required.**
4. ≤1 question per turn. Nothing provided is asked again. **Required.**
5. Budget is handled when the traveler raises it, as estimates only. **Required.**
6. Restart restores everything. Delete (run A) removes all local data. **Required.**
7. Transfer (run B) yields exactly one trip and conversation, and Family Memory is empty. No Family Memory while anonymous. **Required.**
8. Verification: crowds shown as conflicting; water verified as a seasonal pattern; festival date not verified (stale and unreliable). **Required.**
9. No internal terms in user-facing text. Minimization rules are met. **Required.**
