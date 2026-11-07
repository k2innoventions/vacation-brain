# Domain Model

**Version:** 1.1 (updated for Decision Engine v1, 2026-11-07)

**v1.1 changes:**
- Added Account, Exploration, Conversation, Trip Fact, Trip Detail, Party, Decision Readiness, Commitment, Source Document, and Claim Check.
- Updated Trip, Memory, Context, Recommendation, Member, Traveler, and Observation with v1 rules from [ADR-001](../../decisions/001-v1-memory-scope.md) (as amended by [ADR-005](../../decisions/005-user-initiated-memory-saves.md)), [ADR-002](../../decisions/002-memory-ownership.md), and [ADR-004](../../decisions/004-decision-engine-v1.md).
- Long-term definitions are kept; v1 constraints are marked **In v1**.

---

# Purpose

This document defines the core language of the platform.

Every engineer, AI agent, database schema, API, design document, and user experience should use these terms consistently.

The goal is to eliminate ambiguity.

If a concept exists in the product, it should be defined here.

---

# Design Principles

## One concept. One name.

Avoid synonyms.

Choose a single term and use it consistently throughout the system.

Example:

✓ Trip

✗ Vacation

✗ Journey

✗ Visit

---

## Names describe meaning, not implementation.

A Traveler is a business concept.

It should exist regardless of database structure or programming language.

---

## Domain names are not always interface words.

Some domain terms are internal: Decision Readiness, Trip Fact, Claim Check, Recommendation kind, confidence. They never appear in the user interface (ADR-004). Where the product uses a different word for travelers, it's listed with the concept, for example **Memory → "Family Memory"** in the interface.

---

## The Domain Evolves

This document is expected to grow as the product matures.

It is the source of truth for the product's language.

---

# Core Concepts

## Traveler

A person using Vacation Brain.

A Traveler may:

- travel alone
- belong to multiple Travel Groups
- participate in multiple Trips
- build long-term memories over time

Long term, the Traveler is the primary owner of preferences and memories.

**In v1 (ADR-002):** memories belong to the **Account**, representing the family unit. A Traveler may also explore without an account (see Exploration).

---

## Account

A signed-in identity that owns durable data: Trips, Conversations, and Memories.

**In v1:** one account holder (typically a parent) describes the family. Memories are account-owned (ADR-002). Family Memory exists only for accounts (ADR-004, T3).

---

## Exploration

An anonymous Trip and its Conversation, kept **on the traveler's device** before they sign up.

- Survives app restarts.
- Can be deleted completely by the traveler.
- Has **no Memory** (Family Memory requires an account).
- On sign-up, the traveler is offered a transfer into their Account. Transfer moves the Conversation and Trip only and never creates Memory.

---

## Travel Group

A collection of people participating in a Trip together.

Examples:

- Solo traveler
- Couple
- Family
- Friends
- Multi-generational family
- School group

Travel Groups are dynamic.

The same Traveler may belong to different groups on different trips.

**In v1:** a Travel Group is represented by the Trip's **Party**, not by separate member records.

---

## Party

The description of who is going on a Trip: roles, ages, and how the traveler refers to them ("2 adults, Max (9), Lily (6), Nana").

- Scoped to one Trip.
- May hold a **trip-scoped mapping from names to roles** ("Max" → "child, 9"). This lets names stay on the device or in the account while only role references are sent to external AI providers (ADR-004, T15).
- **Not a Member entity.** No permanent family-member records are created (ADR-002).

---

## Member

An individual participant within a Travel Group.

A Member may or may not have their own account.

Examples:

- Child
- Grandparent
- Friend
- Guest

Members may have:

- age
- mobility
- dietary restrictions
- interests
- accessibility needs

**In v1 (ADR-002):** Members are **not entities**. They exist only as descriptions in the Party, Trip Details, and Memory text.

---

## Trip

A bounded travel experience.

A Trip has:

- destination(s)
- dates
- a Party (its travel group)
- goals
- reservations
- Trip Details
- a status: planning → booked → active → complete

A Trip may begin with **no destination and no dates**. They are Trip Facts that can be considering or decided.

A Trip is temporary.

Memories are permanent.

**In v1:** anything shared while planning a Trip **stays in that Trip** unless the traveler explicitly saves it for future trips (ADR-005).

---

## Trip Fact

A planning decision recorded on a Trip: destination, dates, party, where to stay. Each has a state:

- **Considering:** options the traveler is exploring (a shortlist, a date window). Recorded quietly. Never drives briefings.
- **Decided:** set **only by an explicit Commitment**. Drives briefings and reminders.

Briefings require a decided destination and decided exact dates.

---

## Trip Detail

Something the traveler shared about their group for this Trip: a **preference** ("Max loves animals"), a **need** ("short, flat walks only"), a **tradition**, or party or logistics information.

- Kept with the traveler's **original words**.
- Used for **this Trip only**.
- Health-related details record the **practical need**, not a diagnosis.
- Eligible details (preferences, needs, traditions) show a **"Save for future trips"** action. Saving creates a Memory only when the traveler taps it and approves (ADR-005).

---

## Destination

A place being visited.

Examples:

- Walt Disney World
- Gatlinburg
- Outer Banks
- Paris
- Tokyo

A Trip may contain multiple Destinations. **In v1:** one chosen Destination, or a shortlist of up to three while considering.

---

## Experience

Anything a traveler intentionally participates in.

Examples:

- Attraction
- Restaurant
- Show
- Resort stay
- Pool afternoon
- Parade
- Walking trail
- Boat ride

Experiences create memories.

---

## Reservation

A scheduled commitment.

Examples:

- Hotel booking
- Dining reservation
- Flight
- Cruise
- Event ticket
- Tour

Reservations influence recommendations.

---

## Goal

A desired outcome for a Trip.

Examples:

- Relax
- Celebrate
- Ride everything
- Eat amazing food
- Stay under budget
- Experience new things

Goals influence planning.

---

## Conversation

The planning dialogue for one Trip, between the traveler and Vacation Brain.

- It is **context, not memory**.
- Used within its own Trip only.
- Retained on the device (Exploration) or in the Account until the traveler deletes it.
- The engine never derives hidden summaries or profiles from it (ADR-001).

---

## Decision Readiness *(internal)*

How ready the traveler is to decide each part of a Trip: **open → exploring → leaning → decided**.

- Determined per decision (destination, dates, party, where to stay, what to do, pace) from the traveler's intent, not from whether a constraint exists.
- Drives whether Vacation Brain inspires (open, exploring) or narrows (leaning).
- **Never shown to travelers.**

---

## Commitment

An explicit decision by the traveler, in their own words ("Let's do Dec 27–31") or by tapping a choice.

- The only way a Trip Fact becomes decided.
- Enthusiasm or casual agreement ("love it!", "sounds great") is **not** a Commitment.
- Acknowledged lightly, with undo, and no confirmation question.

---

## Observation

Raw information collected by the Intelligence.

Examples:

- User selected a restaurant.
- User ignored a recommendation.
- User walked 11 miles.
- User skipped fireworks.

Long term, Observations may become memories.

**In v1 (ADR-001):** Observations are logged as append-only events and **never** become memories. Nothing reads them to shape advice.

---

## Memory

Persistent knowledge retained across Trips. Interface name: **Family Memory**.

Memories improve future recommendations.

Memory Types are defined in:

`intelligence/02-memory-model.md`

**In v1 (ADR-001 as amended by ADR-005; ADR-002; Memory v1 spec v1.1):**

- Owned by the **Account**. Explorations have none.
- **Authored only by the traveler**, through three write paths: the Family Memory area, "Remember this," and "Save for future trips" on a Trip Detail.
- Never suggested, drafted, or selected by AI. Never created automatically, including from health details or during transfer.
- Visible, editable, and deletable. Capped at 30.
- When sent to an external AI provider: names become role references, and health-related memories are included only when relevant to a decision in play. The original text stays unchanged for the traveler.

---

## Recommendation

Advice generated by the Intelligence. Interface word: a **suggestion**.

A Recommendation is not an itinerary.

It represents the best next suggestion based on the available context.

Recommendations always include a reason.

**In v1:** each Recommendation serves one decision, has an internal kind (action, delay, avoid, discover) and confidence, labels its claims (inspiration, estimate, verified fact), cites the Memories and Trip Details that shaped it, and is accepted or dismissed by the traveler.

---

## Source Document

A retrieved source of world information: publisher, publisher type, URL (never generated), and dates.

---

## Claim Check

The verification of **one specific claim** shown to a traveler, against Source Documents. It covers:

- **relevance:** does an excerpt support this exact claim, place, and time?
- **freshness**
- **reliability** for the claim type
- **conflicts**

The verdict decides whether the claim is shown as a **verified fact** or an **estimate** with stated uncertainty. Predictions are never verified facts.

---

## Briefing

A proactive summary generated for the traveler.

Examples:

- Morning briefing
- Travel day briefing
- Park day briefing
- Weather briefing

A Briefing combines multiple Recommendations into a coherent narrative. It uses decided Trip Facts only.

---

## Context

Everything currently known that may influence decisions.

Examples:

- Time
- Location
- Weather
- Wait times
- Energy
- Upcoming reservations
- Active goals
- Current travel group

Context is temporary.

Memories persist beyond context.

**In v1, three separate layers (ADR-004):**

1. **Conversation**: what was said in this Trip's planning dialogue.
2. **Trip state**: this Trip's Facts and Details.
3. **Memory**: account-owned, traveler-authored, read-only to the engine.

They are stored, scoped, and governed separately.

---

## Intelligence

The reasoning system responsible for:

- understanding
- remembering
- recommending
- learning

The Intelligence is implementation-independent.

It is defined by the documents in the `intelligence/` directory.

**In v1:** the reasoning layer is called the **Decision Engine** internally (ADR-004). It reads Memory and never writes it. "Engine" never appears in the interface.

---

# Relationships

## Long term

Traveler
↓
belongs to
↓
Travel Group
↓
takes
↓
Trip
↓
contains
↓
Destination
↓
contains
↓
Experiences
↓
create
↓
Observations
↓
become
↓
Memories
↓
improve
↓
Recommendations
↓
assembled into
↓
Briefings

## In v1

```
Account ──owns──▶ Memory (Family Memory; traveler-authored only)
   │                 ▲
   │                 │ "Save for future trips" (traveler taps + approves)
   └──owns──▶ Trip ──has──▶ Trip Facts (considering / decided ← Commitment)
                │   ──has──▶ Party (trip-scoped name→role mapping)
                │   ──has──▶ Trip Details (traveler's words; this trip only)
                └──has──▶ Conversation (context, not memory)

Exploration (device, no account) = Trip + Conversation, no Memory
   └── transfer on sign-up ──▶ Account (Trip + Conversation only)

Conversation + Trip state + Memory ──read by──▶ Decision Engine
   ──produces──▶ Recommendations (claims checked by Claim Checks against Source Documents)
Observations ──logged as──▶ events (never become Memory in v1)
```

---

# Naming Conventions

Use singular nouns for entities.

Examples:

Traveler

Trip

Experience

Recommendation

Avoid abbreviations.

Avoid synonyms.

Choose clarity over brevity.

---

# Future Concepts

The following concepts are expected but not yet defined:

- Packing List
- Budget
- Transportation
- Weather Event
- Companion
- Notification
- Celebration
- Achievement
- Story
- Household (a durable family unit distinct from a Trip's Party; deferred by ADR-002)

These will be added as the platform evolves.

---

# Related Documents

- [intelligence/01-decision-framework.md](../../intelligence/01-decision-framework.md)
- [intelligence/02-memory-model.md](../../intelligence/02-memory-model.md)
- [intelligence/02-memory-engine.md](../../intelligence/02-memory-engine.md)
- [docs/product/02-user-journey.md](02-user-journey.md)
- [docs/product/03-memory-v1-spec.md](03-memory-v1-spec.md)
- [docs/product/04-decision-engine-v1-spec.md](04-decision-engine-v1-spec.md)
- [decisions/](../../decisions/README.md)
