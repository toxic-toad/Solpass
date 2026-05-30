import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing! Check your Vercel environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url-for-builds.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
