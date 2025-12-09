import { useState, useEffect } from 'react';
import { Plus, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { RecentTransactions } from '../components/RecentTransactions';
import { TransactionModal } from '../components/TransactionModal';
import { Toast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Category, TransactionWithCategory } from '../lib/types';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function TransactionsPage() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | undefined>();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionWithCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(20);

  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    paymentType: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (user && loading) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [transactions, filters]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    const [categoriesRes, transactionsRes] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name'),
      supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
    ]);

    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
    }

    if (transactionsRes.data) {
      setTransactions(transactionsRes.data as TransactionWithCategory[]);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.merchant.toLowerCase().includes(searchLower) ||
          t.note.toLowerCase().includes(searchLower)
      );
    }

    if (filters.categoryId) {
      filtered = filtered.filter((t) => t.category_id === filters.categoryId);
    }

    if (filters.paymentType) {
      filtered = filtered.filter((t) => t.payment_type === filters.paymentType);
    }

    if (filters.startDate) {
      filtered = filtered.filter((t) => t.date >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter((t) => t.date <= filters.endDate);
    }

    setFilteredTransactions(filtered);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      paymentType: '',
      startDate: '',
      endDate: '',
    });
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
      message: 'Transaction will be deleted in 7 seconds',
      type: 'info',
    });

    setTimeout(async () => {
      if (deletingTransaction && deletingTransaction.id === transaction.id) {
        await supabase.from('transactions').delete().eq('id', transaction.id);
        fetchData();
        setDeletingTransaction(null);
        setToast({
          message: 'Transaction deleted permanently',
          type: 'success',
        });
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

  const hasActiveFilters =
    filters.search || filters.categoryId || filters.paymentType || filters.startDate || filters.endDate;

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
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
              {filteredTransactions.length !== transactions.length && ` (${transactions.length} total)`}
            </p>
          </div>
          <button
            onClick={handleAddTransaction}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search merchant or note..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  value={filters.paymentType}
                  onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {hasActiveFilters && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <RecentTransactions
          transactions={paginatedTransactions.filter(
            (t) => !deletingTransaction || t.id !== deletingTransaction.id
          )}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm`}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
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
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
}
