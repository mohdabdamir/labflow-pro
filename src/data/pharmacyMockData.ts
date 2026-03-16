// ============================================================
// Pharmacy Module — Rich Mock Data
// ============================================================
import type {
  PharmacyPatient, QueueTicket, Prescription, InventoryItem,
  DrugMaster, HL7Connection, RobotSystem, PharmacyMetrics,
  PharmacyCounter, ReorderAlert, HL7MessageLog, DrugInteraction,
  InventoryTransaction,
} from '@/types/pharmacy';

// ─────────────────────────────────────────────
// Drug Master
// ─────────────────────────────────────────────
export const mockDrugs: DrugMaster[] = [
  { id: 'D001', ndc: '0069-0420-30', brandName: 'Lipitor', genericName: 'Atorvastatin', strength: '20mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', therapeuticClass: 'HMG-CoA Reductase Inhibitor', requiresRefrigeration: false, isHighRisk: false, isControlled: false, b2cPrice: 45, b2bPrice: 38, reorderPoint: 200, reorderQuantity: 500, formularyStatus: 'formulary', activeIngredients: ['Atorvastatin Calcium'] },
  { id: 'D002', ndc: '0006-0105-68', brandName: 'Zocor', genericName: 'Simvastatin', strength: '40mg', dosageForm: 'Tablet', manufacturer: 'Merck', therapeuticClass: 'HMG-CoA Reductase Inhibitor', requiresRefrigeration: false, isHighRisk: false, isControlled: false, b2cPrice: 32, b2bPrice: 26, reorderPoint: 150, reorderQuantity: 400, formularyStatus: 'formulary', activeIngredients: ['Simvastatin'] },
  { id: 'D003', ndc: '0074-3614-60', brandName: 'Glucophage', genericName: 'Metformin', strength: '500mg', dosageForm: 'Tablet', manufacturer: 'Bristol-Myers Squibb', therapeuticClass: 'Biguanide Antidiabetic', requiresRefrigeration: false, isHighRisk: false, isControlled: false, b2cPrice: 18, b2bPrice: 14, reorderPoint: 300, reorderQuantity: 800, formularyStatus: 'formulary', activeIngredients: ['Metformin HCl'], labMonitoring: ['Creatinine', 'eGFR', 'B12'] },
  { id: 'D004', ndc: '0169-3636-11', brandName: 'Lantus', genericName: 'Insulin Glargine', strength: '100 units/mL', dosageForm: 'Solution for Injection', manufacturer: 'Sanofi', therapeuticClass: 'Long-acting Insulin', requiresRefrigeration: true, isHighRisk: true, isControlled: false, b2cPrice: 280, b2bPrice: 240, reorderPoint: 50, reorderQuantity: 100, formularyStatus: 'formulary', activeIngredients: ['Insulin Glargine'] },
  { id: 'D005', ndc: '0002-4453-59', brandName: 'Cialis', genericName: 'Tadalafil', strength: '10mg', dosageForm: 'Tablet', manufacturer: 'Eli Lilly', therapeuticClass: 'PDE5 Inhibitor', requiresRefrigeration: false, isHighRisk: false, isControlled: false, b2cPrice: 95, b2bPrice: 78, reorderPoint: 80, reorderQuantity: 200, formularyStatus: 'formulary', activeIngredients: ['Tadalafil'], contraindications: ['Nitrates'] },
  { id: 'D006', ndc: '0069-2600-30', brandName: 'Norvasc', genericName: 'Amlodipine', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', therapeuticClass: 'Calcium Channel Blocker', requiresRefrigeration: false, isHighRisk: false, isControlled: false, b2cPrice: 28, b2bPrice: 22, reorderPoint: 200, reorderQuantity: 500, formularyStatus: 'formulary', activeIngredients: ['Amlodipine Besylate'] },
  { id: 'D007', ndc: '0025-1525-31', brandName: 'Losartan', genericName: 'Losartan Potassium', strength: '50mg', dosageForm: 'Tablet', manufacturer: 'Merck', therapeuticClass: 'ARB', requiresRefrigeration: false, isHighRisk: false, isControlled: false, b2cPrice: 38, b2bPrice: 30, reorderPoint: 180, reorderQuantity: 450, formularyStatus: 'formulary', activeIngredients: ['Losartan Potassium'] },
  { id: 'D008', ndc: '0006-0952-31', brandName: 'Warfarin', genericName: 'Warfarin Sodium', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Bristol-Myers Squibb', therapeuticClass: 'Anticoagulant', requiresRefrigeration: false, isHighRisk: true, isControlled: false, b2cPrice: 22, b2bPrice: 18, reorderPoint: 100, reorderQuantity: 300, formularyStatus: 'formulary', activeIngredients: ['Warfarin Sodium'], labMonitoring: ['INR', 'PT'] },
  { id: 'D009', ndc: '0054-3286-25', brandName: 'OxyContin', genericName: 'Oxycodone HCl CR', strength: '10mg', dosageForm: 'Extended-Release Tablet', manufacturer: 'Purdue Pharma', therapeuticClass: 'Opioid Analgesic', deaSchedule: 'II', requiresRefrigeration: false, isHighRisk: true, isControlled: true, b2cPrice: 180, b2bPrice: 155, reorderPoint: 30, reorderQuantity: 60, formularyStatus: 'restricted', activeIngredients: ['Oxycodone HCl'] },
  { id: 'D010', ndc: '0009-0190-01', brandName: 'Amoxicillin', genericName: 'Amoxicillin', strength: '500mg', dosageForm: 'Capsule', manufacturer: 'GlaxoSmithKline', therapeuticClass: 'Penicillin Antibiotic', requiresRefrigeration: false, isHighRisk: false, isControlled: false, b2cPrice: 25, b2bPrice: 20, reorderPoint: 250, reorderQuantity: 600, formularyStatus: 'formulary', activeIngredients: ['Amoxicillin Trihydrate'] },
  { id: 'D011', ndc: '0093-5163-10', brandName: 'Pantoprazole', genericName: 'Pantoprazole Sodium', strength: '40mg', dosageForm: 'Delayed-Release Tablet', manufacturer: 'Pfizer', therapeuticClass: 'Proton Pump Inhibitor', requiresRefrigeration: false, isHighRisk: false, isControlled: false, b2cPrice: 35, b2bPrice: 28, reorderPoint: 220, reorderQuantity: 550, formularyStatus: 'formulary', activeIngredients: ['Pantoprazole Sodium'] },
  { id: 'D012', ndc: '0378-6910-05', brandName: 'Carvedilol', genericName: 'Carvedilol', strength: '12.5mg', dosageForm: 'Tablet', manufacturer: 'Roche', therapeuticClass: 'Beta Blocker', requiresRefrigeration: false, isHighRisk: false, isControlled: false, b2cPrice: 42, b2bPrice: 35, reorderPoint: 160, reorderQuantity: 400, formularyStatus: 'formulary', activeIngredients: ['Carvedilol'] },
];

// ─────────────────────────────────────────────
// Inventory
// ─────────────────────────────────────────────
export const mockInventory: InventoryItem[] = [
  { id: 'INV001', drugId: 'D001', drug: mockDrugs[0], lot: 'LT2024-001', expiry: '2026-03-01', location: 'main_shelf', quantity: 450, reservedQuantity: 30, availableQuantity: 420, unitCost: 32, receivedDate: '2024-11-15', supplierName: 'MedPharm Dist.', poNumber: 'PO2024-1141', status: 'in_stock', isRobotManaged: false, expiryAlertDays: 60 },
  { id: 'INV002', drugId: 'D002', drug: mockDrugs[1], lot: 'LT2024-022', expiry: '2025-06-30', location: 'robot', quantity: 188, reservedQuantity: 20, availableQuantity: 168, unitCost: 24, receivedDate: '2024-12-01', supplierName: 'NovaDrug Co.', status: 'in_stock', isRobotManaged: true, robotBin: 'R-B042', expiryAlertDays: 60 },
  { id: 'INV003', drugId: 'D003', drug: mockDrugs[2], lot: 'LT2024-055', expiry: '2026-12-01', location: 'main_shelf', quantity: 520, reservedQuantity: 50, availableQuantity: 470, unitCost: 12, receivedDate: '2025-01-10', supplierName: 'GeneriCo Pharm', status: 'in_stock', isRobotManaged: false, expiryAlertDays: 60 },
  { id: 'INV004', drugId: 'D004', drug: mockDrugs[3], lot: 'LT2025-003', expiry: '2025-09-15', location: 'fridge', quantity: 48, reservedQuantity: 10, availableQuantity: 38, unitCost: 218, receivedDate: '2025-02-01', supplierName: 'Cold Chain Med', status: 'low_stock', isRobotManaged: false, expiryAlertDays: 90 },
  { id: 'INV005', drugId: 'D005', drug: mockDrugs[4], lot: 'LT2024-078', expiry: '2026-05-01', location: 'main_shelf', quantity: 142, reservedQuantity: 15, availableQuantity: 127, unitCost: 72, receivedDate: '2024-10-20', supplierName: 'MedPharm Dist.', status: 'in_stock', isRobotManaged: false, expiryAlertDays: 60 },
  { id: 'INV006', drugId: 'D006', drug: mockDrugs[5], lot: 'LT2025-010', expiry: '2027-01-01', location: 'robot', quantity: 380, reservedQuantity: 40, availableQuantity: 340, unitCost: 19, receivedDate: '2025-01-25', supplierName: 'GeneriCo Pharm', status: 'in_stock', isRobotManaged: true, robotBin: 'R-A018', expiryAlertDays: 60 },
  { id: 'INV007', drugId: 'D007', drug: mockDrugs[6], lot: 'LT2024-099', expiry: '2026-08-01', location: 'main_shelf', quantity: 6, reservedQuantity: 3, availableQuantity: 3, unitCost: 26, receivedDate: '2024-09-15', supplierName: 'NovaDrug Co.', status: 'low_stock', isRobotManaged: false, expiryAlertDays: 60 },
  { id: 'INV008', drugId: 'D008', drug: mockDrugs[7], lot: 'LT2025-011', expiry: '2026-10-01', location: 'main_shelf', quantity: 0, reservedQuantity: 0, availableQuantity: 0, unitCost: 16, receivedDate: '2025-01-01', supplierName: 'GeneriCo Pharm', status: 'out_of_stock', isRobotManaged: false, expiryAlertDays: 60 },
  { id: 'INV009', drugId: 'D009', drug: mockDrugs[8], lot: 'LT2025-005', expiry: '2026-02-01', location: 'controlled', quantity: 42, reservedQuantity: 5, availableQuantity: 37, unitCost: 148, receivedDate: '2025-02-10', supplierName: 'Controlled Med Supply', status: 'in_stock', isRobotManaged: false, expiryAlertDays: 90 },
  { id: 'INV010', drugId: 'D010', drug: mockDrugs[9], lot: 'LT2025-020', expiry: '2026-06-01', location: 'main_shelf', quantity: 680, reservedQuantity: 60, availableQuantity: 620, unitCost: 18, receivedDate: '2025-02-15', supplierName: 'MedPharm Dist.', status: 'in_stock', isRobotManaged: false, expiryAlertDays: 60 },
  { id: 'INV011', drugId: 'D011', drug: mockDrugs[10], lot: 'LT2025-028', expiry: '2027-03-01', location: 'robot', quantity: 290, reservedQuantity: 25, availableQuantity: 265, unitCost: 24, receivedDate: '2025-03-01', supplierName: 'GeneriCo Pharm', status: 'in_stock', isRobotManaged: true, robotBin: 'R-C065', expiryAlertDays: 60 },
  { id: 'INV012', drugId: 'D012', drug: mockDrugs[11], lot: 'LT2024-112', expiry: '2025-05-01', location: 'main_shelf', quantity: 88, reservedQuantity: 12, availableQuantity: 76, unitCost: 31, receivedDate: '2024-11-01', supplierName: 'NovaDrug Co.', status: 'in_stock', isRobotManaged: false, expiryAlertDays: 90 },
];

// ─────────────────────────────────────────────
// Patients
// ─────────────────────────────────────────────
export const mockPharmacyPatients: PharmacyPatient[] = [
  {
    id: 'PP001', mrn: 'MRN-2024-00142', firstName: 'Ahmed', lastName: 'Al-Rashid',
    dob: '1971-04-15', age: 52, gender: 'M', phone: '+966-50-1234567',
    email: 'ahmed.rashid@email.com', insurance: 'Gulf Shield Insurance', insuranceId: 'GSI-44821',
    allergies: [
      { id: 'A001', allergen: 'Penicillin', type: 'drug', severity: 'life_threatening', reaction: 'Anaphylaxis', onsetDate: '2005-03-10' },
      { id: 'A002', allergen: 'Sulfonamides', type: 'drug', severity: 'moderate', reaction: 'Rash, hives' },
    ],
    conditions: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
  },
  {
    id: 'PP002', mrn: 'MRN-2024-00287', firstName: 'Fatima', lastName: 'Hassan',
    dob: '1988-09-22', age: 35, gender: 'F', phone: '+966-55-9876543',
    email: 'f.hassan@email.com', insurance: 'National Health Plan', insuranceId: 'NHP-112244',
    allergies: [],
    conditions: ['Hypothyroidism', 'Anemia'],
  },
  {
    id: 'PP003', mrn: 'MRN-2024-00391', firstName: 'James', lastName: 'Morrison',
    dob: '1955-11-08', age: 68, gender: 'M', phone: '+966-50-5551234',
    allergies: [
      { id: 'A003', allergen: 'Aspirin', type: 'drug', severity: 'severe', reaction: 'Bronchospasm' },
      { id: 'A004', allergen: 'NSAIDs', type: 'drug', severity: 'severe', reaction: 'GI Bleeding' },
    ],
    conditions: ['Heart Failure (NYHA II)', 'Atrial Fibrillation', 'Anticoagulation therapy'],
  },
  {
    id: 'PP004', mrn: 'MRN-2024-00512', firstName: 'Sara', lastName: 'Al-Malki',
    dob: '1992-03-17', age: 31, gender: 'F', phone: '+966-59-8887654',
    email: 'sara.malki@work.com', insurance: 'Corporate Health Plan', insuranceId: 'CHP-88765',
    allergies: [],
    conditions: ['Hypertension', 'Anxiety Disorder'],
  },
  {
    id: 'PP005', mrn: 'MRN-2024-00623', firstName: 'Mohammed', lastName: 'Al-Khalil',
    dob: '1980-07-03', age: 43, gender: 'M', phone: '+966-53-4445678',
    allergies: [
      { id: 'A005', allergen: 'Codeine', type: 'drug', severity: 'moderate', reaction: 'Excessive sedation, nausea' },
    ],
    conditions: ['Chronic Back Pain', 'Hyperlipidemia'],
  },
  {
    id: 'PP006', mrn: 'MRN-2024-00734', firstName: 'Layla', lastName: 'Ibrahim',
    dob: '2018-06-10', age: 5, gender: 'F', phone: '+966-50-3334567',
    allergies: [],
    conditions: ['Upper Respiratory Infection'],
  },
];

// ─────────────────────────────────────────────
// Queue Tickets
// ─────────────────────────────────────────────
export const mockQueueTickets: QueueTicket[] = [
  { id: 'Q001', ticketNumber: 'A042', qrCode: 'QR-A042-2024', patientId: 'PP001', patient: mockPharmacyPatients[0], counter: 1, status: 'processing', priority: 'normal', prescriptionIds: ['RX001', 'RX002'], issuedAt: new Date(Date.now() - 25 * 60000).toISOString(), calledAt: new Date(Date.now() - 10 * 60000).toISOString(), processingStartedAt: new Date(Date.now() - 8 * 60000).toISOString(), estimatedWait: 0, source: 'kiosk' },
  { id: 'Q002', ticketNumber: 'A043', qrCode: 'QR-A043-2024', patientId: 'PP002', patient: mockPharmacyPatients[1], status: 'waiting', priority: 'normal', prescriptionIds: ['RX003'], issuedAt: new Date(Date.now() - 18 * 60000).toISOString(), estimatedWait: 8, source: 'kiosk' },
  { id: 'Q003', ticketNumber: 'U009', qrCode: 'QR-U009-2024', patientId: 'PP003', patient: mockPharmacyPatients[2], status: 'waiting', priority: 'urgent', prescriptionIds: ['RX004'], issuedAt: new Date(Date.now() - 12 * 60000).toISOString(), estimatedWait: 3, source: 'hl7' },
  { id: 'Q004', ticketNumber: 'A044', qrCode: 'QR-A044-2024', patientId: 'PP004', patient: mockPharmacyPatients[3], status: 'called', priority: 'normal', prescriptionIds: ['RX005'], issuedAt: new Date(Date.now() - 30 * 60000).toISOString(), calledAt: new Date(Date.now() - 2 * 60000).toISOString(), estimatedWait: 0, source: 'kiosk', counter: 2 },
  { id: 'Q005', ticketNumber: 'P002', qrCode: 'QR-P002-2024', patientId: 'PP006', patient: mockPharmacyPatients[5], status: 'waiting', priority: 'pediatric', prescriptionIds: ['RX006'], issuedAt: new Date(Date.now() - 8 * 60000).toISOString(), estimatedWait: 12, source: 'staff' },
  { id: 'Q006', ticketNumber: 'A041', qrCode: 'QR-A041-2024', patientId: 'PP005', patient: mockPharmacyPatients[4], status: 'ready_for_collection', priority: 'normal', prescriptionIds: ['RX007'], issuedAt: new Date(Date.now() - 45 * 60000).toISOString(), calledAt: new Date(Date.now() - 35 * 60000).toISOString(), readyAt: new Date(Date.now() - 5 * 60000).toISOString(), estimatedWait: 0, source: 'kiosk' },
];

// ─────────────────────────────────────────────
// Prescriptions
// ─────────────────────────────────────────────
const sampleInteraction: DrugInteraction = {
  id: 'INT001', type: 'drug_drug', severity: 'significant',
  drug1: 'Warfarin', drug2: 'Atorvastatin',
  description: 'Increased anticoagulant effect with bleeding risk',
  clinicalSignificance: 'Monitor INR closely. Atorvastatin may increase the anticoagulant effect of warfarin by inhibiting CYP2C9.',
  managementRecommendation: 'Monitor INR within 3-7 days of starting/changing statin dose. Adjust warfarin as needed.',
  overridable: true,
};

export const mockPrescriptions: Prescription[] = [
  {
    id: 'RX001', rxNumber: 'RX-2025-001847', patientId: 'PP001', patient: mockPharmacyPatients[0],
    prescriberId: 'DR001', prescriberName: 'Dr. Khalid Al-Mansoor', prescriberDept: 'Internal Medicine',
    prescriberPhone: '+966-11-555-0100', facility: 'City General Hospital',
    receivedAt: new Date(Date.now() - 30 * 60000).toISOString(), source: 'hl7',
    status: 'dispensing', actionType: 'new',
    counselingRequired: false, highRiskFlag: false,
    hl7MessageId: 'HL7-ORM-2025-8849',
    totalCost: 63, insuranceCovered: 50.4, patientCopay: 12.6,
    items: [
      { id: 'RI001', prescriptionId: 'RX001', drugId: 'D001', drugName: 'Atorvastatin 20mg', genericName: 'Atorvastatin', ndc: '0069-0420-30', strength: '20mg', dosageForm: 'Tablet', quantity: 30, daysSupply: 30, directions: 'Take 1 tablet by mouth once daily at bedtime', refillsAllowed: 5, refillsRemaining: 5, lot: 'LT2024-001', expiry: '2026-03-01', unitPrice: 45, totalPrice: 45, status: 'verified' },
      { id: 'RI002', prescriptionId: 'RX001', drugId: 'D003', drugName: 'Metformin 500mg', genericName: 'Metformin', ndc: '0074-3614-60', strength: '500mg', dosageForm: 'Tablet', quantity: 60, daysSupply: 30, directions: 'Take 1 tablet by mouth twice daily with meals', refillsAllowed: 3, refillsRemaining: 3, unitPrice: 18, totalPrice: 18, status: 'verified' },
    ],
    interactions: [],
    dispensingHistory: [
      { id: 'DE001', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), action: 'Prescription Received (HL7 ORM)', userId: 'SYS', userName: 'System', details: 'Auto-received via HL7 ADT/ORM interface' },
      { id: 'DE002', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), action: 'Clinical Verification', userId: 'U003', userName: 'Dr. Sara Al-Ghamdi (PharmD)', details: 'Verified prescription — no interactions found' },
    ],
  },
  {
    id: 'RX002', rxNumber: 'RX-2025-001848', patientId: 'PP001', patient: mockPharmacyPatients[0],
    prescriberId: 'DR001', prescriberName: 'Dr. Khalid Al-Mansoor', prescriberDept: 'Internal Medicine',
    receivedAt: new Date(Date.now() - 30 * 60000).toISOString(), source: 'hl7',
    status: 'clinical_review', actionType: 'clinical_review',
    counselingRequired: false, highRiskFlag: true,
    totalCost: 22, insuranceCovered: 17.6, patientCopay: 4.4,
    items: [
      { id: 'RI003', prescriptionId: 'RX002', drugId: 'D008', drugName: 'Warfarin 5mg', genericName: 'Warfarin Sodium', ndc: '0006-0952-31', strength: '5mg', dosageForm: 'Tablet', quantity: 30, daysSupply: 30, directions: 'Take as directed per INR results', refillsAllowed: 0, refillsRemaining: 0, unitPrice: 22, totalPrice: 22, status: 'pending' },
    ],
    interactions: [sampleInteraction],
    dispensingHistory: [
      { id: 'DE003', timestamp: new Date(Date.now() - 28 * 60000).toISOString(), action: 'Prescription Received', userId: 'SYS', userName: 'System', details: 'Auto-received via HL7 ORM' },
      { id: 'DE004', timestamp: new Date(Date.now() - 20 * 60000).toISOString(), action: 'Flagged for Clinical Review', userId: 'SYS', userName: 'CDS Engine', details: 'High-risk medication — Warfarin. Requires pharmacist verification.' },
    ],
  },
  {
    id: 'RX003', rxNumber: 'RX-2025-001849', patientId: 'PP002', patient: mockPharmacyPatients[1],
    prescriberId: 'DR002', prescriberName: 'Dr. Hana Al-Otaibi', prescriberDept: 'Endocrinology',
    receivedAt: new Date(Date.now() - 20 * 60000).toISOString(), source: 'cpoe',
    status: 'verification', actionType: 'new',
    counselingRequired: true, highRiskFlag: false,
    totalCost: 280, insuranceCovered: 224, patientCopay: 56,
    items: [
      { id: 'RI004', prescriptionId: 'RX003', drugId: 'D004', drugName: 'Insulin Glargine 100 units/mL', genericName: 'Insulin Glargine', ndc: '0169-3636-11', strength: '100 units/mL', dosageForm: 'Injection', quantity: 1, daysSupply: 30, directions: 'Inject 20 units subcutaneously once daily at bedtime', refillsAllowed: 2, refillsRemaining: 2, unitPrice: 280, totalPrice: 280, status: 'pending' },
    ],
    interactions: [],
    dispensingHistory: [],
  },
  {
    id: 'RX004', rxNumber: 'RX-2025-001850', patientId: 'PP003', patient: mockPharmacyPatients[2],
    prescriberId: 'DR003', prescriberName: 'Dr. Faris Al-Harbi', prescriberDept: 'Cardiology',
    receivedAt: new Date(Date.now() - 15 * 60000).toISOString(), source: 'hl7',
    status: 'received', actionType: 'urgent',
    counselingRequired: false, highRiskFlag: true,
    totalCost: 64, insuranceCovered: 64, patientCopay: 0,
    items: [
      { id: 'RI005', prescriptionId: 'RX004', drugId: 'D012', drugName: 'Carvedilol 12.5mg', genericName: 'Carvedilol', ndc: '0378-6910-05', strength: '12.5mg', dosageForm: 'Tablet', quantity: 60, daysSupply: 30, directions: 'Take 1 tablet twice daily with food', refillsAllowed: 2, refillsRemaining: 2, unitPrice: 42, totalPrice: 42, status: 'pending' },
      { id: 'RI006', prescriptionId: 'RX004', drugId: 'D006', drugName: 'Amlodipine 5mg', genericName: 'Amlodipine', ndc: '0069-2600-30', strength: '5mg', dosageForm: 'Tablet', quantity: 30, daysSupply: 30, directions: 'Take 1 tablet once daily', refillsAllowed: 2, refillsRemaining: 2, unitPrice: 28, totalPrice: 28, status: 'pending' },
    ],
    interactions: [
      { id: 'INT002', type: 'drug_allergy', severity: 'contraindicated', drug1: 'Amoxicillin (if prescribed)', drug2: 'Penicillin allergy', description: 'Patient has documented Penicillin allergy — cross-reactivity risk with Amoxicillin', clinicalSignificance: 'Contraindicated. High risk of anaphylaxis.', managementRecommendation: 'Use an alternative antibiotic class.', overridable: false },
    ],
    dispensingHistory: [],
  },
  {
    id: 'RX005', rxNumber: 'RX-2025-001851', patientId: 'PP004', patient: mockPharmacyPatients[3],
    prescriberId: 'DR004', prescriberName: 'Dr. Nasser Al-Fahd', prescriberDept: 'General Medicine',
    receivedAt: new Date(Date.now() - 35 * 60000).toISOString(), source: 'cpoe',
    status: 'verification', actionType: 'clarification',
    counselingRequired: false, highRiskFlag: false,
    totalCost: 66, insuranceCovered: 52.8, patientCopay: 13.2,
    items: [
      { id: 'RI007', prescriptionId: 'RX005', drugId: 'D006', drugName: 'Amlodipine 5mg', genericName: 'Amlodipine', ndc: '0069-2600-30', strength: '5mg', dosageForm: 'Tablet', quantity: 30, daysSupply: 30, directions: 'Take 1 tablet daily', refillsAllowed: 5, refillsRemaining: 5, unitPrice: 28, totalPrice: 28, status: 'pending' },
      { id: 'RI008', prescriptionId: 'RX005', drugId: 'D007', drugName: 'Losartan 50mg', genericName: 'Losartan Potassium', ndc: '0025-1525-31', strength: '50mg', dosageForm: 'Tablet', quantity: 30, daysSupply: 30, directions: 'Take 1 tablet daily', refillsAllowed: 5, refillsRemaining: 5, unitPrice: 38, totalPrice: 38, status: 'pending' },
    ],
    interactions: [],
    dispensingHistory: [
      { id: 'DE005', timestamp: new Date(Date.now() - 33 * 60000).toISOString(), action: 'Prescription Received', userId: 'U004', userName: 'Mary Williams (Receptionist)', details: 'Paper prescription scanned and entered' },
      { id: 'DE006', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), action: 'Flagged for Clarification', userId: 'SYS', userName: 'CDS Engine', details: 'Prescriber signature unclear. Dose verification needed.' },
    ],
  },
  {
    id: 'RX006', rxNumber: 'RX-2025-001852', patientId: 'PP006', patient: mockPharmacyPatients[5],
    prescriberId: 'DR005', prescriberName: 'Dr. Huda Al-Otaibi', prescriberDept: 'Pediatrics',
    receivedAt: new Date(Date.now() - 10 * 60000).toISOString(), source: 'cpoe',
    status: 'received', actionType: 'counseling',
    counselingRequired: true, highRiskFlag: false,
    totalCost: 25, insuranceCovered: 25, patientCopay: 0,
    items: [
      { id: 'RI009', prescriptionId: 'RX006', drugId: 'D010', drugName: 'Amoxicillin 250mg/5mL Susp.', genericName: 'Amoxicillin', ndc: '0009-0190-01', strength: '250mg/5mL', dosageForm: 'Oral Suspension', quantity: 1, daysSupply: 10, directions: '5mL (250mg) three times daily for 10 days. Shake well before use.', refillsAllowed: 0, refillsRemaining: 0, unitPrice: 25, totalPrice: 25, status: 'pending' },
    ],
    interactions: [],
    dispensingHistory: [],
  },
  {
    id: 'RX007', rxNumber: 'RX-2025-001843', patientId: 'PP005', patient: mockPharmacyPatients[4],
    prescriberId: 'DR001', prescriberName: 'Dr. Khalid Al-Mansoor', prescriberDept: 'Internal Medicine',
    receivedAt: new Date(Date.now() - 50 * 60000).toISOString(), source: 'hl7',
    status: 'ready', actionType: 'new',
    counselingRequired: false, highRiskFlag: false,
    totalCost: 77, insuranceCovered: 61.6, patientCopay: 15.4,
    items: [
      { id: 'RI010', prescriptionId: 'RX007', drugId: 'D001', drugName: 'Atorvastatin 20mg', genericName: 'Atorvastatin', ndc: '0069-0420-30', strength: '20mg', dosageForm: 'Tablet', quantity: 30, daysSupply: 30, directions: 'Take 1 tablet once daily at bedtime', refillsAllowed: 5, refillsRemaining: 5, lot: 'LT2024-001', expiry: '2026-03-01', unitPrice: 45, totalPrice: 45, status: 'dispensed', dispensedQuantity: 30, dispensedAt: new Date(Date.now() - 10 * 60000).toISOString(), dispensedBy: 'Sara Kamal (PharmD)' },
      { id: 'RI011', prescriptionId: 'RX007', drugId: 'D011', drugName: 'Pantoprazole 40mg', genericName: 'Pantoprazole', ndc: '0093-5163-10', strength: '40mg', dosageForm: 'Tablet', quantity: 30, daysSupply: 30, directions: 'Take 1 tablet before breakfast', refillsAllowed: 3, refillsRemaining: 3, lot: 'LT2025-028', expiry: '2027-03-01', unitPrice: 35, totalPrice: 35, status: 'dispensed', dispensedQuantity: 30, dispensedAt: new Date(Date.now() - 10 * 60000).toISOString(), dispensedBy: 'Sara Kamal (PharmD)' },
    ],
    interactions: [],
    dispensingHistory: [
      { id: 'DE007', timestamp: new Date(Date.now() - 48 * 60000).toISOString(), action: 'Received via HL7', userId: 'SYS', userName: 'System', details: 'Auto-received from CPOE' },
      { id: 'DE008', timestamp: new Date(Date.now() - 35 * 60000).toISOString(), action: 'Verification Completed', userId: 'U003', userName: 'Sara Kamal (PharmD)', details: 'Clinically verified — cleared for dispensing' },
      { id: 'DE009', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), action: 'Dispensed', userId: 'U003', userName: 'Sara Kamal (PharmD)', details: 'All items dispensed. Patient notified.' },
    ],
  },
];

// ─────────────────────────────────────────────
// HL7 Connections
// ─────────────────────────────────────────────
export const mockHL7Connections: HL7Connection[] = [
  { id: 'H001', name: 'CPOE → Pharmacy', description: 'Physician order entry to pharmacy order feed', type: 'incoming', protocol: 'MLLP', host: '10.1.2.10', port: 2575, messageTypes: ['ORM', 'ADT'], status: 'connected', lastActivity: new Date(Date.now() - 2 * 60000).toISOString(), messagesProcessed: 14852, messagesErrored: 3, latencyMs: 45, hl7Version: '2.5', sendingApplication: 'CPOE_SYS', sendingFacility: 'MCH', receivingApplication: 'PHARM', receivingFacility: 'MCH' },
  { id: 'H002', name: 'Pharmacy → Billing (DFT)', description: 'Dispensing charge transactions to billing system', type: 'outgoing', protocol: 'MLLP', host: '10.1.2.20', port: 2577, messageTypes: ['DFT', 'ACK'], status: 'connected', lastActivity: new Date(Date.now() - 5 * 60000).toISOString(), messagesProcessed: 9214, messagesErrored: 12, latencyMs: 32, hl7Version: '2.5', sendingApplication: 'PHARM', receivingApplication: 'BILLING' },
  { id: 'H003', name: 'Lab Results (ORU)', description: 'Lab result feed for drug monitoring integration', type: 'incoming', protocol: 'MLLP', host: '10.1.3.15', port: 2578, messageTypes: ['ORU', 'ACK'], status: 'connected', lastActivity: new Date(Date.now() - 15 * 60000).toISOString(), messagesProcessed: 6741, messagesErrored: 8, latencyMs: 28, hl7Version: '2.4' },
  { id: 'H004', name: 'ADT Feed — Admissions', description: 'Patient admission/discharge/transfer feed', type: 'incoming', protocol: 'MLLP', host: '10.1.1.5', port: 2576, messageTypes: ['ADT'], status: 'disconnected', lastActivity: new Date(Date.now() - 3600000).toISOString(), messagesProcessed: 22100, messagesErrored: 0, hl7Version: '2.5' },
  { id: 'H005', name: 'FHIR R4 Gateway', description: 'FHIR R4 bidirectional medication resource layer', type: 'bidirectional', protocol: 'HTTPS', host: 'fhir.hospital.internal', port: 8443, messageTypes: ['ORM', 'ORU'], status: 'error', lastActivity: new Date(Date.now() - 7200000).toISOString(), messagesProcessed: 1820, messagesErrored: 240, latencyMs: 0, hl7Version: '2.7' },
];

// ─────────────────────────────────────────────
// Robot System
// ─────────────────────────────────────────────
export const mockRobotSystems: RobotSystem[] = [
  { id: 'ROB001', name: 'BD Rowa Vmax', vendor: 'bd_rowa', model: 'Vmax 3000', ipAddress: '10.2.0.10', port: 9800, status: 'online', lastHeartbeat: new Date(Date.now() - 30000).toISOString(), currentOperation: 'Idle', queuedCommands: 2, totalBins: 3200, occupiedBins: 2840, firmware: 'v4.2.1' },
  { id: 'ROB002', name: 'Omnicell Unit Dose', vendor: 'omnicell', model: 'XT Automated Dispensing Cabinet', ipAddress: '10.2.0.20', port: 9801, status: 'busy', lastHeartbeat: new Date(Date.now() - 15000).toISOString(), currentOperation: 'Dispensing Amlodipine 5mg for RX-2025-001847', queuedCommands: 5, totalBins: 240, occupiedBins: 198, firmware: 'v8.1.0' },
];

// ─────────────────────────────────────────────
// HL7 Message Log
// ─────────────────────────────────────────────
export const mockHL7Logs: HL7MessageLog[] = [
  { id: 'LOG001', connectionId: 'H001', connectionName: 'CPOE → Pharmacy', messageType: 'ORM', direction: 'in', status: 'processed', messageId: 'ORM-2025-8849', patientId: 'MRN-2024-00142', patientName: 'Ahmed Al-Rashid', processedAt: new Date(Date.now() - 2 * 60000).toISOString(), latencyMs: 43 },
  { id: 'LOG002', connectionId: 'H002', connectionName: 'Pharmacy → Billing', messageType: 'DFT', direction: 'out', status: 'acked', messageId: 'DFT-2025-4412', patientId: 'MRN-2024-00734', patientName: 'Layla Ibrahim', processedAt: new Date(Date.now() - 5 * 60000).toISOString(), latencyMs: 31 },
  { id: 'LOG003', connectionId: 'H003', connectionName: 'Lab Results', messageType: 'ORU', direction: 'in', status: 'processed', messageId: 'ORU-2025-7731', patientId: 'MRN-2024-00391', patientName: 'James Morrison', processedAt: new Date(Date.now() - 15 * 60000).toISOString(), latencyMs: 27 },
  { id: 'LOG004', connectionId: 'H005', connectionName: 'FHIR R4 Gateway', messageType: 'ORM', direction: 'out', status: 'error', messageId: 'FHIR-2025-0091', patientId: 'MRN-2024-00512', patientName: 'Sara Al-Malki', processedAt: new Date(Date.now() - 2 * 3600000).toISOString(), latencyMs: 0, errorDetails: 'SSL certificate validation failed. Host: fhir.hospital.internal. Certificate expired 2025-02-28.' },
  { id: 'LOG005', connectionId: 'H001', connectionName: 'CPOE → Pharmacy', messageType: 'ORM', direction: 'in', status: 'processed', messageId: 'ORM-2025-8848', patientId: 'MRN-2024-00623', patientName: 'Layla Ibrahim', processedAt: new Date(Date.now() - 12 * 60000).toISOString(), latencyMs: 47 },
];

// ─────────────────────────────────────────────
// Reorder Alerts
// ─────────────────────────────────────────────
export const mockReorderAlerts: ReorderAlert[] = [
  { id: 'RO001', drugId: 'D007', drugName: 'Losartan 50mg Tablet', currentStock: 6, reorderPoint: 180, reorderQuantity: 450, estimatedDaysRemaining: 1, supplierId: 'SUP002', supplierName: 'NovaDrug Co.', status: 'pending', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'RO002', drugId: 'D008', drugName: 'Warfarin 5mg Tablet', currentStock: 0, reorderPoint: 100, reorderQuantity: 300, estimatedDaysRemaining: 0, lastOrderDate: new Date(Date.now() - 2 * 86400000).toISOString(), supplierId: 'SUP001', supplierName: 'GeneriCo Pharm', status: 'ordered', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'RO003', drugId: 'D004', drugName: 'Insulin Glargine 100u/mL', currentStock: 48, reorderPoint: 50, reorderQuantity: 100, estimatedDaysRemaining: 14, supplierId: 'SUP003', supplierName: 'Cold Chain Med', status: 'pending', createdAt: new Date(Date.now() - 7200000).toISOString() },
];

// ─────────────────────────────────────────────
// Analytics / Metrics
// ─────────────────────────────────────────────
export const mockPharmacyMetrics: PharmacyMetrics[] = [
  { date: '2025-03-10', prescriptionsFilled: 142, avgWaitTime: 12, peakHour: 10, interventions: 8, interactions_caught: 3, revenue: 18450, robotDispenses: 64, counselingSessions: 12, nearMisses: 1 },
  { date: '2025-03-11', prescriptionsFilled: 158, avgWaitTime: 14, peakHour: 11, interventions: 11, interactions_caught: 5, revenue: 21200, robotDispenses: 71, counselingSessions: 15, nearMisses: 0 },
  { date: '2025-03-12', prescriptionsFilled: 134, avgWaitTime: 10, peakHour: 9, interventions: 6, interactions_caught: 2, revenue: 16890, robotDispenses: 58, counselingSessions: 9, nearMisses: 2 },
  { date: '2025-03-13', prescriptionsFilled: 167, avgWaitTime: 16, peakHour: 12, interventions: 14, interactions_caught: 7, revenue: 23100, robotDispenses: 82, counselingSessions: 18, nearMisses: 1 },
  { date: '2025-03-14', prescriptionsFilled: 151, avgWaitTime: 13, peakHour: 10, interventions: 9, interactions_caught: 4, revenue: 19800, robotDispenses: 68, counselingSessions: 13, nearMisses: 0 },
  { date: '2025-03-15', prescriptionsFilled: 173, avgWaitTime: 15, peakHour: 11, interventions: 12, interactions_caught: 6, revenue: 24350, robotDispenses: 79, counselingSessions: 16, nearMisses: 0 },
  { date: '2025-03-16', prescriptionsFilled: 89, avgWaitTime: 11, peakHour: 10, interventions: 5, interactions_caught: 2, revenue: 11200, robotDispenses: 41, counselingSessions: 7, nearMisses: 0 },
];

// ─────────────────────────────────────────────
// Counters
// ─────────────────────────────────────────────
export const mockCounters: PharmacyCounter[] = [
  { id: 1, name: 'Counter 1', type: 'dispensing', staffId: 'U003', staffName: 'Sara Al-Ghamdi (PharmD)', isOpen: true, currentTicketId: 'Q001', currentPatientName: 'Ahmed Al-Rashid' },
  { id: 2, name: 'Counter 2', type: 'dispensing', staffId: 'U004', staffName: 'Khalid Mahmoud (PharmD)', isOpen: true, currentTicketId: 'Q004', currentPatientName: 'Sara Al-Malki' },
  { id: 3, name: 'Counter 3 — Counseling', type: 'counseling', staffId: 'U005', staffName: 'Nour Hashem (PharmD)', isOpen: true, currentTicketId: undefined, currentPatientName: undefined },
  { id: 4, name: 'Counter 4', type: 'dispensing', isOpen: false },
];

// ─────────────────────────────────────────────
// Inventory Transactions
// ─────────────────────────────────────────────
export const mockInventoryTransactions: InventoryTransaction[] = [
  { id: 'TRX001', inventoryItemId: 'INV001', drugName: 'Atorvastatin 20mg', type: 'dispense', quantity: -2, balanceBefore: 452, balanceAfter: 450, referenceId: 'RX-2025-001843', performedBy: 'Sara Al-Ghamdi', performedAt: new Date(Date.now() - 10 * 60000).toISOString(), lot: 'LT2024-001' },
  { id: 'TRX002', inventoryItemId: 'INV003', drugName: 'Metformin 500mg', type: 'receive', quantity: 200, balanceBefore: 320, balanceAfter: 520, referenceId: 'PO2025-0098', performedBy: 'Hessa Al-Turki', performedAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'TRX003', inventoryItemId: 'INV007', drugName: 'Losartan 50mg', type: 'dispense', quantity: -3, balanceBefore: 9, balanceAfter: 6, referenceId: 'RX-2025-001840', performedBy: 'Sara Al-Ghamdi', performedAt: new Date(Date.now() - 4 * 3600000).toISOString(), lot: 'LT2024-099' },
  { id: 'TRX004', inventoryItemId: 'INV009', drugName: 'Oxycodone 10mg CR', type: 'dispense', quantity: -5, balanceBefore: 47, balanceAfter: 42, referenceId: 'RX-2025-001835', performedBy: 'Omar Bin Saud', performedAt: new Date(Date.now() - 6 * 3600000).toISOString(), lot: 'LT2025-005', notes: 'Controlled substance — dual verification completed' },
  { id: 'TRX005', inventoryItemId: 'INV008', drugName: 'Warfarin 5mg', type: 'adjust', quantity: -30, balanceBefore: 30, balanceAfter: 0, referenceId: 'ADJ-2025-012', performedBy: 'Hessa Al-Turki', performedAt: new Date(Date.now() - 24 * 3600000).toISOString(), reason: 'Damaged on receipt — reported to supplier' },
];
