/*
  # Fix Security Issues - Indexes and Function Search Path

  ## Changes Made
  
  1. **Add Missing Foreign Key Indexes**
     - `alert_settings.category_id` - Index for category lookups
     - `analytics_events.user_id` - Index for user event queries
     - `blog_posts.author_id` - Index for author queries
     - `blog_posts.category_id` - Index for category filtering
     - `budgets.category_id` - Index for budget category queries
     - `merchants.most_common_category_id` - Index for merchant category lookups
     - `portfolio_images.category_id` - Index for portfolio filtering
     - `transactions.category_id` - Index for transaction category queries
     - `transactions.user_id` - Index for user transaction queries
  
  2. **Fix Function Search Path**
     - Recreate `create_default_categories` function with immutable search_path
     - Drop and recreate associated trigger
  
  ## Security Improvements
  - Prevents suboptimal query performance on foreign key lookups
  - Fixes mutable search_path vulnerability in function
  
  ## Notes
  - All indexes use IF NOT EXISTS to prevent errors on re-run
  - Auth DB Connection Strategy must be changed in Supabase Dashboard settings
*/

-- Add index for alert_settings.category_id
CREATE INDEX IF NOT EXISTS idx_alert_settings_category_id 
ON alert_settings(category_id);

-- Add index for analytics_events.user_id
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id 
ON analytics_events(user_id);

-- Add indexes for blog_posts foreign keys
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id 
ON blog_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id 
ON blog_posts(category_id);

-- Add index for budgets.category_id
CREATE INDEX IF NOT EXISTS idx_budgets_category_id 
ON budgets(category_id);

-- Add index for merchants.most_common_category_id
CREATE INDEX IF NOT EXISTS idx_merchants_most_common_category_id 
ON merchants(most_common_category_id);

-- Add index for portfolio_images.category_id
CREATE INDEX IF NOT EXISTS idx_portfolio_images_category_id 
ON portfolio_images(category_id);

-- Add indexes for transactions foreign keys
CREATE INDEX IF NOT EXISTS idx_transactions_category_id 
ON transactions(category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id 
ON transactions(user_id);

-- Fix create_default_categories function with immutable search_path
-- First drop the trigger
DROP TRIGGER IF EXISTS create_default_categories_trigger ON profiles;

-- Then drop the function
DROP FUNCTION IF EXISTS create_default_categories();

-- Recreate function with secure search_path (must return TRIGGER for use in trigger)
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, icon, color)
  SELECT 
    NEW.id,
    name,
    type,
    icon,
    color
  FROM (
    VALUES 
      ('Food & Dining', 'expense', '🍔', '#ef4444'),
      ('Transportation', 'expense', '🚗', '#f59e0b'),
      ('Shopping', 'expense', '🛍️', '#ec4899'),
      ('Entertainment', 'expense', '🎬', '#8b5cf6'),
      ('Bills & Utilities', 'expense', '💡', '#3b82f6'),
      ('Healthcare', 'expense', '🏥', '#10b981'),
      ('Education', 'expense', '📚', '#6366f1'),
      ('Other', 'expense', '📌', '#6b7280'),
      ('Salary', 'income', '💰', '#22c55e'),
      ('Freelance', 'income', '💼', '#14b8a6'),
      ('Investments', 'income', '📈', '#06b6d4'),
      ('Other Income', 'income', '💵', '#84cc16')
  ) AS default_categories(name, type, icon, color)
  ON CONFLICT (user_id, name) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();