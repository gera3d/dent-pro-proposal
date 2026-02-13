#!/usr/bin/env python3
"""
Daily Email Warmup – Dent Experts
=================================
Re-triggers the GHL "Email Warmup - Seed List" workflow every day by
cycling the [warmup] seed tag on all seed contacts.

Flow:
  1. Remove the tag from every contact  →  workflow has nothing to fire on
  2. Pause briefly
  3. Re-add the tag to every contact    →  "Tag Added" trigger fires → email sent

Runs via macOS launchd  (com.dentexperts.warmup.plist)
Logs to  warmup/logs/warmup_YYYY-MM-DD.log

To STOP warmup:
  launchctl unload ~/Library/LaunchAgents/com.dentexperts.warmup.plist

To RE-START warmup:
  launchctl load ~/Library/LaunchAgents/com.dentexperts.warmup.plist
"""

import json, time, subprocess, os, sys
from datetime import datetime, timedelta
from pathlib import Path

# ─── Config ────────────────────────────────────────────────────────────────
API      = "https://services.leadconnectorhq.com/contacts"
TOKEN    = "pit-a8576171-f084-46c5-8b31-e8bd0d05da79"
TAG      = "[warmup] seed"
VERSION  = "2021-07-28"

SCRIPT_DIR   = Path(__file__).resolve().parent
IDS_FILE     = SCRIPT_DIR / "seed_contact_ids.json"
LOG_DIR      = SCRIPT_DIR / "logs"
CONFIG_FILE  = SCRIPT_DIR / "warmup_config.json"

MAX_DAYS     = 30          # auto-stop after this many days
RATE_LIMIT   = 0.5         # seconds between API calls
PAUSE_SECS   = 5           # pause between remove and re-add phases

# ─── Logging ───────────────────────────────────────────────────────────────
LOG_DIR.mkdir(exist_ok=True)

today_str = datetime.now().strftime("%Y-%m-%d")
log_file  = LOG_DIR / f"warmup_{today_str}.log"

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(log_file, "a") as f:
        f.write(line + "\n")

# ─── Config Management ────────────────────────────────────────────────────
def load_config():
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return {}

def save_config(cfg):
    with open(CONFIG_FILE, "w") as f:
        json.dump(cfg, f, indent=2)

# ─── Pre-flight checks ────────────────────────────────────────────────────
def preflight():
    cfg = load_config()

    # Track start date
    if "start_date" not in cfg:
        cfg["start_date"] = today_str
        save_config(cfg)
        log(f"First run – warmup start date set to {today_str}")

    # Check max days
    start = datetime.strptime(cfg["start_date"], "%Y-%m-%d")
    days_elapsed = (datetime.now() - start).days
    log(f"Warmup day {days_elapsed + 1} of {MAX_DAYS}")

    if days_elapsed >= MAX_DAYS:
        log(f"⚠️  MAX_DAYS ({MAX_DAYS}) reached. Warmup complete!")
        log("   Unload the launchd agent or delete the plist to clean up.")
        cfg["status"] = "completed"
        cfg["completed_date"] = today_str
        save_config(cfg)
        return False

    # Check if paused
    if cfg.get("status") == "paused":
        log("⏸  Warmup is PAUSED. Set status to 'active' in warmup_config.json to resume.")
        return False

    cfg["status"] = "active"
    cfg["last_run"] = today_str
    cfg["day_number"] = days_elapsed + 1
    save_config(cfg)
    return True

# ─── API helper ────────────────────────────────────────────────────────────
def update_contact_tags(contact_id, tags):
    """PUT tags on a contact. Returns HTTP status code string."""
    payload = json.dumps({"tags": tags})
    r = subprocess.run(
        ["curl", "-s", "-w", "\n%{http_code}", "-X", "PUT",
         f"{API}/{contact_id}",
         "-H", f"Authorization: Bearer {TOKEN}",
         "-H", f"Version: {VERSION}",
         "-H", "Content-Type: application/json",
         "-d", payload],
        capture_output=True, text=True
    )
    return r.stdout.strip().rsplit("\n", 1)[-1]

# ─── Main ──────────────────────────────────────────────────────────────────
def main():
    log("=" * 60)
    log("Dent Experts – Daily Email Warmup")
    log("=" * 60)

    if not preflight():
        return

    # Load contact IDs
    if not IDS_FILE.exists():
        log(f"❌ Contact IDs file not found: {IDS_FILE}")
        return
    with open(IDS_FILE) as f:
        ids = json.load(f)
    log(f"Loaded {len(ids)} seed contacts")

    # ── Phase 1: Remove tags ──────────────────────────────────────────
    log("")
    log("Phase 1: Removing [warmup] seed tag from all contacts...")
    removed = 0
    errors_1 = 0
    for i, cid in enumerate(ids):
        code = update_contact_tags(cid, [])
        if code in ("200", "201"):
            removed += 1
        else:
            errors_1 += 1
            if errors_1 <= 5:
                log(f"  ⚠ Remove failed for {cid}: HTTP {code}")
        time.sleep(RATE_LIMIT)
        if (i + 1) % 20 == 0 or (i + 1) == len(ids):
            log(f"  [{i+1}/{len(ids)}] removed: {removed}")

    log(f"Phase 1 done: {removed}/{len(ids)} tags removed ({errors_1} errors)")

    # ── Pause ─────────────────────────────────────────────────────────
    log(f"\nPausing {PAUSE_SECS}s before re-adding tags...")
    time.sleep(PAUSE_SECS)

    # ── Phase 2: Re-add tags (triggers workflow) ──────────────────────
    log("")
    log("Phase 2: Re-adding [warmup] seed tag (triggers workflow)...")
    readded = 0
    errors_2 = 0
    for i, cid in enumerate(ids):
        code = update_contact_tags(cid, [TAG])
        if code in ("200", "201"):
            readded += 1
        else:
            errors_2 += 1
            if errors_2 <= 5:
                log(f"  ⚠ Re-add failed for {cid}: HTTP {code}")
        time.sleep(RATE_LIMIT)
        if (i + 1) % 20 == 0 or (i + 1) == len(ids):
            log(f"  [{i+1}/{len(ids)}] re-tagged: {readded}")

    log(f"Phase 2 done: {readded}/{len(ids)} tags re-added ({errors_2} errors)")

    # ── Summary ───────────────────────────────────────────────────────
    log("")
    log("─" * 40)
    total_errors = errors_1 + errors_2
    if total_errors == 0:
        log(f"✅ SUCCESS – {readded} warmup emails triggered")
    else:
        log(f"⚠️  PARTIAL – {readded} triggered, {total_errors} errors total")
    log("─" * 40)

    # Update config
    cfg = load_config()
    cfg["last_run_result"] = {
        "date": today_str,
        "removed": removed,
        "readded": readded,
        "errors": total_errors
    }
    cfg["total_runs"] = cfg.get("total_runs", 0) + 1
    save_config(cfg)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log(f"❌ FATAL ERROR: {e}")
        raise
