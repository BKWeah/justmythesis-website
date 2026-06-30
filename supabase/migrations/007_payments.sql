-- Migration: 007_payments.sql
-- Description: Creates the payments table for tracking client payments
-- Created: 2024
-- Dependencies: 002_users_tables (clients, staff_users), 003_support_requests, 004_projects

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
-- Stores payment records for services.
-- Payments can be associated with a support request, a project, or both.

-- Create enum type for payment status
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'Pending',
        'Verified',
        'Rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum type for payment method
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'Bank Transfer',
        'Mobile Money',
        'PayPal',
        'Western Union',
        'Cash',
        'Other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the payments table
CREATE TABLE IF NOT EXISTS payments (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Client relationship (required)
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    
    -- Optional relationship to support_request
    support_request_id UUID REFERENCES support_requests(id) ON DELETE SET NULL,
    
    -- Optional relationship to project
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_method payment_method NOT NULL,
    payment_date DATE NOT NULL,
    
    -- Reference information
    reference_number TEXT, -- Client's payment reference
    transaction_id TEXT, -- Bank/Payment processor transaction ID
    
    -- Proof of payment
    proof_url TEXT, -- URL to uploaded proof document
    
    -- Status and verification
    status payment_status NOT NULL DEFAULT 'Pending',
    verified_by UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_by UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Index on client_id
CREATE INDEX IF NOT EXISTS idx_payments_client_id 
    ON payments(client_id);

-- Index on support_request_id
CREATE INDEX IF NOT EXISTS idx_payments_support_request_id 
    ON payments(support_request_id);

-- Index on project_id
CREATE INDEX IF NOT EXISTS idx_payments_project_id 
    ON payments(project_id);

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS idx_payments_status 
    ON payments(status);

-- Index on payment_date
CREATE INDEX IF NOT EXISTS idx_payments_payment_date 
    ON payments(payment_date DESC);

-- Index on payment_method
CREATE INDEX IF NOT EXISTS idx_payments_method 
    ON payments(payment_method);

-- Index on amount for reporting
CREATE INDEX IF NOT EXISTS idx_payments_amount 
    ON payments(amount);

-- Composite index for pending payments
CREATE INDEX IF NOT EXISTS idx_payments_pending 
    ON payments(status, payment_date) WHERE status = 'Pending';

-- Index on reference_number for lookups
CREATE INDEX IF NOT EXISTS idx_payments_reference 
    ON payments(reference_number) WHERE reference_number IS NOT NULL;

-- ============================================================
-- CONSTRAINTS
-- ============================================================

-- Ensure amount is positive
ALTER TABLE payments DROP CONSTRAINT IF EXISTS check_positive_amount;
ALTER TABLE payments ADD CONSTRAINT check_positive_amount 
    CHECK (amount > 0);

-- Ensure verified_at is set when status is Verified
ALTER TABLE payments DROP CONSTRAINT IF EXISTS check_verified_at;
ALTER TABLE payments ADD CONSTRAINT check_verified_at 
    CHECK (status != 'Verified' OR (verified_at IS NOT NULL AND verified_by IS NOT NULL));

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_payments_updated_at ON payments;
CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE payments IS 'Payment records for services';
COMMENT ON COLUMN payments.client_id IS 'Reference to the paying client';
COMMENT ON COLUMN payments.support_request_id IS 'Optional link to a support request';
COMMENT ON COLUMN payments.project_id IS 'Optional link to a project';
COMMENT ON COLUMN payments.amount IS 'Payment amount';
COMMENT ON COLUMN payments.currency IS 'Payment currency (default: USD)';
COMMENT ON COLUMN payments.payment_method IS 'Method of payment';
COMMENT ON COLUMN payments.payment_date IS 'Date payment was made';
COMMENT ON COLUMN payments.reference_number IS 'Client-provided payment reference';
COMMENT ON COLUMN payments.transaction_id IS 'Bank/processor transaction ID';
COMMENT ON COLUMN payments.proof_url IS 'URL to uploaded payment proof';
COMMENT ON COLUMN payments.status IS 'Payment verification status';
COMMENT ON COLUMN payments.verified_by IS 'Staff member who verified the payment';
COMMENT ON COLUMN payments.verified_at IS 'When payment was verified';
COMMENT ON COLUMN payments.rejection_reason IS 'Reason for rejection if rejected';
COMMENT ON COLUMN payments.notes IS 'Additional notes';
COMMENT ON COLUMN payments.created_by IS 'Staff member who recorded the payment';

-- ============================================================
-- VERIFY TABLE CREATION
-- ============================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
    ) THEN
        RAISE NOTICE 'Table payments created successfully';
    ELSE
        RAISE EXCEPTION 'Table payments was not created';
    END IF;
END $$;
