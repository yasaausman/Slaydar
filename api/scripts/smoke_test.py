"""End-to-end smoke test of the Slaydar API in dry-run mode.

Runs the full demo spine through FastAPI's TestClient without a live DataHub:
create -> checkin (x N to trip overworn) -> transfer-owner -> lineage.
Run: python -m scripts.smoke_test  (from /api, with the venv active)
"""
from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.main import app

c = TestClient(app)


def show(label, r):
    assert r.status_code == 200, f"{label} -> {r.status_code}: {r.text}"
    print(f"\n== {label} ==")
    print(r.json())
    return r.json()


health = show("health", c.get("/health"))
mode = "DRY-RUN" if health["datahub_dry_run"] else "LIVE (emitting to DataHub)"
print(f"   >> DataHub mode: {mode}")

g = show("create garment", c.post("/garments", json={
    "owner_id": "ishani",
    "category": "t-shirt",
    "color": "black",
    "material": "cotton",
    "brand": "Uniqlo",
    "style_tags": ["casual", "streetwear"],
    "cost": 30.0,
}))
gid = g["garment_id"]

# Four wears in one week -> overworn flag (overworn_count=4, window=7d).
base = date(2026, 8, 5)
for i in range(4):
    g = show(f"checkin #{i+1}", c.post(f"/garments/{gid}/checkin",
                                       json={"worn_date": (base + timedelta(days=i)).isoformat()}))
assert g["wear_count"] == 4
assert g["status"] == "flagged-overworn", f"expected overworn, got {g['status']}"
assert g["cost_per_wear"] == 7.5, f"expected 30/4=7.5, got {g['cost_per_wear']}"

closet = show("closet(ishani)", c.get("/closet/ishani"))
assert any(x["garment_id"] == gid for x in closet)

new = show("transfer-owner -> alex", c.post(f"/garments/{gid}/transfer-owner",
                                            json={"new_owner_id": "alex"}))
new_id = new["garment_id"]
assert new["owner_id"] == "alex"
assert new_id != gid
assert new["wear_count"] == 4  # provenance carried across resale

lin = show("lineage(new)", c.get(f"/garments/{new_id}/lineage"))
chain_ids = [n["garment_id"] for n in lin["chain"]]
assert chain_ids == [new_id, gid], f"expected [{new_id}, {gid}], got {chain_ids}"

print("\nALL SMOKE ASSERTIONS PASSED ✅")
