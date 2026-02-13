#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Dent Experts – Email Warmup Control Script
# ─────────────────────────────────────────────────────────────
# Usage:
#   ./warmup_ctl.sh start    – Install & start daily schedule
#   ./warmup_ctl.sh stop     – Unload daily schedule
#   ./warmup_ctl.sh status   – Show current status
#   ./warmup_ctl.sh run      – Run warmup NOW (manual trigger)
#   ./warmup_ctl.sh logs     – Tail today's log
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLIST_NAME="com.dentexperts.warmup"
PLIST_SRC="${SCRIPT_DIR}/${PLIST_NAME}.plist"
PLIST_DST="${HOME}/Library/LaunchAgents/${PLIST_NAME}.plist"
PYTHON="/usr/bin/python3"
WARMUP_SCRIPT="${SCRIPT_DIR}/daily_warmup.py"
CONFIG="${SCRIPT_DIR}/warmup_config.json"
LOG_DIR="${SCRIPT_DIR}/logs"
TODAY=$(date +%Y-%m-%d)

case "$1" in
  start)
    echo "📧 Installing daily warmup schedule..."
    cp "$PLIST_SRC" "$PLIST_DST"
    launchctl unload "$PLIST_DST" 2>/dev/null
    launchctl load "$PLIST_DST"
    echo "✅ Warmup scheduled – runs daily at 9:00 AM"
    echo "   Plist: $PLIST_DST"
    echo ""
    echo "   To stop:   $0 stop"
    echo "   To check:  $0 status"
    ;;

  stop)
    echo "⏹  Stopping daily warmup..."
    launchctl unload "$PLIST_DST" 2>/dev/null
    rm -f "$PLIST_DST"
    echo "✅ Warmup schedule removed"
    ;;

  status)
    echo "─── Warmup Status ───────────────────────────"
    if [ -f "$CONFIG" ]; then
      $PYTHON -c "
import json
with open('$CONFIG') as f:
    c = json.load(f)
print(f'  Status:     {c.get(\"status\", \"unknown\")}')
print(f'  Start date: {c.get(\"start_date\", \"not set\")}')
print(f'  Day number: {c.get(\"day_number\", 0)} / 30')
print(f'  Total runs: {c.get(\"total_runs\", 0)}')
print(f'  Last run:   {c.get(\"last_run\", \"never\")}')
lr = c.get('last_run_result', {})
if lr:
    print(f'  Last result: {lr.get(\"readded\",0)} emails triggered, {lr.get(\"errors\",0)} errors')
"
    else
      echo "  No config file found – warmup not initialized"
    fi
    echo ""
    if launchctl list | grep -q "$PLIST_NAME"; then
      echo "  ⏰ Schedule: LOADED (runs daily at 9:00 AM)"
    else
      echo "  ⏸  Schedule: NOT LOADED"
    fi
    echo "────────────────────────────────────────────"
    ;;

  run)
    echo "🚀 Running warmup NOW..."
    $PYTHON "$WARMUP_SCRIPT"
    echo ""
    echo "Done. Check log: ${LOG_DIR}/warmup_${TODAY}.log"
    ;;

  logs)
    LOG_FILE="${LOG_DIR}/warmup_${TODAY}.log"
    if [ -f "$LOG_FILE" ]; then
      cat "$LOG_FILE"
    else
      echo "No log for today. Available logs:"
      ls -la "${LOG_DIR}"/warmup_*.log 2>/dev/null || echo "  (none)"
    fi
    ;;

  *)
    echo "Dent Experts – Email Warmup Controller"
    echo ""
    echo "Usage: $0 {start|stop|status|run|logs}"
    echo ""
    echo "  start   Install & start the daily 9 AM schedule"
    echo "  stop    Remove the daily schedule"
    echo "  status  Show warmup status & config"
    echo "  run     Run the warmup right now (manual)"
    echo "  logs    Show today's log"
    ;;
esac
