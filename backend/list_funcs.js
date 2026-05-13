require('dotenv').config();
const supabase = require('./config/supabase');

async function listFunctions() {
  const { data, error } = await supabase.rpc('get_functions'); // Guessing
  if (error) {
    console.error('Error fetching functions:', error);
  } else {
    console.log('Functions:', data);
  }
}

listFunctions();
