-- Migration: 010_rls_policies.sql
-- Description: Creates Row Level Security policies for all tables
-- Created: 2024
-- Dependencies: 002_users_tables, 003_support_requests, 004_projects, 005_documents, 006_assessments_recommendations, 007_payments, 008_qa_deliverables_activity_logs

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

-- Enable RLS on support_requests
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Enable RLS on documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Enable RLS on assessments
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on recommendations
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on qa_reviews
ALTER TABLE qa_reviews ENABLE ROW LEVEL SECURITY;

-- Enable RLS on deliverables
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- Enable RLS on activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to check if current user is an authenticated staff member
-- Roles: super_admin, operations_admin, reviewer
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

-- Staff can view their own profile
CREATE POLICY "staff_view_own_profile"
    ON staff_users FOR SELECT
    USING (auth.uid() = auth_uid);

-- Admin can view all staff profiles (for management)
CREATE POLICY "admin_can_view_all_staff"
    ON staff_users FOR SELECT
    USING (is_admin_level() = TRUE);

-- Admin can insert new staff
CREATE POLICY "admin_can_insert_staff"
    ON staff_users FOR INSERT
    WITH CHECK (is_admin_level() = TRUE);

-- Admin can update staff
CREATE POLICY "admin_can_update_staff"
    ON staff_users FOR UPDATE
    USING (is_admin_level() = TRUE);

-- Super admin can delete staff
CREATE POLICY "super_admin_can_delete_staff"
    ON staff_users FOR DELETE
    USING (is_super_admin() = TRUE);

-- ============================================================
-- CLIENTS POLICIES
-- ============================================================

-- Staff can view all clients
CREATE POLICY "staff_can_view_clients"
    ON clients FOR SELECT
    USING (is_staff_member() = TRUE);

-- Public can create client account (sign up)
CREATE POLICY "public_can_create_client"
    ON clients FOR INSERT
    WITH CHECK (auth.uid() = auth_uid);

-- Clients can view their own profile
CREATE POLICY "client_can_view_own_profile"
    ON clients FOR SELECT
    USING (auth.uid() = auth_uid);

-- Clients can update their own profile
CREATE POLICY "client_can_update_own_profile"
    ON clients FOR UPDATE
    USING (auth.uid() = auth_uid);

-- ============================================================
-- SUPPORT_REQUESTS POLICIES
-- ============================================================

-- ANONYMOUS PUBLIC can INSERT new support request (for public request form)
-- This is the only public write operation allowed - no authentication required
CREATE POLICY "public_can_create_support_request"
    ON support_requests FOR INSERT
    WITH CHECK (TRUE); -- Allow anonymous inserts

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

-- Clients can view their own support requests
CREATE POLICY "client_can_view_own_requests"
    ON support_requests FOR SELECT
    USING (auth.uid() = client_id);

-- ============================================================
-- PROJECTS POLICIES
-- ============================================================

-- Staff can view all projects
CREATE POLICY "staff_can_view_projects"
    ON projects FOR SELECT
    USING (is_staff_member() = TRUE);

-- Staff can insert projects (from approved requests)
CREATE POLICY "staff_can_insert_projects"
    ON projects FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

-- Staff can update projects
CREATE POLICY "staff_can_update_projects"
    ON projects FOR UPDATE
    USING (is_staff_member() = TRUE);

-- Admin can delete projects
CREATE POLICY "admin_can_delete_projects"
    ON projects FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view their own projects
CREATE POLICY "client_can_view_own_projects"
    ON projects FOR SELECT
    USING (auth.uid() = client_id);

-- ============================================================
-- DOCUMENTS POLICIES
-- ============================================================

-- Staff can view all documents
CREATE POLICY "staff_can_view_documents"
    ON documents FOR SELECT
    USING (is_staff_member() = TRUE);

-- Staff can insert documents
CREATE POLICY "staff_can_insert_documents"
    ON documents FOR INSERT
    WITH CHECK (
        is_staff_member() = TRUE 
        OR auth.uid() = client_id
    );

-- Staff can update documents
CREATE POLICY "staff_can_update_documents"
    ON documents FOR UPDATE
    USING (is_staff_member() = TRUE);

-- Admin can delete documents
CREATE POLICY "admin_can_delete_documents"
    ON documents FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view their own documents
CREATE POLICY "client_can_view_own_documents"
    ON documents FOR SELECT
    USING (auth.uid() = client_id);

-- ============================================================
-- ASSESSMENTS POLICIES
-- ============================================================

-- Staff can view all assessments
CREATE POLICY "staff_can_view_assessments"
    ON assessments FOR SELECT
    USING (is_staff_member() = TRUE);

-- Staff can insert assessments
CREATE POLICY "staff_can_insert_assessments"
    ON assessments FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

-- Staff can update assessments
CREATE POLICY "staff_can_update_assessments"
    ON assessments FOR UPDATE
    USING (is_staff_member() = TRUE);

-- Admin can delete assessments
CREATE POLICY "admin_can_delete_assessments"
    ON assessments FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view their own assessments
CREATE POLICY "client_can_view_own_assessments"
    ON assessments FOR SELECT
    USING (
        auth.uid() IN (
            SELECT client_id FROM support_requests 
            WHERE id = support_request_id
        )
    );

-- ============================================================
-- RECOMMENDATIONS POLICIES
-- ============================================================

-- Staff can view all recommendations
CREATE POLICY "staff_can_view_recommendations"
    ON recommendations FOR SELECT
    USING (is_staff_member() = TRUE);

-- Staff can insert recommendations
CREATE POLICY "staff_can_insert_recommendations"
    ON recommendations FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

-- Staff can update recommendations
CREATE POLICY "staff_can_update_recommendations"
    ON recommendations FOR UPDATE
    USING (is_staff_member() = TRUE);

-- Admin can delete recommendations
CREATE POLICY "admin_can_delete_recommendations"
    ON recommendations FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view their own recommendations
CREATE POLICY "client_can_view_own_recommendations"
    ON recommendations FOR SELECT
    USING (
        auth.uid() IN (
            SELECT client_id FROM support_requests 
            WHERE id = support_request_id
        )
    );

-- Clients can update their recommendations (accept/reject)
CREATE POLICY "client_can_update_own_recommendations"
    ON recommendations FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT client_id FROM support_requests 
            WHERE id = support_request_id
        )
        AND status IN ('Sent to Client')
    );

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================
-- NOTE: Reviewers CANNOT modify payments - strict access for this role

-- Staff can view all payments
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

-- Admin can delete payments
CREATE POLICY "admin_can_delete_payments"
    ON payments FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view their own payments
CREATE POLICY "client_can_view_own_payments"
    ON payments FOR SELECT
    USING (auth.uid() = client_id);

-- Clients can insert their own payment records
CREATE POLICY "client_can_insert_own_payments"
    ON payments FOR INSERT
    WITH CHECK (auth.uid() = client_id);

-- Clients can update their own pending payments
CREATE POLICY "client_can_update_own_pending_payments"
    ON payments FOR UPDATE
    USING (
        auth.uid() = client_id 
        AND status = 'Pending'
    );

-- ============================================================
-- QA_REVIEWS POLICIES
-- ============================================================

-- Staff can view all QA reviews
CREATE POLICY "staff_can_view_qa_reviews"
    ON qa_reviews FOR SELECT
    USING (is_staff_member() = TRUE);

-- Staff can insert QA reviews
CREATE POLICY "staff_can_insert_qa_reviews"
    ON qa_reviews FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

-- Staff can update QA reviews
CREATE POLICY "staff_can_update_qa_reviews"
    ON qa_reviews FOR UPDATE
    USING (is_staff_member() = TRUE);

-- Admin can delete QA reviews
CREATE POLICY "admin_can_delete_qa_reviews"
    ON qa_reviews FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view QA reviews for their projects
CREATE POLICY "client_can_view_project_qa_reviews"
    ON qa_reviews FOR SELECT
    USING (
        auth.uid() IN (
            SELECT client_id FROM projects 
            WHERE id = project_id
        )
    );

-- ============================================================
-- DELIVERABLES POLICIES
-- ============================================================

-- Staff can view all deliverables
CREATE POLICY "staff_can_view_deliverables"
    ON deliverables FOR SELECT
    USING (is_staff_member() = TRUE);

-- Staff can insert deliverables
CREATE POLICY "staff_can_insert_deliverables"
    ON deliverables FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

-- Staff can update deliverables
CREATE POLICY "staff_can_update_deliverables"
    ON deliverables FOR UPDATE
    USING (is_staff_member() = TRUE);

-- Admin can delete deliverables
CREATE POLICY "admin_can_delete_deliverables"
    ON deliverables FOR DELETE
    USING (is_admin_level() = TRUE);

-- Clients can view deliverables for their projects
CREATE POLICY "client_can_view_own_deliverables"
    ON deliverables FOR SELECT
    USING (
        auth.uid() IN (
            SELECT client_id FROM projects 
            WHERE id = project_id
        )
    );

-- Clients can confirm receipt of deliverables
CREATE POLICY "client_can_confirm_deliverables"
    ON deliverables FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT client_id FROM projects 
            WHERE id = project_id
        )
        AND client_confirmed = FALSE
    );

-- ============================================================
-- ACTIVITY_LOGS POLICIES
-- ============================================================
-- NOTE: Activity logs should NOT be deleted through application policy

-- Staff can view activity logs
CREATE POLICY "staff_can_view_activity_logs"
    ON activity_logs FOR SELECT
    USING (is_staff_member() = TRUE);

-- Staff can insert activity logs (for audit trail)
CREATE POLICY "staff_can_insert_activity_logs"
    ON activity_logs FOR INSERT
    WITH CHECK (is_staff_member() = TRUE);

-- NO UPDATE policy on activity logs (immutable audit trail)

-- NO DELETE policy for activity_logs
-- This ensures audit logs cannot be deleted through the application

-- Clients can view activity logs related to their requests/projects
CREATE POLICY "client_can_view_own_activity_logs"
    ON activity_logs FOR SELECT
    USING (
        auth.uid() = client_id
        OR auth.uid() IN (
            SELECT client_id FROM support_requests 
            WHERE id = support_request_id
        )
        OR auth.uid() IN (
            SELECT client_id FROM projects 
            WHERE id = project_id
        )
    );

-- ============================================================
-- VERIFY RLS STATUS
-- ============================================================
DO $$ 
DECLARE
    tables TEXT[] := ARRAY[
        'staff_users',
        'clients',
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

-- ============================================================
-- ADDITIONAL SECURITY MEASURES
-- ============================================================

-- Prevent direct updates to reference numbers (should be generated, not edited)

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

-- Create triggers to prevent reference modifications
DROP TRIGGER IF EXISTS prevent_support_request_reference_change ON support_requests;
CREATE TRIGGER prevent_support_request_reference_change
    BEFORE UPDATE ON support_requests
    FOR EACH ROW
    EXECUTE FUNCTION prevent_reference_modification();

DROP TRIGGER IF EXISTS prevent_project_reference_change ON projects;
CREATE TRIGGER prevent_project_reference_change
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION prevent_reference_modification();

-- ============================================================
-- SUMMARY
-- ============================================================
-- This migration creates comprehensive Row Level Security policies:
-- 
-- PUBLIC ACCESS (ANONYMOUS):
-- - Can create support requests (no authentication required)
-- 
-- AUTHENTICATED CLIENTS:
-- - Can view their own profile
-- - Can view their own requests, projects, documents, payments
-- - Can accept/reject recommendations
-- 
-- STAFF (all roles: super_admin, operations_admin, reviewer):
-- - Can view all data
-- - Can manage requests, projects, assessments, recommendations
-- - Reviewers CANNOT modify payments
-- 
-- OPERATIONS_ADMIN:
-- - Full CRUD on all operational tables
-- - Can delete staff, clients, requests, projects, documents, etc.
-- 
-- SUPER_ADMIN:
-- - Full access including delete operations
-- 
-- ACTIVITY LOGS:
-- - Cannot be deleted through application
-- - Creates complete audit trail
