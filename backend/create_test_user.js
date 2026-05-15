require('dotenv').config();
const supabase = require('./config/supabase');
const bcrypt = require('bcrypt');

async function createTestUser() {
  const email = 'testuser@finova.com';
  const password = 'password123';
  const upi_pin = '123456';
  const fullName = 'Test User';
  const phoneNumber = '9876543210';

  const passwordHash = await bcrypt.hash(password, 10);
  const upiId = 'testuser@finova';

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email,
        password_hash: passwordHash,
        full_name: fullName,
        phone_number: phoneNumber,
        upi_id: upiId,
        upi_pin,
        balance: 5000.00,
        role: 'customer'
      }
    ])
    .select();

  if (error) {
    console.error('Error creating user:', error);
  } else {
    console.log('User created successfully:', data);
    
    // Create account for user
    const { error: accError } = await supabase
      .from('accounts')
      .insert([
        {
          user_id: data[0].id,
          account_number: '456712345678',
          account_type: 'savings',
          balance: 5000.00,
          status: 'active',
          upi_id: upiId
        }
      ]);
      
    if (accError) console.error('Error creating account:', accError);
    else console.log('Account created successfully');
  }
}

createTestUser();
