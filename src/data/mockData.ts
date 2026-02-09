// Laboratory Information System - Mock Data

import type { 
  Case, 
  Service, 
  Profile, 
  Client, 
  NormalRange,
  Package,
  PriceList,
  User,
  Sample
} from '@/types/lab';

// Mock Users
export const mockUsers: User[] = [
  { id: 'U001', username: 'admin', fullName: 'Dr. Admin User', role: 'admin', isActive: true },
  { id: 'U002', username: 'tech1', fullName: 'John Smith', role: 'technician', department: 'Hematology', isActive: true },
  { id: 'U003', username: 'path1', fullName: 'Dr. Sarah Johnson', role: 'pathologist', isActive: true },
  { id: 'U004', username: 'recep1', fullName: 'Mary Williams', role: 'receptionist', isActive: true },
];

// Mock Services (Tests)
export const mockServices: Service[] = [
  { id: 'S001', code: 'CBC', name: 'Complete Blood Count', department: 'Hematology', unit: '', sampleType: 'EDTA Blood', turnaroundTime: 2, price: 150, isActive: true, reportOrder: 1 },
  { id: 'S002', code: 'HGB', name: 'Hemoglobin', department: 'Hematology', unit: 'g/dL', sampleType: 'EDTA Blood', turnaroundTime: 1, price: 50, isActive: true, reportOrder: 2 },
  { id: 'S003', code: 'WBC', name: 'White Blood Cell Count', department: 'Hematology', unit: 'x10³/µL', sampleType: 'EDTA Blood', turnaroundTime: 1, price: 50, isActive: true, reportOrder: 3 },
  { id: 'S004', code: 'PLT', name: 'Platelet Count', department: 'Hematology', unit: 'x10³/µL', sampleType: 'EDTA Blood', turnaroundTime: 1, price: 50, isActive: true, reportOrder: 4 },
  { id: 'S005', code: 'RBC', name: 'Red Blood Cell Count', department: 'Hematology', unit: 'x10⁶/µL', sampleType: 'EDTA Blood', turnaroundTime: 1, price: 50, isActive: true, reportOrder: 5 },
  { id: 'S006', code: 'HCT', name: 'Hematocrit', department: 'Hematology', unit: '%', sampleType: 'EDTA Blood', turnaroundTime: 1, price: 40, isActive: true, reportOrder: 6 },
  
  { id: 'S010', code: 'GLU', name: 'Glucose Fasting', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 2, price: 60, isActive: true, reportOrder: 10 },
  { id: 'S011', code: 'GLUR', name: 'Glucose Random', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 2, price: 60, isActive: true, reportOrder: 11 },
  { id: 'S012', code: 'HBA1C', name: 'Glycated Hemoglobin', department: 'Biochemistry', unit: '%', sampleType: 'EDTA Blood', turnaroundTime: 4, price: 350, isActive: true, reportOrder: 12 },
  { id: 'S013', code: 'UREA', name: 'Blood Urea Nitrogen', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 2, price: 70, isActive: true, reportOrder: 13 },
  { id: 'S014', code: 'CREAT', name: 'Creatinine', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 2, price: 80, isActive: true, reportOrder: 14 },
  { id: 'S015', code: 'URIC', name: 'Uric Acid', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 2, price: 90, isActive: true, reportOrder: 15 },
  
  { id: 'S020', code: 'ALT', name: 'Alanine Aminotransferase', shortName: 'SGPT', department: 'Biochemistry', unit: 'U/L', sampleType: 'Serum', turnaroundTime: 2, price: 100, isActive: true, reportOrder: 20 },
  { id: 'S021', code: 'AST', name: 'Aspartate Aminotransferase', shortName: 'SGOT', department: 'Biochemistry', unit: 'U/L', sampleType: 'Serum', turnaroundTime: 2, price: 100, isActive: true, reportOrder: 21 },
  { id: 'S022', code: 'ALP', name: 'Alkaline Phosphatase', department: 'Biochemistry', unit: 'U/L', sampleType: 'Serum', turnaroundTime: 2, price: 100, isActive: true, reportOrder: 22 },
  { id: 'S023', code: 'TBIL', name: 'Total Bilirubin', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 2, price: 80, isActive: true, reportOrder: 23 },
  { id: 'S024', code: 'DBIL', name: 'Direct Bilirubin', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 2, price: 80, isActive: true, reportOrder: 24 },
  { id: 'S025', code: 'TP', name: 'Total Protein', department: 'Biochemistry', unit: 'g/dL', sampleType: 'Serum', turnaroundTime: 2, price: 70, isActive: true, reportOrder: 25 },
  { id: 'S026', code: 'ALB', name: 'Albumin', department: 'Biochemistry', unit: 'g/dL', sampleType: 'Serum', turnaroundTime: 2, price: 70, isActive: true, reportOrder: 26 },
  
  { id: 'S030', code: 'CHOL', name: 'Total Cholesterol', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 3, price: 100, isActive: true, reportOrder: 30 },
  { id: 'S031', code: 'TG', name: 'Triglycerides', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 3, price: 100, isActive: true, reportOrder: 31 },
  { id: 'S032', code: 'HDL', name: 'HDL Cholesterol', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 3, price: 120, isActive: true, reportOrder: 32 },
  { id: 'S033', code: 'LDL', name: 'LDL Cholesterol', department: 'Biochemistry', unit: 'mg/dL', sampleType: 'Serum', turnaroundTime: 3, price: 120, isActive: true, reportOrder: 33 },
  
  { id: 'S040', code: 'TSH', name: 'Thyroid Stimulating Hormone', department: 'Immunology', unit: 'mIU/L', sampleType: 'Serum', turnaroundTime: 4, price: 250, isActive: true, reportOrder: 40 },
  { id: 'S041', code: 'T3', name: 'Triiodothyronine', department: 'Immunology', unit: 'ng/dL', sampleType: 'Serum', turnaroundTime: 4, price: 200, isActive: true, reportOrder: 41 },
  { id: 'S042', code: 'T4', name: 'Thyroxine', department: 'Immunology', unit: 'µg/dL', sampleType: 'Serum', turnaroundTime: 4, price: 200, isActive: true, reportOrder: 42 },
  { id: 'S043', code: 'FT3', name: 'Free T3', department: 'Immunology', unit: 'pg/mL', sampleType: 'Serum', turnaroundTime: 4, price: 280, isActive: true, reportOrder: 43 },
  { id: 'S044', code: 'FT4', name: 'Free T4', department: 'Immunology', unit: 'ng/dL', sampleType: 'Serum', turnaroundTime: 4, price: 280, isActive: true, reportOrder: 44 },
  
  { id: 'S050', code: 'URINE', name: 'Urinalysis Complete', department: 'Urinalysis', unit: '', sampleType: 'Urine', turnaroundTime: 2, price: 100, isActive: true, reportOrder: 50 },
];

// Mock Profiles (Test Panels)
export const mockProfiles: Profile[] = [
  { id: 'P001', code: 'CBC-PANEL', name: 'Complete Blood Count Panel', department: 'Hematology', tests: ['S002', 'S003', 'S004', 'S005', 'S006'], price: 200, isActive: true },
  { id: 'P002', code: 'LFT', name: 'Liver Function Test', department: 'Biochemistry', tests: ['S020', 'S021', 'S022', 'S023', 'S024', 'S025', 'S026'], price: 450, isActive: true },
  { id: 'P003', code: 'RFT', name: 'Renal Function Test', department: 'Biochemistry', tests: ['S013', 'S014', 'S015'], price: 200, isActive: true },
  { id: 'P004', code: 'LIPID', name: 'Lipid Profile', department: 'Biochemistry', tests: ['S030', 'S031', 'S032', 'S033'], price: 350, isActive: true },
  { id: 'P005', code: 'TFT', name: 'Thyroid Function Test', department: 'Immunology', tests: ['S040', 'S041', 'S042'], price: 550, isActive: true },
  { id: 'P006', code: 'TFT-COMP', name: 'Thyroid Profile Complete', department: 'Immunology', tests: ['S040', 'S041', 'S042', 'S043', 'S044'], price: 900, isActive: true },
  { id: 'P007', code: 'DIABETIC', name: 'Diabetic Panel', department: 'Biochemistry', tests: ['S010', 'S012'], price: 380, isActive: true },
];

// Mock Packages
export const mockPackages: Package[] = [
  { id: 'PK001', code: 'BASIC-HEALTH', name: 'Basic Health Checkup', profiles: ['P001', 'P003'], tests: ['S010'], price: 500, validFrom: '2024-01-01', isActive: true },
  { id: 'PK002', code: 'COMP-HEALTH', name: 'Comprehensive Health Checkup', profiles: ['P001', 'P002', 'P003', 'P004', 'P005'], tests: ['S010', 'S050'], price: 1500, validFrom: '2024-01-01', isActive: true },
  { id: 'PK003', code: 'CARDIAC', name: 'Cardiac Risk Profile', profiles: ['P004'], tests: ['S010', 'S012'], price: 600, validFrom: '2024-01-01', isActive: true },
];

// Mock Clients - updated with B2C/B2B types
export const mockClients: Client[] = [
  { id: 'C001', code: 'WALKIN', name: 'Walk-in Patient', type: 'B2C', isActive: true, createdAt: '2024-01-01' },
  { id: 'C006', code: 'HOMEVISIT', name: 'Home Visit', type: 'B2C', isActive: true, createdAt: '2024-01-01' },
  { id: 'C002', code: 'CITYHSP', name: 'City General Hospital', type: 'B2B', email: 'lab@cityhospital.com', phone: '555-0100', address: '123 Medical Center Dr', city: 'Metro City', creditLimit: 50000, priceListId: 'PL002', isActive: true, createdAt: '2024-01-01' },
  { id: 'C003', code: 'WELLNESS', name: 'Wellness Medical Clinic', type: 'B2B', email: 'info@wellnessmc.com', phone: '555-0200', address: '456 Health Ave', city: 'Metro City', creditLimit: 25000, priceListId: 'PL003', isActive: true, createdAt: '2024-01-15' },
  { id: 'C004', code: 'UNITINS', name: 'United Insurance Corp', type: 'B2B', email: 'claims@unitedins.com', phone: '555-0300', address: '789 Finance Blvd', city: 'Capital City', creditLimit: 100000, priceListId: 'PL004', isActive: true, createdAt: '2024-02-01' },
  { id: 'C005', code: 'DRSMITH', name: "Dr. Smith's Family Practice", type: 'B2B', email: 'drsmith@familypractice.com', phone: '555-0400', creditLimit: 10000, isActive: true, createdAt: '2024-02-15' },
];

// Mock Price Lists
export const mockPriceLists: PriceList[] = [
  { id: 'PL001', code: 'STD', name: 'Standard Price List', effectiveFrom: '2024-01-01', discountPercent: 0, isDefault: true, isActive: true },
  { id: 'PL002', code: 'INST-10', name: 'Institution 10% Discount', effectiveFrom: '2024-01-01', discountPercent: 10, isDefault: false, isActive: true },
  { id: 'PL003', code: 'INST-15', name: 'Institution 15% Discount', effectiveFrom: '2024-01-01', discountPercent: 15, isDefault: false, isActive: true },
  { id: 'PL004', code: 'INS-20', name: 'Insurance Panel Rate', effectiveFrom: '2024-01-01', discountPercent: 20, isDefault: false, isActive: true },
];

// Mock Normal Ranges
export const mockNormalRanges: NormalRange[] = [
  { id: 'NR001', serviceId: 'S002', gender: 'Male', ageMin: 18, ageUnit: 'years', normalLow: 13.5, normalHigh: 17.5, criticalLow: 7, criticalHigh: 20, unit: 'g/dL' },
  { id: 'NR002', serviceId: 'S002', gender: 'Female', ageMin: 18, ageUnit: 'years', normalLow: 12.0, normalHigh: 16.0, criticalLow: 7, criticalHigh: 20, unit: 'g/dL' },
  { id: 'NR003', serviceId: 'S003', gender: 'All', normalLow: 4.5, normalHigh: 11.0, criticalLow: 2, criticalHigh: 30, unit: 'x10³/µL' },
  { id: 'NR004', serviceId: 'S004', gender: 'All', normalLow: 150, normalHigh: 400, criticalLow: 50, criticalHigh: 1000, unit: 'x10³/µL' },
  { id: 'NR005', serviceId: 'S005', gender: 'Male', normalLow: 4.5, normalHigh: 5.5, unit: 'x10⁶/µL' },
  { id: 'NR006', serviceId: 'S005', gender: 'Female', normalLow: 4.0, normalHigh: 5.0, unit: 'x10⁶/µL' },
  { id: 'NR010', serviceId: 'S010', gender: 'All', normalLow: 70, normalHigh: 100, criticalLow: 40, criticalHigh: 500, unit: 'mg/dL' },
  { id: 'NR011', serviceId: 'S011', gender: 'All', normalLow: 70, normalHigh: 140, criticalLow: 40, criticalHigh: 500, unit: 'mg/dL' },
  { id: 'NR012', serviceId: 'S012', gender: 'All', normalLow: 4.0, normalHigh: 5.6, unit: '%' },
  { id: 'NR013', serviceId: 'S013', gender: 'All', normalLow: 7, normalHigh: 20, unit: 'mg/dL' },
  { id: 'NR014', serviceId: 'S014', gender: 'Male', normalLow: 0.7, normalHigh: 1.3, criticalHigh: 10, unit: 'mg/dL' },
  { id: 'NR015', serviceId: 'S014', gender: 'Female', normalLow: 0.6, normalHigh: 1.1, criticalHigh: 10, unit: 'mg/dL' },
  { id: 'NR020', serviceId: 'S020', gender: 'All', normalLow: 7, normalHigh: 56, unit: 'U/L' },
  { id: 'NR021', serviceId: 'S021', gender: 'All', normalLow: 10, normalHigh: 40, unit: 'U/L' },
  { id: 'NR022', serviceId: 'S022', gender: 'All', normalLow: 44, normalHigh: 147, unit: 'U/L' },
  { id: 'NR023', serviceId: 'S023', gender: 'All', normalLow: 0.1, normalHigh: 1.2, criticalHigh: 15, unit: 'mg/dL' },
  { id: 'NR024', serviceId: 'S024', gender: 'All', normalLow: 0.0, normalHigh: 0.3, unit: 'mg/dL' },
  { id: 'NR030', serviceId: 'S030', gender: 'All', normalLow: 0, normalHigh: 200, unit: 'mg/dL' },
  { id: 'NR031', serviceId: 'S031', gender: 'All', normalLow: 0, normalHigh: 150, unit: 'mg/dL' },
  { id: 'NR032', serviceId: 'S032', gender: 'Male', normalLow: 40, normalHigh: 999, unit: 'mg/dL' },
  { id: 'NR033', serviceId: 'S032', gender: 'Female', normalLow: 50, normalHigh: 999, unit: 'mg/dL' },
  { id: 'NR034', serviceId: 'S033', gender: 'All', normalLow: 0, normalHigh: 100, unit: 'mg/dL' },
  { id: 'NR040', serviceId: 'S040', gender: 'All', normalLow: 0.4, normalHigh: 4.0, criticalLow: 0.1, criticalHigh: 10, unit: 'mIU/L' },
  { id: 'NR041', serviceId: 'S041', gender: 'All', normalLow: 80, normalHigh: 200, unit: 'ng/dL' },
  { id: 'NR042', serviceId: 'S042', gender: 'All', normalLow: 5.0, normalHigh: 12.0, unit: 'µg/dL' },
];

// Mock Cases with updated structure
export const mockCases: Case[] = [
  {
    id: 'CS001',
    caseNumber: 'LAB-2024-00001',
    patientName: 'John Anderson',
    patientId: 'PAT001',
    patientAge: 45,
    patientGender: 'Male',
    patientPhone: '555-1234',
    clientId: 'C001',
    clientName: 'Walk-in Patient',
    status: 'completed',
    priority: 'routine',
    registeredDate: '2024-02-01T08:00:00',
    collectionDate: '2024-02-01T08:30:00',
    receivedDate: '2024-02-01T09:00:00',
    completedDate: '2024-02-01T11:00:00',
    subtotal: 150,
    discountPercent: 0,
    discountAmount: 0,
    totalAmount: 150,
    paymentStatus: 'paid',
    paidAmount: 150,
    paymentRequired: true,
    samples: [
      { id: 'SM001', tubeId: 'ED1A2B3C4D', sampleType: 'EDTA Blood', status: 'completed', collectedAt: '2024-02-01T08:30:00', testIds: ['S002', 'S003'] }
    ],
    tests: [
      { testId: 'S002', testCode: 'HGB', testName: 'Hemoglobin', department: 'Hematology', sampleType: 'EDTA Blood', price: 50, status: 'completed', result: '14.5', unit: 'g/dL', flag: 'normal', normalRange: '13.5-17.5', tubeId: 'ED1A2B3C4D' },
      { testId: 'S003', testCode: 'WBC', testName: 'White Blood Cell Count', department: 'Hematology', sampleType: 'EDTA Blood', price: 50, status: 'completed', result: '7.2', unit: 'x10³/µL', flag: 'normal', normalRange: '4.5-11.0', tubeId: 'ED1A2B3C4D' },
    ]
  },
  {
    id: 'CS002',
    caseNumber: 'LAB-2024-00002',
    patientName: 'Sarah Mitchell',
    patientId: 'PAT002',
    patientAge: 32,
    patientGender: 'Female',
    patientPhone: '555-2345',
    clientId: 'C002',
    clientName: 'City General Hospital',
    status: 'in-process',
    priority: 'urgent',
    registeredDate: '2024-02-01T09:30:00',
    collectionDate: '2024-02-01T10:00:00',
    receivedDate: '2024-02-01T10:30:00',
    subtotal: 280,
    discountPercent: 10,
    discountAmount: 28,
    totalAmount: 252,
    paymentStatus: 'pending',
    paidAmount: 0,
    paymentRequired: false,
    samples: [
      { id: 'SM002', tubeId: 'SR5E6F7G8H', sampleType: 'Serum', status: 'processing', collectedAt: '2024-02-01T10:00:00', testIds: ['S020', 'S021', 'S023'] }
    ],
    tests: [
      { testId: 'S020', testCode: 'ALT', testName: 'Alanine Aminotransferase', department: 'Biochemistry', sampleType: 'Serum', price: 100, status: 'completed', result: '85', unit: 'U/L', flag: 'abnormal', normalRange: '7-56', tubeId: 'SR5E6F7G8H' },
      { testId: 'S021', testCode: 'AST', testName: 'Aspartate Aminotransferase', department: 'Biochemistry', sampleType: 'Serum', price: 100, status: 'completed', result: '62', unit: 'U/L', flag: 'abnormal', normalRange: '10-40', tubeId: 'SR5E6F7G8H' },
      { testId: 'S023', testCode: 'TBIL', testName: 'Total Bilirubin', department: 'Biochemistry', sampleType: 'Serum', price: 80, status: 'processing', tubeId: 'SR5E6F7G8H' },
    ]
  },
  {
    id: 'CS006',
    caseNumber: 'LAB-2024-00006',
    patientName: 'Lisa Wong',
    patientId: 'PAT006',
    patientAge: 42,
    patientGender: 'Female',
    patientPhone: '555-6789',
    clientId: 'C001',
    clientName: 'Walk-in Patient',
    status: 'registered',
    priority: 'routine',
    registeredDate: '2024-02-01T12:00:00',
    subtotal: 350,
    discountPercent: 0,
    discountAmount: 0,
    totalAmount: 350,
    paymentStatus: 'paid',
    paidAmount: 350,
    paymentRequired: true,
    samples: [],
    tests: [
      { testId: 'S030', testCode: 'CHOL', testName: 'Total Cholesterol', department: 'Biochemistry', sampleType: 'Serum', price: 100, status: 'pending' },
      { testId: 'S031', testCode: 'TG', testName: 'Triglycerides', department: 'Biochemistry', sampleType: 'Serum', price: 100, status: 'pending' },
      { testId: 'S032', testCode: 'HDL', testName: 'HDL Cholesterol', department: 'Biochemistry', sampleType: 'Serum', price: 75, status: 'pending' },
      { testId: 'S033', testCode: 'LDL', testName: 'LDL Cholesterol', department: 'Biochemistry', sampleType: 'Serum', price: 75, status: 'pending' },
    ]
  },
];

// Helper function to generate unique IDs
export const generateId = (prefix: string): string => {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
};

// Helper function to generate case numbers
export const generateCaseNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `LAB-${year}-${random}`;
};

// Helper function to generate patient ID
export const generatePatientId = (): string => {
  return `PAT${Date.now().toString(36).toUpperCase()}`;
};
