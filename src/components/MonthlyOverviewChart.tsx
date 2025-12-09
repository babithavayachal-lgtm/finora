import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrencyCompact } from '../lib/currency';

interface MonthlyData {
  month: string;
  amount: number;
}

type IntervalType = '7d' | '1m' | '3m' | '6m' | '1y';

interface MonthlyOverviewChartProps {
  data: MonthlyData[];
  title?: string;
  onIntervalChange?: (interval: IntervalType) => void;
  selectedInterval?: IntervalType;
  isLoading?: boolean;
}

export function MonthlyOverviewChart({ data, title = 'Spending Overview', onIntervalChange, selectedInterval: propSelectedInterval, isLoading }: MonthlyOverviewChartProps) {
  const { isDarkMode } = useTheme();
  const { currency } = useCurrency();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [localInterval, setLocalInterval] = useState<IntervalType>('7d');

  const intervalOptions: { label: string; value: IntervalType }[] = [
    { label: '7D', value: '7d' },
    { label: '1M', value: '1m' },
    { label: '3M', value: '3m' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
  ];

  const handleIntervalChange = (interval: IntervalType) => {
    // If parent controls the interval (prop passed), parent will update it via onIntervalChange
    if (propSelectedInterval === undefined) {
      setLocalInterval(interval);
    }
    onIntervalChange?.(interval);
  };

  const selectedInterval = propSelectedInterval ?? localInterval;

  if (!data || data.length === 0) {
    return (
      <div className={`rounded-2xl shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <div className={`h-80 flex items-center justify-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          No data available
        </div>
      </div>
    );
  }

  // Find min and max values for scaling
  const maxAmount = Math.max(...data.map((d) => d.amount));
  const minAmount = Math.min(...data.map((d) => d.amount));
  const range = maxAmount - minAmount || maxAmount;
  const padding = 40;
  const chartHeight = 300;
  const chartWidth = 800;

  // Calculate points for the line chart
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * (chartWidth - padding * 2) + padding;
    const normalizedValue = (item.amount - minAmount) / (range || 1);
    const y = chartHeight - padding - normalizedValue * (chartHeight - padding * 2);
    return { x, y, value: item.amount };
  });

  // Create path for the gradient area
  const areaPath = [
    `M ${points[0].x} ${points[0].y}`,
    ...points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${chartHeight}`,
    `L ${points[0].x} ${chartHeight}`,
    'Z',
  ].join(' ');

  const barWidth = (chartWidth - padding * 2) / data.length;
  const barPadding = barWidth * 0.3;
  const actualBarWidth = barWidth - barPadding;

  return (
    <div className={`rounded-2xl shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <div className="flex items-center gap-2">
          {intervalOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleIntervalChange(option.value)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                selectedInterval === option.value
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-gray-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative" style={{ width: '100%', height: `${chartHeight}px` }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={padding + (chartHeight - padding * 2) * (i / 4)}
              x2={chartWidth - padding}
              y2={padding + (chartHeight - padding * 2) * (i / 4)}
              stroke={isDarkMode ? '#374151' : '#e5e7eb'}
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const value = maxAmount - (range * i) / 4;
            return (
              <text
                key={`label-${i}`}
                x={padding - 10}
                y={padding + (chartHeight - padding * 2) * (i / 4) + 4}
                textAnchor="end"
                className={`text-xs font-medium ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
              >
                ${Math.round(value)}
              </text>
            );
          })}

          {/* Gradient area under curve */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Area path */}
          <path
            d={areaPath}
            fill="url(#areaGradient)"
          />

          {/* Line chart */}
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points and bars */}
          {points.map((point, index) => {
            const barX = (index / (data.length - 1)) * (chartWidth - padding * 2) + padding - actualBarWidth / 2;
            const barHeight = ((data[index].amount - minAmount) / (range || 1)) * (chartHeight - padding * 2);
            const isHovered = hoveredIndex === index;

            return (
              <g key={`point-${index}`}>
                {/* Bar background */}
                <rect
                  x={barX}
                  y={chartHeight - padding - barHeight}
                  width={actualBarWidth}
                  height={barHeight}
                  fill={isDarkMode ? '#1f2937' : '#f3f4f6'}
                  opacity="0.5"
                />

                {/* Interactive circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 8 : 5}
                  fill="#3b82f6"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    boxShadow: isHovered ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
                    filter: isHovered ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none',
                  }}
                />

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={point.x - 50}
                      y={point.y - 40}
                      width="100"
                      height="32"
                      rx="6"
                      fill={isDarkMode ? '#1f2937' : '#1f2937'}
                      opacity="0.95"
                    />
                    <text
                      x={point.x}
                      y={point.y - 22}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-white"
                    >
                      {formatCurrencyCompact(point.value, currency)}
                    </text>
                    <text
                      x={point.x}
                      y={point.y - 12}
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
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-gray-900/40 rounded-2xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4 px-10">
        {(() => {
          const maxLabels = 8; // target max labels to avoid crowding
          const step = Math.max(1, Math.ceil(data.length / maxLabels));
          return data.map((item, index) => (
            <div
              key={`month-${index}`}
              className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {index % step === 0 ? item.month : ''}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
