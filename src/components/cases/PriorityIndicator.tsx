import React from 'react';
import { cn } from '@/lib/utils';

interface PriorityIndicatorProps {
  priority: 'routine' | 'urgent' | 'stat';
  size?: 'sm' | 'md';
}

export function PriorityIndicator({ priority, size = 'md' }: PriorityIndicatorProps) {
  const config = {
    routine: {
      label: 'Routine',
      className: 'bg-muted text-muted-foreground',
    },
    urgent: {
      label: 'Urgent',
      className: 'bg-result-abnormal/10 text-result-abnormal font-semibold',
    },
    stat: {
      label: 'STAT',
      className: 'bg-result-critical text-white font-bold animate-pulse-subtle',
    },
  };

  const { label, className } = config[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-sm',
        className
      )}
    >
      {label}
    </span>
  );
}
