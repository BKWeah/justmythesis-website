-- Migration: 008_qa_deliverables_activity_logs.sql
-- Description: Creates QA reviews, deliverables, and activity logs tables
-- Created: 2024
-- Dependencies: 002_users_tables (staff_users), 003_support_requests, 004_projects

-- ============================================================
-- QA REVIEWS TABLE
-- ============================================================
-- Stores quality assurance reviews for projects.

-- Create enum type for QA status
DO $$ BEGIN
    CREATE TYPE qa_status AS ENUM (
        'Pending',
        'Passed',
        'Needs Correction'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the qa_reviews table
CREATE TABLE IF NOT EXISTS qa_reviews (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Project relationship
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Review rounds (multiple reviews possible)
    review_round INTEGER NOT NULL DEFAULT 1,
    
    -- Review components
    structure_review TEXT,
    formatting_review TEXT,
    citation_review TEXT,
    compliance_review TEXT,
    
    -- Additional notes
    final_notes TEXT,
    
    -- Overall status
    status qa_status NOT NULL DEFAULT 'Pending',
    
    -- Overall pass/fail determination
    is_passed BOOLEAN,
    issues_found_count INTEGER DEFAULT 0,
    
    -- Audit
    reviewed_by UUID REFERENCES staff_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    
);

-- QA REVIEWS INDEXES
CREATE INDEX IF NOT EXISTS idx_qa_reviews_project_id 
    ON qa_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_qa_reviews_status 
    ON qa_reviews(status);
CREATE INDEX IF NOT EXISTS idx_qa_reviews_reviewed_by 
    ON qa_reviews(reviewed_by);

-- QA REVIEWS UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_qa_reviews_updated_at ON qa_reviews;
CREATE TRIGGER trigger_qa_reviews_updated_at
    BEFORE UPDATE ON qa_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- QA REVIEWS COMMENTS
COMMENT ON TABLE qa_reviews IS 'Quality assurance reviews for projects';
COMMENT ON COLUMN qa_reviews.project_id IS 'Reference to the project being reviewed';
COMMENT ON COLUMN qa_reviews.review_round IS 'Review round number';
COMMENT ON COLUMN qa_reviews.structure_review IS 'Review of document structure';
COMMENT ON COLUMN qa_reviews.formatting_review IS 'Review of formatting compliance';
COMMENT ON COLUMN qa_reviews.citation_review IS 'Review of citations and references';
COMMENT ON COLUMN qa_reviews.compliance_review IS 'Review of institution compliance';
COMMENT ON COLUMN qa_reviews.final_notes IS 'Final notes and recommendations';
COMMENT ON COLUMN qa_reviews.status IS 'QA review status';
COMMENT ON COLUMN qa_reviews.reviewed_by IS 'Staff member who conducted the review';

-- ============================================================
-- DELIVERABLES TABLE
-- ============================================================
-- Stores deliverables (completed work files) for projects.

-- Create the deliverables table
CREATE TABLE IF NOT EXISTS deliverables (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Project relationship
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- File information
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT,
    
    -- Delivery information
    delivery_notes TEXT,
    version_number INTEGER DEFAULT 1,
    is_final BOOLEAN DEFAULT FALSE,
    
    -- Delivery tracking
    delivered_at TIMESTAMPTZ,
    client_confirmed BOOLEAN DEFAULT FALSE,
    client_confirmed_at TIMESTAMPTZ,
    
    -- Audit
    uploaded_by UUID REFERENCES staff_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    
);

-- DELIVERABLES INDEXES
CREATE INDEX IF NOT EXISTS idx_deliverables_project_id 
    ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_delivered_at 
    ON deliverables(delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_deliverables_uploaded_by 
    ON deliverables(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_deliverables_final 
    ON deliverables(project_id) WHERE is_final = TRUE;

-- DELIVERABLES COMMENTS
COMMENT ON TABLE deliverables IS 'Project deliverables (completed work files)';
COMMENT ON COLUMN deliverables.project_id IS 'Reference to the project';
COMMENT ON COLUMN deliverables.file_name IS 'Deliverable file name';
COMMENT ON COLUMN deliverables.file_url IS 'URL to the file in storage';
COMMENT ON COLUMN deliverables.file_type IS 'MIME type of the file';
COMMENT ON COLUMN deliverables.file_size_bytes IS 'File size in bytes';
COMMENT ON COLUMN deliverables.delivery_notes IS 'Notes about this deliverable';
COMMENT ON COLUMN deliverables.version_number IS 'Version number of the deliverable';
COMMENT ON COLUMN deliverables.is_final IS 'Whether this is the final deliverable';
COMMENT ON COLUMN deliverables.delivered_at IS 'When the deliverable was sent to client';
COMMENT ON COLUMN deliverables.client_confirmed IS 'Whether client confirmed receipt';
COMMENT ON COLUMN deliverables.uploaded_by IS 'Staff member who uploaded';

-- ============================================================
-- ACTIVITY LOGS TABLE
-- ============================================================
-- Stores all activity logs for auditing and tracking.
-- Activity logs should NOT be deleted through application policies.

-- Create enum type for action categories
DO $$ BEGIN
    CREATE TYPE activity_category AS ENUM (
        'Request',
        'Project',
        'Document',
        'Payment',
        'Assessment',
        'Recommendation',
        'Deliverable',
        'QA',
        'Client',
        'Staff',
        'System'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Categorization
    category activity_category NOT NULL DEFAULT 'System',
    
    -- Action description
    action TEXT NOT NULL, -- e.g., 'created', 'updated', 'approved', 'rejected'
    description TEXT NOT NULL,
    
    -- Reference to related entities (flexible)
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    support_request_id UUID REFERENCES support_requests(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Entity type and ID for flexible referencing
    entity_type TEXT, -- e.g., 'support_requests', 'projects', 'payments'
    entity_id UUID, -- ID of the affected entity
    
    -- Actor information
    performed_by UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional context data
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    
);

-- ACTIVITY LOGS INDEXES
CREATE INDEX IF NOT EXISTS idx_activity_logs_client_id 
    ON activity_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_support_request_id 
    ON activity_logs(support_request_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id 
    ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category 
    ON activity_logs(category);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action 
    ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_performed_by 
    ON activity_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity 
    ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at 
    ON activity_logs(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_request_timeline 
    ON activity_logs(support_request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_timeline 
    ON activity_logs(project_id, created_at DESC);

-- ACTIVITY LOGS COMMENTS
COMMENT ON TABLE activity_logs IS 'Audit trail for all system activities';
COMMENT ON COLUMN activity_logs.category IS 'Category of the activity';
COMMENT ON COLUMN activity_logs.action IS 'Action performed (created, updated, etc.)';
COMMENT ON COLUMN activity_logs.description IS 'Human-readable description';
COMMENT ON COLUMN activity_logs.client_id IS 'Related client (if applicable)';
COMMENT ON COLUMN activity_logs.support_request_id IS 'Related request (if applicable)';
COMMENT ON COLUMN activity_logs.project_id IS 'Related project (if applicable)';
COMMENT ON COLUMN activity_logs.entity_type IS 'Type of entity affected';
COMMENT ON COLUMN activity_logs.entity_id IS 'ID of affected entity';
COMMENT ON COLUMN activity_logs.performed_by IS 'Staff who performed the action';
COMMENT ON COLUMN activity_logs.ip_address IS 'IP address of the actor';
COMMENT ON COLUMN activity_logs.user_agent IS 'User agent of the actor';
COMMENT ON COLUMN activity_logs.metadata IS 'Additional context (JSON)';

-- ============================================================
-- VERIFY TABLES CREATION
-- ============================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'qa_reviews'
    ) THEN
        RAISE NOTICE 'Table qa_reviews created successfully';
    ELSE
        RAISE EXCEPTION 'Table qa_reviews was not created';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'deliverables'
    ) THEN
        RAISE NOTICE 'Table deliverables created successfully';
    ELSE
        RAISE EXCEPTION 'Table deliverables was not created';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'activity_logs'
    ) THEN
        RAISE NOTICE 'Table activity_logs created successfully';
    ELSE
        RAISE EXCEPTION 'Table activity_logs was not created';
    END IF;
END $$;
