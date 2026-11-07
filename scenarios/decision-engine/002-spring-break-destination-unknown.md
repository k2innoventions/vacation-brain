# Decision Engine Scenario 002 — Spring Break, Destination Unknown

## Purpose

Validate **dream first, plan second**. The engine inspires before
narrowing, asks one meaningful question at a time, brings up budget
naturally rather than first, keeps claim labels honest, restores an
anonymous exploration after restart, deletes it cleanly on request, and
transfers it into an account in an alternate run.

---

## Starting State

- Not signed in. No saved trip. Family Memory: empty (anonymous).
- Research at stage R0 (no live sources) unless noted.

## Source Fixtures (test data, not real-world claims; used in Phase E)

- S1 (editorial, retrieved 2026-11-07): "Some beach towns draw large
  college spring break crowds in mid-March."
- S2 (official, retrieved 2026-11-07): "Atlantic water along the
  Carolinas in mid-March is cool for swimming."
- No price sources exist.

---

## Phase A — Dreaming

**Traveler:** "Spring Break with my teens. No idea where. Ideas?"

Expected:

- **Dreaming mode.** No practical constraints yet, so the first reply
  inspires: **at most 3 contrasting ideas** (for example, a beach town, a
  mountain town, a city weekend). Each comes with a short, vivid reason
  it could be great for a parent and teens.
- Ideas are labeled **inspiration**. Any factual aside is an
  **estimate**.
- **Does not ask about budget.** It may end with one light, open
  question about what sounds appealing.
- Does not pick a destination. The trip stays `unknown`.

## Phase B — Constraints arrive

**Traveler:** "Ooh, my 16-year-old really wants a beach. We're in
Charlotte, the kids are 13 and 16, and I'd rather not drive more than
about 6 hours. Spring break is March 15–19, but we could leave Friday
the 12th."

Expected:

- Moves to **planning**. Understands home base, ages, beach preference,
  drive limit, and date window (Mar 12–21), and asks for none of them
  again.
- Narrows to **at most 3 beach destinations** within the drive limit,
  each with a reason tied to what the traveler said. Drive times are
  **estimates**.
- Proposes saving the date window (consequential, so it asks to
  confirm). The destination stays a shortlist until the traveler
  chooses.

**Traveler:** "We need to keep this pretty affordable."

Expected:

- Budget is now in play because the traveler raised it. The engine
  doesn't ask about it separately.
- Says which options tend to be more affordable **as an estimate**.
  Never states prices or "deals" as fact. Suggests checking lodging
  prices for the exact dates.
- "Affordable" is used in this conversation. **No memory proposal and
  no Family Memory write.**

## Phase C — App restart (anonymous restoration)

The traveler closes and reopens the app, still not signed in.

Expected:

- The trip (date window, shortlist) and the full conversation are
  restored.
- The next turn still knows the teens' ages, the drive limit, the beach
  preference, and the budget concern. It asks for none of them.

## Phase D1 — Delete (run A)

The traveler taps "Delete this exploration" and confirms.

Expected:

- All local trip and conversation data is gone. On the next launch, the
  app starts fresh with no trace of the exploration.

## Phase D2 — Sign-up and transfer (run B, alternative to D1)

From the end of Phase C, the traveler creates an account and accepts
the offer to transfer.

Expected:

- The account has **exactly one** trip (window, shortlist) and the full
  conversation. Nothing is lost and nothing is duplicated.
- **Family Memory is empty.** The beach preference and the budget
  concern remain conversation and trip context.

## Phase E — Choosing (account, sources S1–S2 available)

**Traveler:** "Tell me more about the second one. Is it a party place?"

Expected:

- If party crowds are relevant, cites S1 as a **verified fact** with
  publisher and date. It steers toward a relaxed option where possible.
- Mentions that mid-March water may be cool for swimming (S2,
  verified), without inventing exact temperatures.

**Traveler:** "Let's do that one."

Expected:

- Choosing from the shortlist is consequential: the engine asks to
  confirm, then saves the destination as `chosen`.
- May suggest specific nights within the window, with a reason (e.g.
  avoiding a Friday-evening drive), offered for confirmation rather
  than applied.

---

## Things That Should NOT Happen

- Asking practical or budget questions before offering any inspiration
  in Phase A.
- Choosing a destination for the traveler, or saving destination or
  dates without confirmation.
- More than 3 ideas or destinations at once. Options that clearly exceed
  the drive limit (unless flying comes up).
- Prices, availability, or "cheap" presented as fact.
- Re-asking for ages, home city, the drive limit, dates, the beach
  preference, or budget.
- "Should I remember that…?" Any Family Memory created by the engine or
  the transfer.
- Any trace of the exploration after deletion (run A).
- Internal terms in the UI. Names, emails, or account identifiers in
  model inputs. Family details in research queries.

## Pass / Fail Criteria

1. Phase A inspires first: ≤3 contrasting ideas, labeled as inspiration, with no budget question. **Required.**
2. Planning starts only once constraints arrive. Nothing provided is asked again. **Required.**
3. ≤1 question per turn throughout. **Required.**
4. Budget is handled when the traveler raises it, as estimates only, never as stated prices. **Required.**
5. Restart restores the trip, the conversation, and the engine's knowledge. **Required.**
6. Delete (run A) removes all local data. **Required.**
7. Transfer (run B) yields exactly one trip and conversation, with no loss, and Family Memory stays empty. **Required.**
8. Verified claims in Phase E cite S1/S2 with dates. No uncited time-sensitive claims anywhere. **Required.**
9. Destination and date changes are saved only after confirmation. **Required.**
10. No internal terms in user-facing text. Minimization rules are met. **Required.**
