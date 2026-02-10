// Laboratory Information System - Core Type Definitions

// Case/Sample Status
export type CaseStatus = 'registered' | 'sample-collected' | 'received' | 'in-process' | 'completed' | 'reported';

// Test Result Flags
export type ResultFlag = 'normal' | 'abnormal' | 'critical' | null;

// Department Types
export type Department = 
  | 'Hematology'
  | 'Biochemistry'
  | 'Microbiology'
  | 'Immunology'
  | 'Pathology'
  | 'Urinalysis';

// Client Types
export type ClientType = 'B2C' | 'B2B';

// Gender for normal ranges
export type Gender = 'Male' | 'Female' | 'All';

// Age Unit for normal ranges
export type AgeUnit = 'days' | 'months' | 'years';

// Age input mode
export type AgeInputMode = 'dob' | 'age' | 'none';

// Sample/Tube Types
export type SampleType = 'EDTA Blood' | 'Serum' | 'Plasma' | 'Urine' | 'Stool' | 'CSF' | 'Other';

// Sample/Tube status
export type SampleStatus = 'pending' | 'collected' | 'received' | 'processing' | 'completed';

// Payment method
export type PaymentMethod = 'cash' | 'benefitpay' | 'card';

// Payment entry for multi-method payments
export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

// Physician registered under a client
export interface Physician {
  id: string;
  name: string;
  specialization?: string;
  phone?: string;
}

// Case Type (report header titles)
export interface CaseType {
  id: string;
  code: string;
  name: string;
  reportTitle: string;
  isActive: boolean;
}

// VAT Configuration
export interface VATConfig {
  id: string;
  percentage: number;
  isActive: boolean;
}

// Sample/Tube Record
export interface Sample {
  id: string;
  tubeId: string;
  sampleType: SampleType;
  status: SampleStatus;
  collectedAt?: string;
  collectedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
  testIds: string[];
  notes?: string;
}

// Case/Sample Record
export interface Case {
  id: string;
  caseNumber: string;
  patientName: string;
  patientId: string;
  patientAge: number;
  patientGender: Gender;
  patientDob?: string;
  patientPhone?: string;
  patientEmail?: string;
  patientAddress?: string;
  patientMrno?: string;
  referringDoctor?: string;
  clinicalNotes?: string;
  clientId: string;
  clientName: string;
  physicianId?: string;
  physicianName?: string;
  pathologistId?: string;
  pathologistName?: string;
  technicianId?: string;
  technicianName?: string;
  caseTypeId?: string;
  status: CaseStatus;
  priority: 'routine' | 'urgent' | 'stat';
  registeredDate: string;
  collectionDate?: string;
  receivedDate?: string;
  completedDate?: string;
  reportedDate?: string;
  tests: CaseTest[];
  samples: Sample[];
  orderedProfileIds?: string[];
  orderedPackageIds?: string[];
  // Billing
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  vatPercent: number;
  vatAmount: number;
  totalAmount: number;
  patientTotal: number;
  insuranceTotal: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  paymentRequired: boolean;
  paymentEntries?: PaymentEntry[];
  discountComment?: string;
  notes?: string;
}

// Test within a case - with per-test billing
export interface CaseTest {
  testId: string;
  testCode: string;
  testName: string;
  department: Department;
  sampleType: SampleType;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'validated';
  result?: string;
  unit?: string;
  flag?: ResultFlag;
  normalRange?: string;
  enteredBy?: string;
  enteredAt?: string;
  validatedBy?: string;
  validatedAt?: string;
  validationNotes?: string;
  tubeId?: string;
  profileId?: string;
  profileName?: string;
  packageId?: string;
  // Per-test billing
  discountPercent?: number;
  discountAmount?: number;
  insured?: boolean;
  insuranceDiscountPercent?: number;
  copayPercent?: number;
  patientAmount?: number;
  insuranceAmount?: number;
  vatPercent?: number;
  patientVat?: number;
  insuranceVat?: number;
}

// Service/Test Master
export interface Service {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  department: Department;
  unit: string;
  sampleType: string;
  turnaroundTime: number;
  price: number;
  isActive: boolean;
  analyzerCode?: string;
  reportOrder?: number;
}

// Test Profile (Panel)
export interface Profile {
  id: string;
  code: string;
  name: string;
  description?: string;
  department: Department;
  tests: string[];
  price: number;
  isActive: boolean;
}

// Package (Bundled profiles/tests)
export interface Package {
  id: string;
  code: string;
  name: string;
  description?: string;
  profiles: string[];
  tests: string[];
  price: number;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
}

// Client Record
export interface Client {
  id: string;
  code: string;
  name: string;
  type: ClientType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  priceListId?: string;
  billingTerms?: string;
  creditLimit?: number;
  physicians?: Physician[];
  isActive: boolean;
  createdAt: string;
}

// Patient Record
export interface Patient {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  name: string; // full name for display
  mrno?: string;
  gender: Gender;
  dob?: string;
  age?: number;
  ageInputMode: AgeInputMode;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

// Price List
export interface PriceList {
  id: string;
  code: string;
  name: string;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  discountPercent: number;
  isDefault: boolean;
  isActive: boolean;
}

// Price List Item
export interface PriceListItem {
  id: string;
  priceListId: string;
  serviceId?: string;
  profileId?: string;
  price: number;
}

// Normal Range
export interface NormalRange {
  id: string;
  serviceId: string;
  gender: Gender;
  ageMin?: number;
  ageMax?: number;
  ageUnit?: AgeUnit;
  normalLow: number;
  normalHigh: number;
  criticalLow?: number;
  criticalHigh?: number;
  unit: string;
}

// User for audit/validation
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'technician' | 'pathologist' | 'medical_director' | 'receptionist' | 'billing';
  department?: Department;
  isActive: boolean;
}

// Audit Log Entry
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalCasesToday: number;
  pendingCases: number;
  inProcessCases: number;
  completedCases: number;
  urgentCases: number;
  averageTAT: number;
}
