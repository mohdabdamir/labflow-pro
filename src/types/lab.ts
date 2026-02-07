// Laboratory Information System - Core Type Definitions

// Case/Sample Status
export type CaseStatus = 'received' | 'in-process' | 'completed' | 'reported';

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
export type ClientType = 'Individual' | 'Institution' | 'Insurance';

// Gender for normal ranges
export type Gender = 'Male' | 'Female' | 'All';

// Age Unit for normal ranges
export type AgeUnit = 'days' | 'months' | 'years';

// Case/Sample Record
export interface Case {
  id: string;
  caseNumber: string;
  patientName: string;
  patientId: string;
  patientAge: number;
  patientGender: Gender;
  clientId: string;
  clientName: string;
  status: CaseStatus;
  priority: 'routine' | 'urgent' | 'stat';
  collectionDate: string;
  receivedDate: string;
  completedDate?: string;
  reportedDate?: string;
  tests: CaseTest[];
  notes?: string;
}

// Test within a case
export interface CaseTest {
  testId: string;
  testCode: string;
  testName: string;
  status: 'pending' | 'processing' | 'completed';
  result?: string;
  unit?: string;
  flag?: ResultFlag;
  normalRange?: string;
  validatedBy?: string;
  validatedAt?: string;
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
