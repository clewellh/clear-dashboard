# CLEAR Database Workflow (Supabase)

## Source of truth
- Schema history lives in: `supabase/migrations/`
- Human-readable reference lives in: `db/schema.sql`

## Golden rules
1. Never edit an old migration after it has been pushed.
2. Every schema change = new migration.
3. Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for additive changes.
4. For breaking changes (rename/drop), create a migration that:
   - adds new column/table
   - backfills data
   - updates app code
   - only then removes old column/table (in a later migration)

## Standard workflow
1. Create migration:
   ```bash
   supabase migrations new <name>
