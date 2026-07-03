-- Migration: 002_users_tables.sql
-- Description: Creates staff_users and clients tables
-- Created: 2024
-- Dependencies: None (must run first after initial schema)

-- ============================================================
-- CLIENTS TABLE
-- ============================================================
-- Stores client user profiles linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_uid UUID UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    institution TEXT,
    programme TEXT,
    academic_level TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_auth_uid ON clients(auth_uid);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- ============================================================
-- STAFF_USERS TABLE
-- ============================================================
-- Stores staff user profiles linked to Supabase Auth users
-- Roles: super_admin, operations_admin, reviewer, support
CREATE TABLE IF NOT EXISTS staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_uid UUID UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'support',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_staff_users_auth_uid ON staff_users(auth_uid);
CREATE INDEX IF NOT EXISTS idx_staff_users_email ON staff_users(email);
CREATE INDEX IF NOT EXISTS idx_staff_users_role ON staff_users(role);

-- ============================================================
-- HELPER FUNCTIONS (used by RLS policies)
-- ============================================================

-- Function to check if current user is a staff member
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
    RETURN EXISTS (
        SELECT 1 FROM staff_users
        WHERE auth_uid = auth.uid()
        AND role IN ('super_admin', 'operations_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;