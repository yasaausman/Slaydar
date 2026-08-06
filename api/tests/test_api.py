"""API + service tests, all in forced dry-run mode (no live DataHub needed)."""
from datetime import date, timedelta

from app import datahub_client as dh


def _create(client, **overrides):
    body = {
        "owner_id": "ishani",
        "category": "t-shirt",
        "color": "black",
        "material": "cotton",
        "brand": "Uniqlo",
        "style_tags": ["casual", "streetwear"],
        "cost": 30.0,
    }
    body.update(overrides)
    r = client.post("/garments", json=body)
    assert r.status_code == 200, r.text
    return r.json()


def test_dry_run_active(client):
    assert dh.is_dry_run() is True
    assert client.get("/health").json()["datahub_dry_run"] is True


def test_create_garment_defaults(client):
    g = _create(client)
    assert g["garment_id"].startswith("t-shirt-")
    assert g["owner_id"] == "ishani"
    assert g["wear_count"] == 0
    assert g["condition_score"] == 100
    assert g["cost_per_wear"] is None
    assert g["status"] == "active"


def test_get_unknown_garment_404(client):
    assert client.get("/garments/does-not-exist").status_code == 404


def test_checkin_updates_stats(client):
    gid = _create(client)["garment_id"]
    g = client.post(f"/garments/{gid}/checkin", json={"worn_date": "2026-08-05"}).json()
    assert g["wear_count"] == 1
    assert g["last_worn_date"] == "2026-08-05"
    assert g["cost_per_wear"] == 30.0  # 30 / 1
    assert g["condition_score"] == 98  # 100 - 1.5*1 rounded


def test_cost_per_wear_none_without_cost(client):
    gid = _create(client, cost=None)["garment_id"]
    g = client.post(f"/garments/{gid}/checkin", json={"worn_date": "2026-08-05"}).json()
    assert g["cost_per_wear"] is None


def test_overworn_flag_trips_on_fourth_wear(client):
    gid = _create(client)["garment_id"]
    base = date(2026, 8, 5)
    g = None
    for i in range(4):
        g = client.post(f"/garments/{gid}/checkin",
                        json={"worn_date": (base + timedelta(days=i)).isoformat()}).json()
    assert g["wear_count"] == 4
    assert g["status"] == "flagged-overworn"
    assert g["cost_per_wear"] == 7.5  # 30 / 4


def test_checkin_unknown_garment_404(client):
    r = client.post("/garments/nope/checkin", json={"worn_date": "2026-08-05"})
    assert r.status_code == 404


def test_transfer_creates_new_urn_and_carries_history(client):
    gid = _create(client)["garment_id"]
    client.post(f"/garments/{gid}/checkin", json={"worn_date": "2026-08-05"})
    new = client.post(f"/garments/{gid}/transfer-owner", json={"new_owner_id": "alex"}).json()
    assert new["garment_id"] != gid
    assert new["owner_id"] == "alex"
    assert new["wear_count"] == 1  # provenance carried across resale
    assert new["cost_per_wear"] is None  # cost basis resets for new owner
    # old record freezes as listed-for-resale
    old = client.get(f"/garments/{gid}").json()
    assert old["status"] == "listed-for-resale"


def test_lineage_chains_across_multiple_transfers(client):
    gid = _create(client)["garment_id"]
    mid = client.post(f"/garments/{gid}/transfer-owner", json={"new_owner_id": "alex"}).json()["garment_id"]
    new = client.post(f"/garments/{mid}/transfer-owner", json={"new_owner_id": "sam"}).json()["garment_id"]
    chain = client.get(f"/garments/{new}/lineage").json()["chain"]
    ids = [n["garment_id"] for n in chain]
    owners = [n["owner_id"] for n in chain]
    assert ids == [new, mid, gid]
    assert owners == ["sam", "alex", "ishani"]


def test_closet_lists_only_owner_items(client):
    _create(client, owner_id="ishani")
    _create(client, owner_id="ishani")
    _create(client, owner_id="alex")
    assert len(client.get("/closet/ishani").json()) == 2
    assert len(client.get("/closet/alex").json()) == 1


def test_resolve_link_not_implemented(client):
    assert client.post("/garments/resolve-link", json={"url": "http://x"}).status_code == 501
