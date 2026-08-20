-- Migration: 010_rls_policies.sql
-- Description: Creates Row Level Security policies for all tables
-- Created: 2024
-- Dependencies: 002_users_tables, 003_support_requests, 004_projects, 005_documents, 006_assessments_recommendations, 007_payments, 008_qa_deliverables_activity_logs
-- NOTE: This migration is idempotent - safe to rerun after partial execution

-- ============================================================
-- CLEANUP: Drop existing policies and functions if they exist
-- ============================================================

-- Drop existing RLS policies (if migration was partially run)
DROP POLICY IF EXISTS "staff_view_own_profile" ON staff_users;
DROP POLICY IF EXISTS "admin_can_view_all_staff" ON staff_users;
DROP POLICY IF EXISTS "admin_can_insert_staff" ON staff_users;
DROP POLICY IF EXISTS "admin_can_update_staff" ON staff_users;
DROP POLICY IF EXISTS "super_admin_can_delete_staff" ON staff_users;

DROP POLICY IF EXISTS "staff_can_view_clients" ON clients;
DROP POLICY IF EXISTS "public_can_create_client" ON clients;
DROP POLICY IF EXISTS "client_can_view_own_profile" ON clients;
DROP POLICY IF EXISTS "client_can_update_own_profile" ON clients;

DROP POLICY IF EXISTS "public_can_create_support_request" ON support_requests;
DROP POLICY IF EXISTS "staff_can_view_support_requests" ON support_requests;
DROP POLICY IF EXISTS "staff_can_update_support_requests" ON support_requests;
DROP POLICY IF EXISTS "admin_can_delete_support_requests" ON support_requests;
DROP POLICY IF EXISTS "client_can_view_own_requests" ON support_requests;

DROP POLICY IF EXISTS "staff_can_view_projects" ON projects;
DROP POLICY IF EXISTS "staff_can_insert_projects" ON projects;
DROP POLICY IF EXISTS "staff_can_update_projects" ON projects;
DROP POLICY IF EXISTS "admin_can_delete_projects" ON projects;
DROP POLICY IF EXISTS "client_can_view_own_projects" ON projects;

DROP POLICY IF EXISTS "staff_can_view_documents" ON documents;
DROP POLICY IF EXISTS "staff_can_insert_documents" ON documents;
DROP POLICY IF EXISTS "staff_can_update_documents" ON documents;
DROP POLICY IF EXISTS "admin_can_delete_documents" ON documents;
DROP POLICY IF EXISTS "client_can_view_own_documents" ON documents;

DROP POLICY IF EXISTS "staff_can_view_assessments" ON assessments;
DROP POLICY IF EXISTS "staff_can_insert_assessments" ON assessments;
DROP POLICY IF EXISTS "staff_can_update_assessments" ON assessments;
DROP POLICY IF EXISTS "admin_can_delete_assessments" ON assessments;

DROP POLICY IF EXISTS "staff_can_view_recommendations" ON recommendations;
DROP POLICY IF EXISTS "staff_can_insert_recommendations" ON recommendations;
DROP POLICY IF EXISTS "staff_can_update_recommendations" ON recommendations;
DROP POLICY IF EXISTS "admin_can_delete_recommendations" ON recommendations;

DROP POLICY IF EXISTS "staff_can_view_payments" ON payments;
DROP POLICY IF EXISTS "staff_can_insert_payments" ON payments;
DROP POLICY IF EXISTS "staff_can_update_payments" ON payments;
DROP POLICY IF EXISTS "admin_can_delete_payments" ON payments;
DROP POLICY IF EXISTS "client_can_view_own_payments" ON payments;
DROP POLICY IF EXISTS "client_can_insert_own_payments" ON payments;
DROP POLICY IF EXISTS "client_can_update_own_pending_payments" ON payments;

DROP POLICY IF EXISTS "staff_can_view_qa_reviews" ON qa_reviews;
DROP POLICY IF EXISTS "staff_can_insert_qa_reviews" ON qa_reviews;
DROP POLICY IF EXISTS "staff_can_update_qa_reviews" ON qa_reviews;
DROP POLICY IF EXISTS "admin_can_delete_qa_reviews" ON qa_reviews;
DROP POLICY IF EXISTS "client_can_view_project_qa_reviews" ON qa_reviews;

DROP POLICY IF EXISTS "staff_can_view_deliverables" ON deliverables;
DROP POLICY IF EXISTS "staff_can_insert_deliverables" ON deliverables;
DROP POLICY IF EXISTS "staff_can_update_deliverables" ON deliverables;
DROP POLICY IF EXISTS "admin_can_delete_deliverables" ON deliverables;
DROP POLICY IF EXISTS "client_can_view_own_deliverables" ON deliverables;
DROP POLICY IF EXISTS "client_can_confirm_deliverables" ON deliverables;

DROP POLICY IF EXISTS "staff_can_view_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "staff_can_insert_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "client_can_view_own_activity_logs" ON activity_logs;

-- Drop existing helper functions (if migration was partially run)
DROP FUNCTION IF EXISTS is_staff_member();
DROP FUNCTION IF EXISTS is_super_admin();
DROP FUNCTION IF EXISTS is_operations_admin();
DROP FUNCTION IF EXISTS is_reviewer();
DROP FUNCTION IF EXISTS is_admin_level();
DROP FUNCTION IF EXISTS prevent_reference_modification();

-- Drop existing triggers
DROP TRIGGER IF EXISTS prevent_support_request_reference_change ON support_requests;
DROP TRIGGER IF EXISTS prevent_project_reference_change ON projects;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to check if current user is an authenticated staff member
CREATE OR REPLACE FUNCTION is_staff_member()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff_users 
        WHERE auth_uid = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is a super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff_users 
        WHERE auth_uid = auth.uid()
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is an operations_admin
CREATE OR REPLACE FUNCTION is_operations_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff_users 
        WHERE auth_uid = auth.uid()
        AND role = 'operations_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is a reviewer
CREATE OR REPLACE FUNCTION is_reviewer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff_users 
        WHERE auth_uid = auth.uid()
        AND role = 'reviewer'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has admin-level access
CREATE OR REPLACE FUNCTION is_admin_level()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_super_admin() OR is_operations_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STAFF_USERS POLICIES
-- ============================================================

CREATE POLICY "staff_view_own_profile"
    ON staff_users FOR SELECT
    USING (auth.uid() = auth_uid);

CREATE POLICY "admin_can_view_all_staff"
    ON staff_users FOR SELECT
    USING (is_admin_level() = TRUE);

CREATE POLICY "admin_can_insert_staff"
    ON staff_users FOR INSERT
    WITH CHECK (is_admin_level() = TRUE);

CREATE POLICY "admin_can_update_staff"
    ON staff_users FOR UPDATE
    USING (is_admin_level() = TRUE);

CREATE POLICY "super_admin_can_delete_staff"
    ON staff_users FOR DELETE
    USING (is_super_admin() = TRUE);

-- ============================================================
-- CLIENTS POLICIES
-- ============================================================

CREATE POLICY "staff_can_view_clients"
    ON clients FOR SELECT
    USING (is_staff_member() = TRUE);

CREATE POLICY "public_can_create_client"
    ON clients FOR INSERT
    WITH CHECK (auth.uid() = auth_uid);

CREATE POLICY "client_can_view_own_profile"
    ON clients FOR SELECT
    USING (auth.uid() = auth_uid);

CREATE POLICY "client_can_update_own_profile"
    ON clients FOR UPDATE
    USING (auth.uid() = auth_uid);

-- ============================================================
-- SUPPORT_REQUESTS POLICIES
-- ============================================================

-- ANONYMOUS PUBLIC can INSERT new support request (for public request form)
CREATE POLICY "public_can_create_support_request"
    ON support_requests FOR INSERT
    WITH CHECK (TRUE);

-- Staff can view all support requests
CREATE POLICY "staff_can_view_support_requests"
    ON support_requests FOR SELECT
    USING (is_staff_member() = TRUE);

-- Staff can update support requests
CREATE POLICY "staff_can_update_support_requests"
    ON support_requests FOR UPDATE
    USING (is_staff_member() = TRUE);

-- Admin can delete support requests
CREATE POLICY "admin_can_delete_support_requests"
    ON support_requests FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view their own support requests (FIXED: lookup via clients table)
CREATE POLICY "client_can_view_own_requests"
    ON support_requests FOR SELECT
    USING (
        auth.uid() IN (
            SELECT auth_uid FROM clients WHERE id = support_requests.client_id
        )
    );

-- ============================================================
-- PROJECTS POLICIES
-- ============================================================

CREATE POLICY "staff_can_view_projects"
    ON projects FOR SELECT
    USING (is_staff_member() = TRUE);

CREATE POLICY "staff_can_insert_projects"
    ON projects FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

CREATE POLICY "staff_can_update_projects"
    ON projects FOR UPDATE
    USING (is_staff_member() = TRUE);

CREATE POLICY "admin_can_delete_projects"
    ON projects FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view their own projects (FIXED: lookup via clients table)
CREATE POLICY "client_can_view_own_projects"
    ON projects FOR SELECT
    USING (
        auth.uid() IN (
            SELECT auth_uid FROM clients WHERE id = projects.client_id
        )
    );

-- ============================================================
-- DOCUMENTS POLICIES
-- ============================================================

CREATE POLICY "staff_can_view_documents"
    ON documents FOR SELECT
    USING (is_staff_member() = TRUE);

-- Staff can insert documents; clients can insert for their own records (FIXED)
CREATE POLICY "staff_can_insert_documents"
    ON documents FOR INSERT
    WITH CHECK (
        is_staff_member() = TRUE 
        OR auth.uid() IN (SELECT auth_uid FROM clients WHERE id = documents.client_id)
    );

CREATE POLICY "staff_can_update_documents"
    ON documents FOR UPDATE
    USING (is_staff_member() = TRUE);

CREATE POLICY "admin_can_delete_documents"
    ON documents FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view their own documents (FIXED: lookup via clients table)
CREATE POLICY "client_can_view_own_documents"
    ON documents FOR SELECT
    USING (
        auth.uid() IN (
            SELECT auth_uid FROM clients WHERE id = documents.client_id
        )
    );

-- ============================================================
-- ASSESSMENTS POLICIES
-- ============================================================

CREATE POLICY "staff_can_view_assessments"
    ON assessments FOR SELECT
    USING (is_staff_member() = TRUE);

CREATE POLICY "staff_can_insert_assessments"
    ON assessments FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

CREATE POLICY "staff_can_update_assessments"
    ON assessments FOR UPDATE
    USING (is_staff_member() = TRUE);

CREATE POLICY "admin_can_delete_assessments"
    ON assessments FOR DELETE
    USING (is_admin_level() = TRUE);

-- ============================================================
-- RECOMMENDATIONS POLICIES
-- ============================================================

CREATE POLICY "staff_can_view_recommendations"
    ON recommendations FOR SELECT
    USING (is_staff_member() = TRUE);

CREATE POLICY "staff_can_insert_recommendations"
    ON recommendations FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

CREATE POLICY "staff_can_update_recommendations"
    ON recommendations FOR UPDATE
    USING (is_staff_member() = TRUE);

CREATE POLICY "admin_can_delete_recommendations"
    ON recommendations FOR DELETE
    USING (is_admin_level() = TRUE);

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================

CREATE POLICY "staff_can_view_payments"
    ON payments FOR SELECT
    USING (is_staff_member() = TRUE);

-- Staff (except reviewers) can insert payments
CREATE POLICY "staff_can_insert_payments"
    ON payments FOR INSERT
    WITH CHECK (
        is_staff_member() = TRUE 
        AND is_reviewer() = FALSE
    );

-- Staff (except reviewers) can update payments
CREATE POLICY "staff_can_update_payments"
    ON payments FOR UPDATE
    USING (
        is_staff_member() = TRUE 
        AND is_reviewer() = FALSE
    );

CREATE POLICY "admin_can_delete_payments"
    ON payments FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view their own payments (FIXED: lookup via clients table)
CREATE POLICY "client_can_view_own_payments"
    ON payments FOR SELECT
    USING (
        auth.uid() IN (
            SELECT auth_uid FROM clients WHERE id = payments.client_id
        )
    );

-- Clients can insert their own payment records (FIXED)
CREATE POLICY "client_can_insert_own_payments"
    ON payments FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT auth_uid FROM clients WHERE id = payments.client_id
        )
    );

-- Clients can update their own pending payments (FIXED)
CREATE POLICY "client_can_update_own_pending_payments"
    ON payments FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT auth_uid FROM clients WHERE id = payments.client_id
        )
        AND status = 'Pending'
    );

-- ============================================================
-- QA_REVIEWS POLICIES
-- ============================================================

CREATE POLICY "staff_can_view_qa_reviews"
    ON qa_reviews FOR SELECT
    USING (is_staff_member() = TRUE);

CREATE POLICY "staff_can_insert_qa_reviews"
    ON qa_reviews FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

CREATE POLICY "staff_can_update_qa_reviews"
    ON qa_reviews FOR UPDATE
    USING (is_staff_member() = TRUE);

CREATE POLICY "admin_can_delete_qa_reviews"
    ON qa_reviews FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view QA reviews for their projects (FIXED: JOIN via clients/projects)
CREATE POLICY "client_can_view_project_qa_reviews"
    ON qa_reviews FOR SELECT
    USING (
        auth.uid() IN (
            SELECT c.auth_uid FROM clients c
            JOIN projects p ON c.id = p.client_id
            WHERE p.id = qa_reviews.project_id
        )
    );

-- ============================================================
-- DELIVERABLES POLICIES
-- ============================================================

CREATE POLICY "staff_can_view_deliverables"
    ON deliverables FOR SELECT
    USING (is_staff_member() = TRUE);

CREATE POLICY "staff_can_insert_deliverables"
    ON deliverables FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

CREATE POLICY "staff_can_update_deliverables"
    ON deliverables FOR UPDATE
    USING (is_staff_member() = TRUE);

CREATE POLICY "admin_can_delete_deliverables"
    ON deliverables FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view deliverables for their projects (FIXED: JOIN via clients/projects)
CREATE POLICY "client_can_view_own_deliverables"
    ON deliverables FOR SELECT
    USING (
        auth.uid() IN (
            SELECT c.auth_uid FROM clients c
            JOIN projects p ON c.id = p.client_id
            WHERE p.id = deliverables.project_id
        )
    );

-- Clients can confirm receipt of deliverables (FIXED)
CREATE POLICY "client_can_confirm_deliverables"
    ON deliverables FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT c.auth_uid FROM clients c
            JOIN projects p ON c.id = p.client_id
            WHERE p.id = deliverables.project_id
        )
        AND client_confirmed = FALSE
    );

-- ============================================================
-- ACTIVITY_LOGS POLICIES
-- ============================================================
-- NOTE: Activity logs should NOT be deleted through application policy

CREATE POLICY "staff_can_view_activity_logs"
    ON activity_logs FOR SELECT
    USING (is_staff_member() = TRUE);

CREATE POLICY "staff_can_insert_activity_logs"
    ON activity_logs FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

-- NO UPDATE policy on activity logs (immutable audit trail)
-- NO DELETE policy for activity_logs

-- Clients can view activity logs related to their requests/projects (FIXED: JOIN via clients)
CREATE POLICY "client_can_view_own_activity_logs"
    ON activity_logs FOR SELECT
    USING (
        -- Direct client reference
        auth.uid() IN (SELECT auth_uid FROM clients WHERE id = activity_logs.client_id)
        -- Via support request
        OR auth.uid() IN (
            SELECT c.auth_uid FROM clients c
            JOIN support_requests sr ON c.id = sr.client_id
            WHERE sr.id = activity_logs.support_request_id
        )
        -- Via project
        OR auth.uid() IN (
            SELECT c.auth_uid FROM clients c
            JOIN projects p ON c.id = p.client_id
            WHERE p.id = activity_logs.project_id
        )
    );

-- ============================================================
-- ADDITIONAL SECURITY: Prevent reference modifications
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_reference_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'support_requests' THEN
        IF NEW.request_reference != OLD.request_reference THEN
            RAISE EXCEPTION 'Request reference cannot be modified';
        END IF;
    ELSIF TG_TABLE_NAME = 'projects' THEN
        IF NEW.project_reference != OLD.project_reference THEN
            RAISE EXCEPTION 'Project reference cannot be modified';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_support_request_reference_change
    BEFORE UPDATE ON support_requests
    FOR EACH ROW
    EXECUTE FUNCTION prevent_reference_modification();

CREATE TRIGGER prevent_project_reference_change
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION prevent_reference_modification();

-- ============================================================
-- VERIFY RLS STATUS
-- ============================================================
DO $$ 
DECLARE
    tables TEXT[] := ARRAY[
        'support_requests',
        'projects',
        'documents',
        'assessments',
        'recommendations',
        'payments',
        'qa_reviews',
        'deliverables',
        'activity_logs'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = t
            AND relrowsecurity = TRUE
        ) THEN
            RAISE NOTICE 'RLS enabled on table: %', t;
        ELSE
            RAISE EXCEPTION 'RLS not enabled on table: %', t;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'All RLS policies created successfully';
END $$;
