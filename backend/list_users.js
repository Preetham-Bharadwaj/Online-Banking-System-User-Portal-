require('dotenv').config();
const supabase = require('./config/supabase');

async function listUsers() {
  const { data, error } = await supabase.from('users').select('id, email, full_name');
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Users in database:', data);
  }
}

listUsers();
