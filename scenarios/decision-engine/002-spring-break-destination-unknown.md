# Decision Engine Scenario 002 — Spring Break, Destination Unknown

## Purpose

Validate **dream first** when the traveler is open, and narrowing as
intent changes, where enthusiasm is not commitment. Also validates
budget raised naturally, trip details that stay in their trip, the save
action (ADR-005) used selectively by the traveler, claim-level
verification with stale and conflicting sources, the web shared-device
notice, anonymous restoration and deletion, and transfer.

---

## Starting State

- Not signed in, **on the web**. No saved trip. No Family Memory
  (anonymous).
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

## Phase A — Dreaming (truly open, on the web)

When the exploration starts, the app shows the **shared-device notice**
once ("This plan is saved in this browser…"), without blocking typing.

**Traveler:** "Spring Break with my teens. No idea where. Ideas?"

Expected:

- Inspires: **≤3 contrasting ideas**, each with a vivid reason, labeled
  as inspiration.
- Nothing decided, nothing prompted, **no budget question**, and no
  offer to save anything.

## Phase B — Exploring with constraints

**Traveler:** "Ooh, my 16-year-old really wants a beach. We're in
Charlotte, the kids are 13 and 16, and I'd rather not drive more than
about 6 hours. We want somewhere relaxed, not a party scene. Break is
March 15–19, but we could leave Friday the 12th."

Internal readiness (never shown): destination **leaning** (a beach,
which one?), party **decided**, dates **leaning**.

Expected:

- Narrows within the beach idea: **≤3 beach destinations** within the
  drive limit, with reasons. Drive times are estimates.
- Shortlist and window recorded as considering, **without prompts**.
  The party is acknowledged inline once.
- **Trip details:**
  - "16-year-old really wants a beach" (`preference`);
  - "relaxed, not a party scene" (`preference`).

  Each shows a quiet "Save for future trips" action on the trip screen,
  never in the conversation.

**Traveler:** "Yes!! These all sound perfect!"

Expected:

- Enthusiasm, **not commitment.** Nothing becomes decided.

**Traveler:** "We need to keep this pretty affordable."

Expected:

- Budget enters because the traveler raised it. Affordability is
  covered only as **estimates**. No prices or deals as fact.
- No memory proposal.

## Phase C — Restart (anonymous restoration)

The traveler closes and reopens the browser tab.

Expected:

- The conversation, the shortlist and window (considering), the decided
  party, and all trip details are restored. Nothing is re-asked.
- The shared-device notice and the delete control are available.

## Phase D1 — Delete (run A)

The traveler taps "Delete this exploration" and confirms.

Expected:

- All stored data for the exploration (including message chunks and the
  index) is gone. Reloading starts fresh.

## Phase D2 — Sign-up, transfer, and a selective save (run B)

From the end of Phase C, the traveler creates an account and accepts
the transfer.

Expected:

- Exactly one trip, its details, and the full conversation. Nothing
  lost, nothing duplicated. **Family Memory is empty.**

The traveler then taps **"Save for future trips"** on "relaxed, not a
party scene," edits the text to "We like relaxed places, not party
scenes," and taps **Save**.

Expected:

- One Family Memory entry, in the traveler's edited words.
- "16-year-old really wants a beach" is **not** saved. It stays a trip
  detail of this trip only.
- No AI message reacts by suggesting other things to save.

## Phase E — Choosing (account, S1–S4 available)

**Traveler:** "Tell me about Beach Town B. Is it a party place? Anything
fun happening while we're there?"

Expected:

- **Crowds:** S1 and S2 conflict. Shown as **conflicting** in plain
  language, not verified. The saved Family Memory about relaxed places
  is cited naturally.
- **Water:** "typically cool for swimming in mid-March" is **verified**
  as a seasonal pattern (S3).
- **Kite festival:** S4 is stale and a blog, so it's **not verified**.
  At most: "There's been one in past years; worth checking for this
  year."

**Traveler:** "Let's go with Beach Town B, leaving Saturday the 13th and
back the 19th."

Expected:

- Destination and dates are decided from the explicit commitment, with
  **one** combined inline acknowledgement and undo. No question.

---

## Things That Should NOT Happen

- Practical or budget questions before inspiration in Phase A.
- "Yes!! These all sound perfect!" or "beach" creating a decided
  destination.
- Confirmation prompts for considering-state changes. A question after
  an explicit decision.
- More than 3 ideas or destinations at once. Options beyond the drive
  limit.
- Prices or "cheap" as fact. Re-asking anything provided.
- **AI-generated memory proposals** of any kind. Save actions appearing
  in the conversation. Anything saved without the traveler tapping Save.
- Unsaved trip details (the beach preference) influencing a different
  trip.
- A verified label on the crowd claim, the festival date, or any
  prediction.
- Any trace of the exploration after deletion (run A).
- The shared-device notice missing on web, or blocking the traveler.
- Readiness states or internal terms in the UI. Family details in
  research queries.

## Pass / Fail Criteria

1. Phase A inspires first: ≤3 ideas, no budget question. **Required.**
2. Phase B narrows within the beach idea while the destination stays leaning. Considering-state changes don't prompt. **Required.**
3. Enthusiasm never creates a decided fact. An explicit decision creates one combined acknowledgement and no question. **Required.**
4. ≤1 question per turn. Nothing provided is asked again. **Required.**
5. Budget is handled when raised, as estimates only. **Required.**
6. On web: the shared-device notice is shown once, without blocking. Restart restores. Delete (run A) leaves nothing. **Required.**
7. Transfer (run B): exactly one trip, and Family Memory is empty until the traveler saves. **Required.**
8. The selective save stores only the traveler's edited words. The unsaved detail stays trip-only. No AI follow-up suggestions. **Required.**
9. Verification: crowds conflicting; water verified as a pattern; festival not verified. **Required.**
10. No AI output proposes a memory. No internal terms or readiness states in the UI. **Required.**
