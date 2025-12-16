/*
  # Remove Unused Indexes and Fix Function Security

  ## Changes Made
  
  1. **Remove Unused Indexes**
     - Drop indexes on tables not actively used in the core expense tracker:
       - `blog_posts` (author_id, category_id) - Blog feature not in use
       - `portfolio_images` (category_id) - Portfolio feature not in use
       - `analytics_events` (user_id) - Analytics not heavily queried
       - `merchants` (most_common_category_id) - Merchants not actively used
       - `alert_settings` (category_id) - Not heavily queried yet
     - Keep only essential indexes for core features:
       - `transactions` (user_id, category_id) - Core feature, heavily queried
       - `budgets` (category_id) - Core feature
  
  2. **Fix Function Search Path**
     - Fix the original `create_default_categories(user_uuid)` function with secure search_path
  
  ## Security Improvements
  - Removes unnecessary indexes that consume resources without benefit
  - Fixes mutable search_path vulnerability in original function
  
  ## Performance Impact
  - Reduces index maintenance overhead
  - Core transaction queries remain optimized with essential indexes
*/

-- Remove unused indexes for features not in active use
DROP INDEX IF EXISTS idx_blog_posts_author_id;
DROP INDEX IF EXISTS idx_blog_posts_category_id;
DROP INDEX IF EXISTS idx_portfolio_images_category_id;
DROP INDEX IF EXISTS idx_analytics_events_user_id;
DROP INDEX IF EXISTS idx_merchants_most_common_category_id;
DROP INDEX IF EXISTS idx_alert_settings_category_id;

-- Keep only the essential indexes for core features:
-- idx_transactions_user_id (already exists)
-- idx_transactions_category_id (already exists)
-- idx_budgets_category_id (already exists)

-- Fix the original create_default_categories function with secure search_path
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid uuid)
RETURNS integer 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer;
BEGIN
  WITH inserted AS (
    INSERT INTO categories (user_id, name, icon, color)
    VALUES
      (user_uuid, 'Food & Dining', 'UtensilsCrossed', '#ef4444'),
      (user_uuid, 'Transportation', 'Car', '#f97316'),
      (user_uuid, 'Shopping', 'ShoppingBag', '#8b5cf6'),
      (user_uuid, 'Bills & Utilities', 'Receipt', '#3b82f6'),
      (user_uuid, 'Entertainment', 'Tv', '#ec4899'),
      (user_uuid, 'Healthcare', 'Heart', '#10b981'),
      (user_uuid, 'Personal', 'User', '#06b6d4'),
      (user_uuid, 'Others', 'MoreHorizontal', '#6b7280')
    ON CONFLICT (user_id, name) DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO inserted_count FROM inserted;
  
  RETURN inserted_count;
END;
$$;