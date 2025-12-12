/*
  # Fix Security and Performance Issues

  ## 1. Add Missing Foreign Key Indexes
    - Add index on blog_posts.author_id
    - Add index on budgets.category_id
    - Add index on merchants.most_common_category_id

  ## 2. Optimize RLS Policies (Auth Function Initialization)
    Replace `auth.uid()` with `(select auth.uid())` in all policies to prevent re-evaluation for each row:
    - profiles: 3 policies
    - categories: 4 policies
    - merchants: 4 policies
    - transactions: 4 policies
    - budgets: 4 policies
    - analytics_events: 1 policy
    - alert_settings: 4 policies

  ## 3. Consolidate Duplicate Permissive Policies
    Remove duplicate policies and create single comprehensive policies:
    - blog_posts: Merge 2 SELECT policies
    - categories: Merge duplicate policies for all operations
    - services: Merge 2 SELECT policies
    - testimonials: Merge 2 SELECT policies

  ## 4. Fix Function Search Path Security
    - update_updated_at_column: Add search_path security
    - create_default_categories: Add search_path security

  ## Notes
    - Unused indexes are kept as they may be needed for future query optimization
    - Auth DB connection strategy must be configured manually in Supabase dashboard
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_merchants_most_common_category_id ON public.merchants(most_common_category_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - PROFILES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - CATEGORIES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Only authenticated users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Only authenticated users can update categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
DROP POLICY IF EXISTS "Only authenticated users can delete categories" ON public.categories;

CREATE POLICY "Users can view own categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - MERCHANTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own merchants" ON public.merchants;
DROP POLICY IF EXISTS "Users can insert own merchants" ON public.merchants;
DROP POLICY IF EXISTS "Users can update own merchants" ON public.merchants;
DROP POLICY IF EXISTS "Users can delete own merchants" ON public.merchants;

CREATE POLICY "Users can view own merchants"
  ON public.merchants
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own merchants"
  ON public.merchants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own merchants"
  ON public.merchants
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own merchants"
  ON public.merchants
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - TRANSACTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - BUDGETS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

CREATE POLICY "Users can view own budgets"
  ON public.budgets
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own budgets"
  ON public.budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own budgets"
  ON public.budgets
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own budgets"
  ON public.budgets
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES - ANALYTICS_EVENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own analytics events" ON public.analytics_events;

CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 8. OPTIMIZE RLS POLICIES - ALERT_SETTINGS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own alert settings" ON public.alert_settings;
DROP POLICY IF EXISTS "Users can insert own alert settings" ON public.alert_settings;
DROP POLICY IF EXISTS "Users can update own alert settings" ON public.alert_settings;
DROP POLICY IF EXISTS "Users can delete own alert settings" ON public.alert_settings;

CREATE POLICY "Users can view own alert settings"
  ON public.alert_settings
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own alert settings"
  ON public.alert_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own alert settings"
  ON public.alert_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own alert settings"
  ON public.alert_settings
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 9. CONSOLIDATE BLOG_POSTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all blog posts" ON public.blog_posts;

CREATE POLICY "Users can view blog posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view published blog posts"
  ON public.blog_posts
  FOR SELECT
  TO anon
  USING (status = 'published');

-- =====================================================
-- 10. CONSOLIDATE SERVICES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Authenticated users can view all services" ON public.services;

CREATE POLICY "Users can view services"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view active services"
  ON public.services
  FOR SELECT
  TO anon
  USING (is_active = true);

-- =====================================================
-- 11. CONSOLIDATE TESTIMONIALS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can view all testimonials" ON public.testimonials;

CREATE POLICY "Users can view testimonials"
  ON public.testimonials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view approved testimonials"
  ON public.testimonials
  FOR SELECT
  TO anon
  USING (is_approved = true);

-- =====================================================
-- 12. FIX FUNCTION SEARCH PATH SECURITY
-- =====================================================

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.create_default_categories() CASCADE;
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Recreate triggers for functions
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.categories;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.merchants;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.transactions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.budgets;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.portfolio_images;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.portfolio_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.blog_posts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.services;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.inquiries;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.testimonials;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS create_default_categories_trigger ON public.profiles;
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories();
