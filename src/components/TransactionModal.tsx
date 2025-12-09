import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category, Transaction } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { trackEvent } from '../lib/analytics';
import { getCurrencySymbol } from '../lib/currency';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: Transaction;
  categories: Category[];
}

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  categories,
}: TransactionModalProps) {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [merchants, setMerchants] = useState<string[]>([]);
  const [showMerchants, setShowMerchants] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    currency: currency,
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    category_id: '',
    payment_type: 'Card' as 'Card' | 'UPI' | 'Cash',
    note: '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        date: transaction.date,
        merchant: transaction.merchant,
        category_id: transaction.category_id,
        payment_type: transaction.payment_type,
        note: transaction.note,
      });
    } else {
      setFormData({
        amount: '',
        currency: currency,
        date: new Date().toISOString().split('T')[0],
        merchant: '',
        category_id: categories[0]?.id || '',
        payment_type: 'Card',
        note: '',
      });
    }
  }, [transaction, categories, isOpen, currency]);

  useEffect(() => {
    if (isOpen) {
      fetchMerchants();
    }
  }, [isOpen]);

  const fetchMerchants = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('merchants')
      .select('name, most_common_category_id')
      .eq('user_id', user.id)
      .order('transaction_count', { ascending: false })
      .limit(10);

    if (data) {
      setMerchants(data.map((m) => m.name));
    }
  };

  const handleMerchantChange = (value: string) => {
    setFormData({ ...formData, merchant: value });
    setShowMerchants(value.length > 0);
  };

  const handleMerchantSelect = async (merchantName: string) => {
    setFormData({ ...formData, merchant: merchantName });
    setShowMerchants(false);

    const { data } = await supabase
      .from('merchants')
      .select('most_common_category_id')
      .eq('user_id', user?.id)
      .eq('name', merchantName)
      .maybeSingle();

    if (data?.most_common_category_id) {
      setFormData((prev) => ({
        ...prev,
        merchant: merchantName,
        category_id: data.most_common_category_id,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) return;

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!formData.merchant.trim()) {
      setError('Please enter a merchant name');
      return;
    }

    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        user_id: user.id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        date: formData.date,
        merchant: formData.merchant.trim(),
        category_id: formData.category_id,
        payment_type: formData.payment_type,
        note: formData.note.trim(),
      };

      if (transaction) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id);

        if (error) throw error;

        await trackEvent('edit_transaction', { transaction_id: transaction.id });
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert(transactionData);

        if (error) throw error;

        await trackEvent('add_transaction');
      }

      const { data: existingMerchant } = await supabase
        .from('merchants')
        .select('id, transaction_count')
        .eq('user_id', user.id)
        .eq('name', formData.merchant.trim())
        .maybeSingle();

      if (existingMerchant) {
        await supabase
          .from('merchants')
          .update({
            transaction_count: existingMerchant.transaction_count + 1,
            most_common_category_id: formData.category_id,
          })
          .eq('id', existingMerchant.id);
      } else {
        await supabase.from('merchants').insert({
          user_id: user.id,
          name: formData.merchant.trim(),
          most_common_category_id: formData.category_id,
          transaction_count: 1,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
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
              {transaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
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
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {getCurrencySymbol(currency)}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merchant *
              </label>
              <input
                type="text"
                required
                value={formData.merchant}
                onChange={(e) => handleMerchantChange(e.target.value)}
                onFocus={() => setShowMerchants(formData.merchant.length > 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Starbucks"
              />
              {showMerchants && merchants.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {merchants
                    .filter((m) =>
                      m.toLowerCase().includes(formData.merchant.toLowerCase())
                    )
                    .map((merchant) => (
                      <button
                        key={merchant}
                        type="button"
                        onClick={() => handleMerchantSelect(merchant)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors"
                      >
                        {merchant}
                      </button>
                    ))}
                </div>
              )}
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Payment Type *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Card', 'UPI', 'Cash'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_type: type })}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.payment_type === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Optional note..."
              />
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
                {loading ? 'Saving...' : transaction ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
