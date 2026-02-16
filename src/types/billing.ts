// Billing Module - Type Definitions

// Transaction types for audit trail
export type TransactionType = 
  | 'case_creation'
  | 'test_addition'
  | 'test_cancellation'
  | 'price_edit'
  | 'discount_applied'
  | 'refund'
  | 'payment';

// Invoice status workflow
export type InvoiceStatus = 
  | 'draft'
  | 'under_review'
  | 'verified'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled';

// Currency type
export type Currency = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED';

// Billing transaction — every financial change creates one
export interface BillingTransaction {
  id: string;
  invoiceId: string;
  caseId: string;
  caseNumber: string;
  patientName: string;
  patientId: string;
  clientId: string;
  clientName: string;
  clientType: 'B2C' | 'B2B';
  transactionType: TransactionType;
  description: string;
  // Financial
  previousAmount: number;
  newAmount: number;
  netAdjustment: number;
  vatPercent: number;
  vatAmount: number;
  totalWithVat: number;
  // Payment
  paymentMethod?: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  // Audit
  createdBy: string;
  createdAt: string;
  reason?: string;
  // Test details (for test-level transactions)
  testId?: string;
  testCode?: string;
  testName?: string;
}

// Tax Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  // Client
  clientId: string;
  clientName: string;
  clientType: 'B2C' | 'B2B';
  // Patient (B2C)
  patientId?: string;
  patientName?: string;
  // Case
  caseId: string;
  caseNumber: string;
  // Financial
  grossAmount: number;
  discountAmount: number;
  additionalAmount: number;
  vatPercent: number;
  vatAmount: number;
  totalAmount: number;
  currency: Currency;
  // Patient/Insurance split
  patientTotal: number;
  insuranceTotal: number;
  // Payment
  paidAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentEntries?: { method: string; amount: number; reference?: string }[];
  // Status workflow
  status: InvoiceStatus;
  // Comments & remarks
  invoiceComment?: string;
  verificationRemarks?: string;
  discountComment?: string;
  cancellationReason?: string;
  // Verification
  verifiedBy?: string;
  verifiedAt?: string;
  // Dates
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  // Version tracking (no deletion, only cancellation)
  version: number;
  previousVersionId?: string;
  // Transactions
  transactionIds: string[];
  // Line items snapshot
  lineItems: InvoiceLineItem[];
}

// Line item in invoice
export interface InvoiceLineItem {
  testId: string;
  testCode: string;
  testName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  insured: boolean;
  insuranceDiscountPercent: number;
  copayPercent: number;
  patientAmount: number;
  insuranceAmount: number;
  vatPercent: number;
  patientVat: number;
  insuranceVat: number;
  patientTotal: number;
  insuranceTotal: number;
}

// Invoice number prefix config per B2B client
export interface InvoicePrefixConfig {
  id: string;
  clientId: string;
  prefix: string;
  currentSequence: number;
  year: number;
}

// Audit log entry for billing
export interface BillingAuditEntry {
  id: string;
  entityType: 'invoice' | 'transaction';
  entityId: string;
  action: string;
  previousState?: string;
  newState?: string;
  userId: string;
  userName: string;
  timestamp: string;
  ipAddress?: string;
}
