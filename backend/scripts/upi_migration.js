const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const projectRef = process.env.SUPABASE_URL.replace('https://', '').split('.')[0];
const connectionString = `postgresql://postgres.${projectRef}:${process.env.DB_PASSWORD}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

async function runMigration() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');

    const queries = [
      // Update users table
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_pin TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0.00`,
      
      // Update transactions table if needed (adding receiver_id etc)
      `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES users(id)`,
      `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'completed'`,
      
      // Create qr_payments table
      `CREATE TABLE IF NOT EXISTS qr_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id),
        receiver_upi VARCHAR(100),
        amount DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Indexes
      `CREATE INDEX IF NOT EXISTS idx_users_upi_id ON users(upi_id)`,
      `CREATE INDEX IF NOT EXISTS idx_accounts_upi_id ON accounts(upi_id)`,
      
      // Sync upi_id from accounts to users if it's missing in users
      `UPDATE users u SET upi_id = a.upi_id FROM accounts a WHERE u.id = a.user_id AND u.upi_id IS NULL`,
      
      // Sync balance from accounts to users if it's 0 in users
      `UPDATE users u SET balance = (SELECT SUM(balance) FROM accounts a WHERE a.user_id = u.id) WHERE u.balance = 0`
    ];

    for (const sql of queries) {
      try {
        await client.query(sql);
        console.log(`  ✅ Executed: ${sql.slice(0, 50)}...`);
      } catch (err) {
        console.log(`  ⚠️  Error executing: ${sql.slice(0, 50)}... \n     Error: ${err.message}`);
      }
    }

    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
