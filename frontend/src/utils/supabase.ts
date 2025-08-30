import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - SINGLE INSTANCE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single instance that will be reused throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the client for use in other files
export default supabase;
