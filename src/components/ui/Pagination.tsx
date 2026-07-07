'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
}

export function Pagination({ total, limit, offset, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const start = offset + 1;
  const end = Math.min(offset + limit, total);

  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {start}&ndash;{end} dari {total} pengguna
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(offset - limit)}
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          Prev
        </Button>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(offset + limit)}
          icon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
