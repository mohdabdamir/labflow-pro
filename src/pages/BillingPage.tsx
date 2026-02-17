import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search, Filter, DollarSign, FileText, TrendingUp, AlertCircle,
  CheckCircle2, MoreHorizontal, Eye, Ban, ArrowUpCircle, Clock,
  Receipt, BarChart3, Download, Building2, Settings2,
} from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import { useCases, useClients } from '@/hooks/useLabData';
import { B2BInvoiceDialog, PrefixConfigDialog } from '@/components/billing';
import type { Invoice, InvoiceStatus, BillingTransaction } from '@/types/billing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: <FileText className="h-3 w-3" /> },
  under_review: { label: 'Under Review', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', icon: <Clock className="h-3 w-3" /> },
  verified: { label: 'Verified', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300', icon: <CheckCircle2 className="h-3 w-3" /> },
  sent: { label: 'Sent', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300', icon: <ArrowUpCircle className="h-3 w-3" /> },
  paid: { label: 'Paid', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', icon: <DollarSign className="h-3 w-3" /> },
  overdue: { label: 'Overdue', color: 'bg-red-500/15 text-red-700 dark:text-red-300', icon: <AlertCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground line-through', icon: <Ban className="h-3 w-3" /> },
};

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = statusConfig[status];
  return (
    <Badge variant="outline" className={cn('text-xs gap-1 border-0', cfg.color)}>
      {cfg.icon} {cfg.label}
    </Badge>
  );
}

export default function BillingPage() {
  const {
    invoices, transactions, auditLog, billingStats,
    updateInvoiceStatus, cancelInvoice, getTransactionsForInvoice,
    prefixConfigs, consolidatedCaseIds, createConsolidatedInvoice, savePrefixConfig,
  } = useBilling();

  const { cases } = useCases();
  const { clients } = useClients();
  const b2bClients = useMemo(() => clients.filter(c => c.type === 'B2B' && c.isActive), [clients]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'B2C' | 'B2B'>('all');

  // Detail dialog
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Cancel dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelInvoiceId, setCancelInvoiceId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Status change dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusInvoiceId, setStatusInvoiceId] = useState('');
  const [newStatus, setNewStatus] = useState<InvoiceStatus>('verified');
  const [statusRemarks, setStatusRemarks] = useState('');

  // B2B dialogs
  const [b2bDialogOpen, setB2BDialogOpen] = useState(false);
  const [prefixDialogOpen, setPrefixDialogOpen] = useState(false);
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q) ||
        inv.caseNumber.toLowerCase().includes(q) ||
        (inv.patientName || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchType = typeFilter === 'all' || inv.clientType === typeFilter;
      return matchSearch && matchStatus && matchType;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, searchQuery, statusFilter, typeFilter]);

  const handleOpenDetail = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setDetailOpen(true);
  };

  const handleCancelInvoice = () => {
    if (!cancelReason.trim()) { toast.error('Cancellation reason is required'); return; }
    cancelInvoice(cancelInvoiceId, cancelReason);
    setCancelDialogOpen(false);
    setCancelReason('');
    toast.success('Invoice cancelled');
  };

  const handleStatusChange = () => {
    updateInvoiceStatus(statusInvoiceId, newStatus, 'System', statusRemarks || undefined);
    setStatusDialogOpen(false);
    setStatusRemarks('');
    toast.success(`Invoice status updated to ${statusConfig[newStatus].label}`);
  };

  const openCancelDialog = (id: string) => {
    setCancelInvoiceId(id);
    setCancelDialogOpen(true);
  };

  const openStatusDialog = (id: string, status: InvoiceStatus) => {
    setStatusInvoiceId(id);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const exportToCSV = () => {
    const headers = ['Invoice #', 'Client', 'Patient', 'Case #', 'Type', 'Gross', 'Discount', 'VAT', 'Total', 'Paid', 'Status', 'Date'];
    const rows = filteredInvoices.map(i => [
      i.invoiceNumber, i.clientName, i.patientName || '', i.caseNumber, i.clientType,
      i.grossAmount.toFixed(2), i.discountAmount.toFixed(2), i.vatAmount.toFixed(2),
      i.totalAmount.toFixed(2), i.paidAmount.toFixed(2), i.status, i.createdAt,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const handleB2BGenerate = (params: {
    clientId: string;
    caseIds: string[];
    periodStart: string;
    periodEnd: string;
    remarks?: string;
  }) => {
    const client = b2bClients.find(c => c.id === params.clientId);
    if (!client) return;
    const selectedCases = cases.filter(c => params.caseIds.includes(c.id));
    if (selectedCases.length === 0) return;

    createConsolidatedInvoice({
      clientId: params.clientId,
      clientName: client.name,
      casesData: selectedCases,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      remarks: params.remarks,
    });
    toast.success(`Consolidated invoice created for ${client.name} with ${selectedCases.length} case(s)`);
  };

  const selectedTransactions = selectedInvoice
    ? getTransactionsForInvoice(selectedInvoice.id)
    : [];

  return (
    <MainLayout title="Billing & Invoicing">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Invoices', value: billingStats.totalInvoices, icon: <Receipt className="h-4 w-4" />, color: 'text-foreground' },
            { label: 'Revenue', value: formatCurrency(billingStats.totalRevenue), icon: <TrendingUp className="h-4 w-4" />, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Paid', value: formatCurrency(billingStats.totalPaid), icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Outstanding', value: formatCurrency(billingStats.totalOutstanding), icon: <AlertCircle className="h-4 w-4" />, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Total VAT', value: formatCurrency(billingStats.totalVat), icon: <BarChart3 className="h-4 w-4" />, color: 'text-purple-600 dark:text-purple-400' },
            { label: 'Discounts', value: formatCurrency(billingStats.totalDiscount), icon: <DollarSign className="h-4 w-4" />, color: 'text-destructive' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1 text-muted-foreground">{s.icon}<p className="text-xs">{s.label}</p></div>
                <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status breakdown */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(billingStats.byStatus).map(([status, count]) => (
            <Badge key={status} variant="outline" className="text-xs cursor-pointer hover:bg-muted"
              onClick={() => setStatusFilter(status as InvoiceStatus)}>
              {statusConfig[status as InvoiceStatus]?.label}: {count}
            </Badge>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoice #, client, patient, case..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | 'all')}>
              <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="B2C">B2C</SelectItem>
                <SelectItem value="B2B">B2B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPrefixDialogOpen(true)}>
              <Settings2 className="h-4 w-4 mr-2" /> Prefixes
            </Button>
            <Button variant="outline" onClick={() => setB2BDialogOpen(true)}>
              <Building2 className="h-4 w-4 mr-2" /> B2B Invoice
            </Button>
            <Button variant="outline" onClick={exportToCSV}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
          </div>
        </div>

        {/* Invoice Grid */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[130px]">Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Case #</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">VAT</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map(inv => (
                    <TableRow key={inv.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleOpenDetail(inv)}>
                      <TableCell className="font-mono text-sm font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>
                        <div>
                          <span className="text-sm font-medium">{inv.clientName}</span>
                          <Badge variant="outline" className={cn('ml-1 text-[10px]', inv.clientType === 'B2C' ? 'border-orange-300 text-orange-600' : 'border-blue-300 text-blue-600')}>{inv.clientType}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{inv.patientName || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{inv.caseNumber}</TableCell>
                      <TableCell className="text-right text-sm">{inv.grossAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-sm text-destructive">{inv.discountAmount > 0 ? `-${inv.discountAmount.toFixed(2)}` : '—'}</TableCell>
                      <TableCell className="text-right text-sm">{inv.vatAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{inv.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-sm">
                        <span className={cn(inv.paidAmount >= inv.totalAmount ? 'text-emerald-600' : inv.paidAmount > 0 ? 'text-amber-600' : 'text-destructive')}>
                          {inv.paidAmount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell><InvoiceStatusBadge status={inv.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDetail(inv)}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                            {inv.status === 'draft' && (
                              <DropdownMenuItem onClick={() => openStatusDialog(inv.id, 'under_review')}><Clock className="h-4 w-4 mr-2" /> Submit for Review</DropdownMenuItem>
                            )}
                            {inv.status === 'under_review' && (
                              <DropdownMenuItem onClick={() => openStatusDialog(inv.id, 'verified')}><CheckCircle2 className="h-4 w-4 mr-2" /> Verify</DropdownMenuItem>
                            )}
                            {inv.status === 'verified' && (
                              <DropdownMenuItem onClick={() => openStatusDialog(inv.id, 'sent')}><ArrowUpCircle className="h-4 w-4 mr-2" /> Mark as Sent</DropdownMenuItem>
                            )}
                            {(inv.status === 'sent' || inv.status === 'overdue') && (
                              <DropdownMenuItem onClick={() => openStatusDialog(inv.id, 'paid')}><DollarSign className="h-4 w-4 mr-2" /> Mark as Paid</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                              <DropdownMenuItem className="text-destructive" onClick={() => openCancelDialog(inv.id)}>
                                <Ban className="h-4 w-4 mr-2" /> Cancel Invoice
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <TableRow><TableCell colSpan={12} className="text-center py-12 text-muted-foreground">
                      <Receipt className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No invoices found. Invoices are automatically created when cases are registered.
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-3">
              <Receipt className="h-5 w-5" />
              {selectedInvoice?.invoiceNumber}
              {selectedInvoice && <InvoiceStatusBadge status={selectedInvoice.status} />}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-6">
                {/* Header info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-xs text-muted-foreground">Client</p><p className="font-medium text-sm">{selectedInvoice.clientName}</p></div>
                  <div><p className="text-xs text-muted-foreground">Patient</p><p className="font-medium text-sm">{selectedInvoice.patientName || '—'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Case</p><p className="font-mono text-sm">{selectedInvoice.caseNumber}</p></div>
                  <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm">{formatDate(selectedInvoice.createdAt)}</p></div>
                </div>

                <Separator />

                {/* Line items */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Line Items</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Test</TableHead>
                          <TableHead className="text-xs text-right">Price</TableHead>
                          <TableHead className="text-xs text-right">Disc%</TableHead>
                          <TableHead className="text-xs text-right">Insured</TableHead>
                          <TableHead className="text-xs text-right">Patient</TableHead>
                          <TableHead className="text-xs text-right">Insurance</TableHead>
                          <TableHead className="text-xs text-right">P.VAT</TableHead>
                          <TableHead className="text-xs text-right">I.VAT</TableHead>
                          <TableHead className="text-xs text-right">P.Total</TableHead>
                          <TableHead className="text-xs text-right">I.Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.lineItems.map((li, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs"><span className="font-mono mr-1">{li.testCode}</span>{li.testName}</TableCell>
                            <TableCell className="text-xs text-right">{li.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-right">{li.discountPercent > 0 ? `${li.discountPercent}%` : '—'}</TableCell>
                            <TableCell className="text-xs text-right">{li.insured ? '✓' : '—'}</TableCell>
                            <TableCell className="text-xs text-right">{li.patientAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-right">{li.insuranceAmount > 0 ? li.insuranceAmount.toFixed(2) : '—'}</TableCell>
                            <TableCell className="text-xs text-right">{li.patientVat.toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-right">{li.insuranceVat > 0 ? li.insuranceVat.toFixed(2) : '—'}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{li.patientTotal.toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{li.insuranceTotal > 0 ? li.insuranceTotal.toFixed(2) : '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Financial summary */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-muted-foreground text-xs">Gross</p><p className="font-semibold">{selectedInvoice.currency} {selectedInvoice.grossAmount.toFixed(2)}</p></div>
                      <div><p className="text-muted-foreground text-xs">Discount</p><p className="font-semibold text-destructive">-{selectedInvoice.discountAmount.toFixed(2)}</p></div>
                      <div><p className="text-muted-foreground text-xs">VAT ({selectedInvoice.vatPercent}%)</p><p className="font-semibold">{selectedInvoice.vatAmount.toFixed(2)}</p></div>
                      <div><p className="text-muted-foreground text-xs">Total</p><p className="font-bold text-lg">{selectedInvoice.currency} {selectedInvoice.totalAmount.toFixed(2)}</p></div>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><p className="text-muted-foreground text-xs">Patient Portion</p><p className="font-semibold">{selectedInvoice.patientTotal.toFixed(2)}</p></div>
                      <div><p className="text-muted-foreground text-xs">Insurance Portion</p><p className="font-semibold">{selectedInvoice.insuranceTotal.toFixed(2)}</p></div>
                      <div><p className="text-muted-foreground text-xs">Paid</p><p className={cn('font-semibold', selectedInvoice.paidAmount >= selectedInvoice.patientTotal ? 'text-emerald-600' : 'text-amber-600')}>{selectedInvoice.paidAmount.toFixed(2)}</p></div>
                    </div>
                    {selectedInvoice.discountComment && (
                      <p className="text-xs text-muted-foreground mt-3 italic">Discount reason: {selectedInvoice.discountComment}</p>
                    )}
                    {selectedInvoice.paymentEntries && selectedInvoice.paymentEntries.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">Payment Methods:</p>
                        <div className="flex gap-2">
                          {selectedInvoice.paymentEntries.map((pe, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{pe.method}: {pe.amount.toFixed(2)}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Transaction history / Audit trail */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Transaction History</h4>
                  {selectedTransactions.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTransactions.map(txn => (
                        <Card key={txn.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium">{txn.description}</p>
                                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                  <span>Type: {txn.transactionType.replace(/_/g, ' ')}</span>
                                  <span>By: {txn.createdBy}</span>
                                  <span>{formatDate(txn.createdAt)}</span>
                                </div>
                                {txn.reason && <p className="text-xs mt-1 italic">Reason: {txn.reason}</p>}
                              </div>
                              <div className="text-right">
                                <p className={cn('text-sm font-semibold', txn.netAdjustment >= 0 ? 'text-emerald-600' : 'text-destructive')}>
                                  {txn.netAdjustment >= 0 ? '+' : ''}{txn.netAdjustment.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">VAT: {txn.vatAmount.toFixed(2)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No transactions recorded.</p>
                  )}
                </div>

                {/* Verification info */}
                {selectedInvoice.verifiedBy && (
                  <div className="text-xs text-muted-foreground">
                    Verified by {selectedInvoice.verifiedBy} on {formatDate(selectedInvoice.verifiedAt || '')}
                    {selectedInvoice.verificationRemarks && <span> — {selectedInvoice.verificationRemarks}</span>}
                  </div>
                )}
                {selectedInvoice.cancellationReason && (
                  <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                    Cancellation reason: {selectedInvoice.cancellationReason}
                  </div>
                )}

                {/* Version */}
                <p className="text-xs text-muted-foreground">Version: {selectedInvoice.version} | ID: {selectedInvoice.id}</p>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Invoice</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Invoices cannot be deleted. Please provide a reason for cancellation.</p>
            <div>
              <Label>Cancellation Reason *</Label>
              <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Enter reason for cancellation..." className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Back</Button>
            <Button variant="destructive" onClick={handleCancelInvoice}>Cancel Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Invoice Status</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">Moving invoice to: <InvoiceStatusBadge status={newStatus} /></p>
            <div>
              <Label>Remarks (optional)</Label>
              <Textarea value={statusRemarks} onChange={(e) => setStatusRemarks(e.target.value)} placeholder="Add verification remarks..." className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* B2B Invoice Dialog */}
      <B2BInvoiceDialog
        open={b2bDialogOpen}
        onOpenChange={setB2BDialogOpen}
        b2bClients={b2bClients}
        cases={cases}
        existingInvoiceCaseIds={consolidatedCaseIds}
        prefixConfigs={prefixConfigs}
        onGenerateInvoice={handleB2BGenerate}
      />

      {/* Prefix Config Dialog */}
      <PrefixConfigDialog
        open={prefixDialogOpen}
        onOpenChange={setPrefixDialogOpen}
        b2bClients={b2bClients}
        prefixConfigs={prefixConfigs}
        onSaveConfig={savePrefixConfig}
      />
    </MainLayout>
  );
}
