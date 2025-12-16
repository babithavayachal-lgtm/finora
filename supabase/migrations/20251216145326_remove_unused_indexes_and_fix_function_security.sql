/*
  Remove Unused Indexes and Fix Function Security

  1. Remove Unused Indexes
    Drop all indexes that are not being used to reduce database overhead:
    - Categories: idx_categories_user_id
    - Merchants: idx_merchants_user_id, idx_merchants_most_common_category_id
    - Transactions: idx_transactions_user_id, idx_transactions_date, idx_transactions_category_id
    - Budgets: idx_budgets_user_id, idx_budgets_composite, idx_budgets_category_id
    - Analytics Events: idx_analytics_events_user_id, idx_analytics_events_name
    - Alert Settings: idx_alert_settings_user_id, idx_alert_settings_category_id
    - Portfolio Images: idx_portfolio_images_category, idx_portfolio_images_featured
    - Blog Posts: idx_blog_posts_category, idx_blog_posts_status, idx_blog_posts_slug, idx_blog_posts_author_id
    - Inquiries: idx_inquiries_status
    - Testimonials: idx_testimonials_featured

  2. Fix Function Search Path Security
    Update create_default_categories function with fully qualified table names

  Notes:
    - Indexes can be recreated later if query performance analysis shows they are needed
    - Auth DB connection strategy must be configured manually in Supabase dashboard
*/

-- =====================================================
-- 1. DROP UNUSED INDEXES
-- =====================================================

-- Categories
DROP INDEX IF EXISTS public.idx_categories_user_id;

-- Merchants
DROP INDEX IF EXISTS public.idx_merchants_user_id;
DROP INDEX IF EXISTS public.idx_merchants_most_common_category_id;

-- Transactions
DROP INDEX IF EXISTS public.idx_transactions_user_id;
DROP INDEX IF EXISTS public.idx_transactions_date;
DROP INDEX IF EXISTS public.idx_transactions_category_id;

-- Budgets
DROP INDEX IF EXISTS public.idx_budgets_user_id;
DROP INDEX IF EXISTS public.idx_budgets_composite;
DROP INDEX IF EXISTS public.idx_budgets_category_id;

-- Analytics Events
DROP INDEX IF EXISTS public.idx_analytics_events_user_id;
DROP INDEX IF EXISTS public.idx_analytics_events_name;

-- Alert Settings
DROP INDEX IF EXISTS public.idx_alert_settings_user_id;
DROP INDEX IF EXISTS public.idx_alert_settings_category_id;

-- Portfolio Images
DROP INDEX IF EXISTS public.idx_portfolio_images_category;
DROP INDEX IF EXISTS public.idx_portfolio_images_featured;

-- Blog Posts
DROP INDEX IF EXISTS public.idx_blog_posts_category;
DROP INDEX IF EXISTS public.idx_blog_posts_status;
DROP INDEX IF EXISTS public.idx_blog_posts_slug;
DROP INDEX IF EXISTS public.idx_blog_posts_author_id;

-- Inquiries
DROP INDEX IF EXISTS public.idx_inquiries_status;

-- Testimonials
DROP INDEX IF EXISTS public.idx_testimonials_featured;

-- =====================================================
-- 2. FIX FUNCTION SEARCH PATH SECURITY
-- =====================================================

DROP FUNCTION IF EXISTS public.create_default_categories() CASCADE;

CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, type, color, icon)
  VALUES
    (NEW.id, 'Groceries', 'expense', '#10b981', '🛒'),
    (NEW.id, 'Transportation', 'expense', '#3b82f6', '🚗'),
    (NEW.id, 'Entertainment', 'expense', '#8b5cf6', '🎬'),
    (NEW.id, 'Utilities', 'expense', '#f59e0b', '⚡'),
    (NEW.id, 'Salary', 'income', '#10b981', '💰'),
    (NEW.id, 'Freelance', 'income', '#06b6d4', '💼')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS create_default_categories_trigger ON public.profiles;
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories();
