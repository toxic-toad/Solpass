import { createClient } from '@supabase/supabase-js';

// Fallback strings prevent the production engine from crashing if variables are empty during a build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-string';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
