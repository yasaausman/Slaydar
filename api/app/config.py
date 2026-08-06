"""Settings for the Slaydar backend.

Staleness thresholds live here (not scattered as magic numbers) so the
Deprecation logic reads as intentional. Mirror any change into
../docs/datahub-schema.md in the same commit.
"""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SLAYDAR_", env_file=".env", extra="ignore")

    # DataHub GMS endpoint. Point at the shared instance; defaults to the
    # `datahub docker quickstart` local GMS.
    datahub_gms_url: str = "http://localhost:8080"
    datahub_token: str | None = None

    # Force dry-run regardless of DataHub reachability. Tests set this so they
    # never emit to the live instance (hermetic + fast + no data pollution).
    force_dry_run: bool = False

    # Platform URN all garments are emitted under.
    platform: str = "slaydar"
    env: str = "PROD"

    # --- Staleness thresholds (see docs/datahub-schema.md) ---
    # Never-worn: catalogued but not checked in within this many days -> Deprecation "never worn".
    never_worn_days: int = 30
    # Overworn: this many check-ins within a rolling window -> Deprecation "overworn".
    overworn_window_days: int = 7
    overworn_count: int = 4

    # New (unworn) garments start here; each wear nudges condition down.
    starting_condition: int = 100
    condition_drop_per_wear: float = 1.5


settings = Settings()
