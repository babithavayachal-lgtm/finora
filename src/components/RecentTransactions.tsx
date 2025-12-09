import { CreditCard, Smartphone, Banknote, Pencil, Trash2 } from 'lucide-react';
import { TransactionWithCategory } from '../lib/types';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../lib/currency';

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (transaction: TransactionWithCategory) => void;
}

export function RecentTransactions({
  transactions,
  onEdit,
  onDelete,
}: RecentTransactionsProps) {
  const { currency } = useCurrency();
  
  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'Card':
        return <CreditCard className="h-4 w-4" />;
      case 'UPI':
        return <Smartphone className="h-4 w-4" />;
      case 'Cash':
        return <Banknote className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">My Transactions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          See all
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No transactions yet</p>
            <p className="text-sm mt-1">Add your first expense to get started</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${transaction.category.color}20` }}
                >
                  <span style={{ color: transaction.category.color }}>
                    {getPaymentIcon(transaction.payment_type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {transaction.merchant}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${transaction.category.color}20`,
                        color: transaction.category.color,
                      }}
                    >
                      {transaction.category.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    -{formatCurrency(transaction.amount, currency)}
                  </p>
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                    }}
                  >
                    Outcome
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Edit transaction"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(transaction)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete transaction"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
