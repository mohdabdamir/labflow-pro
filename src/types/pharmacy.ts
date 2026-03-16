// ============================================================
// Pharmacy Module — Type Definitions
// Enterprise-grade Pharmacy Management System
// ============================================================

export type PharmacyQueueStatus =
  | 'waiting'
  | 'called'
  | 'processing'
  | 'ready_for_collection'
  | 'dispensed'
  | 'cancelled'
  | 'no_show';

export type PrescriptionActionType =
  | 'new'           // Blue — New Rx from CPOE/HL7
  | 'clinical_review' // Orange — Clinical review required
  | 'counseling'    // Purple — Patient counseling required
  | 'clarification' // Red — Doctor clarification needed
  | 'refill'        // Teal — Refill request
  | 'urgent';       // Dark Red — STAT / Urgent

export type PrescriptionStatus =
  | 'received'
  | 'clinical_review'
  | 'verification'
  | 'dispensing'
  | 'ready'
  | 'dispensed'
  | 'cancelled'
  | 'on_hold';

export type DrugInteractionSeverity = 'contraindicated' | 'significant' | 'moderate' | 'minor';
export type DrugInteractionType = 'drug_drug' | 'drug_allergy' | 'drug_food' | 'drug_condition';

export type InventoryLocation = 'main_shelf' | 'robot' | 'fridge' | 'controlled' | 'floor_stock' | 'returns';
export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired' | 'recalled';

export type RobotStatus = 'online' | 'offline' | 'busy' | 'error' | 'maintenance';
export type HL7MessageType = 'ADT' | 'ORM' | 'ORU' | 'DFT' | 'ACK' | 'MWL';
export type DicomConnectionStatus = 'connected' | 'disconnected' | 'error' | 'testing';

// ─────────────────────────────────────────────
// Patient & Queue
// ─────────────────────────────────────────────

export interface PharmacyPatient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  email?: string;
  insurance?: string;
  insuranceId?: string;
  allergies: AllergyRecord[];
  conditions: string[];
  recentVisits?: string[];
}

export interface AllergyRecord {
  id: string;
  allergen: string;
  type: 'drug' | 'food' | 'environmental';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  reaction: string;
  onsetDate?: string;
}

export interface QueueTicket {
  id: string;
  ticketNumber: string;
  qrCode: string;
  patientId: string;
  patient: PharmacyPatient;
  counter?: number;
  status: PharmacyQueueStatus;
  priority: 'normal' | 'urgent' | 'elderly_disabled' | 'pediatric';
  prescriptionIds: string[];
  issuedAt: string;
  calledAt?: string;
  processingStartedAt?: string;
  readyAt?: string;
  collectedAt?: string;
  estimatedWait: number; // minutes
  source: 'kiosk' | 'staff' | 'hl7' | 'portal';
}

// ─────────────────────────────────────────────
// Prescription & Dispensing
// ─────────────────────────────────────────────

export interface Prescription {
  id: string;
  rxNumber: string;
  patientId: string;
  patient: PharmacyPatient;
  prescriberId: string;
  prescriberName: string;
  prescriberDept: string;
  prescriberPhone?: string;
  facility?: string;
  receivedAt: string;
  source: 'cpoe' | 'hl7' | 'paper' | 'fax' | 'portal' | 'telepharmacy';
  status: PrescriptionStatus;
  actionType: PrescriptionActionType;
  items: PrescriptionItem[];
  clinicalNotes?: string;
  pharmacistNotes?: string;
  counselingRequired: boolean;
  highRiskFlag: boolean;
  hl7MessageId?: string;
  totalCost: number;
  insuranceCovered: number;
  patientCopay: number;
  dispensingHistory: DispensingEvent[];
  interactions: DrugInteraction[];
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  drugId: string;
  drugName: string;
  genericName: string;
  ndc: string;
  strength: string;
  dosageForm: string;
  quantity: number;
  daysSupply: number;
  directions: string;
  refillsAllowed: number;
  refillsRemaining: number;
  lot?: string;
  expiry?: string;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'verified' | 'dispensed' | 'on_hold' | 'cancelled';
  dispensedQuantity?: number;
  dispensedAt?: string;
  dispensedBy?: string;
  verifiedBy?: string;
  inventoryItemId?: string;
}

export interface DispensingEvent {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  lot?: string;
  expiry?: string;
}

export interface DrugInteraction {
  id: string;
  type: DrugInteractionType;
  severity: DrugInteractionSeverity;
  drug1: string;
  drug2: string;
  description: string;
  clinicalSignificance: string;
  managementRecommendation: string;
  overridable: boolean;
  overriddenBy?: string;
  overriddenAt?: string;
  overrideReason?: string;
}

// ─────────────────────────────────────────────
// Inventory
// ─────────────────────────────────────────────

export interface DrugMaster {
  id: string;
  ndc: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  therapeuticClass: string;
  deaSchedule?: string; // II, III, IV, V, OTC
  requiresRefrigeration: boolean;
  isHighRisk: boolean;
  isControlled: boolean;
  b2cPrice: number;
  b2bPrice: number;
  clientPrices?: Record<string, number>;
  reorderPoint: number;
  reorderQuantity: number;
  formularyStatus: 'formulary' | 'non_formulary' | 'restricted';
  activeIngredients: string[];
  contraindications?: string[];
  labMonitoring?: string[];
}

export interface InventoryItem {
  id: string;
  drugId: string;
  drug: DrugMaster;
  lot: string;
  expiry: string;
  location: InventoryLocation;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unitCost: number;
  receivedDate: string;
  supplierName: string;
  poNumber?: string;
  status: InventoryStatus;
  isRobotManaged: boolean;
  robotBin?: string;
  lastCountDate?: string;
  lastCountBy?: string;
  expiryAlertDays: number; // 30/60/90 day alerts
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  drugName: string;
  type: 'receive' | 'dispense' | 'adjust' | 'return' | 'waste' | 'transfer' | 'count';
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string; // Rx number, PO number, etc.
  performedBy: string;
  performedAt: string;
  notes?: string;
  lot?: string;
  reason?: string;
}

export interface ReorderAlert {
  id: string;
  drugId: string;
  drugName: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  estimatedDaysRemaining: number;
  lastOrderDate?: string;
  supplierId: string;
  supplierName: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  createdAt: string;
}

// ─────────────────────────────────────────────
// Robot Integration
// ─────────────────────────────────────────────

export interface RobotSystem {
  id: string;
  name: string;
  vendor: 'bd_rowa' | 'swisslog' | 'omnicell' | 'pyxis' | 'other';
  model: string;
  ipAddress: string;
  port: number;
  status: RobotStatus;
  lastHeartbeat?: string;
  currentOperation?: string;
  queuedCommands: number;
  totalBins: number;
  occupiedBins: number;
  errorMessage?: string;
  firmware?: string;
}

export interface RobotCommand {
  id: string;
  robotId: string;
  type: 'dispense' | 'restock' | 'inventory_check' | 'bin_lookup' | 'emergency_stop';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  drugId?: string;
  quantity?: number;
  binId?: string;
  requestedAt: string;
  completedAt?: string;
  errorMessage?: string;
  prescriptionId?: string;
}

// ─────────────────────────────────────────────
// HL7 & Integrations
// ─────────────────────────────────────────────

export interface HL7Connection {
  id: string;
  name: string;
  description: string;
  type: 'incoming' | 'outgoing' | 'bidirectional';
  protocol: 'MLLP' | 'HTTP' | 'HTTPS' | 'FILE';
  host: string;
  port: number;
  messageTypes: HL7MessageType[];
  status: DicomConnectionStatus;
  lastActivity?: string;
  messagesProcessed: number;
  messagesErrored: number;
  latencyMs?: number;
  hl7Version: '2.3' | '2.4' | '2.5' | '2.6' | '2.7';
  sendingApplication?: string;
  sendingFacility?: string;
  receivingApplication?: string;
  receivingFacility?: string;
}

export interface HL7MessageLog {
  id: string;
  connectionId: string;
  connectionName: string;
  messageType: HL7MessageType;
  direction: 'in' | 'out';
  status: 'processed' | 'error' | 'pending' | 'acked';
  messageId: string;
  patientId?: string;
  patientName?: string;
  rawMessage?: string;
  errorDetails?: string;
  processedAt: string;
  latencyMs?: number;
}

// ─────────────────────────────────────────────
// Clinical Decision Support
// ─────────────────────────────────────────────

export interface DoseCheckResult {
  drugId: string;
  drugName: string;
  prescribedDose: string;
  prescribedFrequency: string;
  recommendedRange: string;
  status: 'within_range' | 'below_range' | 'above_range' | 'contraindicated';
  adjustmentNote?: string;
  patientFactor?: string; // renal, hepatic, pediatric, geriatric
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  testCode: string;
  value: string;
  unit: string;
  normalRange: string;
  flag: 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';
  collectedAt: string;
  reportedAt: string;
  relevantDrugs?: string[];
}

// ─────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────

export interface PharmacyMetrics {
  date: string;
  prescriptionsFilled: number;
  avgWaitTime: number; // minutes
  peakHour: number;
  interventions: number;
  interactions_caught: number;
  revenue: number;
  robotDispenses: number;
  counselingSessions: number;
  nearMisses: number;
}

// ─────────────────────────────────────────────
// Staff & Counters
// ─────────────────────────────────────────────

export interface PharmacyCounter {
  id: number;
  name: string;
  type: 'dispensing' | 'counseling' | 'pick_up' | 'consultation';
  staffId?: string;
  staffName?: string;
  isOpen: boolean;
  currentTicketId?: string;
  currentPatientName?: string;
}
