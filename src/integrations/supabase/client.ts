// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yaxkzkjpqvpgyyyaybri.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlheGt6a2pwcXZwZ3l5eWF5YnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4ODY4MTAsImV4cCI6MjA1NzQ2MjgxMH0.ES1fjY6hEOVVF9t-TYYrBaD6HzHXZye-SjEZLqlubMM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);