// Hardcoded for the hackathon demo — no auth/login flow yet.
// Must match the owner_id Person A's seed_demo.py seeds in the shared DataHub instance.
export const DEMO_OWNER_ID = "ishani";

// Other owner_ids known to exist in the shared demo DataHub instance, for the Tier 2
// cross-user "someone else has this" match. There's no real multi-user directory or
// search-across-owners endpoint — this is a hardcoded demo shortcut. "alex" and "sam"
// come from Person A's seed_demo.py resale lineage chain (ishani -> alex -> sam).
export const OTHER_DEMO_OWNER_IDS = ["alex", "sam"];
