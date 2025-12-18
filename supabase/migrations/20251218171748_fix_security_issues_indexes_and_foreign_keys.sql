/*
  # Fix Security Issues - Indexes and Foreign Keys

  ## Changes Made
  
  ### 1. Add Missing Indexes on Foreign Keys
  Creates indexes for foreign key columns to improve query performance:
  - `alert_settings.category_id`
  - `analytics_events.user_id`
  - `blog_posts.author_id`
  - `blog_posts.category_id`
  - `merchants.most_common_category_id`
  - `portfolio_images.category_id`
  
  ### 2. Remove Unused Indexes
  Drops indexes that are not being used:
  - `idx_budgets_category_id`
  - `idx_transactions_category_id`
  - `idx_transactions_user_id`
  
  ## Performance Impact
  - Adding indexes on foreign keys will improve JOIN performance and query optimization
  - Removing unused indexes will reduce write overhead and storage usage
  
  ## Security Notes
  - These changes improve database performance without affecting security policies
  - All existing RLS policies remain in effect
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_budgets_category_id;
DROP INDEX IF EXISTS idx_transactions_category_id;
DROP INDEX IF EXISTS idx_transactions_user_id;

-- Add missing indexes on foreign key columns
CREATE INDEX IF NOT EXISTS idx_alert_settings_category_id ON alert_settings(category_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_merchants_most_common_category_id ON merchants(most_common_category_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_category_id ON portfolio_images(category_id);
