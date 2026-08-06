"""Test harness.

Forces dry-run BEFORE any app import so the suite never emits to a live DataHub
(hermetic, fast, no data pollution — passes whether or not DataHub is running).
Also resets the in-process store between tests so cases don't leak into each other.
"""
import os

# Must be set before app.config is imported anywhere.
os.environ["SLAYDAR_FORCE_DRY_RUN"] = "true"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import store  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def _reset_store():
    for d in (store._garments, store._cost_basis, store._parents, store._cataloged, store._wears):
        d.clear()
    yield


@pytest.fixture
def client():
    return TestClient(app)
