'use client';

interface Props {
  data: {
    total_tokens: number;
    total_latency_ms: number;
    throughput_tokens_per_sec: number;
    provider: string;
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function CostEstimation({ data }: Props) {
  const stats = [
    {
      label: 'Total Tokens',
      value: formatNumber(data.total_tokens),
    },
    {
      label: 'Total Latency',
      value:
        data.total_latency_ms >= 1000
          ? `${(data.total_latency_ms / 1000).toFixed(1)}s`
          : `${Math.round(data.total_latency_ms)}ms`,
    },
    {
      label: 'Throughput',
      value: `${data.throughput_tokens_per_sec.toFixed(1)} tok/s`,
    },
    {
      label: 'Provider',
      value: data.provider,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
