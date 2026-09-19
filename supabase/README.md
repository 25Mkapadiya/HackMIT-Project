# Supabase backend

This directory contains reproducible SQL migrations for the HackMIT state-research backend.

The state-research schema is state-agnostic and stores:
- `data_sources` metadata
- `research_facts` with FACT / PROXY / ESTIMATE / UNKNOWN labels
- `utilities`
- `existing_data_centers`
- `zoning_jurisdictions`
- `incentives`
- `hazards`
- persisted `scenarios` and `scenario_analyses`

Wisconsin is seeded by `20260919201500_seed_wi_research_data.sql`.

Important Wisconsin rules carried into the seed:
- substation available MW/headroom remain UNKNOWN;
- generation proximity is labeled NEARBY GENERATION, never available power;
- state/FCC broadband is a CONNECTIVITY PROXY, not proof of long-haul fiber;
- river/lake proximity does not imply water availability;
- zoning stays UNKNOWN unless researched locally;
- incentives are reported as potential incentives, never automatic eligibility.

The Wisconsin research snapshot is dated 2026-09-19.
