import { useState, useEffect } from 'react';
import { CreditCard, Send, Wallet, Sparkles, TrendingUp, Receipt } from 'lucide-react';

type PaymentCardState = 'illustration' | 'quick-actions' | 'insights';

interface PaymentCardProps {
  monthlySpend: number;
  upcomingBills: number;
  hasTransactions: boolean;
  onAddCard?: () => void;
  onPayInvoice?: () => void;
  onSendMoney?: () => void;
  onTopUp?: () => void;
}

export function PaymentCard({
  monthlySpend,
  upcomingBills,
  hasTransactions,
  onAddCard,
  onPayInvoice,
  onSendMoney,
  onTopUp,
}: PaymentCardProps) {
  const [state, setState] = useState<PaymentCardState>('illustration');

  useEffect(() => {
    const savedState = localStorage.getItem('paymentCardState') as PaymentCardState;
    if (savedState) {
      setState(savedState);
    } else if (hasTransactions) {
      setState('insights');
    }
  }, [hasTransactions]);

  const handleStateChange = (newState: PaymentCardState) => {
    setState(newState);
    localStorage.setItem('paymentCardState', newState);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-[170px] p-6">
        {state === 'illustration' && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No payment methods yet
            </h3>
            <p className="text-sm text-gray-600 mb-4 max-w-xs">
              Add a card to enable quick payments and track spending
            </p>
            <div className="flex gap-3">
              <button
                onClick={onAddCard}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add card
              </button>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                Pay via bank
              </button>
            </div>
          </div>
        )}

        {state === 'quick-actions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                  Virtual card
                </button>
                <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                  Recent
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={onPayInvoice}
                className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Receipt className="h-6 w-6 text-gray-700 mb-1" />
                <span className="text-xs font-medium text-gray-700">Pay invoice</span>
              </button>
              <button
                onClick={onSendMoney}
                className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Send className="h-6 w-6 text-gray-700 mb-1" />
                <span className="text-xs font-medium text-gray-700">Send money</span>
              </button>
              <button
                onClick={onTopUp}
                className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Wallet className="h-6 w-6 text-gray-700 mb-1" />
                <span className="text-xs font-medium text-gray-700">Top up</span>
              </button>
            </div>
          </div>
        )}

        {state === 'insights' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Insights</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${monthlySpend.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Bills</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${upcomingBills.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-3 h-8 flex items-end gap-1">
              {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-200 rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-center gap-2">
        <button
          onClick={() => handleStateChange('illustration')}
          className={`w-2 h-2 rounded-full transition-colors ${
            state === 'illustration' ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          aria-label="Show illustration"
        />
        <button
          onClick={() => handleStateChange('quick-actions')}
          className={`w-2 h-2 rounded-full transition-colors ${
            state === 'quick-actions' ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          aria-label="Show quick actions"
        />
        <button
          onClick={() => handleStateChange('insights')}
          className={`w-2 h-2 rounded-full transition-colors ${
            state === 'insights' ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          aria-label="Show insights"
        />
      </div>
    </div>
  );
}
