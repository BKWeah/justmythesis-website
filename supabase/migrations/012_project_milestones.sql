-- Migration: 012_project_milestones.sql
-- Description: Creates project milestones used by the project Milestones and Timeline workflows.
-- Dependencies: 004_projects, 008_qa_deliverables_activity_logs

CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    completed_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT project_milestones_completed_date_check
        CHECK (status <> 'Completed' OR completed_date IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id
    ON project_milestones(project_id);

CREATE INDEX IF NOT EXISTS idx_project_milestones_due_date
    ON project_milestones(due_date);

CREATE INDEX IF NOT EXISTS idx_project_milestones_status
    ON project_milestones(status);

CREATE OR REPLACE FUNCTION update_project_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_project_milestones_updated_at
    ON project_milestones;

CREATE TRIGGER trigger_project_milestones_updated_at
    BEFORE UPDATE ON project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_project_milestones_updated_at();

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view project milestones" ON project_milestones;
CREATE POLICY "Staff can view project milestones"
ON project_milestones
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM staff_users
        WHERE staff_users.auth_uid = auth.uid()
    )
);

DROP POLICY IF EXISTS "Staff can create project milestones" ON project_milestones;
CREATE POLICY "Staff can create project milestones"
ON project_milestones
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM staff_users
        WHERE staff_users.auth_uid = auth.uid()
    )
);

DROP POLICY IF EXISTS "Staff can update project milestones" ON project_milestones;
CREATE POLICY "Staff can update project milestones"
ON project_milestones
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM staff_users
        WHERE staff_users.auth_uid = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM staff_users
        WHERE staff_users.auth_uid = auth.uid()
    )
);

COMMENT ON TABLE project_milestones IS 'Project milestones used for operational tracking and project timelines';
COMMENT ON COLUMN project_milestones.status IS 'Pending, In Progress, or Completed';
COMMENT ON COLUMN project_milestones.completed_date IS 'Date the milestone was completed';
