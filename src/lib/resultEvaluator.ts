// Result Evaluator - Determines result flags based on normal ranges
import type { NormalRange, ResultFlag, Gender } from '@/types/lab';

export interface EvaluationResult {
  flag: ResultFlag;
  normalRange: string;
  isCritical: boolean;
}

export function evaluateResult(
  value: string,
  serviceId: string,
  patientGender: Gender,
  patientAge: number,
  normalRanges: NormalRange[]
): EvaluationResult {
  // Find applicable normal range
  const applicableRanges = normalRanges.filter(nr => {
    if (nr.serviceId !== serviceId) return false;
    if (nr.gender !== 'All' && nr.gender !== patientGender) return false;
    
    // Age matching
    if (nr.ageMin !== undefined || nr.ageMax !== undefined) {
      const ageInYears = patientAge;
      if (nr.ageMin !== undefined && ageInYears < nr.ageMin) return false;
      if (nr.ageMax !== undefined && ageInYears > nr.ageMax) return false;
    }
    
    return true;
  });

  // Get most specific range (gender-specific > all, age-specific > general)
  const range = applicableRanges.sort((a, b) => {
    // Prefer gender-specific
    if (a.gender !== 'All' && b.gender === 'All') return -1;
    if (b.gender !== 'All' && a.gender === 'All') return 1;
    // Prefer age-specific
    if (a.ageMin !== undefined && b.ageMin === undefined) return -1;
    if (b.ageMin !== undefined && a.ageMin === undefined) return 1;
    return 0;
  })[0];

  if (!range) {
    return { flag: null, normalRange: 'N/A', isCritical: false };
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { flag: null, normalRange: `${range.normalLow}-${range.normalHigh}`, isCritical: false };
  }

  const normalRange = `${range.normalLow}-${range.normalHigh}`;

  // Check critical values first
  if (range.criticalLow !== undefined && numValue < range.criticalLow) {
    return { flag: 'critical', normalRange, isCritical: true };
  }
  if (range.criticalHigh !== undefined && numValue > range.criticalHigh) {
    return { flag: 'critical', normalRange, isCritical: true };
  }

  // Check normal range
  if (numValue < range.normalLow || numValue > range.normalHigh) {
    return { flag: 'abnormal', normalRange, isCritical: false };
  }

  return { flag: 'normal', normalRange, isCritical: false };
}

export function formatResultDisplay(value: string, unit?: string): string {
  if (!value) return '-';
  return unit ? `${value} ${unit}` : value;
}
