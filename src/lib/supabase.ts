import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjichrqwbtfxdzwuqkqa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaWNocnF3YnRmeGR6d3Vxa3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzY0ODQsImV4cCI6MjA4NzAxMjQ4NH0.XKUETNBuZC0XIEb-0d072iZ85Tq-SoGRAFm0Z8o0lo0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Use this for backend/scripts only
export const getSupabaseService = () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaWNocnF3YnRmeGR6d3Vxa3FhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQzNjQ0NCwiZXhwIjoyMDg3MDEyNDQ0fQ.s1TOKDOeKTgYuyoemfqVaADX4fdwndtq6EYG5o6CaoU';
    return createClient(supabaseUrl, serviceKey);
};
