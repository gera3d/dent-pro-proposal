# Email Warmup System – Dent Experts

> **Last Updated:** February 12, 2026  
> **Status:** ✅ Active — Day 1 of 30  
> **First Run:** February 12, 2026

---

## Overview

Automated email warmup system for `info@mg.mydentexperts.com` using GoHighLevel (GHL) workflows + InboxAlly seed engagement. Sends daily warmup emails to 84 InboxAlly seed addresses, which then simulate real human engagement (open, scroll, reply, etc.) to build sender reputation with Gmail, Outlook, Yahoo, etc.

### Why This Exists
New sending domains/IPs start with zero reputation. Without warmup, emails land in spam. InboxAlly's seed accounts open, read, reply to, and move emails out of spam — training mailbox providers that this sender is legitimate.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  macOS launchd (9:00 AM daily)                          │
│  └── daily_warmup.py                                    │
│       1. Remove [warmup] seed tag from 84 contacts      │
│       2. Pause 5s                                       │
│       3. Re-add [warmup] seed tag                       │
│          └── Fires GHL "Tag Added" trigger              │
│               └── Workflow sends warmup email            │
│                    └── Email lands in InboxAlly seeds    │
│                         └── InboxAlly engages:           │
│                              • Opens (60%)              │
│                              • Scrolls (30%)            │
│                              • Removes from Spam (80%)  │
│                              • Removes from Promo (80%) │
│                              • Replies (20%)            │
│                              • Marks Important (20%)    │
│                              • Clicks Link (20%)        │
└─────────────────────────────────────────────────────────┘
```

---

## Configuration

### GHL (GoHighLevel / StormOpsFlow)

| Key | Value |
|---|---|
| Platform URL | `https://app.stormopsflow.com` (white-labeled GHL) |
| Location ID | `AAzBZNLXS4rdwhG76MLi` |
| API Token | `pit-a8576171-f084-46c5-8b31-e8bd0d05da79` |
| API Version | `2021-07-28` |
| API Base URL | `https://services.leadconnectorhq.com` |

### Workflow

| Key | Value |
|---|---|
| Workflow Name | `Email Warmup - Seed List` |
| Workflow ID | `26817aed-c7e7-4ab3-94f9-89208ba204c7` |
| Status | **Published** |
| Trigger | Contact Tag → Tag Added → `[warmup] seed` |
| Action | Send Email: "Warmup – Daily Seed Email" |
| From Name | `Dent Experts` |
| From Email | `info@mg.mydentexperts.com` |
| Subject | `Quick update from Dent Experts` |
| Pre-Header | `We appreciate you being part of our community` |
| Track Clicks | ON |

### Tag

| Key | Value |
|---|---|
| Tag Name | `[warmup] seed` |
| Tag ID | `dmMCsjAItJsJ5nEVFFmj` |

### Seed Contacts

- **Total:** 84 InboxAlly seed addresses imported as GHL contacts
- **IDs File:** `warmup/seed_contact_ids.json`
- **Names:** Randomly generated (e.g., "Sidy Fender", "Dave Fender", "Ginger Kay")
- **All have:** `[warmup] seed` tag, email DND off

---

## Domain & Email Setup

### DNS (Wix-managed: mydentexperts.com)

| Record | Type | Host | Value | Purpose |
|---|---|---|---|---|
| Mailgun MX 1 | MX | mg | `mxa.mailgun.org` (priority 10) | Mailgun inbound for subdomain |
| Mailgun MX 2 | MX | mg | `mxb.mailgun.org` (priority 10) | Mailgun inbound for subdomain |
| Mailgun SPF | TXT | mg | `v=spf1 include:mailgun.org ~all` | SPF for mg subdomain |
| Mailgun DKIM | TXT | smtp._domainkey.mg | *(long DKIM key)* | DKIM signing |
| Mailgun Tracking | CNAME | email.mg | `mailgun.org` | Click/open tracking |
| Google MX (5 records) | MX | @ | Google Workspace MX servers | Google Workspace email on root |
| Google SPF | TXT | @ | `v=spf1 include:_spf.google.com ~all` | SPF for root domain |
| InboxAlly Verify | TXT | @ | `D915B5B8048AA34CC352A11FE4FB0949D2A44115` | InboxAlly domain verification |

### Email Architecture

| Domain | Purpose | MX Provider |
|---|---|---|
| `mydentexperts.com` (root) | Google Workspace email (info@, etc.) | Google |
| `mg.mydentexperts.com` (subdomain) | GHL sending via Mailgun (send-only) | Mailgun |

### GHL Email Settings

| Setting | Value |
|---|---|
| Dedicated Domain | `mg.mydentexperts.com` |
| SSL Status | Issued ✅ |
| Domain Status | Active ✅ |
| Dedicated Header | Name: `Dent Experts`, Email: `info@mg.mydentexperts.com` |
| All 8 email categories | Set to `mg.mydentexperts.com` |

---

## InboxAlly

### Account

| Key | Value |
|---|---|
| Login Email | `gera@why57.com` |
| Plan | Starter (10-day free trial, then $149/mo) |
| Trial Started | ~February 12, 2026 |
| Daily Send Limit | 50 emails/day |
| Active Profiles | 1 / 1 (limit reached on Starter) |

### Verified Domains (3/3)

| Domain | Status |
|---|---|
| `why57.com` | ✅ Verified |
| `mg.mydentexperts.com` | ✅ Verified (auto-detected) |
| `mydentexperts.com` | ✅ Verified (via TXT record) |

### Sender Profile

| Setting | Value |
|---|---|
| Email | `info@mg.mydentexperts.com` |
| Profile Name | `info` |
| Status | **Active** |
| Open Rate | 60% |
| Scroll Down | 30% |
| Remove from Spam | 80% |
| Remove from Promotions | 80% |
| Reply | 20% |
| Mark Important | 20% |
| Click Link | 20% |

### Seed Emails
84 total seed addresses provided by InboxAlly. Mix of Gmail, Outlook, Yahoo, and other providers. Full list downloadable from InboxAlly dashboard → Sender Profiles → Download Seed Emails.

---

## Local Automation Files

All files live in `warmup/` folder:

```
warmup/
├── daily_warmup.py           # Main automation script (runs daily)
├── warmup_ctl.sh             # Control script (start/stop/status/run/logs)
├── warmup_config.json        # State tracking (day #, runs, results)
├── seed_contact_ids.json     # 84 GHL contact IDs
├── com.dentexperts.warmup.plist  # macOS launchd schedule definition
└── logs/
    └── warmup_YYYY-MM-DD.log    # Daily execution logs
```

### daily_warmup.py
Main script that runs the tag cycle. Key behavior:
- **Phase 1:** Removes `[warmup] seed` tag from all 84 contacts (clears previous trigger)
- **Pause:** 5 seconds between phases
- **Phase 2:** Re-adds `[warmup] seed` tag (fires GHL "Tag Added" trigger → workflow → email)
- **Rate limit:** 0.5s between API calls to avoid throttling
- **Auto-stop:** After 30 days (configurable via `MAX_DAYS`)
- **Logging:** Writes to `logs/warmup_YYYY-MM-DD.log`
- **Error tracking:** Logs and counts individual failures, continues on errors

### warmup_ctl.sh
Control script for managing the warmup system:

```bash
cd warmup/
./warmup_ctl.sh start    # Install & start the daily 9 AM schedule
./warmup_ctl.sh stop     # Remove the daily schedule
./warmup_ctl.sh status   # Show warmup status & config
./warmup_ctl.sh run      # Run the warmup right now (manual)
./warmup_ctl.sh logs     # Show today's log
```

### warmup_config.json
Tracks state across runs:
```json
{
  "start_date": "2026-02-12",
  "status": "active",
  "day_number": 1,
  "total_runs": 1,
  "last_run": "2026-02-12",
  "last_run_result": {
    "date": "2026-02-12",
    "removed": 84,
    "readded": 84,
    "errors": 0
  }
}
```

### macOS Schedule (launchd)

| Key | Value |
|---|---|
| Plist Name | `com.dentexperts.warmup` |
| Installed To | `~/Library/LaunchAgents/com.dentexperts.warmup.plist` |
| Schedule | Every day at **9:00 AM** local time |
| Requirement | Mac must be on/awake (macOS will run missed jobs on wake) |

---

## API Notes

### GHL Contacts API
- **⚠ Python `urllib` is blocked** by Cloudflare (error 1010 – bot detection)
- **✅ Use `curl` subprocess** instead — this works reliably
- Endpoint: `PUT /contacts/{contactId}` with `{"tags": ["[warmup] seed"]}` to add tag
- Endpoint: `PUT /contacts/{contactId}` with `{"tags": []}` to remove all tags

### GHL Workflows API
- `GET /workflows/?locationId={id}` — lists all workflows (read-only)
- No API for editing workflow steps — must use GHL UI for step changes
- Workflow fires once per "tag added" event — tag must be removed and re-added to re-trigger

### InboxAlly Domain Verification
- Only accepts **root domains** (e.g., `mydentexperts.com`), not subdomains
- Verifying root domain auto-covers subdomains (e.g., `mg.mydentexperts.com`)
- Verification via TXT record at `@` host
- Must manually click "Click after adding the TXT record" button — doesn't auto-detect

---

## Timeline

| Date | Event |
|---|---|
| Feb 12, 2026 | DNS setup for `mg.mydentexperts.com` (Mailgun MX, SPF, DKIM) |
| Feb 12, 2026 | Domain verified & SSL issued in GHL |
| Feb 12, 2026 | Dedicated email header configured in GHL |
| Feb 12, 2026 | InboxAlly account created, trial unlocked |
| Feb 12, 2026 | 84 seed contacts imported into GHL |
| Feb 12, 2026 | GHL workflow created, published, tested |
| Feb 12, 2026 | InboxAlly domain verified, sender profile activated |
| Feb 12, 2026 | Daily automation installed & first run: 84/84 ✅ 0 errors |
| ~Feb 22, 2026 | InboxAlly trial expires (10-day trial) — upgrade or cancel |
| ~Mar 14, 2026 | Warmup auto-stops after 30 days |

---

## Monitoring & Troubleshooting

### Check Status
```bash
cd "/Users/gerayeremin/Documents/Dent Pro/warmup"
./warmup_ctl.sh status
```

### Check Today's Log
```bash
./warmup_ctl.sh logs
```

### Manual Run (if schedule missed)
```bash
./warmup_ctl.sh run
```

### If Emails Aren't Sending
1. **Check workflow is published:** GHL → Automation → "Email Warmup - Seed List" → should say Published
2. **Check contacts have tag:** Run `./warmup_ctl.sh run` and check log for errors
3. **Check GHL email settings:** Settings → Email Services → `mg.mydentexperts.com` should be Active
4. **Check InboxAlly profile:** Sender Profiles → should show Active

### If Schedule Isn't Running
```bash
# Check if loaded
launchctl list | grep dentexperts

# Reload
./warmup_ctl.sh stop
./warmup_ctl.sh start
```

### To Pause Warmup (without uninstalling)
Edit `warmup_config.json` and set `"status": "paused"`. The script will skip execution but stay scheduled. Set back to `"active"` to resume.

### To Stop Warmup Permanently
```bash
./warmup_ctl.sh stop
```
This removes the launchd schedule. Contacts keep their tags but no new emails fire.

---

## Costs

| Service | Cost | Notes |
|---|---|---|
| InboxAlly Starter | $149/mo (after 10-day free trial) | 100 seeds/day, 1 sender profile |
| GHL / Mailgun | Included in existing GHL plan | Email sending via `mg.mydentexperts.com` |

---

## Deferred Items

- **Google Postmaster Tools** — User deferred. Would provide Gmail-specific deliverability data (spam rate, domain reputation). Can set up later at https://postmaster.google.com with the `mydentexperts.com` domain.
- **Warmup email content rotation** — Currently sends same email template every day. InboxAlly's "Warmup Content Generator" can create varied content. Consider rotating subjects/body after initial warmup period.
- **Post-warmup cleanup** — After 30 days, consider removing seed contacts from GHL or archiving them to keep the contact list clean.
