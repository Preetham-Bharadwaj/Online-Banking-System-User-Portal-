const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

// Build connection string from Supabase URL
// Supabase postgres host: db.<project-ref>.supabase.co
const projectRef = process.env.SUPABASE_URL.replace('https://', '').split('.')[0];
const connectionString = `postgresql://postgres.${projectRef}:${process.env.DB_PASSWORD}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

async function runMigrations() {
  // We'll use the Supabase REST API with service role to execute SQL
  // via the /rest/v1/rpc endpoint if a helper function exists,
  // otherwise fall back to direct pg connection

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const migrations = [
    // ── cards ──────────────────────────────────────────────────────────────
    `ALTER TABLE cards ADD COLUMN IF NOT EXISTS card_brand VARCHAR(50) DEFAULT 'Visa' CHECK (card_brand IN ('Visa', 'Mastercard', 'RuPay'))`,
    `ALTER TABLE cards ADD COLUMN IF NOT EXISTS freeze_status BOOLEAN DEFAULT false`,
    `ALTER TABLE cards ADD COLUMN IF NOT EXISTS international_enabled BOOLEAN DEFAULT false`,
    `ALTER TABLE cards ADD COLUMN IF NOT EXISTS contactless_enabled BOOLEAN DEFAULT false`,
    `ALTER TABLE cards ADD COLUMN IF NOT EXISTS online_limit DECIMAL(15,2) DEFAULT 50000.00`,
    `ALTER TABLE cards ADD COLUMN IF NOT EXISTS atm_limit DECIMAL(15,2) DEFAULT 25000.00`,
    `ALTER TABLE cards ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0`,
    `ALTER TABLE cards ADD COLUMN IF NOT EXISTS pin_hash TEXT`,
    // ── accounts ───────────────────────────────────────────────────────────
    `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100)`,
    `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(11) DEFAULT 'VRX0001234'`,
    `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS branch_name VARCHAR(255) DEFAULT 'Finova Digital Center'`,
    // ── users ──────────────────────────────────────────────────────────────
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_last4 VARCHAR(4)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_state VARCHAR(50) DEFAULT 'created'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_pin TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0.00`,
  ];


  console.log(`\n🔗 Connecting to Supabase project: ${projectRef}\n`);

  // Try Supabase Management API (requires DB password — skip if not set)
  // Instead use the pg direct connection via Supabase's connection pooler
  if (!process.env.DB_PASSWORD) {
    console.log('⚠️  DB_PASSWORD not set in .env');
    console.log('   Add it: DB_PASSWORD=your_supabase_db_password\n');
    console.log('   Find it at: Supabase Dashboard → Settings → Database → Database password\n');
    process.exit(1);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL\n');

    let passed = 0;
    let skipped = 0;

    for (const sql of migrations) {
      const col = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1] ?? sql.slice(0, 60);
      try {
        await client.query(sql);
        console.log(`  ✅ ${col}`);
        passed++;
      } catch (err) {
        console.log(`  ⚠️  ${col}: ${err.message}`);
        skipped++;
      }
    }

    console.log(`\n✅ Done — ${passed} migrations applied, ${skipped} skipped/errored\n`);

    // Verify cards columns
    const { rows } = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cards' ORDER BY ordinal_position`
    );
    console.log('📋 cards table columns:');
    rows.forEach(r => console.log(`   ${r.column_name} (${r.data_type})`));

  } finally {
    await client.end();
  }
}

runMigrations().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
