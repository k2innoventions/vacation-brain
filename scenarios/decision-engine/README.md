# Decision Engine Scenarios

Behavioral specifications for Decision Engine v1
([spec](../../docs/product/04-decision-engine-v1-spec.md),
[ADR-004](../../decisions/004-decision-engine-v1.md)).

Each scenario is one eval case run in phases. Fixture trip state,
Family Memory, sources, conversation turns, and app events (restart,
delete, sign-up and transfer) go in, and the engine's output and the
stored data are judged against the pass/fail criteria. Run by hand during development;
later with an LLM judge plus deterministic checks (memory writes,
counts, citations) before any change to the engine prompt or pipeline.

All world facts in these scenarios are **test fixtures**, not
real-world claims. The engine must cite only the sources it was
given, and that rule is itself under test.

If a change and a scenario disagree, investigate which should change.
Neither is updated casually (see `scenarios/README.md`).
