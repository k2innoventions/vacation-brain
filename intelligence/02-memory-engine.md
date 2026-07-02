# Memory Engine

**Version:** 1.0 (Draft)

---

# Purpose

The Memory Engine is responsible for transforming observations into meaningful, trustworthy memories.

It does not store everything.

It decides what deserves to be remembered.

Its purpose is to continuously improve future recommendations while avoiding stale, incorrect, or unnecessary information.

---

# Core Philosophy

Memory is not a database.

Memory is an evolving understanding of a traveler.

Every observation should answer one question:

> **Will remembering this improve a future experience?**

If the answer is no, the observation should not become long-term memory.

---

# Memory Lifecycle

Every observation follows the same lifecycle.

```
Observe
    ↓
Evaluate
    ↓
Store
    ↓
Use
    ↓
Strengthen
or
Weaken
    ↓
Archive or Forget
```

Not every observation survives every stage.

---

# Stage 1 — Observe

The Intelligence continuously observes signals from multiple sources.

Examples include:

* User input
* Accepted recommendations
* Rejected recommendations
* Searches
* Itinerary changes
* Walking behavior
* Dining choices
* Attraction choices
* Trip feedback
* Explicit corrections

Observations are raw signals.

They are not memories.

---

# Stage 2 — Evaluate

Every observation is scored before storage.

Evaluation considers:

## Relevance

Will this likely matter later?

## Frequency

Has this happened before?

## Confidence

Was this explicitly stated or inferred?

## Duration

Is this temporary or long-term?

## Impact

Would knowing this improve future decisions?

Only meaningful observations continue.

---

# Stage 3 — Store

Observations become one of the defined Memory Types.

Examples:

Identity

Preference

Ritual

Experience

Emotional

The Engine should avoid duplicate memories whenever possible.

Instead, existing memories should evolve.

---

# Stage 4 — Use

Memories exist to influence decisions.

Every recommendation should consider:

* Identity
* Preferences
* Rituals
* Experiences
* Emotions

The importance of each memory depends on the current context.

---

# Stage 5 — Strengthen

Memories gain confidence through repetition.

Examples:

A family chooses the same restaurant on four consecutive trips.

Confidence increases.

A traveler repeatedly ignores early morning suggestions.

Preference confidence increases.

Repeated observations become increasingly influential.

---

# Stage 6 — Weaken

Not every memory remains true forever.

Examples:

Children outgrow attractions.

Budgets change.

Food preferences evolve.

Travel styles mature.

When observations consistently contradict an existing memory, confidence should gradually decrease.

The Intelligence should adapt without becoming unstable.

---

# Stage 7 — Forget

Forgetting is intentional.

The Intelligence should remove memories that no longer provide value.

Examples include:

* Temporary interests
* Outdated assumptions
* One-time anomalies
* Incorrect inferences

The goal is not maximum recall.

The goal is accurate understanding.

---

# Memory Reinforcement

Different actions reinforce memories differently.

| Action                  | Reinforcement |
| ----------------------- | ------------- |
| Explicit confirmation   | Very High     |
| Repeated behavior       | High          |
| Accepted recommendation | Medium        |
| Single observation      | Low           |
| Inferred behavior       | Very Low      |

The Engine should favor explicit knowledge over inference whenever possible.

---

# Memory Conflict Resolution

Contradictions are expected.

Example:

Previous memory:

"Prefers rope drop."

Recent observations:

Three consecutive trips begin after 10:00 AM.

The Engine should not immediately overwrite the older memory.

Instead it should:

1. Lower confidence.
2. Gather additional evidence.
3. Update the memory once sufficient evidence exists.

Stable understanding is more valuable than reacting to every anomaly.

---

# Memory Relationships

Memories rarely exist in isolation.

Examples:

Identity influences Preferences.

Preferences reinforce Rituals.

Experiences create Emotional memories.

Emotional memories influence future Recommendations.

The Engine should treat memories as a connected graph rather than isolated records.

---

# Memory Decay

Confidence naturally decreases over time when a memory is no longer reinforced.

Different memory types decay at different rates.

Identity:

Rarely.

Preferences:

Slowly.

Rituals:

Very slowly.

Experiences:

Moderately.

Emotional memories:

Rarely, unless contradicted by repeated future experiences.

Decay prevents outdated assumptions from dominating future recommendations.

---

# Human Corrections

Explicit user corrections override inference.

If a traveler says:

"We don't like character dining anymore."

The Engine should immediately update the relevant memory.

User intent always takes precedence.

---

# Explainability

Every memory should be explainable.

The Intelligence should be able to answer:

* Why do I believe this?
* How confident am I?
* When was this learned?
* What evidence supports it?

Opaque memories reduce trust.

---

# Privacy

Users remain the owners of their memories.

The Engine should always support:

* Reviewing memories
* Editing memories
* Deleting memories
* Exporting memories

No memory should be impossible to remove.

---

# Guiding Principle

The purpose of the Memory Engine is not perfect recall.

Its purpose is to help travelers feel understood.

When a traveler says,

> "It remembered something that mattered to me."

the Memory Engine has succeeded.

## Reference Scenarios

The following scenarios demonstrate how the Memory Engine should behave in real-world situations.

See:

- scenarios/memory/ritual-emerges.md
- scenarios/memory/children-grow-up.md
- scenarios/memory/explicit-correction.md
- scenarios/memory/emotional-learning.md
