import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Toast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Category, BudgetWithCategory } from '../lib/types';
import { trackEvent } from '../lib/analytics';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budget?: BudgetWithCategory;
  categories: Category[];
}

function BudgetModal({ isOpen, onClose, onSuccess, budget, categories }: BudgetModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category_id: '',
    month: new Date().toISOString().slice(0, 7),
    amount: '',
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id,
        month: budget.month,
        amount: budget.amount.toString(),
      });
    } else {
      setFormData({
        category_id: categories[0]?.id || '',
        month: new Date().toISOString().slice(0, 7),
        amount: '',
      });
    }
  }, [budget, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) return;

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const budgetData = {
        user_id: user.id,
        category_id: formData.category_id,
        month: formData.month,
        amount: parseFloat(formData.amount),
      };

      if (budget) {
        const { error } = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', budget.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('budgets').insert(budgetData);

        if (error) throw error;

        await trackEvent('add_budget', { category_id: formData.category_id });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {budget ? 'Edit Budget' : 'Add Budget'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                disabled={!!budget}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month *
              </label>
              <input
                type="month"
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                disabled={!!budget}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000.00"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : budget ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function BudgetsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithCategory | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    const [categoriesRes, budgetsRes] = await Promise.all([
      supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
      supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('month', { ascending: false }),
    ]);

    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
    }

    if (budgetsRes.data) {
      const budgetsWithSpent = await Promise.all(
        budgetsRes.data.map(async (budget) => {
          const { data: transactions } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('category_id', budget.category_id)
            .gte('date', `${budget.month}-01`)
            .lte('date', `${budget.month}-31`);

          const spent = transactions?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

          return {
            ...budget,
            spent,
          } as BudgetWithCategory;
        })
      );

      setBudgets(budgetsWithSpent);
    }

    setLoading(false);
  };

  const handleAddBudget = () => {
    setEditingBudget(undefined);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: BudgetWithCategory) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (budget: BudgetWithCategory) => {
    if (!confirm(`Are you sure you want to delete this budget?`)) {
      return;
    }

    const { error } = await supabase.from('budgets').delete().eq('id', budget.id);

    if (error) {
      setToast({
        message: 'Failed to delete budget',
        type: 'error',
      });
    } else {
      setToast({
        message: 'Budget deleted successfully',
        type: 'success',
      });
      fetchData();
    }
  };

  const handleModalSuccess = () => {
    fetchData();
    setToast({
      message: editingBudget ? 'Budget updated successfully' : 'Budget added successfully',
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
            <p className="text-gray-600 mt-1">Set and track your spending limits</p>
          </div>
          <button
            onClick={handleAddBudget}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Budget</span>
          </button>
        </div>

        <div className="space-y-4">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const isOverBudget = percentage > 100;
            const isWarning = percentage > 80 && percentage <= 100;

            return (
              <div
                key={budget.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {budget.category.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(budget.month + '-01').toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${budget.spent.toFixed(2)}
                      </span>
                      <span className="text-gray-500">/ ${budget.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBudget(budget)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isOverBudget
                          ? 'bg-red-500'
                          : isWarning
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {isOverBudget ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 font-medium">
                          Over budget by ${(budget.spent - budget.amount).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          ${(budget.amount - budget.spent).toFixed(2)} remaining
                        </span>
                      </>
                    )}
                  </div>
                  <span className={`font-medium ${
                    isOverBudget
                      ? 'text-red-600'
                      : isWarning
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                  }`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {budgets.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No budgets set yet</p>
            <button
              onClick={handleAddBudget}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create your first budget
            </button>
          </div>
        )}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        budget={editingBudget}
        categories={categories}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </DashboardLayout>
  );
}
