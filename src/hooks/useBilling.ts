import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  BillingTransaction, Invoice, InvoiceStatus, InvoiceLineItem, 
  BillingAuditEntry, Currency 
} from '@/types/billing';
import type { Case, CaseTest } from '@/types/lab';

// Generic localStorage hook
function useLocalStorage<T>(key: string, initialData: T[]): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
  const [data, setData] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialData;
    } catch {
      return initialData;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  }, [key, data]);

  return [data, setData];
}

// Invoice number generator
function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${sequence.toString().padStart(5, '0')}`;
}

// Build line items from case tests
function buildLineItems(tests: CaseTest[], vatPercent: number): InvoiceLineItem[] {
  return tests.map(t => {
    const discPct = t.discountPercent || 0;
    const discAmt = t.price * discPct / 100;
    const net = t.price - discAmt;
    const insured = t.insured || false;
    const insPct = t.insuranceDiscountPercent || 0;
    const copay = t.copayPercent || 20;

    let patientAmt: number, insAmt: number;
    if (insured) {
      const afterIns = net * (1 - insPct / 100);
      patientAmt = afterIns * copay / 100;
      insAmt = afterIns - patientAmt;
    } else {
      patientAmt = net;
      insAmt = 0;
    }

    const pVat = patientAmt * vatPercent / 100;
    const iVat = insAmt * vatPercent / 100;

    return {
      testId: t.testId,
      testCode: t.testCode,
      testName: t.testName,
      quantity: 1,
      unitPrice: t.price,
      discountPercent: discPct,
      discountAmount: discAmt,
      insured,
      insuranceDiscountPercent: insPct,
      copayPercent: copay,
      patientAmount: patientAmt,
      insuranceAmount: insAmt,
      vatPercent,
      patientVat: pVat,
      insuranceVat: iVat,
      patientTotal: patientAmt + pVat,
      insuranceTotal: insAmt + iVat,
    };
  });
}

export function useBilling() {
  const [transactions, setTransactions] = useLocalStorage<BillingTransaction>('lis_billing_transactions', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice>('lis_invoices', []);
  const [auditLog, setAuditLog] = useLocalStorage<BillingAuditEntry>('lis_billing_audit', []);
  const [invoiceSequence, setInvoiceSequence] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('lis_invoice_seq');
      return stored ? parseInt(stored) : 1;
    } catch { return 1; }
  });

  useEffect(() => {
    localStorage.setItem('lis_invoice_seq', invoiceSequence.toString());
  }, [invoiceSequence]);

  const genId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

  // Add audit entry
  const addAudit = useCallback((entry: Omit<BillingAuditEntry, 'id' | 'timestamp'>) => {
    setAuditLog(prev => [...prev, { ...entry, id: genId('AUD'), timestamp: new Date().toISOString() }]);
  }, [setAuditLog]);

  // Create invoice + transaction from case creation (B2C)
  const createInvoiceFromCase = useCallback((caseData: Case, createdBy: string = 'System'): Invoice => {
    const seq = invoiceSequence;
    const invoiceNumber = generateInvoiceNumber(seq);
    setInvoiceSequence(prev => prev + 1);

    const now = new Date().toISOString();
    const invoiceId = genId('INV');
    const txnId = genId('TXN');

    const lineItems = buildLineItems(caseData.tests, caseData.vatPercent);
    const grossAmount = caseData.subtotal;
    const discountAmount = caseData.discountAmount;
    const vatAmount = caseData.vatAmount;
    const totalAmount = caseData.totalAmount;

    const transaction: BillingTransaction = {
      id: txnId,
      invoiceId,
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      patientName: caseData.patientName,
      patientId: caseData.patientId,
      clientId: caseData.clientId,
      clientName: caseData.clientName,
      clientType: caseData.paymentRequired ? 'B2C' : 'B2B',
      transactionType: 'case_creation',
      description: `Initial case registration with ${caseData.tests.length} test(s)`,
      previousAmount: 0,
      newAmount: totalAmount,
      netAdjustment: totalAmount,
      vatPercent: caseData.vatPercent,
      vatAmount,
      totalWithVat: totalAmount,
      paymentMethod: caseData.paymentEntries?.map(p => p.method).join(', '),
      paymentStatus: caseData.paymentStatus,
      createdBy,
      createdAt: now,
    };

    const invoice: Invoice = {
      id: invoiceId,
      invoiceNumber,
      clientId: caseData.clientId,
      clientName: caseData.clientName,
      clientType: caseData.paymentRequired ? 'B2C' : 'B2B',
      patientId: caseData.patientId,
      patientName: caseData.patientName,
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      grossAmount,
      discountAmount,
      additionalAmount: 0,
      vatPercent: caseData.vatPercent,
      vatAmount,
      totalAmount,
      currency: 'SAR',
      patientTotal: caseData.patientTotal,
      insuranceTotal: caseData.insuranceTotal,
      paidAmount: caseData.paidAmount,
      paymentStatus: caseData.paymentStatus,
      paymentEntries: caseData.paymentEntries?.map(p => ({ method: p.method, amount: p.amount, reference: p.reference })),
      status: caseData.paymentRequired ? (caseData.paymentStatus === 'paid' ? 'verified' : 'draft') : 'draft',
      discountComment: caseData.discountComment,
      createdAt: now,
      createdBy,
      version: 1,
      transactionIds: [txnId],
      lineItems,
    };

    setTransactions(prev => [...prev, transaction]);
    setInvoices(prev => [...prev, invoice]);

    addAudit({
      entityType: 'invoice',
      entityId: invoiceId,
      action: 'created',
      newState: JSON.stringify({ invoiceNumber, totalAmount, status: invoice.status }),
      userId: createdBy,
      userName: createdBy,
    });

    return invoice;
  }, [invoiceSequence, setTransactions, setInvoices, addAudit, setInvoiceSequence]);

  // Create adjustment transaction (test add/remove/price edit)
  const createAdjustmentTransaction = useCallback((params: {
    invoiceId: string;
    caseData: Case;
    type: 'test_addition' | 'test_cancellation' | 'price_edit' | 'discount_applied' | 'refund';
    description: string;
    previousAmount: number;
    newAmount: number;
    reason?: string;
    testId?: string;
    testCode?: string;
    testName?: string;
    createdBy?: string;
  }) => {
    const { invoiceId, caseData, type, description, previousAmount, newAmount, reason, testId, testCode, testName, createdBy = 'System' } = params;
    const now = new Date().toISOString();
    const txnId = genId('TXN');
    const netAdj = newAmount - previousAmount;
    const vatAmt = Math.abs(netAdj) * caseData.vatPercent / 100;

    const transaction: BillingTransaction = {
      id: txnId,
      invoiceId,
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      patientName: caseData.patientName,
      patientId: caseData.patientId,
      clientId: caseData.clientId,
      clientName: caseData.clientName,
      clientType: caseData.paymentRequired ? 'B2C' : 'B2B',
      transactionType: type,
      description,
      previousAmount,
      newAmount,
      netAdjustment: netAdj,
      vatPercent: caseData.vatPercent,
      vatAmount: vatAmt,
      totalWithVat: netAdj + (netAdj > 0 ? vatAmt : -vatAmt),
      paymentStatus: 'pending',
      createdBy,
      createdAt: now,
      reason,
      testId,
      testCode,
      testName,
    };

    setTransactions(prev => [...prev, transaction]);

    // Update invoice with new transaction and recalculate
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newLineItems = buildLineItems(caseData.tests, caseData.vatPercent);
      const gross = caseData.subtotal;
      const disc = caseData.discountAmount;
      const vat = caseData.vatAmount;
      const total = caseData.totalAmount;

      return {
        ...inv,
        grossAmount: gross,
        discountAmount: disc,
        vatAmount: vat,
        totalAmount: total,
        patientTotal: caseData.patientTotal,
        insuranceTotal: caseData.insuranceTotal,
        lineItems: newLineItems,
        transactionIds: [...inv.transactionIds, txnId],
        version: inv.version + 1,
        updatedAt: now,
        status: 'draft' as InvoiceStatus,
      };
    }));

    addAudit({
      entityType: 'transaction',
      entityId: txnId,
      action: type,
      previousState: JSON.stringify({ amount: previousAmount }),
      newState: JSON.stringify({ amount: newAmount, reason }),
      userId: createdBy,
      userName: createdBy,
    });

    return txnId;
  }, [setTransactions, setInvoices, addAudit]);

  // Update invoice status
  const updateInvoiceStatus = useCallback((invoiceId: string, newStatus: InvoiceStatus, userId: string = 'System', remarks?: string) => {
    const now = new Date().toISOString();
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const updates: Partial<Invoice> = { status: newStatus, updatedAt: now };
      if (newStatus === 'verified') { updates.verifiedBy = userId; updates.verifiedAt = now; }
      if (remarks) updates.verificationRemarks = remarks;
      if (newStatus === 'paid') updates.paymentStatus = 'paid';
      return { ...inv, ...updates };
    }));

    addAudit({
      entityType: 'invoice',
      entityId: invoiceId,
      action: `status_changed_to_${newStatus}`,
      userId,
      userName: userId,
    });
  }, [setInvoices, addAudit]);

  // Cancel invoice (no deletion)
  const cancelInvoice = useCallback((invoiceId: string, reason: string, userId: string = 'System') => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      return { ...inv, status: 'cancelled' as InvoiceStatus, cancellationReason: reason, updatedAt: new Date().toISOString() };
    }));
    addAudit({
      entityType: 'invoice',
      entityId: invoiceId,
      action: 'cancelled',
      newState: JSON.stringify({ reason }),
      userId,
      userName: userId,
    });
  }, [setInvoices, addAudit]);

  // Get invoice by case
  const getInvoiceByCase = useCallback((caseId: string) => {
    return invoices.find(i => i.caseId === caseId && i.status !== 'cancelled');
  }, [invoices]);

  // Get transactions for invoice
  const getTransactionsForInvoice = useCallback((invoiceId: string) => {
    return transactions.filter(t => t.invoiceId === invoiceId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions]);

  // Summary stats
  const billingStats = useMemo(() => {
    const active = invoices.filter(i => i.status !== 'cancelled');
    const totalRevenue = active.reduce((s, i) => s + i.totalAmount, 0);
    const totalPaid = active.reduce((s, i) => s + i.paidAmount, 0);
    const totalOutstanding = totalRevenue - totalPaid;
    const totalVat = active.reduce((s, i) => s + i.vatAmount, 0);
    const totalDiscount = active.reduce((s, i) => s + i.discountAmount, 0);
    const byStatus = {
      draft: active.filter(i => i.status === 'draft').length,
      under_review: active.filter(i => i.status === 'under_review').length,
      verified: active.filter(i => i.status === 'verified').length,
      sent: active.filter(i => i.status === 'sent').length,
      paid: active.filter(i => i.status === 'paid').length,
      overdue: active.filter(i => i.status === 'overdue').length,
    };
    return { totalRevenue, totalPaid, totalOutstanding, totalVat, totalDiscount, byStatus, totalInvoices: active.length };
  }, [invoices]);

  return {
    transactions,
    invoices,
    auditLog,
    billingStats,
    createInvoiceFromCase,
    createAdjustmentTransaction,
    updateInvoiceStatus,
    cancelInvoice,
    getInvoiceByCase,
    getTransactionsForInvoice,
    setInvoices,
  };
}
