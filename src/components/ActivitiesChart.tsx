interface ActivitiesChartProps {
  data: { date: string; amount: number }[];
}

export function ActivitiesChart({ data }: ActivitiesChartProps) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 100);
  const chartHeight = 120;
  const padding = 10;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = chartHeight - padding - ((d.amount / maxAmount) * (chartHeight - padding * 2));
      return `${x},${y}`;
    })
    .join(' ');

  const gradientPath = `${points} 100,${chartHeight} 0,${chartHeight}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          See all
        </button>
      </div>
      {data.length === 0 ? (
        <div className="h-[150px] flex items-center justify-center text-gray-500">
          No activity data yet
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 100 ${chartHeight}`}
            className="w-full"
            style={{ height: '150px' }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <polygon
              points={gradientPath}
              fill="url(#chartGradient)"
            />

            <polyline
              points={points}
              fill="none"
              stroke="#ec4899"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = chartHeight - padding - ((d.amount / maxAmount) * (chartHeight - padding * 2));
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#ec4899"
                  className="cursor-pointer transition-all hover:r-6"
                >
                  <title>
                    {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${d.amount.toFixed(2)}
                  </title>
                </circle>
              );
            })}
          </svg>
          <div className="flex justify-between mt-3 text-xs text-gray-500">
            {data.map((d, i) => (
              <span key={i} className="text-center">
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
