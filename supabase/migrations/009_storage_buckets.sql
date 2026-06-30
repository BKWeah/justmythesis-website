-- Migration: 009_storage_buckets.sql
-- Description: Creates storage buckets for file management
-- Created: 2024
-- Dependencies: None (runs independently)

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Creates storage buckets for organizing different types of files.
-- Files are stored in Supabase Storage which is backed by S3-compatible storage.
-- File size validation is handled at the application layer.

-- ============================================================
-- BUCKET: request-documents
-- ============================================================
-- Stores documents uploaded for support requests (thesis guides, drafts, etc.)

INSERT INTO storage.buckets (id, name, public)
VALUES (
    'request-documents',
    'request-documents',
    false -- Private bucket
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BUCKET: project-documents
-- ============================================================
-- Stores documents related to active projects (drafts, supervisor comments, etc.)

INSERT INTO storage.buckets (id, name, public)
VALUES (
    'project-documents',
    'project-documents',
    false -- Private bucket
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BUCKET: payment-proofs
-- ============================================================
-- Stores proof of payment documents (screenshots, receipts, etc.)

INSERT INTO storage.buckets (id, name, public)
VALUES (
    'payment-proofs',
    'payment-proofs',
    false -- Private bucket
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BUCKET: deliverables
-- ============================================================
-- Stores final deliverables (completed thesis, presentation, etc.)

INSERT INTO storage.buckets (id, name, public)
VALUES (
    'deliverables',
    'deliverables',
    false -- Private bucket
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON BUCKET 'request-documents' IS 'Documents uploaded for support requests (thesis guides, proposals, drafts)';
COMMENT ON BUCKET 'project-documents' IS 'Documents related to active projects (drafts, supervisor comments)';
COMMENT ON BUCKET 'payment-proofs' IS 'Payment proof documents (receipts, screenshots)';
COMMENT ON BUCKET 'deliverables' IS 'Final deliverables (completed thesis, presentations)';

-- ============================================================
-- VERIFY BUCKETS CREATION
-- ============================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'request-documents'
    ) THEN
        RAISE NOTICE 'Bucket request-documents created/verified';
    ELSE
        RAISE EXCEPTION 'Bucket request-documents was not created';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'project-documents'
    ) THEN
        RAISE NOTICE 'Bucket project-documents created/verified';
    ELSE
        RAISE EXCEPTION 'Bucket project-documents was not created';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'payment-proofs'
    ) THEN
        RAISE NOTICE 'Bucket payment-proofs created/verified';
    ELSE
        RAISE EXCEPTION 'Bucket payment-proofs was not created';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'deliverables'
    ) THEN
        RAISE NOTICE 'Bucket deliverables created/verified';
    ELSE
        RAISE EXCEPTION 'Bucket deliverables was not created';
    END IF;
END $$;
