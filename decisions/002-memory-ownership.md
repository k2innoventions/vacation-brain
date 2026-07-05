# Decision 002 — Memory Ownership in V1

**Status:** Accepted
**Date:** 2026-07-04
**Deciders:** Founder, Engineering

---

## Context

The domain model says the Traveler "is the primary owner of preferences and memories." But the memory scenarios describe family-level memories ("the family always starts at Casey's Corner"), and Travel Groups are explicitly dynamic — the same Traveler belongs to different groups on different trips.

This creates an unresolved question that hits the database schema on day one: when a memory forms, does it belong to the individual Traveler, to each Member, or to some persistent family unit that the domain model does not currently define?

Getting this wrong is expensive — memory ownership is the kind of decision that is cheap to make now and painful to migrate later.

## Decision

**In v1, memories belong to the account.**

- V1 has a single account holder (typically a parent) who describes their family in plain language.
- All memories — identity facts, preferences, "remember this" moments — attach to that account, representing the family unit as a whole.
- Members (children, grandparents, guests) exist only as descriptions inside memories ("Grandma needs afternoon breaks"), not as entities that own data.
- There are no per-member accounts, no invitations, and no group membership machinery in v1.

## Why this answer

1. **It matches how v1 data arrives.** One parent tells us about the family. The natural owner of that statement is the teller's account.
2. **It defers the minor-consent problem.** Because the parent volunteers descriptions rather than the system profiling individual children, v1 avoids building per-child data records before a privacy/compliance stance exists (COPPA/GDPR-shaped questions).
3. **It keeps the schema simple without closing doors.** Memory records already carry an `associated travelers` metadata field (per Decision 001). In v1 it is unused; when traveler-level ownership arrives, it is populated rather than invented.

## Deferred (not removed)

- Traveler-level memory ownership (memories that follow a person across different Travel Groups)
- A durable "household" or "family" entity distinct from the per-trip Travel Group
- Member accounts, invitations, and consent flows for minors
- Memory visibility rules between members of a group

Before any of these ship, a privacy and data-ownership document must exist (view/correct/delete/export commitments in the Memory Model imply real compliance obligations once individual profiles exist).

## How we'll know it worked

- V1 families can express everything they need through account-level memories — watch for beta feedback like "I want my daughter to have her own profile" as the signal that traveler-level ownership is being genuinely demanded rather than speculatively designed.
- No schema migration is required when traveler-level ownership arrives — only new fields populated and new rules added.

## Revisit when

- Multi-account families appear (two parents both wanting access), or
- The same account holder runs trips with meaningfully different groups (family trip vs. friends trip) and memories start cross-contaminating recommendations.

Either signal means the household/traveler distinction has become real and this decision should be superseded.
