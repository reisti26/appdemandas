import { createClient } from '@supabase/supabase-js';

// In a real app, these should be in a .env file:
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = 'https://mzxnohaeyecavkjwcapx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16eG5vaGFleWVjYXZrandjYXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NTMxNzcsImV4cCI6MjA5NzEyOTE3N30.lECEju2-3H32DqZr2U0sSE5OGELvyL0HVPEJVjMu22k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
