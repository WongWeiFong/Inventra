const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://fnvplrjygbfsbdyanqcg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudnBscmp5Z2Jmc2JkeWFucWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxOTgzNTcsImV4cCI6MjA5Nzc3NDM1N30.T1tJ8yQqvP3LAgUT7zoPE8b6WgOj-GrNPwAGAtWc9Y8'
)

async function test() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
  console.log('Connected! Data:', data)
  if (error) console.log('Error:', error)
}

test()