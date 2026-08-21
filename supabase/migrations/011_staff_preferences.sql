-- Migration: 011_staff_preferences.sql
-- Description: Adds persistent workspace preferences for staff users
-- Dependencies: 002_users_tables.sql

CREATE TABLE IF NOT EXISTS staff_preferences (
    staff_id UUID PRIMARY KEY REFERENCES staff_users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    project_updates BOOLEAN NOT NULL DEFAULT TRUE,
    request_updates BOOLEAN NOT NULL DEFAULT TRUE,
    qa_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    compact_mode BOOLEAN NOT NULL DEFAULT FALSE,
    items_per_page INTEGER NOT NULL DEFAULT 25 CHECK (items_per_page IN (10, 25, 50)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE staff_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view own preferences" ON staff_preferences;
CREATE POLICY "Staff can view own preferences"
ON staff_preferences
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM staff_users
        WHERE staff_users.id = staff_preferences.staff_id
          AND staff_users.auth_uid = auth.uid()
    )
);

DROP POLICY IF EXISTS "Staff can insert own preferences" ON staff_preferences;
CREATE POLICY "Staff can insert own preferences"
ON staff_preferences
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM staff_users
        WHERE staff_users.id = staff_preferences.staff_id
          AND staff_users.auth_uid = auth.uid()
    )
);

DROP POLICY IF EXISTS "Staff can update own preferences" ON staff_preferences;
CREATE POLICY "Staff can update own preferences"
ON staff_preferences
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM staff_users
        WHERE staff_users.id = staff_preferences.staff_id
          AND staff_users.auth_uid = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM staff_users
        WHERE staff_users.id = staff_preferences.staff_id
          AND staff_users.auth_uid = auth.uid()
    )
);

CREATE INDEX IF NOT EXISTS idx_staff_preferences_staff_id
    ON staff_preferences(staff_id);
