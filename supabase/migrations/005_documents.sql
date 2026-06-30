-- Migration: 005_documents.sql
-- Description: Creates the documents table for file management
-- Created: 2024
-- Dependencies: 002_users_tables (clients, staff_users), 003_support_requests, 004_projects

-- ============================================================
-- DOCUMENTS TABLE
-- ============================================================
-- Stores document metadata for files uploaded during requests and projects.
-- Files are stored in Supabase Storage buckets.
-- Documents are permanent - corrections handled through version uploads and activity logs.

-- Create enum type for document category
DO $$ BEGIN
    CREATE TYPE document_category AS ENUM (
        'Thesis Guide',
        'Proposal',
        'Draft Chapter',
        'Supervisor Comment',
        'Data',
        'Payment Proof',
        'Agreement',
        'Final Deliverable',
        'Other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum type for file type
DO $$ BEGIN
    CREATE TYPE document_file_type AS ENUM (
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'application/zip',
        'text/plain',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the documents table
CREATE TABLE IF NOT EXISTS documents (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Client relationship (required)
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Optional relationship to support_request
    -- Document may be for a request without a project yet
    support_request_id UUID REFERENCES support_requests(id) ON DELETE SET NULL,
    
    -- Optional relationship to project
    -- Document may be for a project (mutually exclusive with support_request_id in some cases)
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- File information
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type document_file_type NOT NULL DEFAULT 'other',
    file_size_bytes BIGINT, -- Size in bytes for display
    
    -- Document categorization
    category document_category NOT NULL DEFAULT 'Other',
    
    -- Upload information
    uploaded_by UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    
    -- Description
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Index on client_id
CREATE INDEX IF NOT EXISTS idx_documents_client_id 
    ON documents(client_id);

-- Index on support_request_id
CREATE INDEX IF NOT EXISTS idx_documents_support_request_id 
    ON documents(support_request_id);

-- Index on project_id
CREATE INDEX IF NOT EXISTS idx_documents_project_id 
    ON documents(project_id);

-- Index on category
CREATE INDEX IF NOT EXISTS idx_documents_category 
    ON documents(category);

-- Index on file_type
CREATE INDEX IF NOT EXISTS idx_documents_file_type 
    ON documents(file_type);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_documents_created_at 
    ON documents(created_at DESC);

-- Composite index for request documents
CREATE INDEX IF NOT EXISTS idx_documents_request_category 
    ON documents(support_request_id, category);

-- Composite index for project documents
CREATE INDEX IF NOT EXISTS idx_documents_project_category 
    ON documents(project_id, category);

-- ============================================================
-- CONSTRAINTS
-- ============================================================

-- Check that file_size is non-negative
ALTER TABLE documents DROP CONSTRAINT IF EXISTS check_file_size;
ALTER TABLE documents ADD CONSTRAINT check_file_size 
    CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0);

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE documents IS 'Document metadata for files uploaded to requests and projects';
COMMENT ON COLUMN documents.client_id IS 'Reference to the owning client';
COMMENT ON COLUMN documents.support_request_id IS 'Optional link to a support request';
COMMENT ON COLUMN documents.project_id IS 'Optional link to a project';
COMMENT ON COLUMN documents.file_name IS 'Original file name';
COMMENT ON COLUMN documents.file_url IS 'URL/path to the file in storage';
COMMENT ON COLUMN documents.file_type IS 'MIME type of the file';
COMMENT ON COLUMN documents.file_size_bytes IS 'File size in bytes';
COMMENT ON COLUMN documents.category IS 'Document category for organization';
COMMENT ON COLUMN documents.uploaded_by IS 'Staff member who uploaded the document';
COMMENT ON COLUMN documents.description IS 'Optional description of the document';

-- ============================================================
-- VERIFY TABLE CREATION
-- ============================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'documents'
    ) THEN
        RAISE NOTICE 'Table documents created successfully';
    ELSE
        RAISE EXCEPTION 'Table documents was not created';
    END IF;
END $$;
