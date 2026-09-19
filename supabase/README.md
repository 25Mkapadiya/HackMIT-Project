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
Illinois is seeded by `20260919205300_seed_il_research_data.sql`.

Important Wisconsin rules carried into the seed:
- substation available MW/headroom remain UNKNOWN;
- generation proximity is labeled NEARBY GENERATION, never available power;
- state/FCC broadband is a CONNECTIVITY PROXY, not proof of long-haul fiber;
- river/lake proximity does not imply water availability;
- zoning stays UNKNOWN unless researched locally;
- incentives are reported as potential incentives, never automatic eligibility.

The Wisconsin research snapshot is dated 2026-09-19.

Important Illinois rules carried into the seed:
- substation available MW/headroom remain UNKNOWN unless explicitly published;
- Illinois spans both MISO and PJM planning regions;
- generation proximity is labeled NEARBY GENERATION, never available power;
- broadband availability is a CONNECTIVITY PROXY, not proof of long-haul fiber;
- nearby surface water or reported withdrawals do not imply available capacity;
- zoning stays UNKNOWN unless researched locally;
- Data Center Investment Program processing for new agreements is recorded as paused beginning 2026-07-01, so incentives are not represented as automatically available.

The Illinois research snapshot is dated 2026-09-19.
