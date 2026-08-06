# /api — Slaydar backend (Person A)

FastAPI service wrapping the DataHub Python SDK (`acryl-datahub`). This is the only thing that writes to DataHub. Person B's `/web` talks to it over the REST contract in [`../docs/api-contract.md`](../docs/api-contract.md).

## Golden rules
- **The contract is law.** Endpoint shapes come from `../docs/api-contract.md`; the aspect mapping comes from `../docs/datahub-schema.md`. Change either → update the doc in the **same commit** (see root `CLAUDE.md` sync workflow).
- **All DataHub writes go through `datahub_client.py`.** No emitter calls scattered in route handlers — routes call client functions. This keeps the emitters unit-testable against a local DataHub without the frontend.
- Every mutation is a `MetadataChangeProposal` (MCP) emitted via the SDK.
- Garments are DataHub **Dataset** entities: `urn:li:dataset:(urn:li:dataPlatform:slaydar,<garment_id>,PROD)`. Never a custom entity type.
- Ownership history across resale = **new dataset URN per ownership period**, chained with `UpstreamLineage`. This is the demo's money shot — keep the lineage edges correct.

## Layout
- `app/main.py` — FastAPI app + route handlers.
- `app/models.py` — Pydantic models matching the garment contract.
- `app/config.py` — settings (DataHub GMS URL, staleness thresholds).
- `app/datahub_client.py` — all emitter functions + URN helpers.
- `app/store.py` — lightweight in-process index of known garment_ids per owner (DataHub search is eventually-consistent; we keep a local map so `/closet` is instant for the demo).
- `scripts/seed_glossary.py` — one-time glossary node + style terms seed.

## Running
```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Point `DATAHUB_GMS_URL` at the shared instance (default `http://localhost:8080`). If DataHub is unreachable, the client runs in **dry-run mode** (logs the MCP it *would* emit) so the API still boots for frontend integration.

## Staleness thresholds
Defined in `app/config.py` and documented in `../docs/datahub-schema.md`. Deprecation logic lives in `service.py` (`_staleness`) — one place, so the numbers are intentional, not scattered magic values.

## Testing
```bash
cd api && source .venv/bin/activate
pip install -r requirements-dev.txt   # once
pytest                                 # tests/ run in FORCED dry-run — no live DataHub needed
```
`tests/conftest.py` sets `SLAYDAR_FORCE_DRY_RUN=true` before importing the app, so the suite is hermetic and never pollutes the shared instance. For a live end-to-end check against a running DataHub, use `python -m scripts.smoke_test` instead (that one *does* emit).

**Known gap (Day 3):** never-worn `Deprecation` logic exists and is unit-tested (`_staleness`), but nothing calls it for a 0-wear item — staleness is only recomputed on check-in, and a never-worn item never checks in. Day 3 adds the trigger (a staleness sweep endpoint, or lazy evaluation on `/closet`).
