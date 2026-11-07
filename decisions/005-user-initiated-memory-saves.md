# Decision 005 — User-Initiated Saves to Family Memory (Amendment to ADR-001)

**Status:** Accepted
**Date:** Proposed 2026-11-07; accepted 2026-11-07
**Deciders:** Founder, Engineering
**Amends:** [001 — V1 Memory Scope](001-v1-memory-scope.md), guardrail 3 (an amendment note was added to ADR-001; its original text is preserved)
**Related:** [002](002-memory-ownership.md), [004](004-decision-engine-v1.md), [Memory v1 spec](../docs/product/03-memory-v1-spec.md)

---

## Context

Decision T14 (ADR-004): **information shared while planning a trip stays
in that trip, unless the traveler explicitly chooses to save it for
future trips.** Saving must be obvious, easy, and delightful, not buried
in settings.

ADR-001 guardrail 3 allowed two write paths, the Family Memory screen
and "Remember this," and said the app never *suggests* a memory. A
contextual "Save for future trips" action is a third path. Without care,
it could also read as a suggestion. This record amends ADR-001 narrowly
and in the open.

## The distinction this amendment rests on

| | **Allowed** | **Still prohibited** |
| --- | --- | --- |
| Who decides something might be worth remembering | **Nobody.** The action appears on *every* eligible trip detail by a fixed rule | The AI selecting, ranking, or flagging details as worth remembering |
| Where it appears | As a visible, easy-to-discover control on a trip detail the traveler stated | In conversation text ("Want me to remember that?"), notifications, banners, badges, or pop-ups |
| What gets saved | The traveler's **own words**, editable before saving | AI-drafted or AI-paraphrased memory text |
| Who starts it | The traveler taps the action | Anything that opens, highlights, or animates without the traveler's tap |
| Who approves it | The traveler, by tapping Save | Saving by default, timeouts, or opt-out flows |
| How often | Always available, never pushed | Re-showing, nudging, or counting unsaved details |

A deterministic, contextual, user-controlled save button is a **tool**.
The AI recommending what to remember is **inference**. The first is
allowed. The second remains prohibited.

## Decision

ADR-001 guardrail 3 now reads:

> **Three write paths only.** (1) The Family Memory area. (2) "Remember
> this" during a trip. (3) **"Save for future trips" on an existing trip
> detail**, under the constraints in ADR-005. The app never *suggests* a
> memory: no AI-generated memory proposals, no conversational offers to
> remember, and no selective highlighting of what to save.

### Constraints on write path 3

1. **Visible and easy to discover, never pushed.** The action is a
   clear, consistently placed control on every eligible trip detail. It
   isn't hidden behind menus or settings. It's never announced,
   animated, badged, repeated, or placed in the conversation stream.
2. **Eligibility is a fixed rule, not an AI judgment.** The action
   appears on every trip detail that is:
   - stated by the traveler (not inferred), **and**
   - of an eligible kind: a preference, a need, or a tradition about the
     group;
   - **not** destination, dates, bookings, or other logistics.

   The AI sorts trip details into kinds to plan the trip. It has **no**
   signal, field, or score for "worth remembering," and it can't add or
   hide the action on an individual detail.
3. **Pre-filled with the traveler's own words.** The save sheet starts
   with the traveler's original quote, which they can edit. The AI never
   writes memory text.
4. **Explicit initiation and approval.** Nothing is saved until the
   traveler taps Save. Cancel saves nothing.
5. **Account-only.** Saving requires an account (ADR-002). For anonymous
   travelers, tapping the action explains this and offers sign-up.
   "Not now" returns them exactly where they were, with no other
   memory-related sign-up prompts.
6. **Health details are never promoted automatically.** A trip health
   detail reaches Family Memory only through this same explicit tap and
   approval. Nothing is ever saved on the traveler's behalf.
7. **Same memory, same rules.** Saved memories are ordinary Family
   Memory: `source = 'explicit'`, visible, editable, deletable, and
   counted toward the 30-memory cap. The event `memory_created` records
   `entry_point = 'trip_detail'`, and the memory's associated trip is the
   originating trip.

## Consistency with ADR-001

- The prohibition on AI-generated memory suggestions is **unchanged and
  restated**.
- Write paths: two become three.
- ADR-001's validation signals still apply. Path-3 saves count as adding
  a memory unprompted, because the traveler initiates them.
- The Memory v1 spec §3 and §5 are updated to match (version 1.1).

## Consistency with ADR-002

- **Ownership is unchanged.** Path-3 memories belong to the account.
  Anonymous travelers have no Family Memory (ADR-004, T3).
- **No member entities.** Names in memory text stay part of the
  traveler's words. Name handling for AI calls (ADR-004, T15) uses
  **trip-scoped** role references derived from the trip's own party
  description. **No permanent family-member records** are created for
  this. ADR-002's deferral of member entities stands, and ADR-002 needs
  no change.

## How we'll know it worked

- Beta families save at least one memory through path 3 without being
  prompted.
- No tester reports feeling asked or nudged to save something.
- An audit of AI outputs finds zero memory proposals or
  "worth remembering" language.
- Everything in Family Memory was written or approved verbatim by the
  traveler.

## Revisit when

- Families ask for the app to *suggest* what to save. That's inference,
  and needs a new record superseding ADR-001.
- Eligible kinds prove too broad (cluttered) or too narrow (useful
  details unsaveable).
