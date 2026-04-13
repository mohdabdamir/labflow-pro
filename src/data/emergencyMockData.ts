import { EDPatient, LabResult, Vitals, EDOrder, EDEvent, BPAAlert, HandoverTask } from '@/types/emergency';

const now = new Date();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000);
const hrsAgo = (h: number) => new Date(now.getTime() - h * 3600000);

let vId = 1;
const mkVitals = (hr: number, rr: number, sbp: number, dbp: number, temp: number, spo2: number, pain: number, ago: number): Vitals => ({
  id: `V${vId++}`, timestamp: minsAgo(ago), hr, rr, sbp, dbp, temp, spo2, painScale: pain,
});

let lId = 1;
const mkLab = (name: string, val: number, unit: string, range: string, crit: boolean, ago: number): LabResult => ({
  id: `L${lId++}`, testName: name, value: val, unit, normalRange: range, isCritical: crit, timestamp: minsAgo(ago),
});

let oId = 1;
const mkOrder = (type: EDOrder['type'], desc: string, status: EDOrder['status'], ago: number, completedAgo?: number): EDOrder => ({
  id: `O${oId++}`, type, description: desc, status, orderedBy: 'Dr. Martinez', orderedAt: minsAgo(ago),
  ...(completedAgo !== undefined ? { completedAt: minsAgo(completedAgo) } : {}),
});

let eId = 1;
const mkEvent = (pid: string, type: string, desc: string, ago: number): EDEvent => ({
  id: `E${eId++}`, patientId: pid, type, description: desc, timestamp: minsAgo(ago),
});

export const initialEDPatients: EDPatient[] = [
  {
    id: 'ED001', mrn: 'MRN-90001', name: 'James Wilson', age: 67, gender: 'M', dob: '1957-03-15',
    acuity: 1, status: 'in_treatment', zone: 'resuscitation', bed: 'Resus-1',
    arrivalTime: minsAgo(45), triageTime: minsAgo(42),
    assignedMD: 'Dr. Martinez', assignedRN: 'RN Sarah',
    chiefComplaint: 'Chest pain, diaphoresis, radiating to left arm',
    vitals: [mkVitals(112, 24, 88, 52, 37.2, 94, 9, 40), mkVitals(108, 22, 92, 56, 37.1, 95, 8, 15)],
    labs: [mkLab('Troponin I', 2.4, 'ng/mL', '<0.04', true, 20), mkLab('BNP', 890, 'pg/mL', '<100', true, 20)],
    orders: [mkOrder('lab', 'Troponin I (serial)', 'completed', 40, 20), mkOrder('imaging', 'Chest X-Ray', 'completed', 38, 25), mkOrder('medication', 'Aspirin 325mg PO', 'completed', 40, 39)],
    predictedDischargeScore: 5, hasCriticalResult: true, isPediatric: false,
    insuranceVerified: true, allergies: ['Penicillin'],
    events: [mkEvent('ED001', 'ARRIVAL', 'Patient arrived by EMS', 45), mkEvent('ED001', 'TRIAGE', 'ESI 1 assigned', 42), mkEvent('ED001', 'CRITICAL_LAB', 'Troponin I: 2.4 ng/mL (CRITICAL)', 20)],
  },
  {
    id: 'ED002', mrn: 'MRN-90002', name: 'Maria Santos', age: 34, gender: 'F', dob: '1990-07-22',
    acuity: 2, status: 'pending_results', zone: 'acute', bed: 'Acute-3',
    arrivalTime: minsAgo(90), triageTime: minsAgo(85),
    assignedMD: 'Dr. Chen', assignedRN: 'RN Davis',
    chiefComplaint: 'Severe abdominal pain, fever, vomiting',
    vitals: [mkVitals(98, 22, 118, 72, 38.6, 97, 8, 80), mkVitals(102, 24, 112, 68, 38.9, 96, 7, 30)],
    labs: [mkLab('WBC', 16.2, 'K/uL', '4.5-11.0', true, 35), mkLab('Lactate', 2.8, 'mmol/L', '0.5-2.0', true, 35)],
    orders: [mkOrder('lab', 'CBC + CMP', 'completed', 80, 35), mkOrder('imaging', 'CT Abdomen/Pelvis w/ contrast', 'in_progress', 60)],
    predictedDischargeScore: 15, hasCriticalResult: false, isPediatric: false,
    insuranceVerified: true, allergies: [],
    events: [mkEvent('ED002', 'ARRIVAL', 'Walk-in', 90), mkEvent('ED002', 'VITAL_ENTERED', 'Temp 38.9°C', 30)],
  },
  {
    id: 'ED003', mrn: 'MRN-90003', name: 'Robert Kim', age: 52, gender: 'M', dob: '1972-11-08',
    acuity: 3, status: 'in_treatment', zone: 'acute', bed: 'Acute-5',
    arrivalTime: hrsAgo(2), triageTime: minsAgo(110),
    assignedMD: 'Dr. Martinez', assignedRN: 'RN Johnson',
    chiefComplaint: 'Fall from ladder, right ankle deformity',
    vitals: [mkVitals(88, 18, 142, 86, 36.8, 98, 7, 100)],
    labs: [],
    orders: [mkOrder('imaging', 'X-Ray Right Ankle AP/Lat', 'completed', 100, 70), mkOrder('medication', 'Morphine 4mg IV', 'completed', 95, 93)],
    predictedDischargeScore: 65, hasCriticalResult: false, isPediatric: false,
    insuranceVerified: true, allergies: ['Codeine'],
    events: [mkEvent('ED003', 'ARRIVAL', 'Walk-in with family', 120)],
  },
  {
    id: 'ED004', mrn: 'MRN-90004', name: 'Emily Zhang', age: 4, gender: 'F', dob: '2022-01-30',
    acuity: 2, status: 'in_treatment', zone: 'acute', bed: 'Peds-1',
    arrivalTime: minsAgo(60), triageTime: minsAgo(55),
    assignedMD: 'Dr. Patel', assignedRN: 'RN Thompson',
    chiefComplaint: 'High fever, lethargy, poor feeding',
    vitals: [mkVitals(145, 32, 85, 50, 39.4, 96, 5, 50)],
    labs: [mkLab('WBC', 18.5, 'K/uL', '5.0-15.0', true, 25)],
    orders: [mkOrder('lab', 'CBC + Blood Culture', 'completed', 50, 25), mkOrder('medication', 'Acetaminophen 60mg PO', 'completed', 48, 46)],
    predictedDischargeScore: 20, hasCriticalResult: false, isPediatric: true,
    weight: 16.2, weightDate: minsAgo(55),
    insuranceVerified: true, allergies: [],
    events: [mkEvent('ED004', 'ARRIVAL', 'Brought by parents', 60)],
  },
  {
    id: 'ED005', mrn: 'MRN-90005', name: 'Thomas Brown', age: 78, gender: 'M', dob: '1946-05-12',
    acuity: 2, status: 'pending_results', zone: 'acute', bed: 'Acute-2',
    arrivalTime: hrsAgo(3), triageTime: minsAgo(170),
    assignedMD: 'Dr. Chen', assignedRN: 'RN Sarah',
    chiefComplaint: 'Acute onset confusion, slurred speech',
    vitals: [mkVitals(92, 20, 178, 95, 37.0, 97, 0, 165), mkVitals(88, 18, 165, 88, 36.9, 98, 0, 60)],
    labs: [mkLab('Glucose', 245, 'mg/dL', '70-100', true, 140), mkLab('INR', 1.1, '', '0.8-1.2', false, 140)],
    orders: [mkOrder('imaging', 'CT Head w/o contrast', 'completed', 165, 130), mkOrder('imaging', 'CT Angiography Head/Neck', 'in_progress', 90)],
    predictedDischargeScore: 8, hasCriticalResult: false, isPediatric: false,
    insuranceVerified: true, allergies: ['Sulfa drugs'],
    events: [mkEvent('ED005', 'ARRIVAL', 'EMS stroke alert', 180)],
  },
  {
    id: 'ED006', mrn: 'MRN-90006', name: 'Linda Okafor', age: 29, gender: 'F', dob: '1995-09-03',
    acuity: 4, status: 'waiting', zone: 'waiting',
    arrivalTime: minsAgo(25), triageTime: minsAgo(20),
    chiefComplaint: 'Sore throat, mild fever x2 days',
    vitals: [mkVitals(78, 16, 118, 74, 37.8, 99, 3, 20)],
    labs: [], orders: [],
    predictedDischargeScore: 90, hasCriticalResult: false, isPediatric: false,
    insuranceVerified: false, allergies: [],
    events: [mkEvent('ED006', 'ARRIVAL', 'Walk-in', 25)],
  },
  {
    id: 'ED007', mrn: 'MRN-90007', name: 'David Nguyen', age: 45, gender: 'M', dob: '1979-12-18',
    acuity: 3, status: 'in_treatment', zone: 'minor', bed: 'Minor-2',
    arrivalTime: hrsAgo(1.5), triageTime: minsAgo(85),
    assignedMD: 'Dr. Patel', assignedRN: 'RN Davis',
    chiefComplaint: 'Laceration right forearm, glass injury',
    vitals: [mkVitals(82, 16, 128, 78, 36.7, 99, 5, 80)],
    labs: [], orders: [mkOrder('procedure', 'Wound repair - sutures', 'in_progress', 40)],
    predictedDischargeScore: 80, hasCriticalResult: false, isPediatric: false,
    insuranceVerified: true, allergies: ['Latex'],
    events: [mkEvent('ED007', 'ARRIVAL', 'Walk-in', 90)],
  },
  {
    id: 'ED008', mrn: 'MRN-90008', name: 'Sarah Mitchell', age: 62, gender: 'F', dob: '1962-06-27',
    acuity: 3, status: 'pending_disposition', zone: 'observation', bed: 'Obs-1',
    arrivalTime: hrsAgo(5), triageTime: minsAgo(295),
    assignedMD: 'Dr. Martinez', assignedRN: 'RN Johnson',
    chiefComplaint: 'Syncope, brief LOC at home',
    vitals: [mkVitals(72, 16, 132, 80, 36.6, 98, 1, 290), mkVitals(68, 14, 128, 76, 36.5, 99, 0, 60)],
    labs: [mkLab('Troponin I', 0.02, 'ng/mL', '<0.04', false, 240), mkLab('Hemoglobin', 10.2, 'g/dL', '12.0-16.0', false, 240)],
    orders: [mkOrder('imaging', 'CT Head', 'completed', 280, 240), mkOrder('lab', 'Serial Troponin', 'completed', 280, 120)],
    predictedDischargeScore: 70, hasCriticalResult: false, isPediatric: false,
    insuranceVerified: true, allergies: [],
    events: [mkEvent('ED008', 'ARRIVAL', 'EMS transport', 300)],
  },
  {
    id: 'ED009', mrn: 'MRN-90009', name: 'Ahmed Hassan', age: 38, gender: 'M', dob: '1986-04-11',
    acuity: 5, status: 'waiting', zone: 'fast_track',
    arrivalTime: minsAgo(15),
    chiefComplaint: 'Prescription refill, ran out of BP meds',
    vitals: [mkVitals(74, 14, 148, 92, 36.6, 99, 0, 12)],
    labs: [], orders: [],
    predictedDischargeScore: 95, hasCriticalResult: false, isPediatric: false,
    insuranceVerified: true, allergies: [],
    events: [mkEvent('ED009', 'ARRIVAL', 'Walk-in', 15)],
  },
  {
    id: 'ED010', mrn: 'MRN-90010', name: 'Jessica Park', age: 8, gender: 'F', dob: '2016-08-19',
    acuity: 3, status: 'in_treatment', zone: 'acute', bed: 'Peds-2',
    arrivalTime: minsAgo(75), triageTime: minsAgo(70),
    assignedMD: 'Dr. Patel', assignedRN: 'RN Thompson',
    chiefComplaint: 'Asthma exacerbation, difficulty breathing',
    vitals: [mkVitals(118, 28, 100, 62, 37.1, 92, 4, 65), mkVitals(105, 22, 102, 64, 37.0, 96, 2, 20)],
    labs: [], orders: [mkOrder('medication', 'Albuterol nebulizer x3', 'in_progress', 65)],
    predictedDischargeScore: 55, hasCriticalResult: false, isPediatric: true,
    weight: 28.5, weightDate: minsAgo(70),
    insuranceVerified: true, allergies: [],
    events: [mkEvent('ED010', 'ARRIVAL', 'Brought by mother', 75)],
  },
  {
    id: 'ED011', mrn: 'MRN-90011', name: 'Carlos Reyes', age: 55, gender: 'M', dob: '1969-02-28',
    acuity: 2, status: 'in_treatment', zone: 'resuscitation', bed: 'Resus-2',
    arrivalTime: minsAgo(20), triageTime: minsAgo(18),
    assignedMD: 'Dr. Martinez', assignedRN: 'RN Davis',
    chiefComplaint: 'GI bleed, hematemesis, hemodynamically unstable',
    vitals: [mkVitals(118, 26, 82, 48, 36.4, 95, 6, 15)],
    labs: [mkLab('Hemoglobin', 6.8, 'g/dL', '13.5-17.5', true, 10)],
    orders: [mkOrder('lab', 'Type & Cross 4 units PRBC', 'in_progress', 18), mkOrder('medication', 'Pantoprazole 80mg IV bolus', 'completed', 17, 15)],
    predictedDischargeScore: 3, hasCriticalResult: true, isPediatric: false,
    insuranceVerified: false, allergies: ['Aspirin'],
    events: [mkEvent('ED011', 'ARRIVAL', 'EMS, actively vomiting blood', 20), mkEvent('ED011', 'CRITICAL_LAB', 'Hgb 6.8 (CRITICAL)', 10)],
  },
  {
    id: 'ED012', mrn: 'MRN-90012', name: 'Patricia Lawson', age: 71, gender: 'F', dob: '1953-10-05',
    acuity: 3, status: 'discharge_ready', zone: 'minor', bed: 'Minor-4',
    arrivalTime: hrsAgo(4), triageTime: minsAgo(235),
    assignedMD: 'Dr. Chen', assignedRN: 'RN Johnson',
    chiefComplaint: 'UTI, dysuria, mild confusion',
    vitals: [mkVitals(84, 18, 138, 82, 37.6, 98, 3, 230), mkVitals(78, 16, 132, 78, 37.2, 99, 1, 30)],
    labs: [mkLab('WBC', 13.5, 'K/uL', '4.5-11.0', false, 180), mkLab('Urinalysis', 1, '', 'Negative', false, 180)],
    orders: [mkOrder('medication', 'Ciprofloxacin 500mg PO', 'completed', 120, 118)],
    predictedDischargeScore: 92, hasCriticalResult: false, isPediatric: false,
    pcp: 'Dr. Williams', insuranceVerified: true, allergies: ['Amoxicillin'],
    events: [mkEvent('ED012', 'ARRIVAL', 'Walk-in with daughter', 240)],
  },
];

export const initialBPAAlerts: BPAAlert[] = [
  {
    id: 'BPA001', patientId: 'ED002', patientName: 'Maria Santos',
    type: 'sepsis_sirs', severity: 'critical',
    title: '⚠️ SIRS Alert — Sepsis Screening Required',
    message: 'HR 102, RR 24, Temp 38.9°C, WBC 16.2, Lactate 2.8. 5/5 SIRS criteria met. Consider Sepsis Bundle.',
    timestamp: minsAgo(28), acknowledged: false,
  },
  {
    id: 'BPA002', patientId: 'ED001', patientName: 'James Wilson',
    type: 'critical_result', severity: 'critical',
    title: '🔴 Critical Lab Result',
    message: 'Troponin I: 2.4 ng/mL (Critical High). Immediate physician review required.',
    timestamp: minsAgo(20), acknowledged: true, acknowledgedBy: 'Dr. Martinez', actionTaken: 'Cardiology consult ordered',
  },
];

export const initialHandoverTasks: HandoverTask[] = [
  {
    id: 'HT001', patientId: 'ED005', patientName: 'Thomas Brown',
    description: 'CTA Head/Neck ordered at 06:45 — result expected. Ensure stroke protocol follow-through.',
    priority: 'critical', status: 'pending',
    createdBy: 'Dr. Night (outgoing)', createdAt: minsAgo(30),
    isStaleResult: true, relatedOrderId: 'O10',
  },
  {
    id: 'HT002', patientId: 'ED008', patientName: 'Sarah Mitchell',
    description: 'Awaiting cardiology consult for disposition. Serial troponins negative.',
    priority: 'routine', status: 'pending',
    createdBy: 'Dr. Night (outgoing)', createdAt: minsAgo(30),
    isStaleResult: false,
  },
];

export const ED_PHYSICIANS = ['Dr. Martinez', 'Dr. Chen', 'Dr. Patel'];
export const ED_NURSES = ['RN Sarah', 'RN Davis', 'RN Johnson', 'RN Thompson'];
