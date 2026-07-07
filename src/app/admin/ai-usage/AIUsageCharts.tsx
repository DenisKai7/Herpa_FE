'use client';
import { useState } from 'react';
import type { AIUsageChartsData } from '@/types/admin';
import DailyRequestsChart from './DailyRequestsChart';
import DailyTokensChart from './DailyTokensChart';
import PersonaBarChart from './PersonaBarChart';
import ModelPieChart from './ModelPieChart';
import HourlyHeatmap from './HourlyHeatmap';
import TopUsersChart from './TopUsersChart';
import TopEndpointsChart from './TopEndpointsChart';
import ErrorAnalytics from './ErrorAnalytics';
import LatencyAnalytics from './LatencyAnalytics';
import CostEstimation from './CostEstimation';

interface Props {
  data: AIUsageChartsData;
}

const cardClass =
  'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6';

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function AIUsageCharts({ data }: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    daily: true,
    personas: true,
    models: true,
    hourly: true,
    top_users: true,
    top_endpoints: true,
    errors: true,
    latency: true,
    cost: true,
  });

  const toggle = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const sections = [
    {
      id: 'daily',
      title: 'Daily Requests & Tokens',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Daily Requests
            </h4>
            <DailyRequestsChart data={data.daily_requests} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Daily Token Usage
            </h4>
            <DailyTokensChart data={data.daily_tokens} />
          </div>
        </div>
      ),
    },
    {
      id: 'personas',
      title: 'Requests by Persona',
      content: <PersonaBarChart data={data.by_persona} />,
    },
    {
      id: 'models',
      title: 'Model Distribution',
      content: <ModelPieChart data={data.by_model} />,
    },
    {
      id: 'hourly',
      title: 'Hourly Usage Heatmap',
      content: <HourlyHeatmap data={data.hourly_heatmap} />,
    },
    {
      id: 'top_users',
      title: 'Top Users',
      content: <TopUsersChart data={data.top_users} />,
    },
    {
      id: 'top_endpoints',
      title: 'Top Endpoints',
      content: <TopEndpointsChart data={data.top_endpoints} />,
    },
    {
      id: 'errors',
      title: 'Error Analytics',
      content: <ErrorAnalytics data={data.error_analytics} />,
    },
    {
      id: 'latency',
      title: 'Latency Statistics',
      content: <LatencyAnalytics data={data.latency_stats} />,
    },
    {
      id: 'cost',
      title: 'Cost & Throughput',
      content: <CostEstimation data={data.cost_estimation} />,
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map(({ id, title, content }) => (
        <div key={id} className={cardClass}>
          <button
            onClick={() => toggle(id)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <ChevronIcon open={!!openSections[id]} />
          </button>
          {openSections[id] && <div className="mt-4">{content}</div>}
        </div>
      ))}
    </div>
  );
}
