-- Create alert_settings table
CREATE TABLE IF NOT EXISTS alert_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('category_threshold', 'total_budget_threshold', 'monthly_completion')),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  threshold_percentage decimal(5, 2) NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, alert_type, category_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alert_settings_user_id ON alert_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_settings_category_id ON alert_settings(category_id);

-- Enable RLS
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own alert settings"
  ON alert_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert settings"
  ON alert_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert settings"
  ON alert_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert settings"
  ON alert_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE TRIGGER update_alert_settings_updated_at BEFORE UPDATE ON alert_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

