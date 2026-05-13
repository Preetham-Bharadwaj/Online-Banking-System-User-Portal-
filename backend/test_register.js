async function testRegister() {
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'password123',
        full_name: 'New User',
        phone_number: '1234567890',
        date_of_birth: '1990-01-01',
        address: '123 Finance Street, Wealth City'
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Registration successful:', data);
    } else {
      console.error('Registration failed:', data);
    }
  } catch (err) {
    console.error('Registration failed:', err.message);
  }
}

testRegister();
