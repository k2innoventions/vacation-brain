# Decision Engine Scenario 001 — Gatlinburg Holiday Family

## Purpose

Validate **mixed-mode** conversation. Also validates explicit commitment
only (enthusiasm never commits), trip details that stay in their trip,
the user-initiated **"Save for future trips"** action (ADR-005), name
pseudonymization with the identifying-detail check (T15), health
minimization with decision-level relevance (T16), claim-level
verification, anonymous restoration, and transfer into an account with
an empty Family Memory.

---

## Starting State

- Not signed in, on a phone. No saved trip. No Family Memory (anonymous).

## Source Fixtures (test data, not real-world claims)

| Id | Publisher type | Updated | Excerpt |
| --- | --- | --- | --- |
| S1 | official (park service) | 2026-10-15 | "Newfound Gap Road may close temporarily during winter weather for snow and ice." |
| S2 | editorial (regional guide) | 2026-09-01 | "Historically, Gatlinburg's busiest traffic of the holiday season falls in the days around New Year's Eve." |
| S3 | official (park service) | 2026-10-15 | "Roaring Fork Motor Nature Trail is a narrow, winding, one-way road. It closes seasonally; check current dates." |
| S4 | user-generated (forum) | 2026-10-20 | "Roaring Fork is closed all of December, don't bother." |

Phases A–C run at research stage R0. Phase D has S1–S4 available.

---

## Phase A — Anonymous, mixed readiness

**Traveler:** "We're going to Gatlinburg over the holidays, somewhere
between Dec 26 and Jan 2, about 4 nights. It's me, my husband, our kids
Max (9) and Lily (6), and Nana, driving up from Atlanta. Lily gets
carsick on curvy roads, and Nana had knee surgery so no long walks. Max
loves anything with animals. Max's school, Oakwood Elementary, gets out
on the 19th. No idea what we'll actually do there."

Internal readiness (never shown): destination **decided**, party
**decided**, dates **leaning**, what to do **open**.

Expected:

- **One** quiet inline acknowledgement (with undo) for destination and
  party. No confirmation question.
- **Dates** recorded as considering, with no prompt. A practical
  suggestion: something like Dec 27–31 could avoid the New Year's rush
  (an **estimate** at R0), with at most one inline option.
- **What to do:** inspiring, with a few contrasting possibilities. Max's
  love of animals, Lily's carsickness, and Nana's walking limit shape
  them naturally, using their names in the reply.
- **Trip details** recorded, visible under "about your group":
  - Lily: carsick on curvy roads (`need`);
  - Nana: short, flat walks only (`need`). This is the **practical
    need**. "Knee surgery" is not stored as a trip detail; the
    traveler's words remain only in the conversation;
  - Max: loves animals (`preference`).
- **Model input** contains role references ("child, 9", "child, 6",
  "grandparent"), **not** "Max", "Lily", or "Nana". The mapping is held
  in this trip's party fact; no family-member records are created.
- **Identifying-detail check:** "Oakwood Elementary" is removed or
  replaced before the model call ("school gets out on the 19th"). The
  traveler's stored message is unchanged.
- Research queries contain no family details.
- Asks for nothing already said. ≤1 question. ≤3 suggestions. **No
  budget question.**
- The reply contains **no** offer to remember or save anything.

**Traveler:** "Love it! The cabin idea sounds amazing!"

Expected:

- Enthusiasm, **not commitment.** No decided fact, no acknowledgement,
  no new option. The earlier dates option is not repeated.

**Traveler:** "Oh, and Nana loves pancakes."

Expected:

- Used in this conversation. Recorded as a `preference` trip detail.
  **No offer to remember it.**

**The traveler taps "Save for future trips"** next to "Max loves
animals" on the trip screen.

Expected (anonymous):

- A short sheet: saving for future trips needs an account. Options:
  **Create account** and **Not now**.
- The traveler taps **Not now**. They return exactly where they were.
  No further memory or account prompts appear, then or later in this
  exploration.

**Traveler:** "Let's do the 27th through the 31st."

Expected:

- Dates are **decided** from the explicit commitment, with one inline
  acknowledgement and undo. No question.

## Phase B — App restart (anonymous restoration)

The traveler force-quits and reopens the app, still not signed in.

Expected:

- Everything is restored exactly: the conversation; decided destination,
  party, and dates; the cabin idea as considering; all trip details;
  local names.
- The next turn knows everything, asks for nothing, and still uses the
  names in replies (re-personalized after the model call).
- No Family Memory appears.

## Phase C — Sign-up and transfer

The traveler creates an account (from the home screen, not the save
sheet) and accepts the transfer.

Expected:

- Exactly one trip and conversation in the account. Facts, details, and
  names are preserved. Nothing is lost or duplicated.
- **Family Memory exists and is empty.**

## Phase D — Account: saving, Family Memory, verification

1. On the trip screen, the traveler taps **"Save for future trips"**
   next to "Lily gets carsick on curvy roads."
   - The sheet is pre-filled with the traveler's own words. They edit it
     to "Lily gets carsick on winding roads" and tap **Save**.
   - Gentle confirmation, "Saved for future trips", with a link to
     Family Memory. The detail shows a quiet "Saved" mark.
2. From home (one tap), the traveler opens Family Memory, sees that
   entry, and adds two more in their own words:
   - "We'd rather do one big thing a day than rush."
   - "Lily is allergic to peanuts and carries an EpiPen."
3. The traveler doesn't save "Nana loves pancakes." It stays a trip
   detail.

**Turn D1:** "Can we do the Roaring Fork drive?"

Expected:

- **Roaring Fork:** "narrow, winding road" is **verified** (S3). With
  Lily's saved carsickness memory, that leads to a gentle suggestion to
  skip or limit it. "Closed during your dates" is **not verified** (S3
  is only partially relevant; S4 is user-generated). It's shown as
  uncertain.
- **Mountain roads:** winter closures are **verified** (S1), with a note
  to check conditions that day. No weather prediction.
- **Health minimization:** the model input includes the carsickness
  memory (relevant to a driving decision) but **not** the peanut allergy
  (no food decision in play).
- **Model input:** names are role references ("child, 6 gets carsick on
  winding roads"). The reply shows "Lily."

**Turn D2:** "What should our days look like? And where should we eat
dinner on the 28th?"

Expected:

- **Days:** one anchor per day, citing the "one big thing" memory
  naturally.
- **Dinner:** the peanut allergy **is** in the model input, because a
  dining decision is in play, even though the message doesn't mention
  it. The suggestion advises confirming allergy handling with the
  restaurant. It never claims a place is safe without a verified
  source.
- The traveler's original memory text (including "EpiPen") stays
  unchanged and editable in Family Memory. What's sent is limited to
  what the decision needs.
- **Crowds:** verified only as a historical pattern (S2). "Your dates
  will be quieter" stays an estimate.
- **Later, a new trip** (not part of this run's pass criteria, but a
  required follow-up check): "Nana loves pancakes" and "Max loves
  animals" don't appear in its context. Lily's carsickness does,
  because it was saved.

---

## Things That Should NOT Happen

- Confirmation questions for explicit decisions.
- "Love it!" or "sounds amazing" creating a decided fact.
- Skipping inspiration for "what to do."
- Re-asking for the party, ages, home city, dates, carsickness, or
  walking limit.
- **Any AI-generated memory proposal**, offer to remember, or "worth
  saving" language. The save action appearing in the conversation, or
  appearing on only some eligible details.
- Anything saved to Family Memory without the traveler tapping Save.
- More than one account prompt after "Not now."
- "Knee surgery" stored as a trip detail.
- Names, or the school name, in model inputs. Family details in research
  queries.
- The peanut allergy sent during the driving-only turn, or missing from
  the dining turn.
- Any family-member record created to support name handling.
- A verified label on the December closure claim, or on any prediction.
- Readiness states or internal terms in the UI.

## Pass / Fail Criteria

1. Readiness is handled internally, the reply mixes modes accordingly, and no readiness state appears in the UI. **Required.**
2. Only explicit commitments create decided facts; "Love it!" does not. **Required.**
3. Trip details are recorded in the traveler's words. Health is stored as the practical need, not the diagnosis. **Required.**
4. The anonymous save tap shows the account sheet; "Not now" returns with no further prompts. **Required.**
5. Restart restores everything, including details and local names. **Required.**
6. Transfer yields exactly one trip and conversation, and an empty Family Memory. **Required.**
7. The account save action is visible on every eligible detail, never in the conversation, pre-filled with the traveler's words, editable, and saves only on Save. **Required.**
8. The Family Memory area is one tap from home, with add, edit, and delete working. **Required.**
9. No AI output proposes or highlights a memory. **Required.**
10. Model inputs contain role references, not names, using a trip-scoped mapping with no member records. Replies show names. The identifying-detail check removes the school name. **Required.**
11. Claim verification outcomes for S1–S4 are as specified. **Required.**
12. Unsaved trip details don't appear in another trip. **Required.**
13. Health relevance: the allergy is absent in D1 (driving) and present in D2 (dining) without being mentioned. The original memory text is unchanged. **Required.**
