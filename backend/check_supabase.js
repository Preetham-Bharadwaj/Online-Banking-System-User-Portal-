require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking tables in Supabase...');
  
  const tables = [
    'users', 'accounts', 'transactions', 'cards', 'beneficiaries', 
    'bills', 'recharges', 'fixed_deposits', 'recurring_deposits', 
    'loans', 'budgets', 'notifications', 'qr_payments', 'security_sessions'
  ];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log(`❌ Table "${table}" does not exist.`);
      } else {
        console.log(`⚠️ Error checking table "${table}":`, error.message);
      }
    } else {
      console.log(`✅ Table "${table}" exists.`);
    }
  }
}

checkTables();
