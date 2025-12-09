import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';
import { Category, Transaction } from '../lib/types';
import { formatCurrency } from '../lib/currency';

type IntervalType = '1m' | '3m' | '6m' | '1y';

interface MonthlyData {
  month: string;
  amount: number;
}

interface CategorySpendingData {
  category: Category;
  data: MonthlyData[];
}

export function AnalysisPage() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySpendingData, setCategorySpendingData] = useState<CategorySpendingData[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<IntervalType>('1m');
  const [isChartLoading, setIsChartLoading] = useState(false);

  useEffect(() => {
    if (user && loading) {
      fetchCategories();
    }
  }, [user]);

  useEffect(() => {
    if (user && categories.length > 0) {
      fetchCategorySpendingData();
    }
  }, [user, categories, selectedInterval]);

  const fetchCategories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeForInterval = (interval: IntervalType) => {
    const now = new Date();
    let startDate = new Date();

    switch (interval) {
      case '1m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        startDate.setHours(0, 0, 0, 0);
        break;
      case '6m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        startDate.setHours(0, 0, 0, 0);
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  };

  const getDataPointsForInterval = (interval: IntervalType, transactions: Transaction[]) => {
    const now = new Date();
    const dataPoints: MonthlyData[] = [];
    const byDay = new Map<string, number>();
    const byMonth = new Map<string, number>();

    const pad = (n: number) => n.toString().padStart(2, '0');

    transactions.forEach((t) => {
      const dt = t.date ? new Date(t.date) : null;
      if (!dt || isNaN(dt.getTime())) return;
      const year = dt.getFullYear();
      const month = pad(dt.getMonth() + 1);
      const day = pad(dt.getDate());

      const dayKey = `${year}-${month}-${day}`;
      const monthKey = `${year}-${month}`;

      const amt = parseFloat(t.amount.toString());
      byDay.set(dayKey, (byDay.get(dayKey) || 0) + amt);
      byMonth.set(monthKey, (byMonth.get(monthKey) || 0) + amt);
    });

    if (interval === '1m') {
      const { startDate } = getDateRangeForInterval('1m');
      const current = new Date(startDate);
      while (current <= now) {
        const year = current.getFullYear();
        const month = pad(current.getMonth() + 1);
        const day = pad(current.getDate());
        const dayKey = `${year}-${month}-${day}`;
        const amount = byDay.get(dayKey) || 0;
        dataPoints.push({
          month: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount,
        });
        current.setDate(current.getDate() + 1);
      }
    } else {
      const { startDate } = getDateRangeForInterval(interval);
      const current = new Date(startDate);
      while (current <= now) {
        const year = current.getFullYear();
        const month = pad(current.getMonth() + 1);
        const monthKey = `${year}-${month}`;
        const amount = byMonth.get(monthKey) || 0;
        dataPoints.push({
          month: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount,
        });
        current.setMonth(current.getMonth() + 1);
      }
    }

    return dataPoints;
  };

  const fetchCategorySpendingData = async () => {
    if (!user || categories.length === 0) return;

    setIsChartLoading(true);
    try {
      const { startDate, endDate } = getDateRangeForInterval(selectedInterval);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const categoryData: CategorySpendingData[] = categories.map((category) => {
        const categoryTransactions = (transactions || []).filter(
          (t) => t.category_id === category.id
        );
        const data = getDataPointsForInterval(selectedInterval, categoryTransactions);
        return {
          category,
          data,
        };
      });

      setCategorySpendingData(categoryData);
    } catch (error) {
      console.error('Error fetching category spending data:', error);
    } finally {
      setIsChartLoading(false);
    }
  };

  const CategoryChart = ({ categoryData }: { categoryData: CategorySpendingData }) => {
    const { category, data } = categoryData;
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) {
      return (
        <div className={`rounded-2xl shadow-sm border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <span style={{ color: category.color }} className="text-sm font-semibold">
                {category.name.charAt(0)}
              </span>
            </div>
            <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {category.name}
            </h3>
          </div>
          <div className={`h-40 flex items-center justify-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <p className="text-sm">No spending data</p>
          </div>
        </div>
      );
    }

    const maxAmount = Math.max(...data.map((d) => d.amount));
    const minAmount = Math.min(...data.map((d) => d.amount));
    const range = maxAmount - minAmount || maxAmount;
    const padding = 30;
    const chartHeight = 180;
    const chartWidth = 400; // Smaller width for 2 per row

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * (chartWidth - padding * 2) + padding;
      const normalizedAmount = range > 0 ? (item.amount - minAmount) / range : 0.5;
      const y = chartHeight - padding - normalizedAmount * (chartHeight - padding * 2);
      return { x, y, value: item.amount };
    });

    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    const totalSpending = data.reduce((sum, d) => sum + d.amount, 0);

    return (
      <div className={`rounded-2xl shadow-sm border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <span style={{ color: category.color }} className="text-sm font-semibold">
                {category.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {category.name}
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatCurrency(totalSpending, currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="relative" style={{ width: '100%', height: `${chartHeight}px` }}>
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Grid lines */}
            {[0, 0.5, 1].map((ratio) => {
              const y = padding + ratio * (chartHeight - padding * 2);
              return (
                <line
                  key={ratio}
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Line path */}
            <path
              d={pathData}
              fill="none"
              stroke={category.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? 5 : 3}
                    fill={category.color}
                    stroke={isDarkMode ? '#1f2937' : 'white'}
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredIndex(index)}
                    style={{ cursor: 'pointer' }}
                  />
                  {isHovered && (
                    <g>
                      <rect
                        x={point.x - 40}
                        y={point.y - 35}
                        width="80"
                        height="28"
                        rx="4"
                        fill={isDarkMode ? '#1f2937' : '#1f2937'}
                        opacity="0.95"
                      />
                      <text
                        x={point.x}
                        y={point.y - 20}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-white"
                      >
                        {formatCurrency(point.value, currency)}
                      </text>
                      <text
                        x={point.x}
                        y={point.y - 10}
                        textAnchor="middle"
                        className="text-xs fill-gray-300"
                      >
                        {data[index].month}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const intervalOptions: { label: string; value: IntervalType }[] = [
    { label: '1M', value: '1m' },
    { label: '3M', value: '3m' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
  ];

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Category Analysis
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track spending trends for each category
            </p>
          </div>

          <div className="flex items-center gap-2">
            {intervalOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedInterval(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedInterval === option.value
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isChartLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : categorySpendingData.length === 0 ? (
          <div className={`rounded-2xl shadow-sm border p-12 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No categories found. Create categories to see spending analysis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorySpendingData.map((categoryData) => (
              <CategoryChart key={categoryData.category.id} categoryData={categoryData} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

