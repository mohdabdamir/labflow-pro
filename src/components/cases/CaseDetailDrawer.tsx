import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Calendar, Building, Phone, Mail, 
  FileText, Beaker, FlaskConical, CheckCircle2,
  AlertTriangle, AlertCircle, DollarSign, Printer
} from 'lucide-react';
import { StatusBadge, PriorityIndicator } from '@/components/cases';
import type { Case, CaseTest } from '@/types/lab';

interface CaseDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  caseData: Case | null;
  onCollectSamples: () => void;
  onEnterResults: () => void;
  onValidateResults: () => void;
  onGenerateReport: () => void;
}

export function CaseDetailDrawer({
  open,
  onClose,
  caseData,
  onCollectSamples,
  onEnterResults,
  onValidateResults,
  onGenerateReport,
}: CaseDetailDrawerProps) {
  if (!caseData) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTestFlagIcon = (flag?: string | null) => {
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

  const pendingTests = caseData.tests.filter(t => t.status === 'pending').length;
  const completedTests = caseData.tests.filter(t => t.status === 'completed' || t.status === 'validated').length;
  const validatedTests = caseData.tests.filter(t => t.status === 'validated').length;

  const canCollectSamples = caseData.status === 'registered' && caseData.samples.length === 0;
  const canEnterResults = caseData.samples.length > 0 && pendingTests > 0;
  const canValidate = completedTests > 0 && validatedTests < caseData.tests.length;
  const canGenerateReport = validatedTests === caseData.tests.length && validatedTests > 0;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-mono">{caseData.caseNumber}</SheetTitle>
            <div className="flex items-center gap-2">
              <PriorityIndicator priority={caseData.priority} size="sm" />
              <StatusBadge status={caseData.status} size="sm" />
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Patient Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{caseData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age / Gender</span>
                  <span>{caseData.patientAge}y / {caseData.patientGender}</span>
                </div>
                {caseData.patientPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span>{caseData.patientPhone}</span>
                  </div>
                )}
                {caseData.referringDoctor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Referring Dr.</span>
                    <span>{caseData.referringDoctor}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client & Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Client & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium">{caseData.clientName}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered</span>
                  <span>{formatDate(caseData.registeredDate)}</span>
                </div>
                {caseData.collectionDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Collected</span>
                    <span>{formatDate(caseData.collectionDate)}</span>
                  </div>
                )}
                {caseData.completedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{formatDate(caseData.completedDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Samples */}
            {caseData.samples.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Beaker className="h-4 w-4" />
                    Samples ({caseData.samples.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {caseData.samples.map(sample => (
                    <div 
                      key={sample.id} 
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-sm">{sample.sampleType}</span>
                        <p className="text-xs text-muted-foreground font-mono">
                          {sample.tubeId}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {sample.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Tests ({caseData.tests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {caseData.tests.map(test => (
                  <div 
                    key={test.testId} 
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {getTestFlagIcon(test.flag)}
                      <div>
                        <span className="font-medium text-sm">{test.testName}</span>
                        <p className="text-xs text-muted-foreground">
                          {test.testCode} • {test.department}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {test.result ? (
                        <span className="font-mono text-sm">
                          {test.result} {test.unit}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-xs capitalize">
                          {test.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Billing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${caseData.subtotal.toFixed(2)}</span>
                </div>
                {caseData.discountAmount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount ({caseData.discountPercent}%)</span>
                    <span>-${caseData.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${caseData.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span>${caseData.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Balance</span>
                  <span className={caseData.totalAmount - caseData.paidAmount > 0 ? 'text-destructive' : 'text-status-completed'}>
                    ${(caseData.totalAmount - caseData.paidAmount).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <div className="flex gap-2">
            {canCollectSamples && (
              <Button onClick={onCollectSamples} className="flex-1">
                <Beaker className="h-4 w-4 mr-1" />
                Collect Samples
              </Button>
            )}
            {canEnterResults && (
              <Button onClick={onEnterResults} className="flex-1">
                <FlaskConical className="h-4 w-4 mr-1" />
                Enter Results
              </Button>
            )}
            {canValidate && (
              <Button onClick={onValidateResults} variant="secondary" className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Validate
              </Button>
            )}
            {canGenerateReport && (
              <Button onClick={onGenerateReport} variant="default" className="flex-1">
                <Printer className="h-4 w-4 mr-1" />
                Report
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
