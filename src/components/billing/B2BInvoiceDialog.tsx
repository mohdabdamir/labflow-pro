import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2, Calendar, FileText, Search, CheckCircle2, AlertCircle,
} from 'lucide-react';
import type { Client, Case } from '@/types/lab';
import type { InvoicePrefixConfig } from '@/types/billing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface B2BInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  b2bClients: Client[];
  cases: Case[];
  existingInvoiceCaseIds: Set<string>;
  prefixConfigs: InvoicePrefixConfig[];
  onGenerateInvoice: (params: {
    clientId: string;
    caseIds: string[];
    periodStart: string;
    periodEnd: string;
    remarks?: string;
  }) => void;
}

type Step = 'select_client' | 'select_period' | 'review_cases' | 'confirm';

export function B2BInvoiceDialog({
  open, onOpenChange, b2bClients, cases, existingInvoiceCaseIds,
  prefixConfigs, onGenerateInvoice,
}: B2BInvoiceDialogProps) {
  const [step, setStep] = useState<Step>('select_client');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());
  const [remarks, setRemarks] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedClient = b2bClients.find(c => c.id === selectedClientId);
  const clientPrefix = prefixConfigs.find(p => p.clientId === selectedClientId);

  // Filter cases for selected client within date range that don't already have a consolidated invoice
  const eligibleCases = useMemo(() => {
    if (!selectedClientId || !periodStart || !periodEnd) return [];
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    end.setHours(23, 59, 59, 999);

    return cases.filter(c => {
      if (c.clientId !== selectedClientId) return false;
      const regDate = new Date(c.registeredDate);
      if (regDate < start || regDate > end) return false;
      // Exclude cases already in a consolidated invoice
      if (existingInvoiceCaseIds.has(c.id)) return false;
      return true;
    });
  }, [selectedClientId, periodStart, periodEnd, cases, existingInvoiceCaseIds]);

  const filteredCases = useMemo(() => {
    if (!searchQuery) return eligibleCases;
    const q = searchQuery.toLowerCase();
    return eligibleCases.filter(c =>
      c.caseNumber.toLowerCase().includes(q) ||
      c.patientName.toLowerCase().includes(q)
    );
  }, [eligibleCases, searchQuery]);

  const toggleCase = (caseId: string) => {
    setSelectedCaseIds(prev => {
      const next = new Set(prev);
      if (next.has(caseId)) next.delete(caseId);
      else next.add(caseId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedCaseIds.size === eligibleCases.length) {
      setSelectedCaseIds(new Set());
    } else {
      setSelectedCaseIds(new Set(eligibleCases.map(c => c.id)));
    }
  };

  const selectedCasesData = useMemo(() => {
    return eligibleCases.filter(c => selectedCaseIds.has(c.id));
  }, [eligibleCases, selectedCaseIds]);

  const totals = useMemo(() => {
    return selectedCasesData.reduce((acc, c) => ({
      gross: acc.gross + c.subtotal,
      discount: acc.discount + c.discountAmount,
      vat: acc.vat + c.vatAmount,
      total: acc.total + c.totalAmount,
      cases: acc.cases + 1,
      tests: acc.tests + c.tests.length,
    }), { gross: 0, discount: 0, vat: 0, total: 0, cases: 0, tests: 0 });
  }, [selectedCasesData]);

  const handleNext = () => {
    if (step === 'select_client') {
      if (!selectedClientId) { toast.error('Please select a client'); return; }
      setStep('select_period');
    } else if (step === 'select_period') {
      if (!periodStart || !periodEnd) { toast.error('Please select both start and end dates'); return; }
      if (new Date(periodStart) > new Date(periodEnd)) { toast.error('Start date must be before end date'); return; }
      // Auto-select all eligible cases
      setSelectedCaseIds(new Set(eligibleCases.map(c => c.id)));
      setStep('review_cases');
    } else if (step === 'review_cases') {
      if (selectedCaseIds.size === 0) { toast.error('Please select at least one case'); return; }
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'select_period') setStep('select_client');
    else if (step === 'review_cases') setStep('select_period');
    else if (step === 'confirm') setStep('review_cases');
  };

  const handleGenerate = () => {
    onGenerateInvoice({
      clientId: selectedClientId,
      caseIds: Array.from(selectedCaseIds),
      periodStart,
      periodEnd,
      remarks: remarks || undefined,
    });
    resetAndClose();
  };

  const resetAndClose = useCallback(() => {
    setStep('select_client');
    setSelectedClientId('');
    setPeriodStart('');
    setPeriodEnd('');
    setSelectedCaseIds(new Set());
    setRemarks('');
    setSearchQuery('');
    onOpenChange(false);
  }, [onOpenChange]);

  const stepLabels: Record<Step, string> = {
    select_client: 'Select Client',
    select_period: 'Billing Period',
    review_cases: 'Review Cases',
    confirm: 'Confirm & Generate',
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetAndClose(); else onOpenChange(o); }}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <Building2 className="h-5 w-5" />
            Generate B2B Consolidated Invoice
          </DialogTitle>
          {/* Step indicator */}
          <div className="flex gap-2 mt-3">
            {(['select_client', 'select_period', 'review_cases', 'confirm'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  step === s ? 'bg-primary text-primary-foreground' :
                  (['select_client', 'select_period', 'review_cases', 'confirm'].indexOf(step) > i)
                    ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}>{i + 1}</div>
                <span className={cn('text-xs', step === s ? 'font-medium' : 'text-muted-foreground')}>
                  {stepLabels[s]}
                </span>
                {i < 3 && <Separator className="w-4" />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          {/* Step 1: Select Client */}
          {step === 'select_client' && (
            <div className="space-y-4">
              <Label>Select B2B Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a B2B client..." />
                </SelectTrigger>
                <SelectContent>
                  {b2bClients.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                        <span>{c.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClient && (
                <Card>
                  <CardContent className="pt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground text-xs">Client</span><p className="font-medium">{selectedClient.name}</p></div>
                      <div><span className="text-muted-foreground text-xs">Code</span><p className="font-mono">{selectedClient.code}</p></div>
                      <div><span className="text-muted-foreground text-xs">Email</span><p>{selectedClient.email || '—'}</p></div>
                      <div><span className="text-muted-foreground text-xs">Credit Limit</span><p>SAR {(selectedClient.creditLimit || 0).toLocaleString()}</p></div>
                    </div>
                    {clientPrefix && (
                      <div className="pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Invoice Prefix: </span>
                        <Badge variant="outline" className="font-mono">{clientPrefix.prefix}-{new Date().getFullYear()}-{String(clientPrefix.currentSequence).padStart(4, '0')}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Select Period */}
          {step === 'select_period' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the billing period for <span className="font-medium text-foreground">{selectedClient?.name}</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Period Start</Label>
                  <Input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Period End</Label>
                  <Input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="mt-1" />
                </div>
              </div>
              {/* Quick presets */}
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground self-center">Quick:</span>
                {[
                  { label: 'This Month', fn: () => {
                    const now = new Date();
                    setPeriodStart(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`);
                    setPeriodEnd(now.toISOString().split('T')[0]);
                  }},
                  { label: 'Last Month', fn: () => {
                    const now = new Date();
                    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const last = new Date(now.getFullYear(), now.getMonth(), 0);
                    setPeriodStart(prev.toISOString().split('T')[0]);
                    setPeriodEnd(last.toISOString().split('T')[0]);
                  }},
                  { label: 'Last 90 Days', fn: () => {
                    const now = new Date();
                    const past = new Date(now.getTime() - 90 * 86400000);
                    setPeriodStart(past.toISOString().split('T')[0]);
                    setPeriodEnd(now.toISOString().split('T')[0]);
                  }},
                ].map(p => (
                  <Button key={p.label} variant="outline" size="sm" className="text-xs" onClick={p.fn}>{p.label}</Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review Cases */}
          {step === 'review_cases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found <span className="font-medium text-foreground">{eligibleCases.length}</span> unbilled case(s)
                  for <span className="font-medium text-foreground">{selectedClient?.name}</span>
                  <span className="mx-1">•</span>
                  <span className="font-mono text-xs">{periodStart} → {periodEnd}</span>
                </p>
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs" />
                </div>
              </div>

              {eligibleCases.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No unbilled cases found for this client and period.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox
                              checked={selectedCaseIds.size === eligibleCases.length && eligibleCases.length > 0}
                              onCheckedChange={toggleAll}
                            />
                          </TableHead>
                          <TableHead className="text-xs">Case #</TableHead>
                          <TableHead className="text-xs">Patient</TableHead>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Tests</TableHead>
                          <TableHead className="text-xs text-right">Subtotal</TableHead>
                          <TableHead className="text-xs text-right">Discount</TableHead>
                          <TableHead className="text-xs text-right">VAT</TableHead>
                          <TableHead className="text-xs text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCases.map(c => (
                          <TableRow key={c.id} className={cn('cursor-pointer', selectedCaseIds.has(c.id) && 'bg-primary/5')}>
                            <TableCell>
                              <Checkbox checked={selectedCaseIds.has(c.id)} onCheckedChange={() => toggleCase(c.id)} />
                            </TableCell>
                            <TableCell className="font-mono text-xs">{c.caseNumber}</TableCell>
                            <TableCell className="text-sm">{c.patientName}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(c.registeredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </TableCell>
                            <TableCell className="text-xs">{c.tests.length}</TableCell>
                            <TableCell className="text-xs text-right">{c.subtotal.toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-right text-destructive">
                              {c.discountAmount > 0 ? `-${c.discountAmount.toFixed(2)}` : '—'}
                            </TableCell>
                            <TableCell className="text-xs text-right">{c.vatAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{c.totalAmount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Selection summary */}
                  <Card>
                    <CardContent className="pt-3 pb-3">
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center text-sm">
                        <div><p className="text-xs text-muted-foreground">Cases</p><p className="font-bold">{totals.cases}</p></div>
                        <div><p className="text-xs text-muted-foreground">Tests</p><p className="font-bold">{totals.tests}</p></div>
                        <div><p className="text-xs text-muted-foreground">Gross</p><p className="font-semibold">{totals.gross.toFixed(2)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Discount</p><p className="font-semibold text-destructive">{totals.discount.toFixed(2)}</p></div>
                        <div><p className="text-xs text-muted-foreground">VAT</p><p className="font-semibold">{totals.vat.toFixed(2)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold text-lg">{totals.total.toFixed(2)}</p></div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground text-xs">Client</span><p className="font-medium">{selectedClient?.name}</p></div>
                    <div><span className="text-muted-foreground text-xs">Period</span><p className="font-mono text-xs">{periodStart} → {periodEnd}</p></div>
                    <div><span className="text-muted-foreground text-xs">Cases Included</span><p className="font-bold">{totals.cases}</p></div>
                    <div><span className="text-muted-foreground text-xs">Total Tests</span><p className="font-bold">{totals.tests}</p></div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-muted-foreground text-xs">Gross</span><p className="font-semibold">SAR {totals.gross.toFixed(2)}</p></div>
                    <div><span className="text-muted-foreground text-xs">Discount</span><p className="font-semibold text-destructive">-{totals.discount.toFixed(2)}</p></div>
                    <div><span className="text-muted-foreground text-xs">VAT</span><p className="font-semibold">{totals.vat.toFixed(2)}</p></div>
                    <div><span className="text-muted-foreground text-xs">Total</span><p className="font-bold text-lg">SAR {totals.total.toFixed(2)}</p></div>
                  </div>
                  {clientPrefix && (
                    <div className="pt-2 border-t">
                      <span className="text-xs text-muted-foreground">Invoice Number: </span>
                      <Badge variant="outline" className="font-mono">
                        {clientPrefix.prefix}-{new Date().getFullYear()}-{String(clientPrefix.currentSequence).padStart(4, '0')}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <Label>Invoice Remarks (optional)</Label>
                <Textarea value={remarks} onChange={e => setRemarks(e.target.value)}
                  placeholder="Add remarks for this consolidated invoice..."
                  className="mt-1" />
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  A consolidated B2B invoice will be generated. Individual case transactions are preserved for audit.
                  The invoice will be created in <span className="font-medium text-foreground">Draft</span> status.
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={step === 'select_client' ? resetAndClose : handleBack}>
            {step === 'select_client' ? 'Cancel' : 'Back'}
          </Button>
          {step === 'confirm' ? (
            <Button onClick={handleGenerate}>
              <FileText className="h-4 w-4 mr-2" /> Generate Invoice
            </Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
