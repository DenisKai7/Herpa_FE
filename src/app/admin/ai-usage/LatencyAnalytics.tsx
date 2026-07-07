'use client';

interface Props {
  data: {
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
  };
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

const cards = [
  { key: 'min' as const, label: 'Min' },
  { key: 'max' as const, label: 'Max' },
  { key: 'avg' as const, label: 'Average' },
  { key: 'median' as const, label: 'Median' },
  { key: 'p95' as const, label: 'P95' },
];

export default function LatencyAnalytics({ data }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatMs(data[key])}
          </p>
        </div>
      ))}
    </div>
  );
}
