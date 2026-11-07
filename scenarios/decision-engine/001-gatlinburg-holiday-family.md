# Decision Engine Scenario 001 — Gatlinburg Holiday Family

## Purpose

Validate that the engine **plans** when the traveler already gives
practical constraints. It understands trip facts conversationally
without re-asking, keeps conversation, trip state, and Family Memory
separate, restores an anonymous exploration after an app restart, and
transfers it into an account without creating memory.

---

## Starting State

- Not signed in. No saved trip. Family Memory: empty.

## Source Fixtures (test data, not real-world claims)

- S1 (official, retrieved 2026-11-07): "Newfound Gap Road can close
  temporarily for snow and ice in winter."
- S2 (editorial, retrieved 2026-11-07): "Gatlinburg traffic is heaviest
  around New Year's Eve."
- S3 (official, retrieved 2026-11-07): "Roaring Fork Motor Nature Trail
  is a narrow, winding one-way road. Seasonal closure dates vary."

Phases A–C run with research at stage R0 (no live sources). Phase D
runs with S1–S3 available.

---

## Phase A — Anonymous planning

**Traveler:** "We're thinking Gatlinburg sometime between Dec 26 and
Jan 2, about 4 nights. It's me, my husband, our kids (6 and 9), and
Grandma. We'll drive up from Atlanta. Our 6-year-old gets carsick on
curvy roads, and Grandma can't do long walks."

Expected:

- **Planning mode, not dreaming.** Destination, dates, and party are
  given, so no inspiration round.
- Understands party, ages, home base, travel mode, date window,
  carsickness, and mobility. **Asks for none of them again.**
- Asks at most one question, and only if it would change the
  suggestion. Proceeding with a stated assumption is fine.
- Proposes saving the trip's consequential facts (destination, date
  window) with a confirmation. Non-consequential details (for example,
  the party description) may be saved without a prompt, subject to the
  T7 classification.
- Suggests narrowing the window (e.g. Dec 27–31, avoiding New Year's
  Eve). With R0 that's framed as an **estimate**, not a verified fact.
- Suggests going easy on winding scenic drives because of the
  carsickness, and short or seated options for Grandma. Reasons cite
  what the traveler said.
- Drive time from Atlanta, if mentioned, is labeled an **estimate**.
- **No budget question** at this point.

**Traveler:** "Oh, and Grandma loves pancakes."

Expected:

- May use it in this conversation (a pancake breakfast idea).
- **Not saved as Family Memory. No offer to remember it.**

## Phase B — App restart (anonymous restoration)

The traveler force-quits and reopens the app, still not signed in.

Expected:

- The exploration is restored: trip details and the full conversation,
  exactly as before.
- The next engine turn still knows everything from Phase A and asks for
  none of it again.
- A clear "Delete this exploration" option is available. (Its behavior
  is tested in Scenario 002; it is not used here.)

## Phase C — Sign-up and transfer

The traveler creates an account.

Expected:

- The app **offers** to move the exploration into the account. The
  traveler accepts.
- Afterward, the account has **exactly one** Gatlinburg trip and its
  full conversation. Nothing is lost and nothing is duplicated.
- **Family Memory is still empty.** Carsickness, mobility, and pancakes
  remain conversation and trip context only.

## Phase D — Account planning with Family Memory

The traveler opens Family Memory and adds, in their own words:
"We'd rather do one big thing a day than rush."

Then, in the planning conversation: "What should our days look like?"

Expected:

- Suggests at most one anchor activity per day, citing the Family
  Memory naturally.
- The winding-road suggestion now cites S3 as a **verified fact**, with
  publisher and date shown. The carsickness reason still comes from the
  conversation.
- If mountain roads come up, mentions possible winter closures (S1,
  verified) and suggests checking conditions before driving. No weather
  prediction.
- If lodging comes up, it may ask about budget naturally, as its one
  question for that turn.
- A later sign-in on a second device shows the same trip and
  conversation.

---

## Things That Should NOT Happen

- Asking again about the party, ages, home city, dates, carsickness, or
  Grandma's mobility.
- An inspiration round when the traveler has already chosen a
  destination.
- Specific prices, hours, or "open on Dec 28" claims presented as fact
  without a source.
- Long hikes or steep trails for Grandma, or winding drives without a
  caveat.
- Any memory proposal ("Want me to remember…?"), or any Family Memory
  created by the engine or by the transfer.
- Saving date or destination changes without confirmation.
- More than 3 suggestions or more than 1 question in a turn.
- Internal terms in the UI (engine, trip state, evidence, confidence…).
- Names, emails, or account identifiers in model inputs. Family details
  in research queries.

## Pass / Fail Criteria

1. Phase A goes straight to planning, without an inspiration round. **Required.**
2. No previously provided fact is asked for again, in any phase. **Required.**
3. Consequential trip changes are saved only after confirmation. **Required.**
4. After restart, the exploration and the engine's knowledge are fully restored. **Required.**
5. Transfer yields exactly one trip and conversation in the account, with no loss. **Required.**
6. Family Memory is empty after transfer. It contains only the traveler's own entry after Phase D. **Required.**
7. Claims are correctly labeled: R0 crowd and drive claims are estimates; Phase D road claims are verified, citing S1/S3 with dates. **Required.**
8. No suggestion conflicts with the mobility needs or the "one big thing a day" memory. **Required.**
9. Budget is not asked before lodging or cost becomes relevant. **Required.**
10. ≤3 suggestions and ≤1 question per turn. No internal terms in user-facing text. **Required.**
11. Model inputs and research queries meet the minimization rules. **Required.**
