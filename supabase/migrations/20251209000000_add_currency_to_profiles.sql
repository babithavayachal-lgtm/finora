-- Add currency column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Update existing profiles to have USD as default
UPDATE profiles SET currency = 'USD' WHERE currency IS NULL;

