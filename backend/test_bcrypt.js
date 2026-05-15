const bcrypt = require('bcrypt');

async function testBcrypt() {
  const hash = '$2b$10$mPIyMi8YGGgaJTCSsOFBeeBQwcLwK/GdxfB.znr/9.cXJNXjWSL.i';
  const pin = '123456';
  
  const match = await bcrypt.compare(pin, hash);
  console.log('Match result for 123456:', match);
  
  const match2 = await bcrypt.compare('123456', hash);
  console.log('Match result for string 123456:', match2);
}

testBcrypt();
