-- Supabase PostgreSQL Production-Grade Schema for Online Banking System
-- Optimized for Neo-Bank Aesthetics and High-Fidelity Functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Core user identity and KYC data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    profile_image TEXT,
    date_of_birth DATE,
    address TEXT,
    aadhaar_last4 VARCHAR(4),
    pan_number VARCHAR(20),
    kyc_status VARCHAR(50) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'expired')),
    onboarding_state VARCHAR(50) DEFAULT 'created' CHECK (onboarding_state IN ('created', 'provisioned', 'kyc_pending', 'complete')),
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'moderator')),
    is_verified BOOLEAN DEFAULT false,
    mfa_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ACCOUNTS TABLE
-- Supports Savings, Salary, and Current accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    upi_id VARCHAR(100) UNIQUE,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('savings', 'salary', 'current', 'fixed_deposit', 'recurring_deposit')),
    ifsc_code VARCHAR(11) DEFAULT 'VRX0001234',
    branch_name VARCHAR(255) DEFAULT 'Finova Digital Center',
    balance DECIMAL(20, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'INR',
    account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CARDS TABLE
-- Comprehensive management for Debit, Credit, and Virtual cards
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    card_type VARCHAR(50) NOT NULL CHECK (card_type IN ('debit', 'credit', 'virtual')),
    card_brand VARCHAR(50) DEFAULT 'Visa' CHECK (card_brand IN ('Visa', 'Mastercard', 'RuPay')),
    masked_card_number VARCHAR(19) NOT NULL, -- e.g., 4421 98xx xxxx 1092
    card_number_hash TEXT NOT NULL, -- Hashed for verification
    expiry_date VARCHAR(5) NOT NULL, -- MM/YY
    cvv_hash TEXT NOT NULL,
    card_status VARCHAR(50) DEFAULT 'active' CHECK (card_status IN ('active', 'locked', 'expired', 'replaced')),
    freeze_status BOOLEAN DEFAULT false,
    international_enabled BOOLEAN DEFAULT false,
    contactless_enabled BOOLEAN DEFAULT false,
    online_limit DECIMAL(15, 2) DEFAULT 50000.00,
    atm_limit DECIMAL(15, 2) DEFAULT 25000.00,
    reward_points INTEGER DEFAULT 0,
    pin_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSACTIONS TABLE
-- Unified tracking for all financial movements
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    receiver_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('upi', 'bank_transfer', 'qr_payment', 'bill_payment', 'recharge', 'card_payment', 'atm_withdrawal', 'interest_credit')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('upi', 'imps', 'neft', 'rtgs', 'card', 'wallet')),
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    transaction_note TEXT,
    category VARCHAR(100), -- Food, Shopping, etc.
    transaction_status VARCHAR(50) DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'completed', 'failed', 'reversed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BENEFICIARIES TABLE
-- Contact management for quick transfers
CREATE TABLE beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    beneficiary_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(11),
    upi_id VARCHAR(100),
    nickname VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. BILLS & UTILITIES TABLE
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bill_type VARCHAR(50) NOT NULL CHECK (bill_type IN ('electricity', 'water', 'gas', 'broadband', 'dth', 'fastag', 'insurance', 'postpaid')),
    provider_name VARCHAR(255) NOT NULL,
    customer_number VARCHAR(100) NOT NULL, -- e.g., K-Number, Consumer ID
    amount DECIMAL(15, 2),
    due_date DATE,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. RECHARGES TABLE
CREATE TABLE recharges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recharge_type VARCHAR(50) NOT NULL CHECK (recharge_type IN ('prepaid', 'postpaid', 'dth', 'fastag')),
    mobile_number VARCHAR(20),
    operator_name VARCHAR(255) NOT NULL,
    plan_amount DECIMAL(15, 2) NOT NULL,
    recharge_status VARCHAR(50) DEFAULT 'pending' CHECK (recharge_status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. FIXED DEPOSITS (FD)
CREATE TABLE fixed_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fd_account_number VARCHAR(20) UNIQUE NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL, -- e.g., 7.50
    maturity_amount DECIMAL(15, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    maturity_date DATE NOT NULL,
    fd_status VARCHAR(50) DEFAULT 'active' CHECK (fd_status IN ('active', 'matured', 'withdrawn_prematurely')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. RECURRING DEPOSITS (RD)
CREATE TABLE recurring_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rd_account_number VARCHAR(20) UNIQUE NOT NULL,
    monthly_installment DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    maturity_amount DECIMAL(15, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    next_due_date DATE NOT NULL,
    rd_status VARCHAR(50) DEFAULT 'active' CHECK (rd_status IN ('active', 'completed', 'lapsed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. LOANS TABLE
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    loan_type VARCHAR(50) NOT NULL CHECK (loan_type IN ('personal', 'home', 'education', 'vehicle')),
    sanctioned_amount DECIMAL(20, 2) NOT NULL,
    outstanding_amount DECIMAL(20, 2) NOT NULL,
    emi_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    next_emi_date DATE,
    loan_status VARCHAR(50) DEFAULT 'active' CHECK (loan_status IN ('active', 'closed', 'defaulted', 'pending_approval')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. BUDGETS & ANALYTICS
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- Housing, Food, etc.
    monthly_limit DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0.00,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category, month, year)
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) CHECK (notification_type IN ('transaction', 'security', 'offer', 'alert')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. USER SETTINGS TABLE
-- Default preferences created during banking onboarding
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    push_notifications BOOLEAN DEFAULT true,
    transaction_alerts BOOLEAN DEFAULT true,
    marketing_opt_in BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. QR PAYMENTS TABLE
-- Specific tracking for QR scans
CREATE TABLE qr_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_upi_id VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    qr_reference VARCHAR(255) UNIQUE NOT NULL,
    merchant_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. SECURITY SESSIONS
CREATE TABLE security_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255),
    ip_address VARCHAR(45),
    login_location VARCHAR(255),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. PERFORMANCE INDEXES
-- Optimized for fast lookups in a banking environment
CREATE INDEX idx_users_email_phone ON users(email, phone_number);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_upi_id ON accounts(upi_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_reference ON transactions(reference_number);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_bills_user_due ON bills(user_id, due_date);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;

-- 17. AUTO-UPDATE TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_modtime BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_modtime BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beneficiaries_modtime BEFORE UPDATE ON beneficiaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_modtime BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fixed_deposits_modtime BEFORE UPDATE ON fixed_deposits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_deposits_modtime BEFORE UPDATE ON recurring_deposits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_modtime BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_modtime BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_modtime BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
