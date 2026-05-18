-- ADA Optimized Search Indexes
-- Run this in your Supabase SQL Editor to improve search query performance

CREATE INDEX IF NOT EXISTS idx_users_upi_id ON users(upi_id);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(full_name);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
