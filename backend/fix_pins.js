require('dotenv').config();
const supabase = require('./config/supabase');

async function reportHashedPins() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, upi_pin')
    .not('upi_pin', 'is', null);

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  const hashedPins = (users || []).filter((user) => /^\$2[aby]\$/.test(user.upi_pin));

  if (!hashedPins.length) {
    console.log('All stored UPI PINs are plain text already.');
    return;
  }

  console.log('These users still have bcrypt UPI PINs and must reset their PIN:');
  hashedPins.forEach((user) => console.log(`- ${user.email} (${user.id})`));
}

reportHashedPins();
