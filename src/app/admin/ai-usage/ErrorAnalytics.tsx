'use client';

interface Props {
  data: {
    by_endpoint: Array<{ endpoint: string; errors: number }>;
    by_model: Array<{ model: string; errors: number }>;
    by_day: Array<{ date: string; errors: number }>;
  };
}

function TableSection({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: Array<(string | number)[]>;
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-3 px-3 text-gray-400 dark:text-gray-500 text-center"
                >
                  No errors
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="py-2 px-3 text-gray-700 dark:text-gray-300"
                    >
                      {typeof cell === 'string' && cell.length > 30
                        ? cell.slice(0, 30) + '...'
                        : cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ErrorAnalytics({ data }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TableSection
        title="By Endpoint"
        columns={['Endpoint', 'Errors']}
        rows={data.by_endpoint.map((d) => [d.endpoint, d.errors])}
      />
      <TableSection
        title="By Model"
        columns={['Model', 'Errors']}
        rows={data.by_model.map((d) => [d.model, d.errors])}
      />
      <TableSection
        title="By Day"
        columns={['Date', 'Errors']}
        rows={data.by_day.map((d) => [d.date, d.errors])}
      />
    </div>
  );
}
