import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jmkwrxtxfkvydjmlrmya.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbXdyeHR4Zmt2eWRqbWxybXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjU0MDMsImV4cCI6MjA1OTY0MTQwM30.8kKqL7h5xR3vN2mP9sT6wU4yC1zD8fG0jH3iK5lM7nO'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
