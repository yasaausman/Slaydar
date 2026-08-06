"""Seed a coherent demo closet through the live API.

Builds exactly the data the demo script (PLAN.md §7) needs, so every beat has a
real stat behind it and the DataHub UI looks populated:

  - 14 black t-shirts for `ishani`, only 3 ever worn  -> the "you own 14 black
    tees, wore 3, list the other 11" roast, and 11 never-worn flags after sweep.
  - 1 overworn hoodie (worn 4x in one week)           -> overworn flag + roast.
  - a few variety items with normal wear.
  - 1 denim jacket transferred ishani -> alex -> sam  -> the lineage graph moment.

Hits the running API (default http://localhost:8000), so it populates BOTH the
API's /closet cache and the live DataHub. It does NOT talk to DataHub directly.

    cd api && source .venv/bin/activate
    python -m scripts.seed_demo                 # against localhost:8000
    SLAYDAR_API_BASE=https://x.trycloudflare.com python -m scripts.seed_demo

Garment ids are server-generated, so re-running ADDS a second demo closet — run
once against a fresh instance. To reset: restart the API (clears the cache) and
optionally `datahub docker nuke && datahub docker quickstart`.
"""
from __future__ import annotations

import os
import sys
from datetime import date, timedelta

import requests

API = os.environ.get("SLAYDAR_API_BASE", "http://localhost:8000").rstrip("/")
OWNER = "ishani"
TODAY = date(2026, 8, 6)  # fixed reference so the demo reads the same every run
OLD_CATALOG = (TODAY - timedelta(days=40)).isoformat()  # 40d ago -> never-worn eligible


def _create(**fields) -> dict:
    body = {"owner_id": OWNER, "brand": None, "style_tags": [], "cataloged_date": OLD_CATALOG}
    body.update(fields)
    r = requests.post(f"{API}/garments", json=body, timeout=30)
    r.raise_for_status()
    return r.json()


def _wear(garment_id: str, days: list[int]) -> dict:
    """Check the item in on TODAY-offset days (e.g. [0,1,2] = last three days)."""
    g = None
    for d in days:
        worn = (TODAY - timedelta(days=d)).isoformat()
        r = requests.post(f"{API}/garments/{garment_id}/checkin", json={"worn_date": worn}, timeout=30)
        r.raise_for_status()
        g = r.json()
    return g


def _transfer(garment_id: str, new_owner: str) -> dict:
    r = requests.post(f"{API}/garments/{garment_id}/transfer-owner",
                      json={"new_owner_id": new_owner}, timeout=30)
    r.raise_for_status()
    return r.json()


def main() -> int:
    try:
        requests.get(f"{API}/health", timeout=10).raise_for_status()
    except Exception as exc:
        print(f"API not reachable at {API} ({exc}). Start it: uvicorn app.main:app --port 8000")
        return 1

    print(f"Seeding demo closet for '{OWNER}' via {API} ...\n")

    # 1) 14 black t-shirts; wear only the first 3.
    tees = [_create(category="t-shirt", color="black", material="cotton",
                    brand="Uniqlo", style_tags=["casual"], cost=15.0) for _ in range(14)]
    for t in tees[:3]:
        _wear(t["garment_id"], [0, 4, 9])
    print(f"  14 black t-shirts (3 worn, 11 never-worn)")

    # 2) Overworn hoodie — 4 wears in the last 7 days.
    hoodie = _create(category="hoodie", color="grey", material="fleece",
                     brand="Champion", style_tags=["streetwear", "loungewear"], cost=60.0)
    hoodie = _wear(hoodie["garment_id"], [0, 1, 3, 5])
    print(f"  hoodie {hoodie['garment_id']} -> status={hoodie['status']}  cpw={hoodie['cost_per_wear']}")

    # 3) Variety items with ordinary wear.
    _wear(_create(category="jeans", color="indigo", material="denim",
                  brand="Levi's", style_tags=["casual"], cost=90.0)["garment_id"], [7, 20])
    _wear(_create(category="blazer", color="navy", material="wool",
                  brand="COS", style_tags=["formal", "business"], cost=180.0)["garment_id"], [12])

    # 4) Resale lineage chain: denim jacket ishani -> alex -> sam.
    jacket = _create(category="jacket", color="blue", material="denim",
                     brand="Wrangler", style_tags=["outerwear", "vintage"], cost=120.0)
    _wear(jacket["garment_id"], [15, 25, 30])
    to_alex = _transfer(jacket["garment_id"], "alex")
    to_sam = _transfer(to_alex["garment_id"], "sam")
    lineage = requests.get(f"{API}/garments/{to_sam['garment_id']}/lineage", timeout=30).json()
    chain = " -> ".join(f"{n['owner_id']}" for n in reversed(lineage["chain"]))
    print(f"  denim jacket resale chain: {chain}  (final id {to_sam['garment_id']})")

    # 5) Sweep to flag the 11 never-worn tees.
    swept = requests.post(f"{API}/garments/evaluate-staleness", json={"owner_id": OWNER}, timeout=60).json()
    never = [g for g in swept if g["status"] == "flagged-unworn"]
    over = [g for g in swept if g["status"] == "flagged-overworn"]
    print(f"\n  staleness sweep: {len(never)} never-worn, {len(over)} overworn flagged")

    closet = requests.get(f"{API}/closet/{OWNER}", timeout=30).json()
    print(f"\nDone. {OWNER}'s closet now has {len(closet)} items.")
    print(f"Demo lineage URL: {API}/garments/{to_sam['garment_id']}/lineage")
    print("Open DataHub UI (http://localhost:9002) and search 'jacket' -> Lineage tab for the graph.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
