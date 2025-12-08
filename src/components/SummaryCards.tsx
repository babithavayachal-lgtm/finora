import { TrendingUp, Calendar, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  todaySpent: number;
  monthlyBudget: number;
  monthlySpent: number;
  onQuickAdd: () => void;
}

export function SummaryCards({
  todaySpent,
  monthlyBudget,
  monthlySpent,
  onQuickAdd,
}: SummaryCardsProps) {
  const budgetPercentage = monthlyBudget > 0 ? (monthlySpent / monthlyBudget) * 100 : 0;
  const isOverBudget = budgetPercentage > 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Today's Spent</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ${todaySpent.toFixed(2)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-600">Monthly Budget</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ${monthlySpent.toFixed(0)}
              <span className="text-lg text-gray-500"> / ${monthlyBudget.toFixed(0)}</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isOverBudget ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        {isOverBudget && (
          <p className="text-xs text-red-600 mt-2 font-medium">
            Over budget by ${(monthlySpent - monthlyBudget).toFixed(2)}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-blue-100">Quick Add</p>
            <p className="text-lg font-semibold mt-1">Add Transaction</p>
          </div>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Wallet className="h-6 w-6" />
          </div>
        </div>
        <button
          onClick={onQuickAdd}
          className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
}
