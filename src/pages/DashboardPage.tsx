import { useState, useEffect } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, Tag } from 'lucide-react';
import * as Icons from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ActivitiesChart } from '../components/ActivitiesChart';
import { RecentTransactions } from '../components/RecentTransactions';
import { TransactionModal } from '../components/TransactionModal';
import { Toast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Category, TransactionWithCategory } from '../lib/types';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [todaySpent, setTodaySpent] = useState(0);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [upcomingBills, setUpcomingBills] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ date: string; amount: number }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | undefined>();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionWithCategory | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    const [categoriesRes, transactionsRes, budgetsRes] = await Promise.all([
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
        .select('amount')
        .eq('user_id', user.id)
        .eq('month', new Date().toISOString().slice(0, 7)),
    ]);

    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
    }

    if (transactionsRes.data) {
      setTransactions(transactionsRes.data as TransactionWithCategory[]);
    }

    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const { data: todayTransactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('date', today);

    const todayTotal = todayTransactions?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
    setTodaySpent(todayTotal);

    const { data: monthTransactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', `${thisMonth}-01`)
      .lte('date', `${thisMonth}-31`);

    const monthTotal = monthTransactions?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
    setMonthlySpent(monthTotal);

    const budgetTotal = budgetsRes.data?.reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0) || 0;
    setMonthlyBudget(budgetTotal);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const weeklyPromises = last7Days.map(async (date) => {
      const { data } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('date', date);

      const total = data?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      return { date, amount: total };
    });

    const weekly = await Promise.all(weeklyPromises);
    setWeeklyData(weekly);

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

    setLoading(false);
  };

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
      <div className="p-6 space-y-6 pb-24 md:pb-6">
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">Your total balance</p>
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              ${(monthlyBudget > 0 ? monthlyBudget - monthlySpent : monthlySpent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <div className="flex items-center gap-4">
              <span className="flex items-center text-sm text-green-600 font-medium">
                <TrendingUp className="h-4 w-4 mr-1" />
                {monthlyBudget > 0 ? ((monthlySpent / monthlyBudget) * 100).toFixed(1) : '0.0'}%
              </span>
              <span className="flex items-center text-sm text-red-600 font-medium">
                <TrendingDown className="h-4 w-4 mr-1" />
                {todaySpent > 0 ? '2.5' : '0.0'}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Balance</p>
                  <p className="text-3xl font-bold">${monthlySpent.toFixed(2)}</p>
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
                  <p className="text-3xl font-bold">${monthlyBudget.toFixed(2)}</p>
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
          <ActivitiesChart data={weeklyData} />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              <button
                onClick={() => window.location.href = '/categories'}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                See all
              </button>
            </div>
            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No categories yet</p>
              ) : (
                categories.slice(0, 4).map((category) => {
                  const IconComponent = (Icons as any)[category.icon];
                  return (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {IconComponent ? (
                            <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                          ) : (
                            <Tag className="h-5 w-5" style={{ color: category.color }} />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
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
