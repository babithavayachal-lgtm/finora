import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { CURRENCIES, getCurrencySymbol } from '../lib/currency';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { currency, setCurrency, loading } = useCurrency();
  const { isDarkMode } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedCurrency(currency);
    }
  }, [isOpen, currency]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setCurrency(selectedCurrency);
      onClose();
    } catch (error) {
      console.error('Error saving currency:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-md mx-4 rounded-2xl shadow-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Currency
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {CURRENCIES.map((curr) => (
                <label
                  key={curr}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCurrency === curr
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="currency"
                    value={curr}
                    checked={selectedCurrency === curr}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="sr-only"
                  />
                  <span className="flex-1 font-medium">{curr}</span>
                  <span className="text-sm opacity-75">
                    {getCurrencySymbol(curr)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || selectedCurrency === currency}
            className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

