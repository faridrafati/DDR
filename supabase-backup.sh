#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
CONTAINER="supabase_db_ddr-app"       # Your Postgres container
BACKUP_DIR="$HOME/supabase-backups"   # Where backups will be stored
STORAGE_VOLUME="supabase_storage_ddr-app"  # Your storage volume name

# === VALIDATION ===
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "ERROR: Container '$CONTAINER' not found. Check with: docker ps"
  exit 1
fi

# === SETUP ===
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%F_%H-%M-%S)

DB_BACKUP="$BACKUP_DIR/db_full_$TIMESTAMP.sql"
GLOBAL_BACKUP="$BACKUP_DIR/db_globals_$TIMESTAMP.sql"
STORAGE_BACKUP="$BACKUP_DIR/storage_$TIMESTAMP.tar.gz"

echo "=== Supabase Backup Started at $TIMESTAMP ==="

# === FULL DATABASE BACKUP ===
echo "Backing up full Postgres database..."
docker exec "$CONTAINER" \
  pg_dump -U postgres -d postgres --format=plain --no-owner --no-privileges \
  > "$DB_BACKUP"

# === GLOBAL OBJECTS BACKUP ===
echo "Backing up Postgres roles and globals..."
docker exec "$CONTAINER" \
  pg_dumpall -U postgres --globals-only \
  > "$GLOBAL_BACKUP"

# === STORAGE BACKUP (Docker Volume) ===
echo "Backing up Supabase Storage volume..."
docker run --rm \
  -v "$STORAGE_VOLUME":/data \
  -v "$BACKUP_DIR":/backup \
  alpine tar -czf "/backup/storage_$TIMESTAMP.tar.gz" -C /data .

echo "=== Backup Completed Successfully ==="
echo "Files saved in: $BACKUP_DIR"
