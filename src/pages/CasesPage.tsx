import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { 
  Plus, Search, Filter, MoreHorizontal, Eye, Beaker,
  FlaskConical, CheckCircle2, FileText, Trash2
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCases } from '@/hooks/useLabData';
import { useBilling } from '@/hooks/useBilling';
import { 
  StatusBadge, PriorityIndicator, CaseCreationWizard,
  SampleCollectionDialog, ResultEntryDialog, CaseDetailDrawer
} from '@/components/cases';
import { ReportPreviewDialog } from '@/components/reports';
import type { Case, CaseStatus, CaseTest, Sample } from '@/types/lab';
import { toast } from 'sonner';

export default function CasesPage() {
  const { cases, addCase, updateCase, deleteCase } = useCases();
  const { createInvoiceFromCase } = useBilling();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'routine' | 'urgent' | 'stat'>('all');

  const [createWizardOpen, setCreateWizardOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [sampleCollectionOpen, setSampleCollectionOpen] = useState(false);
  const [resultEntryOpen, setResultEntryOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false);

  const normalizedCases = useMemo(() => {
    return cases.map(c => ({ ...c, tests: c.tests || [], samples: c.samples || [] }));
  }, [cases]);

  const filteredCases = useMemo(() => {
    return normalizedCases.filter(c => {
      const matchesSearch =
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [normalizedCases, searchQuery, statusFilter, priorityFilter]);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this case?')) { deleteCase(id); toast.success('Case deleted'); }
  };

  const handleCaseCreated = (newCase: Case) => {
    addCase(newCase);
    // Auto-generate tax invoice for B2C, or record for B2B
    const invoice = createInvoiceFromCase(newCase);
    toast.success(`Case ${newCase.caseNumber} created — Invoice ${invoice.invoiceNumber} generated`);
  };

  const handleSamplesCollected = (samples: Sample[]) => {
    if (!selectedCase) return;
    const anyCollected = samples.some(s => s.status === 'collected');
    updateCase(selectedCase.id, {
      samples,
      status: anyCollected ? 'sample-collected' : selectedCase.status,
      collectionDate: anyCollected ? new Date().toISOString() : selectedCase.collectionDate,
    });
    // Refresh selectedCase
    setSelectedCase(prev => prev ? { ...prev, samples, status: anyCollected ? 'sample-collected' : prev.status } : null);
    toast.success('Samples updated');
  };

  const handleResultsSaved = (tests: CaseTest[]) => {
    if (!selectedCase) return;
    const allCompleted = tests.every(t => t.status === 'completed' || t.status === 'validated');
    const allValidated = tests.every(t => t.status === 'validated');
    let newStatus: CaseStatus = selectedCase.status;
    if (allValidated) newStatus = 'completed';
    else if (allCompleted || tests.some(t => t.result)) newStatus = 'in-process';

    updateCase(selectedCase.id, { tests, status: newStatus, ...(allCompleted ? { completedDate: new Date().toISOString() } : {}) });
    setSelectedCase(prev => prev ? { ...prev, tests, status: newStatus } : null);
  };

  const handleGenerateReport = () => {
    if (!selectedCase) return;
    updateCase(selectedCase.id, { status: 'reported', reportedDate: new Date().toISOString() });
    setSelectedCase(prev => prev ? { ...prev, status: 'reported' } : null);
    setReportPreviewOpen(true);
  };

  const openCaseDetail = (c: Case) => { setSelectedCase(c); setDetailDrawerOpen(true); };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const stats = useMemo(() => ({
    total: normalizedCases.length,
    registered: normalizedCases.filter(c => c.status === 'registered').length,
    sampleCollected: normalizedCases.filter(c => c.status === 'sample-collected').length,
    received: normalizedCases.filter(c => c.status === 'received').length,
    inProcess: normalizedCases.filter(c => c.status === 'in-process').length,
    completed: normalizedCases.filter(c => c.status === 'completed').length,
    urgentStat: normalizedCases.filter(c => c.priority !== 'routine').length,
  }), [normalizedCases]);

  return (
    <MainLayout title="Cases / Worklist">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by case #, patient, client..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CaseStatus | 'all')}>
              <SelectTrigger className="w-44"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="sample-collected">Sample Collected</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="in-process">In Process</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setCreateWizardOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Case</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Total', value: stats.total, color: '' },
            { label: 'Registered', value: stats.registered, color: 'text-muted-foreground' },
            { label: 'Collected', value: stats.sampleCollected, color: 'text-purple-500' },
            { label: 'Received', value: stats.received, color: 'text-status-received' },
            { label: 'In Process', value: stats.inProcess, color: 'text-status-in-process' },
            { label: 'Completed', value: stats.completed, color: 'text-status-completed' },
            { label: 'Urgent/STAT', value: stats.urgentStat, color: 'text-destructive' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></CardContent></Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead><TableHead>Patient</TableHead><TableHead>Client</TableHead>
                  <TableHead>Tests</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead>
                  <TableHead>Date</TableHead><TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map(c => (
                  <TableRow key={c.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => openCaseDetail(c)}>
                    <TableCell className="font-mono text-sm font-medium">{c.caseNumber}</TableCell>
                    <TableCell><p className="font-medium">{c.patientName}</p><p className="text-xs text-muted-foreground">{c.patientAge}y / {c.patientGender}</p></TableCell>
                    <TableCell className="text-sm">{c.clientName}</TableCell>
                    <TableCell><span className="text-sm font-medium">{c.tests.length} tests</span>{c.samples.length > 0 && <span className="text-xs text-muted-foreground ml-1">({c.samples.length} tubes)</span>}</TableCell>
                    <TableCell><PriorityIndicator priority={c.priority} size="sm" /></TableCell>
                    <TableCell><StatusBadge status={c.status} size="sm" /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(c.registeredDate)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openCaseDetail(c)}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedCase(c); setSampleCollectionOpen(true); }}><Beaker className="h-4 w-4 mr-2" /> Collect Samples</DropdownMenuItem>
                          {c.samples.some(s => s.status === 'collected') && (
                            <DropdownMenuItem onClick={() => { setSelectedCase(c); setResultEntryOpen(true); }}><FlaskConical className="h-4 w-4 mr-2" /> Enter Results</DropdownMenuItem>
                          )}
                          {c.tests.some(t => t.status === 'completed') && (
                            <DropdownMenuItem onClick={() => { setSelectedCase(c); setValidationOpen(true); }}><CheckCircle2 className="h-4 w-4 mr-2" /> Validate Results</DropdownMenuItem>
                          )}
                          {c.tests.length > 0 && c.tests.every(t => t.status === 'validated') && (
                            <DropdownMenuItem onClick={() => { setSelectedCase(c); handleGenerateReport(); }}><FileText className="h-4 w-4 mr-2" /> Generate Report</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCases.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No cases found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CaseCreationWizard open={createWizardOpen} onClose={() => setCreateWizardOpen(false)} onSave={handleCaseCreated} />

      {selectedCase && (
        <>
          <CaseDetailDrawer
            open={detailDrawerOpen}
            onClose={() => setDetailDrawerOpen(false)}
            caseData={selectedCase}
            onCollectSamples={() => { setDetailDrawerOpen(false); setSampleCollectionOpen(true); }}
            onEnterResults={() => { setDetailDrawerOpen(false); setResultEntryOpen(true); }}
            onValidateResults={() => { setDetailDrawerOpen(false); setValidationOpen(true); }}
            onGenerateReport={() => { setDetailDrawerOpen(false); handleGenerateReport(); }}
          />
          <SampleCollectionDialog open={sampleCollectionOpen} onClose={() => setSampleCollectionOpen(false)} caseData={selectedCase} onSave={handleSamplesCollected} />
          <ResultEntryDialog open={resultEntryOpen} onClose={() => setResultEntryOpen(false)} caseData={selectedCase} onSave={handleResultsSaved} mode="entry" />
          <ResultEntryDialog open={validationOpen} onClose={() => setValidationOpen(false)} caseData={selectedCase} onSave={handleResultsSaved} mode="validation" />
          <ReportPreviewDialog open={reportPreviewOpen} onClose={() => setReportPreviewOpen(false)} caseData={selectedCase} />
        </>
      )}
    </MainLayout>
  );
}
