#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
CONTAINER="supabase_db_ddr-app"       # Your Postgres container
PROJECT_DIR="/home/DDR" # Your Supabase project directory
BACKUP_DIR="/home/supabase-backups"   # Where backups are stored

# === VALIDATION ===
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "ERROR: Container '$CONTAINER' not found. Check with: docker ps"
  exit 1
fi

# === SELECT BACKUP FILES ===
echo "Available full DB backups:"
ls -1 "$BACKUP_DIR"/db_full_*.sql

echo
read -p "Enter the EXACT filename of the DB full backup to restore: " DB_FILE

if [ ! -f "$BACKUP_DIR/$DB_FILE" ]; then
  echo "ERROR: File '$DB_FILE' not found in $BACKUP_DIR"
  exit 1
fi

echo
echo "Available globals backups:"
ls -1 "$BACKUP_DIR"/db_globals_*.sql

echo
read -p "Enter the EXACT filename of the globals backup to restore: " GLOBAL_FILE

if [ ! -f "$BACKUP_DIR/$GLOBAL_FILE" ]; then
  echo "ERROR: File '$GLOBAL_FILE' not found in $BACKUP_DIR"
  exit 1
fi

# === RESTORE GLOBALS ===
echo "Restoring Postgres roles and globals..."
cat "$BACKUP_DIR/$GLOBAL_FILE" | docker exec -i "$CONTAINER" psql -U postgres

# === RESTORE FULL DATABASE ===
echo "Restoring full Postgres database..."
cat "$BACKUP_DIR/$DB_FILE" | docker exec -i "$CONTAINER" psql -U postgres -d postgres

# === RESTORE STORAGE (if exists) ===
echo
echo "Checking for storage backup..."
STORAGE_ARCHIVE=$(ls -1 "$BACKUP_DIR"/storage_*.tar.gz 2>/dev/null | head -n 1 || true)

if [ -n "$STORAGE_ARCHIVE" ]; then
  echo "Found storage archive: $STORAGE_ARCHIVE"
  read -p "Restore storage files as well? (y/n): " RESTORE_STORAGE

  if [ "$RESTORE_STORAGE" = "y" ]; then
    echo "Restoring storage files..."
    tar -xzf "$STORAGE_ARCHIVE" -C "$PROJECT_DIR"
  else
    echo "Skipping storage restore."
  fi
else
  echo "No storage backup found — skipping storage restore."
fi

echo
echo "=== Restore Completed Successfully ==="
