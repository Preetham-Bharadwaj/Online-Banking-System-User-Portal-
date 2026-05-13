require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllTables() {
  console.log('Fetching all table names from information_schema...');
  
  // This query works if the service role key has permissions (which it should)
  const { data, error } = await supabase.rpc('get_tables_info'); 
  
  // Since I don't have the RPC, I'll use a direct select on a known system table if allowed, 
  // or just try to select from a table and log the FULL response.
  
  const table = 'users';
  console.log(`Checking table: ${table}`);
  const response = await supabase.from(table).select('count', { count: 'exact' });
  
  console.log('Full Response:', JSON.stringify(response, null, 2));
  
  if (response.error) {
    console.log('❌ Error:', response.error.message);
  } else {
    console.log('✅ Table exists and count is:', response.count);
  }
}

listAllTables();
