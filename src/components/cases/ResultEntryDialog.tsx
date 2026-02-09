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
          <div key={profileId} className="space-y-2">
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-0 text-xs">Profile</Badge>
              <span className="text-sm font-semibold text-primary">{name}</span>
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
    return (
      <Card
        key={test.testId}
        className={cn(
          'transition-all',
          resultData.isCritical && 'border-destructive bg-destructive/5',
          resultData.flag === 'abnormal' && !resultData.isCritical && 'border-orange-400/50'
        )}
      >
        <CardContent className="p-3">
          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Test Info */}
            <div className="col-span-4">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] font-mono">{test.testCode}</Badge>
                {getFlagIcon(resultData.flag)}
              </div>
              <p className="font-medium text-sm mt-0.5">{test.testName}</p>
            </div>
            {/* Result Input */}
            <div className="col-span-3">
              <div className="flex items-center gap-1.5">
                <Input
                  value={resultData.result}
                  onChange={(e) => updateResult(test.testId, e.target.value)}
                  placeholder="Value"
                  className={cn('font-mono h-8 text-sm', resultData.isCritical && 'border-destructive focus-visible:ring-destructive')}
                  disabled={mode === 'validation' && test.status === 'validated'}
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">{test.unit}</span>
              </div>
            </div>
            {/* Normal Range */}
            <div className="col-span-3">
              <p className="text-xs text-muted-foreground">Ref: {resultData.normalRange || 'N/A'}{test.unit ? ` ${test.unit}` : ''}</p>
            </div>
            {/* Flag */}
            <div className="col-span-2 flex justify-end">
              {getFlagBadge(resultData.flag)}
            </div>
          </div>
          {resultData.isCritical && (
            <div className="mt-2 p-1.5 bg-destructive/10 rounded flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              Critical value - notify physician
            </div>
          )}
          {mode === 'validation' && test.validatedBy && (
            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Validated by {test.validatedBy}
            </div>
          )}
        </CardContent>
      </Card>
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

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Validation mode: summary at top */}
            {mode === 'validation' && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Results Summary</h4>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">{getFlagIcon('normal')} Normal: {Array.from(results.values()).filter(r => r.flag === 'normal').length}</span>
                    <span className="flex items-center gap-1">{getFlagIcon('abnormal')} Abnormal: {Array.from(results.values()).filter(r => r.flag === 'abnormal').length}</span>
                    <span className="flex items-center gap-1">{getFlagIcon('critical')} Critical: {Array.from(results.values()).filter(r => r.isCritical).length}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tests grouped by tube */}
            {Array.from(tubeGroups.entries()).map(([tubeId, { sampleType, tests }]) => (
              <div key={tubeId}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono text-xs">{tubeId}</Badge>
                  <span className="text-sm text-muted-foreground">{sampleType}</span>
                </div>
                <div className="space-y-2">
                  {renderTestsInTube(tests)}
                </div>
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
    case 'normal': return <Badge className="bg-status-completed/20 text-status-completed border-0 text-xs">Normal</Badge>;
    case 'abnormal': return <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border-0 text-xs">Abnormal</Badge>;
    case 'critical': return <Badge className="bg-destructive/20 text-destructive border-0 text-xs">Critical</Badge>;
    default: return null;
  }
}
