import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Save, CheckCircle2, AlertTriangle, AlertCircle, 
  FlaskConical, ArrowRight, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNormalRanges } from '@/hooks/useLabData';
import { evaluateResult } from '@/lib/resultEvaluator';
import type { Case, CaseTest, ResultFlag, Department } from '@/types/lab';
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

  // Group tests by department
  const testsByDepartment = useMemo(() => {
    const grouped: Record<string, CaseTest[]> = {};
    caseData.tests.forEach(test => {
      const dept = test.department;
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(test);
    });
    return grouped;
  }, [caseData.tests]);

  const departments = Object.keys(testsByDepartment);

  // Track result edits
  const [results, setResults] = useState<Map<string, TestResult>>(() => {
    const initial = new Map<string, TestResult>();
    caseData.tests.forEach(test => {
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

  const updateResult = (testId: string, value: string) => {
    const test = caseData.tests.find(t => t.testId === testId);
    if (!test) return;

    // Evaluate the result against normal ranges
    const evaluation = evaluateResult(
      value,
      testId,
      caseData.patientGender,
      caseData.patientAge,
      normalRanges
    );

    setResults(prev => {
      const updated = new Map(prev);
      updated.set(testId, {
        testId,
        result: value,
        flag: evaluation.flag,
        normalRange: evaluation.normalRange,
        isCritical: evaluation.isCritical,
      });
      return updated;
    });
  };

  const getResultData = (testId: string): TestResult => {
    return results.get(testId) || {
      testId,
      result: '',
      flag: null,
      normalRange: '',
      isCritical: false,
    };
  };

  const hasCriticalResults = useMemo(() => {
    return Array.from(results.values()).some(r => r.isCritical);
  }, [results]);

  const completedCount = useMemo(() => {
    return Array.from(results.values()).filter(r => r.result.trim()).length;
  }, [results]);

  const handleSave = () => {
    const now = new Date().toISOString();
    const updatedTests = caseData.tests.map(test => {
      const resultData = getResultData(test.testId);
      
      if (mode === 'validation') {
        // Validation mode - mark as validated
        return {
          ...test,
          result: resultData.result,
          flag: resultData.flag,
          normalRange: resultData.normalRange,
          status: resultData.result ? 'validated' as const : test.status,
          validatedBy: resultData.result ? validatorName || 'System' : test.validatedBy,
          validatedAt: resultData.result ? now : test.validatedAt,
          validationNotes: validationNotes || test.validationNotes,
        };
      } else {
        // Entry mode - mark as completed
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
    toast.success(mode === 'validation' ? 'Results validated' : 'Results saved');
    onClose();
  };

  const getFlagIcon = (flag: ResultFlag) => {
    switch (flag) {
      case 'normal':
        return <CheckCircle2 className="h-4 w-4 text-status-completed" />;
      case 'abnormal':
        return <AlertTriangle className="h-4 w-4 text-status-in-process" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getFlagBadge = (flag: ResultFlag) => {
    switch (flag) {
      case 'normal':
        return <Badge className="bg-status-completed/20 text-status-completed border-0">Normal</Badge>;
      case 'abnormal':
        return <Badge className="bg-status-in-process/20 text-status-in-process border-0">Abnormal</Badge>;
      case 'critical':
        return <Badge className="bg-destructive/20 text-destructive border-0">Critical</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            {mode === 'validation' ? 'Validate Results' : 'Enter Results'} - {caseData.caseNumber}
          </DialogTitle>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{caseData.patientName}</span>
            <span>•</span>
            <span>{caseData.patientAge}y / {caseData.patientGender}</span>
            <span>•</span>
            <span>{completedCount}/{caseData.tests.length} completed</span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue={departments[0]} className="h-full flex flex-col">
            <div className="px-6 pt-2 border-b">
              <TabsList className="h-auto flex-wrap">
                {departments.map(dept => (
                  <TabsTrigger key={dept} value={dept} className="text-xs">
                    {dept}
                    <Badge variant="secondary" className="ml-1.5 text-xs">
                      {testsByDepartment[dept].length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              {departments.map(dept => (
                <TabsContent key={dept} value={dept} className="m-0 p-6">
                  <div className="space-y-4">
                    {testsByDepartment[dept].map(test => {
                      const resultData = getResultData(test.testId);
                      return (
                        <Card
                          key={test.testId}
                          className={cn(
                            'transition-all',
                            resultData.isCritical && 'border-destructive bg-destructive/5',
                            resultData.flag === 'abnormal' && !resultData.isCritical && 'border-status-in-process/50'
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="grid grid-cols-12 gap-4 items-center">
                              {/* Test Info */}
                              <div className="col-span-4">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {test.testCode}
                                  </Badge>
                                  {getFlagIcon(resultData.flag)}
                                </div>
                                <p className="font-medium mt-1">{test.testName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {test.sampleType}
                                </p>
                              </div>

                              {/* Result Input */}
                              <div className="col-span-3">
                                <Label className="text-xs text-muted-foreground">Result</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Input
                                    value={resultData.result}
                                    onChange={(e) => updateResult(test.testId, e.target.value)}
                                    placeholder="Enter value"
                                    className={cn(
                                      'font-mono',
                                      resultData.isCritical && 'border-destructive focus-visible:ring-destructive'
                                    )}
                                    disabled={mode === 'validation' && test.status === 'validated'}
                                  />
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {test.unit}
                                  </span>
                                </div>
                              </div>

                              {/* Normal Range */}
                              <div className="col-span-3">
                                <Label className="text-xs text-muted-foreground">Normal Range</Label>
                                <p className="mt-1 text-sm font-medium">
                                  {resultData.normalRange || 'N/A'}
                                  {test.unit && ` ${test.unit}`}
                                </p>
                              </div>

                              {/* Flag */}
                              <div className="col-span-2 flex justify-end">
                                {getFlagBadge(resultData.flag)}
                              </div>
                            </div>

                            {/* Critical Alert */}
                            {resultData.isCritical && (
                              <div className="mt-3 p-2 bg-destructive/10 rounded-lg flex items-center gap-2 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span>Critical value - Immediate notification required</span>
                              </div>
                            )}

                            {/* Previous result / validation info */}
                            {test.validatedBy && (
                              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Validated by {test.validatedBy}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </div>

        {/* Validation fields (only in validation mode) */}
        {mode === 'validation' && (
          <div className="px-6 py-4 border-t bg-muted/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validatorName">Validated By</Label>
                <Input
                  id="validatorName"
                  value={validatorName}
                  onChange={(e) => setValidatorName(e.target.value)}
                  placeholder="Pathologist name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="validationNotes">Notes</Label>
                <Input
                  id="validationNotes"
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Optional validation notes"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Critical Results Warning */}
        {hasCriticalResults && (
          <div className="mx-6 mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              This case contains critical values. Please notify the physician immediately.
            </span>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'validation' ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Validate & Save
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Results
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
