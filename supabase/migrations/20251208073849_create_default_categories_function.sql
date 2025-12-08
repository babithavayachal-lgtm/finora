/*
  # Create Default Categories Function

  ## Purpose
  Creates a database function to seed default categories for new users during onboarding.
  This ensures every user starts with a useful set of expense categories.

  ## Default Categories
  1. Food & Dining - Restaurant, Groceries
  2. Transportation - Gas, Public Transit, Ride Share
  3. Shopping - Retail, Online Shopping
  4. Bills & Utilities - Rent, Electric, Water, Internet
  5. Entertainment - Movies, Games, Subscriptions
  6. Healthcare - Medical, Pharmacy
  7. Personal - Clothing, Grooming
  8. Others - Miscellaneous expenses

  ## Function
  - `create_default_categories(user_uuid)` - Creates default categories for specified user
  - Returns the count of categories created
  - Safe to call multiple times (uses INSERT ... ON CONFLICT DO NOTHING)
*/

CREATE OR REPLACE FUNCTION create_default_categories(user_uuid uuid)
RETURNS integer AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
