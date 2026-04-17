import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jmkwrxtxfkvydjmlrmya.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbXdyeHR4Zmt2eWRqbWxybXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjU0MDMsImV4cCI6MjA1OTY0MTQwM30.8kKqL7h5xR3vN2mP9sT6wU4yC1zD8fG0jH3iK5lM7nO'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('Testing Supabase connection...')
  
  // Try to fetch tickets
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Tickets found:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('First ticket:', JSON.stringify(data[0], null, 2))
    }
  }
}

test()
