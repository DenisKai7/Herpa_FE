'use client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Props {
  data: Array<{ date: string; requests: number }>;
}

export default function DailyRequestsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
          }}
          labelStyle={{ color: '#374151' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="requests"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ r: 3, fill: '#8b5cf6' }}
          activeDot={{ r: 5 }}
          name="Requests"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
