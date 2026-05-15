require('dotenv').config();
const supabase = require('./config/supabase');

async function updatePin() {
  const email = 'testuser@finova.com';
  const upi_pin = '123456';

  const { error } = await supabase
    .from('users')
    .update({ upi_pin })
    .eq('email', email);

  if (error) {
    console.error('Error updating PIN:', error);
  } else {
    console.log('PIN updated successfully for testuser@finova.com');
  }
}

updatePin();
