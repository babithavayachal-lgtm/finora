import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<string>('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCurrency();
    } else {
      setCurrencyState('USD');
      setLoading(false);
    }
  }, [user]);

  const fetchCurrency = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', user.id)
        .maybeSingle();

      // If column doesn't exist yet (migration not run), default to USD
      if (error && error.code === 'PGRST204') {
        console.warn('Currency column not found, using default USD. Please run the migration.');
        setCurrencyState('USD');
        setLoading(false);
        return;
      }

      if (error) throw error;

      if (data?.currency) {
        setCurrencyState(data.currency);
      } else {
        // Default to USD if not set
        setCurrencyState('USD');
      }
    } catch (error) {
      console.error('Error fetching currency:', error);
      setCurrencyState('USD');
    } finally {
      setLoading(false);
    }
  };

  const setCurrency = async (newCurrency: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ currency: newCurrency })
        .eq('id', user.id);

      // If column doesn't exist yet (migration not run), just update local state
      if (error && error.code === 'PGRST204') {
        console.warn('Currency column not found. Please run the migration to save currency preference.');
        setCurrencyState(newCurrency);
        return;
      }

      if (error) throw error;

      setCurrencyState(newCurrency);
    } catch (error) {
      console.error('Error updating currency:', error);
      // Still update local state even if save fails
      setCurrencyState(newCurrency);
      throw error;
    }
  };

  const value = {
    currency,
    setCurrency,
    loading,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

