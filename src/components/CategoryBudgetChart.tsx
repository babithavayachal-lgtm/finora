import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Category } from '../lib/types';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../lib/currency';

interface CategorySpending {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  spending: number;
  budget: number;
  percentage: number;
}

interface CategoryBudgetChartProps {
  categories: Category[];
  categorySpending: CategorySpending[];
  totalSpending: number;
  totalBudget: number;
}

export function CategoryBudgetChart({
  categorySpending,
  totalSpending,
}: CategoryBudgetChartProps) {
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const pieData = categorySpending.length > 0 ? categorySpending : [];

  if (pieData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget by Categories</h3>
        <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
          <p className="text-center">Add transactions or budgets to see category breakdown</p>
        </div>
      </div>
    );
  }

  // Generate SVG pie chart with hover effects
  const radius = 70;
  const svgSize = 180;
  const center = svgSize / 2;

  let currentAngle = -Math.PI / 2;
  const slices = pieData.map((item) => {
    const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    const slice = {
      item,
      pathData,
      startAngle,
      endAngle,
    };

    currentAngle = endAngle;
    return slice;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Budget by Categories</h3>
          <p className="text-sm text-gray-500 mt-1">Monthly spending breakdown</p>
        </div>
        <button
          onClick={() => navigate('/categories')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Manage
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Interactive Pie Chart */}
        <div className="flex-shrink-0 flex items-center justify-center relative">
          <div className="relative" style={{ width: '220px', height: '220px' }}>
            {/* Tooltip */}
            {hoveredCategory && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="text-center bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl animate-pulse">
                  <p className="text-sm font-semibold">{hoveredCategory}</p>
                </div>
              </div>
            )}

            {/* SVG Pie Chart */}
            <svg
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
            >
              {slices.map((slice) => (
                <g key={slice.item.categoryId}>
                  {/* Slice path with hover effects */}
                  <path
                    d={slice.pathData}
                    fill={slice.item.color}
                    className="cursor-pointer transition-all duration-300"
                    opacity={hoveredCategory === null || hoveredCategory === slice.item.categoryName ? 1 : 0.5}
                    onMouseEnter={() => setHoveredCategory(slice.item.categoryName)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    style={{
                      filter: hoveredCategory === slice.item.categoryName 
                        ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' 
                        : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      transformBox: 'fill-box',
                      transformOrigin: `${center}px ${center}px`,
                    }}
                  >
                    <title>
                      {slice.item.categoryName}: {formatCurrency(slice.item.spending, currency)} ({slice.item.percentage.toFixed(1)}%)
                    </title>
                  </path>
                </g>
              ))}

              {/* Center circle for donut effect */}
              <circle
                cx={center}
                cy={center}
                r={35}
                fill="white"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))' }}
              />

              {/* Center text */}
              <text
                x={center}
                y={center - 5}
                textAnchor="middle"
                className="fill-gray-900"
                style={{ fontSize: '16px', fontWeight: 'bold' }}
              >
                {formatCurrency(totalSpending, currency)}
              </text>
              <text
                x={center}
                y={center + 15}
                textAnchor="middle"
                className="fill-gray-500"
                style={{ fontSize: '10px' }}
              >
                Total Spent
              </text>
            </svg>
          </div>
        </div>

        {/* Legend and Details */}
        <div className="flex-1">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {pieData.map((item) => {
              const IconComponent = (Icons as any)[item.icon];
              const spendingPercentage = item.budget > 0 ? (item.spending / item.budget) * 100 : 0;
              const remaining = Math.max(0, item.budget - item.spending);

              return (
                <div
                  key={item.categoryId}
                  className={`border rounded-lg p-3 transition-all duration-300 cursor-pointer ${
                    hoveredCategory === item.categoryName
                      ? 'border-gray-400 bg-gray-50 shadow-md'
                      : 'border-gray-100 hover:border-gray-300 bg-white'
                  }`}
                  onMouseEnter={() => setHoveredCategory(item.categoryName)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      {IconComponent ? (
                        <IconComponent className="h-4 w-4" style={{ color: item.color }} />
                      ) : (
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: item.color }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.categoryName}</p>
                        <span className="text-xs font-semibold text-gray-600 flex-shrink-0">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatCurrency(item.spending, currency)} {item.budget > 0 && `/ ${formatCurrency(item.budget, currency)}`}
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  {item.budget > 0 && (
                    <>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            spendingPercentage > 100 ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, spendingPercentage)}%` }}
                        />
                      </div>
                      {remaining > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{formatCurrency(remaining, currency)} remaining</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
