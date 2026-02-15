import React, { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Save, CheckCircle2, AlertTriangle, AlertCircle, 
  FlaskConical, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNormalRanges } from '@/hooks/useLabData';
import { evaluateResult } from '@/lib/resultEvaluator';
import type { Case, CaseTest, ResultFlag } from '@/types/lab';
import { toast } from 'sonner';

interface ResultEntryDialogProps {
  open: boolean;
  onClose: () => void;
  caseData: Case;
  onSave: (tests: CaseTest[]) => void;
  mode: 'entry' | 'validation';
}

interface TestResult {
  testId: string;
  result: string;
  flag: ResultFlag;
  normalRange: string;
  isCritical: boolean;
}

export function ResultEntryDialog({ open, onClose, caseData, onSave, mode }: ResultEntryDialogProps) {
  const { normalRanges } = useNormalRanges();
  const [validatorName, setValidatorName] = useState('');
  const [validationNotes, setValidationNotes] = useState('');

  // Track result edits
  const [results, setResults] = useState<Map<string, TestResult>>(() => {
    const initial = new Map<string, TestResult>();
    (caseData.tests || []).forEach(test => {
      initial.set(test.testId, {
        testId: test.testId,
        result: test.result || '',
        flag: test.flag || null,
        normalRange: test.normalRange || '',
        isCritical: test.flag === 'critical',
      });
    });
    return initial;
  });

  const updateResult = useCallback((testId: string, value: string) => {
    const evaluation = evaluateResult(value, testId, caseData.patientGender, caseData.patientAge, normalRanges);
    setResults(prev => {
      const updated = new Map(prev);
      updated.set(testId, { testId, result: value, flag: evaluation.flag, normalRange: evaluation.normalRange, isCritical: evaluation.isCritical });
      return updated;
    });
  }, [caseData.patientGender, caseData.patientAge, normalRanges]);

  const getResultData = (testId: string): TestResult => {
    return results.get(testId) || { testId, result: '', flag: null, normalRange: '', isCritical: false };
  };

  const hasCriticalResults = useMemo(() => Array.from(results.values()).some(r => r.isCritical), [results]);
  const completedCount = useMemo(() => Array.from(results.values()).filter(r => r.result.trim()).length, [results]);

  // Group tests: by tube, then within each tube show profile groups and singles
  const tubeGroups = useMemo(() => {
    const groups = new Map<string, { sampleType: string; tests: CaseTest[] }>();
    (caseData.tests || []).forEach(test => {
      const tubeId = test.tubeId || 'unassigned';
      const existing = groups.get(tubeId) || { sampleType: test.sampleType, tests: [] };
      existing.tests.push(test);
      groups.set(tubeId, existing);
    });
    return groups;
  }, [caseData.tests]);

  // Within a tube, group by profile
  const renderTestsInTube = (tests: CaseTest[]) => {
    const profileGroups = new Map<string, { name: string; tests: CaseTest[] }>();
    const singles: CaseTest[] = [];

    tests.forEach(t => {
      if (t.profileId && t.profileName) {
        const existing = profileGroups.get(t.profileId) || { name: t.profileName, tests: [] };
        existing.tests.push(t);
        profileGroups.set(t.profileId, existing);
      } else {
        singles.push(t);
      }
    });

    return (
      <>
        {Array.from(profileGroups.entries()).map(([profileId, { name, tests: profileTests }]) => (
          <div key={profileId}>
            <div className="flex items-center gap-2 py-1 px-2 bg-primary/5 rounded-sm">
              <Badge className="bg-primary/15 text-primary border-0 text-[10px] h-4 px-1.5">Profile</Badge>
              <span className="text-xs font-semibold text-primary">{name}</span>
            </div>
            {profileTests.map(test => renderTestRow(test))}
          </div>
        ))}
        {singles.map(test => renderTestRow(test))}
      </>
    );
  };

  const renderTestRow = (test: CaseTest) => {
    const resultData = getResultData(test.testId);
    const isCritical = resultData.isCritical;
    const isAbnormal = resultData.flag === 'abnormal' && !isCritical;

    return (
      <div
        key={test.testId}
        className={cn(
          'grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] gap-2 items-center px-2 py-1.5 rounded-sm transition-colors',
          isCritical && 'bg-destructive/8 border-l-2 border-destructive',
          isAbnormal && 'bg-orange-500/5 border-l-2 border-orange-400',
          !isCritical && !isAbnormal && 'hover:bg-muted/50 border-l-2 border-transparent'
        )}
      >
        {/* Test name + code */}
        <div className="flex items-center gap-2 min-w-0">
          {getFlagIcon(resultData.flag)}
          <span className="text-sm font-medium truncate">{test.testName}</span>
          <span className="text-[10px] font-mono text-muted-foreground shrink-0">{test.testCode}</span>
        </div>

        {/* Result input */}
        <div className="flex items-center gap-1">
          <Input
            value={resultData.result}
            onChange={(e) => updateResult(test.testId, e.target.value)}
            placeholder="—"
            className={cn(
              'font-mono h-7 text-sm px-2',
              isCritical && 'border-destructive focus-visible:ring-destructive'
            )}
            disabled={mode === 'validation' && test.status === 'validated'}
          />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap w-10 text-right">{test.unit}</span>
        </div>

        {/* Reference range */}
        <span className="text-[11px] text-muted-foreground truncate">
          {resultData.normalRange || '—'}
        </span>

        {/* Flag badge */}
        <div className="w-16 flex justify-end">
          {getFlagBadge(resultData.flag)}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const updatedTests = (caseData.tests || []).map(test => {
      const resultData = getResultData(test.testId);
      if (mode === 'validation') {
        return {
          ...test,
          result: resultData.result,
          flag: resultData.flag,
          normalRange: resultData.normalRange,
          status: resultData.result ? 'validated' as const : test.status,
          validatedBy: resultData.result ? (validatorName || 'System') : test.validatedBy,
          validatedAt: resultData.result ? now : test.validatedAt,
          validationNotes: validationNotes || test.validationNotes,
        };
      } else {
        return {
          ...test,
          result: resultData.result,
          flag: resultData.flag,
          normalRange: resultData.normalRange,
          status: resultData.result ? 'completed' as const : test.status,
          enteredBy: resultData.result ? 'Lab Tech' : test.enteredBy,
          enteredAt: resultData.result ? now : test.enteredAt,
        };
      }
    });

    onSave(updatedTests);
    toast.success(mode === 'validation' ? 'Results validated & saved' : 'Results saved');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            {mode === 'validation' ? 'Verify & Validate Results' : 'Enter Results'} - {caseData.caseNumber}
          </DialogTitle>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{caseData.patientName}</span>
            <span>•</span>
            <span>{caseData.patientAge}y / {caseData.patientGender}</span>
            <span>•</span>
            <span>{completedCount}/{(caseData.tests || []).length} entered</span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-4">
            {/* Validation mode: compact summary */}
            {mode === 'validation' && (
              <div className="flex items-center gap-4 px-2 py-2 bg-muted/50 rounded-md text-sm">
                <span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Summary</span>
                <span className="flex items-center gap-1">{getFlagIcon('normal')} {Array.from(results.values()).filter(r => r.flag === 'normal').length}</span>
                <span className="flex items-center gap-1">{getFlagIcon('abnormal')} {Array.from(results.values()).filter(r => r.flag === 'abnormal').length}</span>
                <span className="flex items-center gap-1">{getFlagIcon('critical')} {Array.from(results.values()).filter(r => r.isCritical).length}</span>
              </div>
            )}

            {/* Column headers */}
            <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] gap-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              <span>Test</span>
              <span>Result</span>
              <span>Reference</span>
              <span className="w-16 text-right">Flag</span>
            </div>

            {/* Tests grouped by tube */}
            {Array.from(tubeGroups.entries()).map(([tubeId, { sampleType, tests }]) => (
              <div key={tubeId} className="space-y-0.5">
                <div className="flex items-center gap-2 px-2 py-1 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                  <Badge variant="outline" className="font-mono text-[10px] h-4 px-1.5">{tubeId}</Badge>
                  <span className="text-xs text-muted-foreground">{sampleType}</span>
                </div>
                {renderTestsInTube(tests)}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Validation fields */}
        {mode === 'validation' && (
          <div className="px-6 py-3 border-t bg-muted/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Validated By</Label>
                <Input value={validatorName} onChange={(e) => setValidatorName(e.target.value)} placeholder="Pathologist name" className="mt-1 h-8" />
              </div>
              <div>
                <Label className="text-sm">Notes</Label>
                <Input value={validationNotes} onChange={(e) => setValidationNotes(e.target.value)} placeholder="Optional notes" className="mt-1 h-8" />
              </div>
            </div>
          </div>
        )}

        {hasCriticalResults && (
          <div className="mx-6 mb-3 p-2 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">Critical values detected - notify physician immediately</span>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {mode === 'validation' ? (
              <><CheckCircle2 className="h-4 w-4 mr-1" /> Validate & Save</>
            ) : (
              <><Save className="h-4 w-4 mr-1" /> Save Results</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getFlagIcon(flag: ResultFlag) {
  switch (flag) {
    case 'normal': return <CheckCircle2 className="h-4 w-4 text-status-completed" />;
    case 'abnormal': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'critical': return <AlertCircle className="h-4 w-4 text-destructive" />;
    default: return null;
  }
}

function getFlagBadge(flag: ResultFlag) {
  switch (flag) {
    case 'normal': return <Badge className="bg-status-completed/20 text-status-completed border-0 text-[10px] h-5 px-1.5">N</Badge>;
    case 'abnormal': return <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border-0 text-[10px] h-5 px-1.5">Abn</Badge>;
    case 'critical': return <Badge className="bg-destructive/20 text-destructive border-0 text-[10px] h-5 px-1.5">Crit</Badge>;
    default: return null;
  }
}
