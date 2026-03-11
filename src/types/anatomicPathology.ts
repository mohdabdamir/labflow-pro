// Anatomic Pathology Module - Core Type Definitions

export type APCaseStatus =
  | 'registered'
  | 'grossing'
  | 'processing'
  | 'embedding'
  | 'sectioning'
  | 'staining'
  | 'transcription'
  | 'review'
  | 'finalized'
  | 'amended'
  | 'cancelled';

export type APReportDeliveryStatus = 'pending' | 'emailed' | 'portal_uploaded' | 'both' | 'failed';

export type APCancerType = 'benign' | 'intermediate' | 'malignant' | 'pending';

export type APSpecimenAdequacy = 'adequate' | 'inadequate' | 'limited';

export type APCaseType =
  | 'Biopsy'
  | 'Resection'
  | 'Cytology'
  | 'Autopsy'
  | 'Frozen Section'
  | 'Bone Marrow'
  | 'Fine Needle Aspiration'
  | 'Excision'
  | 'Curettage';

export type APUnitType =
  | 'pathology'
  | 'lab'
  | 'billing'
  | 'logistics'
  | 'customer_service'
  | 'reception'
  | 'management';

export type APMessageStatus = 'pending' | 'acknowledged' | 'resolved' | 'escalated';
export type APMessagePriority = 'routine' | 'urgent' | 'critical';

// ─── Specimens & Blocks ───────────────────────────────────────────────────────

export interface APBlock {
  id: string;
  blockLabel: string; // e.g. "A1", "B2"
  description?: string;
  stainingProtocol?: string;
}

export interface APAncillaryStudy {
  id: string;
  specimenIndex: number;
  blockNumber: string;
  stainName: string;
  result: string;
  interpretation?: string;
  performedAt?: string;
  performedBy?: string;
  notes?: string;
}

export interface APFrozenSection {
  id: string;
  specimenIndex: number;
  requestedAt: string;
  requestedBy?: string;
  diagnosis: string;
  communicatedTo?: string;
  communicatedAt?: string;
  notes?: string;
}

export interface APSpecimen {
  id: string;
  specimenIndex: number; // 1-based
  specimenLabel: string; // e.g. "A", "B", "C"
  specimenName: string; // e.g. "Right breast core biopsy"
  site?: string;
  laterality?: 'Left' | 'Right' | 'Bilateral' | 'Midline' | 'NA';
  containerDescription?: string;
  fixative?: string;
  adequacy?: APSpecimenAdequacy;
  deficiencies?: string;
  numberOfBlocks: number;
  blocks: APBlock[];
  // Grossing
  grossDescription?: string;
  grossedBy?: string;
  grossedAt?: string;
  // Transcription / Diagnosis
  microscopicFindings?: string;
  diagnosis?: string;
  cancerType?: APCancerType;
  // Ancillary studies
  ancillaryStudies?: APAncillaryStudy[];
  // Frozen sections
  frozenSections?: APFrozenSection[];
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export interface APBillingCode {
  id: string;
  code: string;
  description: string;
  category: string;
  b2cPrice: number;
  b2bPrice: number;
  isActive: boolean;
  notes?: string;
}

export interface APClientPrice {
  id: string;
  billingCodeId: string;
  clientId: string;
  clientName: string;
  customPrice: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface APCaseBillingEntry {
  id: string;
  billingCodeId: string;
  billingCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  vatPercent: number;
  vatAmount: number;
  total: number;
  insured?: boolean;
  insuranceDiscountPercent?: number;
  patientAmount?: number;
  insuranceAmount?: number;
}

// ─── Case Communication ───────────────────────────────────────────────────────

export interface APCaseMessage {
  id: string;
  caseId: string;
  fromUnit: APUnitType;
  fromUserId: string;
  fromUserName: string;
  toUnit: APUnitType;
  subject: string;
  body: string;
  priority: APMessagePriority;
  status: APMessageStatus;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  attachments?: string[];
  parentMessageId?: string; // for threading
  replies?: APCaseMessage[];
}

// ─── Main AP Case ─────────────────────────────────────────────────────────────

export interface APCase {
  id: string;
  caseNumber: string;
  // Client
  clientId: string;
  clientName: string;
  clientType: 'B2C' | 'B2B';
  treatingPhysician: string;
  referringPhysician?: string;
  ccPhysicians?: string[];
  // Patient
  patientId: string;
  patientName: string;
  patientDob?: string;
  patientAge?: number;
  patientGender: 'M' | 'F' | 'Unknown';
  patientMobile?: string;
  patientEmail?: string;
  // Case details
  caseType: APCaseType;
  clinicalHistory?: string;
  clinicalIndication?: string;
  numberOfSpecimens: number;
  specimens: APSpecimen[];
  // Report
  status: APCaseStatus;
  pathologistId?: string;
  pathologistName?: string;
  technicianId?: string;
  technicianName?: string;
  pathologistComment?: string;
  // Final report
  finalDiagnosis?: string;
  overallCancerType?: APCancerType;
  reportedAt?: string;
  reportedBy?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  amendmentReason?: string;
  // Delivery
  deliveryStatus: APReportDeliveryStatus;
  emailedAt?: string;
  portalUploadedAt?: string;
  // Billing
  billingEntries: APCaseBillingEntry[];
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  // Communication
  messages: APCaseMessage[];
  unreadMessageCount?: number;
  // Timestamps
  registeredAt: string;
  grossingStartedAt?: string;
  transcriptionStartedAt?: string;
  finalizedAt?: string;
  // Flags
  priority: 'routine' | 'urgent' | 'stat';
  isCritical?: boolean;
  criticalNote?: string;
  notes?: string;
}
