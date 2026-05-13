require('dotenv').config();
const supabase = require('./config/supabase');

async function checkSchema() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error('Error fetching user:', error);
  } else {
    console.log('User columns:', Object.keys(data[0] || {}));
  }
  
  const { data: accounts, error: accError } = await supabase.from('accounts').select('*').limit(1);
  if (accError) {
    console.error('Error fetching account:', accError);
  } else {
    console.log('Account columns:', Object.keys(accounts[0] || {}));
  }
}

checkSchema();
