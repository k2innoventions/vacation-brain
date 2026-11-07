# Decision 005 — User-Initiated Saves to Family Memory (Proposed Amendment to ADR-001)

**Status:** Proposed. **Not in effect** until accepted. ADR-001 remains unchanged until then.
**Date:** 2026-11-07
**Deciders:** Founder, Engineering
**Amends (if accepted):** [001 — V1 Memory Scope](001-v1-memory-scope.md), guardrail 3
**Related:** [002](002-memory-ownership.md), [004](004-decision-engine-v1.md)

---

## Context

Decision T14 (ADR-004) chose this direction: **information shared while
planning a trip stays in that trip, unless the traveler explicitly
chooses to save it for future trips.** Saving must be obvious, easy,
and delightful, not buried in settings.

ADR-001 guardrail 3 currently says:

> **Two write paths only.** The user taps "remember this" or edits the
> family memory screen. The app never *suggests* a memory in v1 — that
> is inference's front door.

A contextual "Save for future trips" action next to a trip detail is
neither of those two paths. It could also be read as the app
"suggesting" a memory. Shipping it without amending ADR-001 would break
the record silently, so this record proposes a narrow amendment
instead.

## The distinction this amendment rests on

| | **Allowed by this amendment** | **Still prohibited** |
| --- | --- | --- |
| Who decides something might be worth remembering | **Nobody.** The action appears on *every* eligible trip detail by a fixed rule | The AI selecting, ranking, or flagging details as worth remembering |
| Where it appears | As a quiet control on a trip detail the traveler stated | In conversation text ("Want me to remember that?"), notifications, banners, badges, or pop-ups |
| What gets saved | The traveler's **own words**, which they can edit before saving | AI-drafted or AI-paraphrased memory text |
| Who starts it | The traveler taps the action | Anything that opens, highlights, or animates without the traveler's tap |
| Who approves it | The traveler, on a save sheet, by tapping Save | Saving by default, timeouts, or opt-out flows |
| How often | Always available, never pushed | Re-showing, nudging, or counting unsaved details |

**Summary:** a deterministic, contextual, user-controlled save button
on an existing trip detail is a *tool*. The AI recommending what should
be remembered is *inference*. This amendment allows the first and keeps
the prohibition on the second.

## Proposed amendment

If accepted, ADR-001 guardrail 3 would read:

> **Three write paths only.** (1) The Family Memory area. (2) "Remember
> this" during a trip. (3) **"Save for future trips" on an existing
> trip detail**, under the constraints in ADR-005. The app never
> *suggests* a memory: no AI-generated memory proposals, no
> conversational offers to remember, and no selective highlighting of
> what to save.

### Constraints on write path 3

1. **Eligibility is a fixed rule, not an AI judgment.** The action
   appears on every trip detail that is:
   - stated by the traveler (not inferred), **and**
   - of an eligible kind: a preference, a need, or a tradition about the
     group;
   - **not** destination, dates, bookings, or other logistics.

   The AI already sorts trip details into kinds to plan the trip (ADR-004
   § trip facts). It has **no** signal, field, or score for "worth
   remembering," and it can't add or hide the action on an individual
   detail.
2. **Pre-filled with the traveler's own words.** Each trip detail keeps
   the traveler's original quote. The save sheet starts with that quote,
   and the traveler can edit it. The AI never writes memory text.
3. **Explicit initiation and approval.** Tapping the action opens a
   save sheet. Nothing is saved until the traveler taps Save. Cancel
   saves nothing.
4. **Passive placement.** The action sits with the trip detail on the
   trip screen. It never appears in the conversation stream, and is
   never announced, animated, badged, or repeated.
5. **Account-only.** Saving requires an account (ADR-002). For
   anonymous travelers, tapping the action explains that and offers
   sign-up, with "Not now" returning them exactly where they were. There
   is no other sign-up prompt tied to memory.
6. **Same memory, same rules.** A memory saved this way is an ordinary
   Family Memory: `source = 'explicit'`, visible in the Family Memory
   area, editable, deletable, and counted toward the 30-memory cap. The
   event `memory_created` records `entry_point = 'trip_detail'`.

## Implications

### For ADR-001

- The prohibition on AI-generated memory suggestions is **unchanged and
  restated**.
- The count of write paths changes from two to three.
- The validation signals in ADR-001 still apply. Saves through path 3
  count as "adds a memory unprompted," because the traveler initiates
  them.
- The Memory v1 spec (`docs/product/03-memory-v1-spec.md`) §3 and §5
  would need a matching update **after** acceptance. It is not edited
  now.

### For ADR-002

- **Ownership is unchanged:** memories saved through path 3 belong to
  the account.
- **Anonymous travelers have no Family Memory** (ADR-004, T3). The path
  works only after sign-up.
- **Names inside memories.** Travelers may write names ("Max loves
  waterslides"). ADR-002 keeps members as descriptions inside memories,
  not entities. The new privacy rule (names are not automatically sent
  to external AI services; ADR-004) means memory text may need name
  handling before model calls. Any approach that keeps a mapping from
  names to roles starts to look like the member records ADR-002
  deferred. **That needs a decision** (spec §10, T15) and possibly a
  revision to ADR-002.
- The `associated trip` field in the memory record is populated with
  the originating trip for path-3 saves.

## How we'll know it worked

- Beta families save at least one memory through path 3 without being
  prompted.
- No tester reports feeling asked or nudged to save something.
- An audit of AI outputs finds zero memory proposals or
  "worth remembering" language.
- Everything in Family Memory was written or approved verbatim by the
  traveler.

## Revisit when

- Families ask for the app to *suggest* what to save. That would be
  inference and needs a new record superseding ADR-001.
- Eligible kinds prove too broad (cluttered) or too narrow (useful
  details unsaveable).
