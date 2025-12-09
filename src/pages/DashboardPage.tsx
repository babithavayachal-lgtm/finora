import { useState, useEffect } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, Tag } from 'lucide-react';
import * as Icons from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { CategoryBudgetChart } from '../components/CategoryBudgetChart';
import { MonthlyOverviewChart } from '../components/MonthlyOverviewChart';
import { RecentTransactions } from '../components/RecentTransactions';
import { TransactionModal } from '../components/TransactionModal';
import { Toast } from '../components/Toast';
import { AnimatedTagline } from '../components/AnimatedTagline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';
import { Category, TransactionWithCategory } from '../lib/types';
import { formatCurrency, formatCurrencyCompact } from '../lib/currency';

type IntervalType = '7d' | '1m' | '3m' | '6m' | '1y';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

interface CategorySpending {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  spending: number;
  budget: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  amount: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [monthlyOverviewData, setMonthlyOverviewData] = useState<MonthlyData[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<IntervalType>('7d');
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [todaySpent, setTodaySpent] = useState(0);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [upcomingBills, setUpcomingBills] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | undefined>();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionWithCategory | null>(null);

  useEffect(() => {
    if (user && loading) {
      fetchData();
    }
  }, [user]);

  const getDateRangeForInterval = (interval: IntervalType) => {
    const now = new Date();
    let startDate = new Date();

    switch (interval) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        // set to start of day
        startDate.setHours(0, 0, 0, 0);
        break;
      case '1m':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3m':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '6m':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '1y':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    return {
      // return full ISO datetimes so Supabase comparisons include time
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  };

  const getDataPointsForInterval = (interval: IntervalType, transactions: Array<{amount: number, date: string}>) => {
    const now = new Date();
    const dataPoints: MonthlyData[] = [];
    let currentDate = new Date();
    
    // Aggregate transactions into maps keyed by local day/month to avoid timezone issues
    const byDay = new Map<string, number>();
    const byMonth = new Map<string, number>();

    const pad = (n: number) => n.toString().padStart(2, '0');

    transactions.forEach((t) => {
      const dt = t.date ? new Date(t.date) : null;
      if (!dt || isNaN(dt.getTime())) return;
      const year = dt.getFullYear();
      const month = pad(dt.getMonth() + 1);
      const day = pad(dt.getDate());

      const dayKey = `${year}-${month}-${day}`; // YYYY-MM-DD local
      const monthKey = `${year}-${month}`; // YYYY-MM local

      const amt = parseFloat(t.amount.toString());

      byDay.set(dayKey, (byDay.get(dayKey) || 0) + amt);
      byMonth.set(monthKey, (byMonth.get(monthKey) || 0) + amt);
    });

    if (interval === '7d') {
      // Show daily data for 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const dayKey = `${year}-${month}-${day}`;
        const amount = byDay.get(dayKey) || 0;
        dataPoints.push({
          month: date.toLocaleString('default', { weekday: 'short' }),
          amount,
        });
      }
    } else if (interval === '1m') {
      // Show daily data for 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const dayKey = `${year}-${month}-${day}`;
        const amount = byDay.get(dayKey) || 0;
        dataPoints.push({
          month: date.getDate().toString(),
          amount,
        });
      }
    } else if (interval === '3m' || interval === '6m') {
      // Show weekly data
      const weeks = interval === '3m' ? 12 : 24;
      for (let i = weeks - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        let amount = 0;
        for (const [dateKey, value] of byDay.entries()) {
          const transDate = new Date(dateKey);
          if (transDate >= weekStart && transDate <= weekEnd) {
            amount += value;
          }
        }
        
        dataPoints.push({
          month: `W${weekStart.getDate()}`,
          amount,
        });
      }
    } else if (interval === '1y') {
      // Show monthly data for 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const monthKey = `${year}-${month}`;
        
        const amount = byMonth.get(monthKey) || 0;
        
        dataPoints.push({
          month: date.toLocaleString('default', { month: 'short' }),
          amount,
        });
      }
    }

    return dataPoints;
  };

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    const thisMonth = new Date().toISOString().slice(0, 7);

    const [categoriesRes, transactionsRes, budgetsRes, allMonthTransactionsRes] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name'),
      supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10),
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', thisMonth),
      supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .gte('date', `${thisMonth}-01`)
        .lte('date', `${thisMonth}-31`),
    ]);

    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
    }

    if (transactionsRes.data) {
      setTransactions(transactionsRes.data as TransactionWithCategory[]);
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: todayTransactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('date', today);

    const todayTotal = todayTransactions?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
    setTodaySpent(todayTotal);

    const monthTotal = allMonthTransactionsRes.data?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
    setMonthlySpent(monthTotal);

    // Calculate spending per category with budgets
    if (categoriesRes.data) {
      const categorySpendingMap = new Map<string, number>();
      const categoryBudgetMap = new Map<string, number>();

      // Calculate spending per category
      allMonthTransactionsRes.data?.forEach((transaction) => {
        const categoryId = transaction.category_id;
        const current = categorySpendingMap.get(categoryId) || 0;
        categorySpendingMap.set(categoryId, current + parseFloat(transaction.amount.toString()));
      });

      // Map budgets to categories
      budgetsRes.data?.forEach((budget: any) => {
        categoryBudgetMap.set(budget.category_id, parseFloat(budget.amount.toString()));
      });

      // Create category spending data - include all categories
      const spendingData: CategorySpending[] = categoriesRes.data
        .map((category) => {
          const spending = categorySpendingMap.get(category.id) || 0;
          const budget = categoryBudgetMap.get(category.id) || 0;
          const displayTotal = monthTotal > 0 ? monthTotal : 1; // Prevent division by zero
          return {
            categoryId: category.id,
            categoryName: category.name,
            icon: category.icon,
            color: category.color,
            spending,
            budget,
            percentage: monthTotal > 0 ? (spending / displayTotal) * 100 : 0,
          };
        })
        .filter((item) => item.spending > 0 || item.budget > 0)
        .sort((a, b) => b.spending - a.spending);

      setCategorySpending(spendingData);
    }

    const budgetTotal = budgetsRes.data?.reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0) || 0;
    setMonthlyBudget(budgetTotal);

    const { data: billsCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'Bills & Utilities')
      .maybeSingle();

    if (billsCategory) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().slice(0, 7);

      const { data: upcomingBillsData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('category_id', billsCategory.id)
        .gte('date', `${nextMonthStr}-01`)
        .lte('date', `${nextMonthStr}-31`);

      const billsTotal = upcomingBillsData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      setUpcomingBills(billsTotal);
    }

    // Fetch initial chart data (uses selectedInterval)
    await fetchChartData(selectedInterval);

    setLoading(false);
  };

  const fetchChartData = async (intervalParam?: IntervalType) => {
    if (!user) return;
    const intervalToUse = intervalParam ?? selectedInterval;
    setIsChartLoading(true);

    const { startDate, endDate } = getDateRangeForInterval(intervalToUse);
    const { data: intervalTransactions } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate);

    const chartData = getDataPointsForInterval(intervalToUse, intervalTransactions || []);
    setMonthlyOverviewData(chartData);
    setIsChartLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    // Only fetch chart data when interval changes — don't trigger full page loading
    fetchChartData(selectedInterval);
  }, [selectedInterval, user]);

  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (transaction: TransactionWithCategory) => {
    setDeletingTransaction(transaction);
    setToast({
      message: 'Transaction deleted',
      type: 'info',
      actionLabel: 'Undo',
      onAction: () => {
        setDeletingTransaction(null);
        setToast(null);
      },
    });

    setTimeout(async () => {
      if (deletingTransaction && deletingTransaction.id === transaction.id) {
        await supabase.from('transactions').delete().eq('id', transaction.id);
        fetchData();
        setDeletingTransaction(null);
      }
    }, 7000);
  };

  const handleModalSuccess = () => {
    fetchData();
    setToast({
      message: editingTransaction
        ? 'Transaction updated successfully'
        : 'Transaction added successfully',
      type: 'success',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`p-6 space-y-6 pb-24 md:pb-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your total balance</p>
              <div className="flex items-baseline gap-4">
                <h1 className={`text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(monthlyBudget > 0 ? monthlyBudget - monthlySpent : monthlySpent, currency)}
                </h1>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-end self-center">
              <AnimatedTagline size="lg" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(monthlySpent, currency)}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <p className="text-blue-100 text-sm">This month spending</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Budget</p>
                  <p className="text-3xl font-bold">{formatCurrency(monthlyBudget, currency)}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="text-emerald-100 text-sm">Monthly limit</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Wallet className="h-12 w-12 text-white" />
              </div>
              <button
                onClick={handleAddTransaction}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyOverviewChart 
            data={monthlyOverviewData} 
            title="Spending Overview"
            selectedInterval={selectedInterval}
            onIntervalChange={setSelectedInterval}
            isLoading={isChartLoading}
          />

          <CategoryBudgetChart
            categories={categories}
            categorySpending={categorySpending}
            totalSpending={monthlySpent}
            totalBudget={monthlyBudget}
          />
        </div>

        <RecentTransactions
          transactions={transactions.filter((t) => !deletingTransaction || t.id !== deletingTransaction.id)}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        transaction={editingTransaction}
        categories={categories}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
}
