# JUSTmyTHESIS Workspace Authentication Setup Guide

This guide walks you through setting up Supabase authentication for the workspace.

---

## Prerequisites

- A Supabase account ([sign up at supabase.com](https://supabase.com))
- Access to your Vercel project dashboard
- GitHub account linked to your Vercel project

---

## Part 1: Create Supabase Project

### Step 1.1: Create New Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Enter project details:
   - **Organization**: Select your organization
   - **Name**: `justmythesis-workspace` (or your preferred name)
   - **Database Region**: Choose closest to your users
   - **Pricing Tier**: Free (Hobby) for development
4. Click **"Create new project"**
5. **Wait 2 minutes** for project to initialize

### Step 1.2: Note Your Credentials

Once created, go to **Settings > API** and note:

```
Project URL: https://xxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGc... (starts with eyJ)
service_role key: eyJhbGc... (starts with eyJ)
```

You'll need these in Part 2.

---

## Part 2: Configure Environment Variables in Vercel

### Step 2.1: Access Vercel Project Settings

1. Go to [vercel.com](https://vercel.com)
2. Select your **justmythesis-website** project
3. Go to **Settings** (top navigation)
4. Click **"Environment Variables"** (left sidebar)

### Step 2.2: Add Each Variable

Add these environment variables **for Production** (and optionally Preview/Development):

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (anon key) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (service role key) | **Production only** (server-side only) |

### Step 2.3: Important Notes

- `SUPABASE_SERVICE_ROLE_KEY` is **server-side only** - never expose to client
- Click **"Save"** after each variable
- After saving, you may need to **redeploy** for changes to take effect

---

## Part 3: Run Database Migrations

### Migration Order

**Important:** Run migrations in numerical order. Each migration depends on the previous ones.

| Order | Migration | Purpose |
|-------|-----------|---------|
| 1 | `002_users_tables.sql` | Creates `clients` and `staff_users` tables |
| 2 | `003_support_requests.sql` | Creates `support_requests` table |
| 3 | `004_projects.sql` | Creates `projects` table |
| 4 | `005_documents.sql` | Creates `documents` table with short file type identifiers |
| 5 | `006_assessments_recommendations.sql` | Creates `assessments` and `recommendations` tables |
| 6 | `007_payments.sql` | Creates `payments` table |
| 7 | `008_qa_deliverables_activity_logs.sql` | Creates `qa_reviews`, `deliverables`, `activity_logs` tables |
| 8 | `009_storage_buckets.sql` | Creates storage buckets for file uploads |
| 9 | `010_rls_policies.sql` | Creates RLS policies and helper functions |

### Note on File Types

The `documents` table uses short file type identifiers (e.g., `pdf`, `docx`, `png`) instead of full MIME types. MIME type mapping is handled in the application layer.

### Step 3.1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 3.2: Run Migrations in Order

Run each migration file in numbered order:

**Migration 002: Users Tables**
```sql
-- Copy content from: supabase/migrations/002_users_tables.sql
-- Run this FIRST before other migrations
```

**Migration 003: Support Requests**
```sql
-- Copy content from: supabase/migrations/003_support_requests.sql
```

**Migration 004: Projects**
```sql
-- Copy content from: supabase/migrations/004_projects.sql
```

**Migration 005: Documents**
```sql
-- Copy content from: supabase/migrations/005_documents.sql
```

**Migration 006: Assessments & Recommendations**
```sql
-- Copy content from: supabase/migrations/006_assessments_recommendations.sql
```

**Migration 007: Payments**
```sql
-- Copy content from: supabase/migrations/007_payments.sql
```

**Migration 008: QA, Deliverables, Activity Logs**
```sql
-- Copy content from: supabase/migrations/008_qa_deliverables_activity_logs.sql
```

**Migration 009: Storage Buckets**
```sql
-- Copy content from: supabase/migrations/009_storage_buckets.sql
```

**Migration 010: RLS Policies**
```sql
-- Copy content from: supabase/migrations/010_rls_policies.sql
-- Run this LAST - it sets up security policies
```

### Step 3.3: Verify Tables Created

1. Go to **Table Editor** in Supabase
2. Verify these tables exist:
   - [ ] `clients`
   - [ ] `staff_users`
   - [ ] `support_requests`
   - [ ] `projects`
   - [ ] `documents`
   - [ ] `assessments`
   - [ ] `recommendations`
   - [ ] `payments`
   - [ ] `qa_reviews`
   - [ ] `deliverables`
   - [ ] `activity_logs`

---

## Part 4: Create Test Staff Account

### Step 4.1: Create Auth User

1. In Supabase dashboard, go to **Authentication** (left sidebar)
2. Click **"Users"**
3. Click **"Add User"** (top right)
4. Fill in:
   - **Email**: `admin@justmythesis.org`
   - **Password**: `Workspace2024!`
   - **Confirm Password**: `Workspace2024!`
5. Click **"Create user"**
6. **Copy the user's UUID** (shown in the users list)

### Step 4.2: Link User to staff_users Table

1. Go to **Table Editor**
2. Select `staff_users` table
3. Click **"Insert"**
4. Fill in:
   - **auth_uid**: Paste the UUID from Step 4.1
   - **email**: `admin@justmythesis.org`
   - **full_name**: `Test Admin`
   - **role**: `super_admin`
5. Click **"Save"**

### Step 4.3: Verify Link

Run this SQL in the SQL Editor to verify:
```sql
SELECT * FROM staff_users WHERE email = 'admin@justmythesis.org';
```

You should see one row with the admin user's details.

---

## Part 5: Test Authentication

### Step 5.1: Redeploy Application

1. Go to Vercel dashboard
2. Go to your project
3. Click **"Deployments"**
4. Click **"Redeploy"** on the latest deployment (or push a commit to trigger new deploy)

### Step 5.2: Test Login

1. Open your live website: `https://your-domain.com/workspace/login`
2. Enter credentials:
   - **Email**: `admin@justmythesis.org`
   - **Password**: `Workspace2024!`
3. Click **"Sign In"**
4. **Expected**: Redirect to `/workspace/dashboard`

### Step 5.3: Verify Dashboard Access

If login succeeded, you should see:
- Dashboard stats (may be empty initially)
- Sidebar navigation
- Workspace header

### Step 5.4: Test Logout

1. Look for logout button in workspace header/sidebar
2. Click to sign out
3. **Expected**: Redirect to `/workspace/login`

---

## Troubleshooting

### "Database not configured" Error

**Cause**: Environment variables not set in Vercel

**Fix**: 
1. Verify all 3 env vars are set in Vercel Settings > Environment Variables
2. Click Save after each
3. Redeploy the application

### "Access denied. Staff accounts only." Error

**Cause**: User exists in Auth but not in `staff_users` table

**Fix**:
1. Go to Supabase Table Editor > `staff_users`
2. Verify the user row exists with matching `auth_uid`
3. Check the `auth_uid` matches the user's UUID exactly

### Blank Page After Login

**Cause**: Auth succeeded but redirect failed

**Fix**:
1. Check browser console for errors
2. Verify middleware is working correctly
3. Check network tab for failed API calls

### 500 Error on Login

**Cause**: Supabase client initialization failed

**Fix**:
1. Check Vercel environment variables
2. Verify Supabase URL format: `https://xxx.supabase.co`
3. Verify keys start with `eyJ` (JWT format)

---

## Test Credentials Summary

| Field | Value |
|-------|-------|
| **Email** | `admin@justmythesis.org` |
| **Password** | `Workspace2024!` |
| **Role** | `super_admin` |
| **Access URL** | `/workspace/login` |
| **Redirect After Login** | `/workspace/dashboard` |

---

## Files Created/Modified

| File | Purpose |
|------|---------|
| `supabase/migrations/002_users_tables.sql` | Creates `clients` and `staff_users` tables |
| `supabase/seed.sql` | Documentation for seeding test data |
| `SUPABASE_SETUP_GUIDE.md` | This complete setup guide |

---

## Remaining Steps (If Any Blockers Exist)

1. **Supabase project URL and keys** - Copy from Supabase dashboard
2. **Vercel environment variables** - Set in Vercel project settings
3. **Database migrations** - Run in SQL Editor
4. **Test user creation** - Create auth user + staff_users record

Once all steps are complete, authentication will be fully functional.