'use client';

interface Props {
  data: Array<{ hour: number; count: number }>;
}

function getColor(count: number, max: number): string {
  if (max === 0) return 'bg-gray-100 dark:bg-gray-800';
  const ratio = count / max;
  if (ratio === 0) return 'bg-gray-100 dark:bg-gray-800';
  if (ratio < 0.2) return 'bg-purple-100 dark:bg-purple-900/30';
  if (ratio < 0.4) return 'bg-purple-200 dark:bg-purple-800/40';
  if (ratio < 0.6) return 'bg-purple-300 dark:bg-purple-700/50';
  if (ratio < 0.8) return 'bg-purple-400 dark:bg-purple-600/60';
  return 'bg-purple-600 dark:bg-purple-500';
}

export default function HourlyHeatmap({ data }: Props) {
  const max = Math.max(...data.map((d) => d.count), 0);

  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
        {data.map((item) => (
          <div key={item.hour} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {String(item.hour).padStart(2, '0')}
            </span>
            <div
              className={`w-full aspect-square rounded-sm ${getColor(item.count, max)} transition-colors`}
              title={`${String(item.hour).padStart(2, '0')}:00 - ${item.count} requests`}
            />
            <span className="text-[10px] text-gray-600 dark:text-gray-300 font-medium">
              {item.count}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-4 h-4 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-4 h-4 rounded-sm bg-purple-200 dark:bg-purple-900/40" />
          <div className="w-4 h-4 rounded-sm bg-purple-400 dark:bg-purple-700/50" />
          <div className="w-4 h-4 rounded-sm bg-purple-600 dark:bg-purple-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
