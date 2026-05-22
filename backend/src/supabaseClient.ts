import { createClient } from '@supabase/supabase-js';

// Initialise and export a Supabase client using environment variables.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration. Please define SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in your environment.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);