# Decision Engine Scenario 001 — Gatlinburg Holiday Family

## Purpose

Validate **mixed-mode** conversation: practical where the traveler is
ready, inspiring where they're open. Also validates exploring vs.
committing without repetitive confirmations, claim-level verification
(not just attribution), anonymous restoration, and transfer into an
account where Family Memory starts empty and is authored by the
traveler.

---

## Starting State

- Not signed in. No saved trip. No Family Memory (anonymous travelers
  don't have one).

## Source Fixtures (test data, not real-world claims)

| Id | Publisher type | Updated | Excerpt |
| --- | --- | --- | --- |
| S1 | official (park service) | 2026-10-15 | "Newfound Gap Road may close temporarily during winter weather for snow and ice." |
| S2 | editorial (regional guide) | 2026-09-01 | "Historically, Gatlinburg's busiest traffic of the holiday season falls in the days around New Year's Eve." |
| S3 | official (park service) | 2026-10-15 | "Roaring Fork Motor Nature Trail is a narrow, winding, one-way road. It closes seasonally; check current dates." |
| S4 | user-generated (forum) | 2026-10-20 | "Roaring Fork is closed all of December, don't bother." |

Phases A–C run at research stage R0 (no retrieval). Phase D runs with
S1–S4 available.

---

## Phase A — Anonymous, mixed readiness

**Traveler:** "We're going to Gatlinburg over the holidays, somewhere
between Dec 26 and Jan 2, about 4 nights. It's me, my husband, our kids
(6 and 9), and Grandma, driving up from Atlanta. Our 6-year-old gets
carsick on curvy roads, and Grandma can't do long walks. No idea what
we'll actually do there."

Readiness the engine should arrive at: **destination decided** ("We're
going to Gatlinburg"), **dates leaning** (a window), **party decided**,
**what to do open**.

Expected:

- **Destination** is recorded as decided from the traveler's own words,
  with one quiet inline acknowledgement (with undo) covering
  destination and party together. **No confirmation question.**
- **Dates:** recorded as *considering* (the window), with no prompt. The
  reply is practical: it suggests that something like Dec 27–31 could
  avoid the New Year's rush. At R0 that's an **estimate**. It may
  include **one** inline option ("Go with Dec 27–31").
- **What to do:** **inspiring**, because this decision is open. A few
  contrasting possibilities suited to the family, e.g. a cozy cabin
  morning, an easy scenic overlook reachable by car, an indoor
  attraction. Reasons reflect the carsickness and Grandma's mobility.
- Asks for nothing already said. ≤1 question in total. ≤3 suggestions.
- **No budget question.**

**Traveler:** "Ooh, the cabin idea sounds nice."

Expected:

- Not a commitment. The cabin idea is noted as considering at most. No
  acknowledgement and no new option prompt. The earlier dates option
  is not repeated.

**Traveler:** "Oh, and Grandma loves pancakes."

Expected:

- May use it in this conversation. **Not saved anywhere as memory. No
  offer to remember it.** No sign-up pitch built around it.

**Traveler:** "Let's do the 27th through the 31st."

Expected:

- Dates become **decided** from the traveler's words. One inline
  acknowledgement with undo ("Dates set: Dec 27–31 · Undo"). **No
  question.**

## Phase B — App restart (anonymous restoration)

The traveler force-quits and reopens the app, still not signed in.

Expected:

- The exploration is restored exactly: the conversation, decided
  destination, party and dates, and the cabin idea as considering.
- The next turn still knows everything and asks for none of it.
- "Delete this exploration" is available. (Its behavior is tested in
  Scenario 002.)
- No Family Memory screen or entries appear for this anonymous traveler.

## Phase C — Sign-up and transfer

The traveler creates an account and accepts the offer to transfer.

Expected:

- Exactly one Gatlinburg trip and its full conversation in the account.
  Decided and considering facts are preserved, nothing is lost, and
  nothing is duplicated.
- **Family Memory exists and is empty.** Carsickness, mobility, and
  pancakes remain conversation and trip context.

## Phase D — Account planning, Family Memory, verification

The traveler opens Family Memory and writes: "We'd rather do one big
thing a day than rush."

Then: "Can we do the Roaring Fork drive? And what should our days look
like?"

Expected:

- **Days:** one anchor per day, citing the Family Memory naturally.
- **Roaring Fork:**
  - "It's a narrow, winding road" is a **verified fact** (S3: official,
    current, directly supports the claim). Combined with the carsickness
    the traveler mentioned, it leads to a gentle suggestion to skip it
    or limit it.
  - "It's closed during your dates" is **not verified**. S3 only says
    closures are seasonal; it doesn't support December. S4 is
    user-generated and can't verify on its own. The engine shows it as
    uncertain ("It may be closed in late December; worth checking
    before you go"), not as fact.
- **Mountain roads:** possible winter closures are a **verified fact**
  (S1) with an uncertainty note for their dates ("can close; check
  conditions that morning"). No weather prediction.
- **Crowds:** "historically busiest around New Year's Eve" can be
  verified *as a pattern* (S2). "Your dates will be quieter" stays an
  **estimate**.
- If lodging comes up, it may ask about budget naturally, as its one
  question for that turn.
- Signing in on a second device shows the same trip and conversation.

---

## Things That Should NOT Happen

- A confirmation question for the destination or the dates when the
  traveler stated them as decisions.
- Treating "the cabin idea sounds nice" as a commitment, or repeating
  the dates option.
- Skipping inspiration for "what to do" because other constraints were
  given.
- Re-asking for the party, ages, home city, dates, carsickness, or
  mobility.
- Any memory proposal. Any Family Memory before sign-up. Any Family
  Memory created by the engine or the transfer.
- A **verified** label on "Roaring Fork is closed in December" (S3 is
  only partially relevant; S4 is user-generated).
- Future weather or crowds presented as verified.
- More than 3 suggestions, 1 question, or 1 inline option in a turn.
- Internal terms in the UI. Names, emails, or account identifiers in
  model inputs. Family details in research queries.

## Pass / Fail Criteria

1. Phase A readiness: destination and party decided, dates leaning, activities open. The reply mixes practical and inspiring content accordingly. **Required.**
2. Commitments in words produce one inline acknowledgement with undo and no question. "Sounds nice" is not a commitment. **Required.**
3. ≤1 inline option per reply, and it isn't repeated after being ignored. **Required.**
4. No previously provided fact is asked again, in any phase. **Required.**
5. Restart restores the conversation, the decided and considering facts, and the engine's knowledge. **Required.**
6. No Family Memory while anonymous. After transfer, Family Memory is empty until the traveler writes it. **Required.**
7. Transfer yields exactly one trip and conversation, with nothing lost. **Required.**
8. Claim verification: S3's winding-road claim is verified; the December closure stays uncertain; S1 is verified with a dated uncertainty note; S2 is verified only as a historical pattern. **Required.**
9. Budget isn't asked before cost becomes relevant. **Required.**
10. No internal terms in user-facing text. Minimization rules are met. **Required.**
