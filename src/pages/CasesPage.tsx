import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Beaker,
  FlaskConical,
  CheckCircle2,
  FileText,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCases } from '@/hooks/useLabData';
import { 
  StatusBadge, 
  PriorityIndicator, 
  CaseCreationWizard,
  SampleCollectionDialog,
  ResultEntryDialog,
  CaseDetailDrawer
} from '@/components/cases';
import { ReportPreviewDialog } from '@/components/reports';
import type { Case, CaseStatus, CaseTest, Sample } from '@/types/lab';
import { toast } from 'sonner';

export default function CasesPage() {
  const { cases, addCase, updateCase, deleteCase } = useCases();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'routine' | 'urgent' | 'stat'>('all');

  // Dialog states
  const [createWizardOpen, setCreateWizardOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [sampleCollectionOpen, setSampleCollectionOpen] = useState(false);
  const [resultEntryOpen, setResultEntryOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false);

  const filteredCases = useMemo(() => {
    return cases.filter(caseItem => {
      const matchesSearch = 
        caseItem.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || caseItem.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, searchQuery, statusFilter, priorityFilter]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      deleteCase(id);
      toast.success('Case deleted');
    }
  };

  const handleCaseCreated = (newCase: Case) => {
    addCase(newCase);
    toast.success(`Case ${newCase.caseNumber} created`);
  };

  const handleSamplesCollected = (samples: Sample[]) => {
    if (!selectedCase) return;
    
    const updatedStatus: CaseStatus = samples.length > 0 ? 'sample-collected' : selectedCase.status;
    updateCase(selectedCase.id, {
      samples,
      status: updatedStatus,
      collectionDate: new Date().toISOString(),
    });
    toast.success('Samples collected successfully');
  };

  const handleResultsSaved = (tests: CaseTest[]) => {
    if (!selectedCase) return;
    
    const allCompleted = tests.every(t => t.status === 'completed' || t.status === 'validated');
    const allValidated = tests.every(t => t.status === 'validated');
    
    let newStatus: CaseStatus = selectedCase.status;
    if (allValidated) {
      newStatus = 'completed';
    } else if (allCompleted || tests.some(t => t.result)) {
      newStatus = 'in-process';
    }

    updateCase(selectedCase.id, {
      tests,
      status: newStatus,
      ...(allCompleted ? { completedDate: new Date().toISOString() } : {}),
    });
  };

  const handleGenerateReport = () => {
    if (!selectedCase) return;
    
    // Update status to reported
    updateCase(selectedCase.id, {
      status: 'reported',
      reportedDate: new Date().toISOString(),
    });
    setReportPreviewOpen(true);
  };

  const openCaseDetail = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setDetailDrawerOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Statistics
  const stats = useMemo(() => ({
    total: cases.length,
    registered: cases.filter(c => c.status === 'registered').length,
    sampleCollected: cases.filter(c => c.status === 'sample-collected').length,
    received: cases.filter(c => c.status === 'received').length,
    inProcess: cases.filter(c => c.status === 'in-process').length,
    completed: cases.filter(c => c.status === 'completed').length,
    urgentStat: cases.filter(c => c.priority !== 'routine').length,
  }), [cases]);

  return (
    <MainLayout title="Cases / Worklist">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by case #, patient, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CaseStatus | 'all')}>
              <SelectTrigger className="w-44">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
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
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setCreateWizardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <Card className="bg-card">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Registered</p>
              <p className="text-2xl font-bold text-muted-foreground">{stats.registered}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-2xl font-bold text-purple-500">{stats.sampleCollected}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Received</p>
              <p className="text-2xl font-bold text-status-received">{stats.received}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">In Process</p>
              <p className="text-2xl font-bold text-status-in-process">{stats.inProcess}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-status-completed">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Urgent/STAT</p>
              <p className="text-2xl font-bold text-destructive">{stats.urgentStat}</p>
            </CardContent>
          </Card>
        </div>

        {/* Cases Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((caseItem) => (
                  <TableRow 
                    key={caseItem.id} 
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => openCaseDetail(caseItem)}
                  >
                    <TableCell className="font-mono text-sm font-medium">
                      {caseItem.caseNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{caseItem.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {caseItem.patientAge}y / {caseItem.patientGender}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{caseItem.clientName}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{caseItem.tests.length} tests</span>
                      {caseItem.samples.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({caseItem.samples.length} tubes)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <PriorityIndicator priority={caseItem.priority} size="sm" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={caseItem.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(caseItem.registeredDate)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openCaseDetail(caseItem)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {caseItem.status === 'registered' && caseItem.samples.length === 0 && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedCase(caseItem);
                              setSampleCollectionOpen(true);
                            }}>
                              <Beaker className="h-4 w-4 mr-2" />
                              Collect Samples
                            </DropdownMenuItem>
                          )}
                          {caseItem.samples.length > 0 && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedCase(caseItem);
                              setResultEntryOpen(true);
                            }}>
                              <FlaskConical className="h-4 w-4 mr-2" />
                              Enter Results
                            </DropdownMenuItem>
                          )}
                          {caseItem.tests.some(t => t.status === 'completed') && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedCase(caseItem);
                              setValidationOpen(true);
                            }}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Validate Results
                            </DropdownMenuItem>
                          )}
                          {caseItem.tests.every(t => t.status === 'validated') && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedCase(caseItem);
                              handleGenerateReport();
                            }}>
                              <FileText className="h-4 w-4 mr-2" />
                              Generate Report
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(caseItem.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No cases found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CaseCreationWizard
        open={createWizardOpen}
        onClose={() => setCreateWizardOpen(false)}
        onSave={handleCaseCreated}
      />

      {selectedCase && (
        <>
          <CaseDetailDrawer
            open={detailDrawerOpen}
            onClose={() => setDetailDrawerOpen(false)}
            caseData={selectedCase}
            onCollectSamples={() => {
              setDetailDrawerOpen(false);
              setSampleCollectionOpen(true);
            }}
            onEnterResults={() => {
              setDetailDrawerOpen(false);
              setResultEntryOpen(true);
            }}
            onValidateResults={() => {
              setDetailDrawerOpen(false);
              setValidationOpen(true);
            }}
            onGenerateReport={() => {
              setDetailDrawerOpen(false);
              handleGenerateReport();
            }}
          />

          <SampleCollectionDialog
            open={sampleCollectionOpen}
            onClose={() => setSampleCollectionOpen(false)}
            caseData={selectedCase}
            onSave={handleSamplesCollected}
          />

          <ResultEntryDialog
            open={resultEntryOpen}
            onClose={() => setResultEntryOpen(false)}
            caseData={selectedCase}
            onSave={handleResultsSaved}
            mode="entry"
          />

          <ResultEntryDialog
            open={validationOpen}
            onClose={() => setValidationOpen(false)}
            caseData={selectedCase}
            onSave={handleResultsSaved}
            mode="validation"
          />

          <ReportPreviewDialog
            open={reportPreviewOpen}
            onClose={() => setReportPreviewOpen(false)}
            caseData={selectedCase}
          />
        </>
      )}
    </MainLayout>
  );
}
