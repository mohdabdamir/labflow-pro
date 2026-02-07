import React from 'react';
import { cn } from '@/lib/utils';
import type { CaseStatus } from '@/types/lab';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<CaseStatus, { label: string; className: string }> = {
  received: {
    label: 'Received',
    className: 'bg-status-received/10 text-status-received border-status-received/20',
  },
  'in-process': {
    label: 'In Process',
    className: 'bg-status-in-process/10 text-status-in-process border-status-in-process/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-status-completed/10 text-status-completed border-status-completed/20',
  },
  reported: {
    label: 'Reported',
    className: 'bg-status-reported/10 text-status-reported border-status-reported/20',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        config.className
      )}
    >
      <span className={cn(
        'rounded-full mr-1.5',
        size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
        status === 'received' && 'bg-status-received',
        status === 'in-process' && 'bg-status-in-process animate-pulse-subtle',
        status === 'completed' && 'bg-status-completed',
        status === 'reported' && 'bg-status-reported'
      )} />
      {config.label}
    </span>
  );
}
