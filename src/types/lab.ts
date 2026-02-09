// Laboratory Information System - Core Type Definitions

// Case/Sample Status - now includes 'registered' for cases before sample collection
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

// Sample/Tube Record
export interface Sample {
  id: string;
  tubeId: string; // Barcode ID for interfacing
  sampleType: SampleType;
  status: SampleStatus;
  collectedAt?: string;
  collectedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
  testIds: string[]; // Tests associated with this sample
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
  referringDoctor?: string;
  clinicalNotes?: string;
  clientId: string;
  clientName: string;
  status: CaseStatus;
  priority: 'routine' | 'urgent' | 'stat';
  registeredDate: string;
  collectionDate?: string;
  receivedDate?: string;
  completedDate?: string;
  reportedDate?: string;
  tests: CaseTest[];
  samples: Sample[];
  // Track which profiles/packages were ordered
  orderedProfileIds?: string[];
  orderedPackageIds?: string[];
  // Billing
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  paymentRequired: boolean; // true for B2C (walk-in, home visit)
  notes?: string;
}

// Test within a case
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
  tubeId?: string; // Assigned tube ID
  profileId?: string; // If part of a profile
  profileName?: string; // Profile name for display
  packageId?: string; // If part of a package
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
  turnaroundTime: number; // in hours
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
  tests: string[]; // Service IDs
  price: number;
  isActive: boolean;
}

// Package (Bundled profiles/tests)
export interface Package {
  id: string;
  code: string;
  name: string;
  description?: string;
  profiles: string[]; // Profile IDs
  tests: string[]; // Individual Service IDs
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
  isActive: boolean;
  createdAt: string;
}

// Patient Record (stored separately for reuse)
export interface Patient {
  id: string;
  name: string;
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
  role: 'admin' | 'technician' | 'pathologist' | 'receptionist' | 'billing';
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
  averageTAT: number; // in hours
}
