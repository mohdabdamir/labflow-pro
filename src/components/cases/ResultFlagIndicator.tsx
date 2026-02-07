import React from 'react';
import { cn } from '@/lib/utils';
import type { ResultFlag } from '@/types/lab';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ResultFlagIndicatorProps {
  flag: ResultFlag;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ResultFlagIndicator({ flag, showLabel = false, size = 'md' }: ResultFlagIndicatorProps) {
  if (!flag) return null;

  const config = {
    normal: {
      icon: CheckCircle,
      label: 'Normal',
      className: 'text-result-normal',
    },
    abnormal: {
      icon: AlertTriangle,
      label: 'Abnormal',
      className: 'text-result-abnormal',
    },
    critical: {
      icon: XCircle,
      label: 'Critical',
      className: 'text-result-critical',
    },
  };

  const flagConfig = config[flag];
  const Icon = flagConfig.icon;

  return (
    <span className={cn('inline-flex items-center gap-1', flagConfig.className)}>
      <Icon className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      {showLabel && <span className="text-sm font-medium">{flagConfig.label}</span>}
    </span>
  );
}
