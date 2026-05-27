#!/usr/bin/env sh
# Simple Postgres backup script. Requires PG_URL or DATABASE_URL env var.
set -e

PG_URL=${PG_URL:-$DATABASE_URL}
if [ -z "$PG_URL" ]; then
  echo "PG_URL or DATABASE_URL must be set"
  exit 1
fi

OUT_DIR=${OUT_DIR:-./backups}
mkdir -p "$OUT_DIR"
FILENAME="$OUT_DIR/pg-backup-$(date +%Y%m%d-%H%M%S).sql"

echo "Dumping database to $FILENAME"
pg_dump "$PG_URL" > "$FILENAME"

echo "Backup finished"
