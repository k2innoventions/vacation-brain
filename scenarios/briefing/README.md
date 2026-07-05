# Briefing Scenarios

Behavioral specifications for the morning briefing. Each scenario is
one eval case: fixture inputs → generate a briefing → judge the output
against the pass/fail criteria.

How to use in v1:

1. Encode each scenario's family profile, memories, weather, park
   data, and reservations as a fixture `prompt_inputs` payload.
2. Generate a briefing with the current prompt.
3. Check the output against the scenario's pass/fail criteria — by
   hand during development, or with an LLM judge in CI later.
4. Run all twelve before merging any change to the briefing prompt.

All park facts in these scenarios (hours, showtimes, crowd notes) are
**test fixtures**, not real-world claims. The briefing must cite only
data it was given — that rule is itself under test in several
scenarios.

If a prompt change and a scenario disagree, investigate which should
change. Neither is updated casually. (See `scenarios/README.md`.)
