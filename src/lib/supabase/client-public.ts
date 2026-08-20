import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for public (anonymous) access
// This client is used on public pages like /request-support
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}