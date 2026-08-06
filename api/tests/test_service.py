"""Unit tests for derived-field logic that isn't fully exposed via endpoints yet."""
from datetime import date, timedelta

from app import service
from app.models import CreateGarmentRequest, GarmentStatus


def _req(**overrides):
    body = dict(owner_id="ishani", category="coat", color="grey", material="wool",
                brand=None, style_tags=[], cost=None)
    body.update(overrides)
    return CreateGarmentRequest(**body)


def test_condition_monotonically_decreases():
    assert service._condition_for(0) == 100
    assert service._condition_for(1) == 98
    assert service._condition_for(10) == 85
    assert service._condition_for(1000) == 0  # clamped, never negative


def test_never_worn_staleness_flags_after_threshold():
    # Catalogued 40 days ago, zero wears -> should flag unworn.
    old_catalog = date.today() - timedelta(days=40)
    g = service.create_garment(_req(cataloged_date=old_catalog))
    status, deprecated, note = service._staleness(g.garment_id, wear_count=0, today=date.today())
    assert status == GarmentStatus.flagged_unworn
    assert deprecated is True
    assert "never worn" in note


def test_recently_catalogued_unworn_is_not_stale():
    g = service.create_garment(_req(cataloged_date=date.today()))
    status, deprecated, _ = service._staleness(g.garment_id, wear_count=0, today=date.today())
    assert status == GarmentStatus.active
    assert deprecated is False
