-- Migration: 006_assessments_recommendations.sql
-- Description: Creates assessment and recommendation tables for request evaluation
-- Created: 2024
-- Dependencies: 002_users_tables (staff_users), 003_support_requests

-- ============================================================
-- ASSESSMENTS TABLE
-- ============================================================
-- Stores project assessments conducted by staff.
-- Each support request can have only one assessment.

-- Create enum type for assessment status
DO $$ BEGIN
    CREATE TYPE assessment_status AS ENUM (
        'Draft',
        'Completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum type for risk level
DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM (
        'Low',
        'Medium',
        'High'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the assessments table
CREATE TABLE IF NOT EXISTS assessments (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to the support request (1:1 relationship)
    support_request_id UUID UNIQUE NOT NULL REFERENCES support_requests(id) ON DELETE RESTRICT,
    
    -- Project stage at time of assessment
    current_project_stage TEXT NOT NULL,
    
    -- Timeline estimates
    completion_estimate TEXT, -- e.g., '2-3 weeks', '1 month'
    
    -- Risk assessment
    risk_level risk_level DEFAULT 'Medium',
    
    -- Detailed analysis
    strengths TEXT,
    weaknesses TEXT,
    missing_requirements TEXT,
    compliance_issues TEXT,
    
    -- Summary
    assessment_summary TEXT NOT NULL,
    
    -- Status
    status assessment_status NOT NULL DEFAULT 'Draft',
    
    -- Audit
    created_by UUID NOT NULL REFERENCES staff_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    
);

-- ============================================================
-- ASSESSMENT INDEXES
-- ============================================================

-- Index on support_request_id (unique)
CREATE INDEX IF NOT EXISTS idx_assessments_support_request_id 
    ON assessments(support_request_id);

-- Index on risk_level for filtering
CREATE INDEX IF NOT EXISTS idx_assessments_risk_level 
    ON assessments(risk_level);

-- Index on status
CREATE INDEX IF NOT EXISTS idx_assessments_status 
    ON assessments(status);

-- Index on created_by for tracking
CREATE INDEX IF NOT EXISTS idx_assessments_created_by 
    ON assessments(created_by);

-- ============================================================
-- ASSESSMENT UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assessments_updated_at ON assessments;
CREATE TRIGGER trigger_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ASSESSMENT COMMENTS
-- ============================================================
COMMENT ON TABLE assessments IS 'Project assessments conducted by staff';
COMMENT ON COLUMN assessments.support_request_id IS 'Link to the support request being assessed (unique)';
COMMENT ON COLUMN assessments.current_project_stage IS 'Current academic stage of the project';
COMMENT ON COLUMN assessments.completion_estimate IS 'Estimated time for completion';
COMMENT ON COLUMN assessments.risk_level IS 'Risk assessment: Low, Medium, or High';
COMMENT ON COLUMN assessments.strengths IS 'Identified strengths of the project';
COMMENT ON COLUMN assessments.weaknesses IS 'Identified weaknesses of the project';
COMMENT ON COLUMN assessments.missing_requirements IS 'Missing requirements or incomplete sections';
COMMENT ON COLUMN assessments.compliance_issues IS 'Issues with institution requirements or formatting';
COMMENT ON COLUMN assessments.assessment_summary IS 'Overall assessment summary and recommendation';
COMMENT ON COLUMN assessments.status IS 'Assessment status: Draft or Completed';
COMMENT ON COLUMN assessments.created_by IS 'Staff member who created the assessment';

-- ============================================================
-- RECOMMENDATIONS TABLE
-- ============================================================
-- Stores service recommendations based on assessments.
-- Each support request can have only one recommendation.

-- Create enum type for recommendation status
DO $$ BEGIN
    CREATE TYPE recommendation_status AS ENUM (
        'Draft',
        'Approved Internally',
        'Sent to Client',
        'Accepted',
        'Rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to the support request (1:1 relationship)
    support_request_id UUID UNIQUE NOT NULL REFERENCES support_requests(id) ON DELETE RESTRICT,
    
    -- Recommended service package
    recommended_service TEXT NOT NULL,
    
    -- Timeline
    recommended_timeline TEXT, -- e.g., '4-6 weeks'
    
    -- Fee structure
    recommended_fee DECIMAL(10,2),
    payment_structure TEXT, -- e.g., 'Full Payment', '50% Advance / 50% Before Delivery', 'Three Installments', 'Custom Arrangement'
    
    -- Roadmap
    roadmap_summary TEXT, -- Text summary of the service roadmap
    
    -- Summary
    recommendation_summary TEXT NOT NULL,
    
    -- Status
    status recommendation_status NOT NULL DEFAULT 'Draft',
    
    -- Client decision
    client_feedback TEXT,
    client_decision_at TIMESTAMPTZ,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES staff_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    
);

-- ============================================================
-- RECOMMENDATION INDEXES
-- ============================================================

-- Index on support_request_id (unique)
CREATE INDEX IF NOT EXISTS idx_recommendations_support_request_id 
    ON recommendations(support_request_id);

-- Index on status
CREATE INDEX IF NOT EXISTS idx_recommendations_status 
    ON recommendations(status);

-- Index on recommended_fee for filtering
CREATE INDEX IF NOT EXISTS idx_recommendations_fee 
    ON recommendations(recommended_fee);

-- Index on created_by
CREATE INDEX IF NOT EXISTS idx_recommendations_created_by 
    ON recommendations(created_by);

-- ============================================================
-- RECOMMENDATION UPDATED_AT TRIGGER
-- ============================================================

DROP TRIGGER IF EXISTS trigger_recommendations_updated_at ON recommendations;
CREATE TRIGGER trigger_recommendations_updated_at
    BEFORE UPDATE ON recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RECOMMENDATION COMMENTS
-- ============================================================
COMMENT ON TABLE recommendations IS 'Service recommendations based on assessments';
COMMENT ON COLUMN recommendations.support_request_id IS 'Link to the support request (unique)';
COMMENT ON COLUMN recommendations.recommended_service IS 'The recommended service package';
COMMENT ON COLUMN recommendations.recommended_timeline IS 'Estimated timeline for service delivery';
COMMENT ON COLUMN recommendations.recommended_fee IS 'Recommended service fee';
COMMENT ON COLUMN recommendations.payment_structure IS 'Payment structure: Full Payment, 50% Advance / 50% Before Delivery, Three Installments, Custom Arrangement';
COMMENT ON COLUMN recommendations.roadmap_summary IS 'Summary of the service delivery roadmap';
COMMENT ON COLUMN recommendations.recommendation_summary IS 'Overall recommendation summary';
COMMENT ON COLUMN recommendations.status IS 'Recommendation status';
COMMENT ON COLUMN recommendations.client_feedback IS 'Feedback from the client';
COMMENT ON COLUMN recommendations.client_decision_at IS 'When client made a decision';
COMMENT ON COLUMN recommendations.created_by IS 'Staff member who created the recommendation';

-- ============================================================
-- VERIFY TABLES CREATION
-- ============================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'assessments'
    ) THEN
        RAISE NOTICE 'Table assessments created successfully';
    ELSE
        RAISE EXCEPTION 'Table assessments was not created';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'recommendations'
    ) THEN
        RAISE NOTICE 'Table recommendations created successfully';
    ELSE
        RAISE EXCEPTION 'Table recommendations was not created';
    END IF;
END $$;
