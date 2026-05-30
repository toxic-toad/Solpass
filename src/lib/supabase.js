import { createClient } from '@supabase/supabase-js';

// Fully formatted valid URL strings guarantee the compilation engine doesn't trip up
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://a1b2c3d4e5f6g7h8i9j0.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
