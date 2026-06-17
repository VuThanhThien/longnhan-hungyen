#!/usr/bin/env bash
# Nightly Postgres backup: pg_dump → gzip → local volume → prune.
set -euo pipefail

readonly HOST_LABEL="${BACKUP_HOST_LABEL:-longnhan_prod}"
readonly BACKUP_DIR="${BACKUP_DIR:-/backups}"
readonly BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-7}"
readonly POSTGRES_HOST="${POSTGRES_HOST:?POSTGRES_HOST is required}"
readonly POSTGRES_PORT="${POSTGRES_PORT:-5432}"
readonly POSTGRES_USER="${POSTGRES_USER:?POSTGRES_USER is required}"
readonly POSTGRES_PASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
readonly POSTGRES_DB="${POSTGRES_DB:?POSTGRES_DB is required}"

LAST_ERROR=""
WEBHOOK_SENT=0

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

truncate_error() {
  local msg="$1"
  if ((${#msg} > 500)); then
    echo "${msg: -500}"
  else
    echo "$msg"
  fi
}

notify_failure() {
  local error_msg
  error_msg="$(truncate_error "${1:-${LAST_ERROR:-Unknown backup error}}")"
  local timestamp
  timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  log "ERROR: ${error_msg}"

  if [[ -z "${BACKUP_WEBHOOK_URL:-}" ]]; then
    return 0
  fi

  if [[ "$WEBHOOK_SENT" -eq 1 ]]; then
    return 0
  fi
  WEBHOOK_SENT=1

  local payload notify_style="slack"
  if [[ "$BACKUP_WEBHOOK_URL" == *"discord.com/api/webhooks"* ]]; then
    notify_style="discord"
  fi

  payload="$(
    NOTIFY_ERROR_MSG="$error_msg" NOTIFY_TIMESTAMP="$timestamp" NOTIFY_STYLE="$notify_style" HOST_LABEL="$HOST_LABEL" python3 - <<'PY'
import json, os

error = os.environ["NOTIFY_ERROR_MSG"]
timestamp = os.environ["NOTIFY_TIMESTAMP"]
host = os.environ["HOST_LABEL"]
if os.environ["NOTIFY_STYLE"] == "discord":
    body = {
        "content": (
            f"[longnhan-prod] DB backup FAILED\n"
            f"host: {host}\n"
            f"timestamp: {timestamp}\n"
            f"error: {error}"
        )
    }
else:
    body = {
        "text": "[longnhan-prod] DB backup FAILED",
        "host": host,
        "error": error,
        "timestamp": timestamp,
    }
print(json.dumps(body))
PY
  )"

  if ! curl -fsS -X POST -H "Content-Type: application/json" -d "$payload" "$BACKUP_WEBHOOK_URL" >/dev/null 2>&1; then
    log "WARN: webhook POST failed (backup failure still reported via exit code)"
  fi
}

on_err() {
  local line="$1"
  LAST_ERROR="${LAST_ERROR:-Backup failed at line ${line}}"
  notify_failure "$LAST_ERROR"
  exit 1
}

trap 'on_err $LINENO' ERR

mkdir -p "$BACKUP_DIR"

START_EPOCH=$(date +%s)
DATE=$(date -u +%Y%m%d_%H%M%S)
FILE="backup_${DATE}.sql.gz"
OUTPUT="$BACKUP_DIR/$FILE"
DUMP_ERR=$(mktemp)
cleanup() {
  rm -f "$DUMP_ERR"
}
trap cleanup EXIT

log "Starting backup → ${FILE}"

export PGPASSWORD="$POSTGRES_PASSWORD"
if ! pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" 2>"$DUMP_ERR" | gzip >"$OUTPUT"; then
  rm -f "$OUTPUT"
  LAST_ERROR="$(cat "$DUMP_ERR" 2>/dev/null || true)"
  notify_failure "$LAST_ERROR"
  exit 1
fi

FILE_SIZE=$(stat -c %s "$OUTPUT" 2>/dev/null || stat -f %z "$OUTPUT")
log "Dump complete: ${FILE} (${FILE_SIZE} bytes)"

find "$BACKUP_DIR" -name 'backup_*.sql.gz' -mtime +"$BACKUP_KEEP_DAYS" -delete
log "Pruned local backups older than ${BACKUP_KEEP_DAYS} days"

DURATION=$(( $(date +%s) - START_EPOCH ))
log "Backup succeeded: ${FILE} (${FILE_SIZE} bytes, ${DURATION}s)"
