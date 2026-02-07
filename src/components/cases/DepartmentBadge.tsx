import React from 'react';
import { cn } from '@/lib/utils';
import type { Department } from '@/types/lab';

interface DepartmentBadgeProps {
  department: Department;
  size?: 'sm' | 'md';
}

const deptConfig: Record<Department, { className: string; abbrev: string }> = {
  Hematology: { className: 'bg-dept-hematology/10 text-dept-hematology border-dept-hematology/20', abbrev: 'HEM' },
  Biochemistry: { className: 'bg-dept-biochemistry/10 text-dept-biochemistry border-dept-biochemistry/20', abbrev: 'BIO' },
  Microbiology: { className: 'bg-dept-microbiology/10 text-dept-microbiology border-dept-microbiology/20', abbrev: 'MIC' },
  Immunology: { className: 'bg-dept-immunology/10 text-dept-immunology border-dept-immunology/20', abbrev: 'IMM' },
  Pathology: { className: 'bg-dept-pathology/10 text-dept-pathology border-dept-pathology/20', abbrev: 'PATH' },
  Urinalysis: { className: 'bg-accent/10 text-accent border-accent/20', abbrev: 'UA' },
};

export function DepartmentBadge({ department, size = 'md' }: DepartmentBadgeProps) {
  const config = deptConfig[department];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-sm',
        config.className
      )}
    >
      {size === 'sm' ? config.abbrev : department}
    </span>
  );
}
