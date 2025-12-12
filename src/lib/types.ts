export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          onboarding_completed: boolean;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      merchants: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          most_common_category_id: string | null;
          transaction_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          most_common_category_id?: string | null;
          transaction_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          most_common_category_id?: string | null;
          transaction_count?: number;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          date: string;
          merchant: string;
          category_id: string;
          payment_type: 'Card' | 'UPI' | 'Cash';
          note: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          currency?: string;
          date?: string;
          merchant: string;
          category_id: string;
          payment_type: 'Card' | 'UPI' | 'Cash';
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          date?: string;
          merchant?: string;
          category_id?: string;
          payment_type?: 'Card' | 'UPI' | 'Cash';
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          month: string;
          amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          month: string;
          amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          month?: string;
          amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_name: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_name?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
      alert_settings: {
        Row: {
          id: string;
          user_id: string;
          alert_type: 'category_threshold' | 'total_budget_threshold' | 'monthly_completion';
          category_id: string | null;
          threshold_percentage: number;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          alert_type: 'category_threshold' | 'total_budget_threshold' | 'monthly_completion';
          category_id?: string | null;
          threshold_percentage: number;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          alert_type?: 'category_threshold' | 'total_budget_threshold' | 'monthly_completion';
          category_id?: string | null;
          threshold_percentage?: number;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Merchant = Database['public']['Tables']['merchants']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Budget = Database['public']['Tables']['budgets']['Row'];
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];

export type TransactionWithCategory = Transaction & {
  category: Category;
};

export type BudgetWithCategory = Budget & {
  category: Category;
  spent: number;
};

export interface AlertSetting {
  id: string;
  user_id: string;
  alert_type: 'category_threshold' | 'total_budget_threshold' | 'monthly_completion';
  category_id: string | null;
  threshold_percentage: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedAlert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  alert_setting_id?: string;
}

export interface PortfolioImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category_id: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price_range: string;
  inclusions: string[];
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  category_id: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  preferred_date: string | null;
  message: string;
  status: 'new' | 'in_progress' | 'responded' | 'closed';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_photo: string;
  rating: number;
  testimonial: string;
  is_featured: boolean;
  is_approved: boolean;
  display_order: number;
  created_at: string;
}
