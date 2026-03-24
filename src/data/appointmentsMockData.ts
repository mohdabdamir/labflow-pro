import type {
  Appointment, AppointmentPatient, Physician, Clinic,
  QueueEntry, WaitlistEntry, ScheduleBlock
} from '@/types/appointments';
import { addDays, format, subDays } from 'date-fns';

const TODAY = format(new Date(), 'yyyy-MM-dd');
const YESTERDAY = format(subDays(new Date(), 1), 'yyyy-MM-dd');
const TOMORROW = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const DAY2 = format(addDays(new Date(), 2), 'yyyy-MM-dd');
const DAY3 = format(addDays(new Date(), 3), 'yyyy-MM-dd');
const DAY4 = format(addDays(new Date(), 4), 'yyyy-MM-dd');
const DAY5 = format(addDays(new Date(), 5), 'yyyy-MM-dd');

// ── Physicians ────────────────────────────────────────────────────────────────
export const MOCK_PHYSICIANS: Physician[] = [
  {
    id: 'PHY001', name: 'Dr. Sarah Mitchell', specialty: 'General Medicine',
    department: 'Internal Medicine', email: 'smitchell@medicenter.com',
    phone: '+1-555-0101', color: '#3b82f6',
  },
  {
    id: 'PHY002', name: 'Dr. James Hartwell', specialty: 'Cardiology',
    department: 'Cardiology', email: 'jhartwell@medicenter.com',
    phone: '+1-555-0102', color: '#ef4444',
  },
  {
    id: 'PHY003', name: 'Dr. Aisha Patel', specialty: 'Endocrinology',
    department: 'Endocrinology', email: 'apatel@medicenter.com',
    phone: '+1-555-0103', color: '#8b5cf6',
  },
  {
    id: 'PHY004', name: 'Dr. Robert Chen', specialty: 'Orthopedics',
    department: 'Orthopedics', email: 'rchen@medicenter.com',
    phone: '+1-555-0104', color: '#10b981',
  },
  {
    id: 'PHY005', name: 'Dr. Laura Gomez', specialty: 'Pediatrics',
    department: 'Pediatrics', email: 'lgomez@medicenter.com',
    phone: '+1-555-0105', color: '#f59e0b',
  },
  {
    id: 'PHY006', name: 'Dr. Khalid Mansour', specialty: 'Neurology',
    department: 'Neurology', email: 'kmansour@medicenter.com',
    phone: '+1-555-0106', color: '#06b6d4',
  },
];

// ── Clinics ───────────────────────────────────────────────────────────────────
export const MOCK_CLINICS: Clinic[] = [
  { id: 'CLN001', name: 'General OPD - Room 1', department: 'Internal Medicine', floor: '1', room: '101', capacity: 20 },
  { id: 'CLN002', name: 'Cardiac Clinic', department: 'Cardiology', floor: '2', room: '205', capacity: 15 },
  { id: 'CLN003', name: 'Endocrinology Clinic', department: 'Endocrinology', floor: '2', room: '210', capacity: 15 },
  { id: 'CLN004', name: 'Orthopedics Clinic', department: 'Orthopedics', floor: '3', room: '301', capacity: 18 },
  { id: 'CLN005', name: 'Pediatric Clinic', department: 'Pediatrics', floor: '1', room: '115', capacity: 25 },
  { id: 'CLN006', name: 'Neurology Clinic', department: 'Neurology', floor: '4', room: '401', capacity: 12 },
];

// ── Patients ──────────────────────────────────────────────────────────────────
const MOCK_PATIENTS: AppointmentPatient[] = [
  { id: 'PAT001', mrn: 'MRN-10001', firstName: 'Emma', lastName: 'Thompson', dob: '1985-06-15', gender: 'F', phone: '+1-555-1001', email: 'emma.t@email.com', insurance: 'BlueCross', allergies: ['Penicillin'] },
  { id: 'PAT002', mrn: 'MRN-10002', firstName: 'Michael', lastName: 'Harrison', dob: '1962-03-22', gender: 'M', phone: '+1-555-1002', email: 'm.harrison@email.com', insurance: 'Aetna' },
  { id: 'PAT003', mrn: 'MRN-10003', firstName: 'Sophia', lastName: 'Al-Rashid', dob: '1990-11-08', gender: 'F', phone: '+1-555-1003', email: 'sophia.ar@email.com', insurance: 'UnitedHealth' },
  { id: 'PAT004', mrn: 'MRN-10004', firstName: 'David', lastName: 'Nguyen', dob: '1955-07-30', gender: 'M', phone: '+1-555-1004', email: 'd.nguyen@email.com', insurance: 'Medicare', allergies: ['Sulfa', 'Aspirin'] },
  { id: 'PAT005', mrn: 'MRN-10005', firstName: 'Olivia', lastName: 'Fernandez', dob: '2018-01-12', gender: 'F', phone: '+1-555-1005', email: 'o.fern@email.com', insurance: 'Cigna' },
  { id: 'PAT006', mrn: 'MRN-10006', firstName: 'James', lastName: 'O\'Brien', dob: '1948-09-03', gender: 'M', phone: '+1-555-1006', email: 'j.obrien@email.com', insurance: 'Medicare' },
  { id: 'PAT007', mrn: 'MRN-10007', firstName: 'Amira', lastName: 'Hassan', dob: '1978-04-17', gender: 'F', phone: '+1-555-1007', email: 'a.hassan@email.com', insurance: 'BlueCross' },
  { id: 'PAT008', mrn: 'MRN-10008', firstName: 'Thomas', lastName: 'Walker', dob: '1970-12-05', gender: 'M', phone: '+1-555-1008', email: 't.walker@email.com' },
  { id: 'PAT009', mrn: 'MRN-10009', firstName: 'Fatima', lastName: 'Al-Zahra', dob: '1995-08-20', gender: 'F', phone: '+1-555-1009', email: 'f.alzahra@email.com', insurance: 'Aetna' },
  { id: 'PAT010', mrn: 'MRN-10010', firstName: 'Carlos', lastName: 'Rivera', dob: '1982-05-28', gender: 'M', phone: '+1-555-1010', email: 'c.rivera@email.com', insurance: 'UnitedHealth' },
  { id: 'PAT011', mrn: 'MRN-10011', firstName: 'Priya', lastName: 'Sharma', dob: '1988-02-14', gender: 'F', phone: '+1-555-1011', email: 'p.sharma@email.com', insurance: 'BlueCross' },
  { id: 'PAT012', mrn: 'MRN-10012', firstName: 'William', lastName: 'Jackson', dob: '1940-10-19', gender: 'M', phone: '+1-555-1012', email: 'w.jackson@email.com', insurance: 'Medicare', allergies: ['Codeine'] },
  { id: 'PAT013', mrn: 'MRN-10013', firstName: 'Nora', lastName: 'Eriksson', dob: '1993-07-07', gender: 'F', phone: '+1-555-1013', email: 'n.eriksson@email.com', insurance: 'Cigna' },
  { id: 'PAT014', mrn: 'MRN-10014', firstName: 'Ahmed', lastName: 'Khalil', dob: '1967-03-11', gender: 'M', phone: '+1-555-1014', email: 'a.khalil@email.com' },
  { id: 'PAT015', mrn: 'MRN-10015', firstName: 'Grace', lastName: 'Lin', dob: '2015-09-25', gender: 'F', phone: '+1-555-1015', email: 'g.lin@email.com', insurance: 'Aetna' },
];

// ── Helper ─────────────────────────────────────────────────────────────────────
function makeApt(
  id: string, no: string, patIdx: number, phyIdx: number, clnIdx: number,
  date: string, start: string, end: string, duration: number,
  type: Appointment['type'], status: Appointment['status'],
  priority: Appointment['priority'], complaint: string,
  notes?: string
): Appointment {
  const patient = MOCK_PATIENTS[patIdx];
  const physician = MOCK_PHYSICIANS[phyIdx];
  const clinic = MOCK_CLINICS[clnIdx];
  return {
    id, appointmentNo: no,
    patientId: patient.id, patient,
    physicianId: physician.id, physician,
    clinicId: clinic.id, clinic,
    date, startTime: start, endTime: end, duration,
    type, status, priority, chiefComplaint: complaint, notes,
    recurrence: 'none', createdBy: 'REC001',
    createdAt: `${YESTERDAY}T08:00:00`, updatedAt: `${TODAY}T07:00:00`,
    reminderSent: status !== 'scheduled', billingLinked: status === 'completed',
    auditLog: [
      {
        id: `AUD-${id}-1`, timestamp: `${YESTERDAY}T08:00:00`,
        action: 'Appointment Created', performedBy: 'Front Desk - Reception',
      },
    ],
  };
}

// ── Appointments ──────────────────────────────────────────────────────────────
export const MOCK_APPOINTMENTS: Appointment[] = [
  // Today's appointments
  makeApt('APT001','APT-20240001',0,0,0, TODAY,'08:00','08:30',30,'consultation','checked_in','routine','Annual checkup and blood pressure review'),
  makeApt('APT002','APT-20240002',1,1,1, TODAY,'08:30','09:00',30,'consultation','in_progress','urgent','Chest pain and shortness of breath','Patient reports chest tightness since yesterday'),
  makeApt('APT003','APT-20240003',2,2,2, TODAY,'09:00','09:30',30,'follow_up','scheduled','routine','Diabetes follow-up — HbA1c review'),
  makeApt('APT004','APT-20240004',3,3,3, TODAY,'09:30','10:30',60,'procedure','confirmed','routine','Right knee arthroscopy pre-op evaluation'),
  makeApt('APT005','APT-20240005',4,4,4, TODAY,'10:00','10:30',30,'consultation','scheduled','routine','6-month well-child visit'),
  makeApt('APT006','APT-20240006',5,5,5, TODAY,'10:30','11:00',30,'consultation','scheduled','stat','Severe headache and visual disturbances'),
  makeApt('APT007','APT-20240007',6,0,0, TODAY,'11:00','11:30',30,'lab_review','completed','routine','Review lab results — CBC and metabolic panel'),
  makeApt('APT008','APT-20240008',7,1,1, TODAY,'11:30','12:00',30,'consultation','no_show','routine','Palpitations and mild fatigue'),
  makeApt('APT009','APT-20240009',8,2,2, TODAY,'13:00','13:30',30,'follow_up','scheduled','routine','Thyroid medication adjustment'),
  makeApt('APT010','APT-20240010',9,3,3, TODAY,'13:30','14:00',30,'post_op','confirmed','follow_up','Post-surgery wound check — left shoulder'),
  makeApt('APT011','APT-20240011',10,4,4, TODAY,'14:00','14:30',30,'vaccination','scheduled','routine','MMR booster — 12 months'),
  makeApt('APT012','APT-20240012',11,5,5, TODAY,'14:30','15:30',60,'consultation','scheduled','urgent','Memory loss and confusion episodes','Reported by family caregiver'),
  makeApt('APT013','APT-20240013',12,0,0, TODAY,'15:30','16:00',30,'screening','completed','routine','Colorectal cancer screening referral'),
  makeApt('APT014','APT-20240014',13,1,1, TODAY,'16:00','16:30',30,'radiology_review','scheduled','routine','Echo results discussion'),
  makeApt('APT015','APT-20240015',14,4,4, TODAY,'16:30','17:00',30,'consultation','scheduled','routine','Fever and ear infection'),

  // Tomorrow
  makeApt('APT016','APT-20240016',0,0,0, TOMORROW,'08:00','08:30',30,'follow_up','scheduled','follow_up','Follow-up on hypertension treatment'),
  makeApt('APT017','APT-20240017',1,1,1, TOMORROW,'09:00','09:30',30,'consultation','confirmed','urgent','Worsening chest pain'),
  makeApt('APT018','APT-20240018',3,2,2, TOMORROW,'10:00','10:30',30,'consultation','scheduled','routine','New patient — type 2 diabetes'),
  makeApt('APT019','APT-20240019',6,3,3, TOMORROW,'11:00','12:00',60,'procedure','confirmed','routine','Knee steroid injection'),
  makeApt('APT020','APT-20240020',9,4,4, TOMORROW,'14:00','14:30',30,'follow_up','scheduled','routine','Growth chart review — 18 months'),

  // Day after tomorrow
  makeApt('APT021','APT-20240021',2,5,5, DAY2,'09:00','09:30',30,'consultation','scheduled','routine','Migraine management'),
  makeApt('APT022','APT-20240022',5,0,0, DAY2,'10:00','10:30',30,'lab_review','scheduled','routine','Thyroid function test results'),
  makeApt('APT023','APT-20240023',7,1,1, DAY2,'11:00','11:30',30,'pre_op','confirmed','routine','CABG pre-operative assessment'),
  makeApt('APT024','APT-20240024',10,2,2, DAY2,'13:00','13:30',30,'follow_up','scheduled','routine','Blood sugar log review'),
  makeApt('APT025','APT-20240025',12,3,3, DAY2,'14:00','14:30',30,'post_op','scheduled','follow_up','Spinal surgery recovery assessment'),

  // Future days
  makeApt('APT026','APT-20240026',4,4,4, DAY3,'09:00','09:30',30,'vaccination','scheduled','routine','5-year booster shots'),
  makeApt('APT027','APT-20240027',8,5,5, DAY3,'10:30','11:00',30,'consultation','scheduled','routine','Peripheral neuropathy assessment'),
  makeApt('APT028','APT-20240028',11,0,0, DAY4,'08:30','09:00',30,'consultation','scheduled','routine','Chest X-ray results review'),
  makeApt('APT029','APT-20240029',13,1,1, DAY4,'10:00','10:30',30,'follow_up','confirmed','follow_up','Atrial fibrillation management'),
  makeApt('APT030','APT-20240030',14,2,2, DAY5,'09:00','09:30',30,'screening','scheduled','routine','Annual diabetes screening'),

  // Yesterday (completed/cancelled)
  makeApt('APT031','APT-20230031',0,0,0, YESTERDAY,'09:00','09:30',30,'consultation','completed','routine','Sinusitis follow-up'),
  makeApt('APT032','APT-20230032',1,1,1, YESTERDAY,'10:00','10:30',30,'consultation','cancelled','routine','Routine cardiac check'),
  makeApt('APT033','APT-20230033',2,2,2, YESTERDAY,'11:00','11:30',30,'follow_up','completed','follow_up','Insulin dosing review'),
  makeApt('APT034','APT-20230034',3,3,3, YESTERDAY,'14:00','14:30',30,'post_op','completed','routine','Hip replacement recovery check'),
];

// Enrich APT002 with completed audit entries since it's in_progress
MOCK_APPOINTMENTS[1].auditLog.push(
  { id: 'AUD-APT002-2', timestamp: `${TODAY}T08:25:00`, action: 'Status Updated', performedBy: 'Nurse Station', details: 'Marked as In Progress' },
);
MOCK_APPOINTMENTS[0].checkedInAt = `${TODAY}T07:55:00`;
MOCK_APPOINTMENTS[0].confirmedAt = `${YESTERDAY}T15:00:00`;
MOCK_APPOINTMENTS[6].completedAt = `${TODAY}T11:25:00`;

// ── Queue Entries (Today) ─────────────────────────────────────────────────────
export const MOCK_QUEUE: QueueEntry[] = [
  {
    id: 'Q001', appointmentId: 'APT001', appointment: MOCK_APPOINTMENTS[0],
    physicianId: 'PHY001', clinicId: 'CLN001', position: 1,
    arrivalTime: `${TODAY}T07:55:00`, estimatedCallTime: `${TODAY}T08:05:00`,
    status: 'in_room', waitMinutes: 0, isUrgent: false,
  },
  {
    id: 'Q002', appointmentId: 'APT002', appointment: MOCK_APPOINTMENTS[1],
    physicianId: 'PHY002', clinicId: 'CLN002', position: 1,
    arrivalTime: `${TODAY}T08:20:00`, estimatedCallTime: `${TODAY}T08:30:00`,
    status: 'in_room', waitMinutes: 0, isUrgent: true,
  },
  {
    id: 'Q003', appointmentId: 'APT003', appointment: MOCK_APPOINTMENTS[2],
    physicianId: 'PHY003', clinicId: 'CLN003', position: 1,
    arrivalTime: `${TODAY}T08:50:00`, estimatedCallTime: `${TODAY}T09:00:00`,
    status: 'waiting', waitMinutes: 12, isUrgent: false,
  },
  {
    id: 'Q004', appointmentId: 'APT004', appointment: MOCK_APPOINTMENTS[3],
    physicianId: 'PHY004', clinicId: 'CLN004', position: 1,
    arrivalTime: `${TODAY}T09:20:00`, estimatedCallTime: `${TODAY}T09:30:00`,
    status: 'waiting', waitMinutes: 8, isUrgent: false,
  },
  {
    id: 'Q005', appointmentId: 'APT006', appointment: MOCK_APPOINTMENTS[5],
    physicianId: 'PHY006', clinicId: 'CLN006', position: 1,
    arrivalTime: `${TODAY}T10:15:00`, estimatedCallTime: `${TODAY}T10:20:00`,
    status: 'called', waitMinutes: 5, isUrgent: true,
  },
];

// ── Waitlist ──────────────────────────────────────────────────────────────────
export const MOCK_WAITLIST: WaitlistEntry[] = [
  {
    id: 'WL001', patient: MOCK_PATIENTS[1], physicianId: 'PHY001',
    preferredDates: [DAY2, DAY3], preferredTimes: ['09:00', '10:00', '11:00'],
    appointmentType: 'consultation', priority: 'routine',
    notes: 'Flexible — available mornings', addedAt: `${TODAY}T09:00:00`, notified: false,
  },
  {
    id: 'WL002', patient: MOCK_PATIENTS[7], physicianId: 'PHY002',
    preferredDates: [TOMORROW], preferredTimes: ['14:00', '15:00'],
    appointmentType: 'consultation', priority: 'urgent',
    notes: 'Referred by ER — needs prompt evaluation', addedAt: `${TODAY}T10:30:00`, notified: true,
  },
  {
    id: 'WL003', patient: MOCK_PATIENTS[11], physicianId: 'PHY005',
    preferredDates: [DAY2, DAY3, DAY4], preferredTimes: ['10:00', '11:00'],
    appointmentType: 'follow_up', priority: 'follow_up',
    addedAt: `${YESTERDAY}T14:00:00`, notified: false,
  },
];

// ── Schedule Blocks ───────────────────────────────────────────────────────────
export const MOCK_SCHEDULE_BLOCKS: ScheduleBlock[] = [
  { id: 'BLK001', physicianId: 'PHY001', date: TODAY, startTime: '12:00', endTime: '13:00', type: 'break', note: 'Lunch break' },
  { id: 'BLK002', physicianId: 'PHY001', date: TOMORROW, startTime: '12:00', endTime: '13:00', type: 'break', note: 'Lunch break' },
  { id: 'BLK003', physicianId: 'PHY002', date: TODAY, startTime: '12:00', endTime: '13:30', type: 'break', note: 'Lunch + admin time' },
  { id: 'BLK004', physicianId: 'PHY003', date: DAY2, startTime: '14:00', endTime: '17:00', type: 'out_of_office', note: 'Conference attendance' },
  { id: 'BLK005', physicianId: 'PHY004', date: TODAY, startTime: '12:00', endTime: '13:00', type: 'break', note: 'Lunch break' },
  { id: 'BLK006', physicianId: 'PHY005', date: TOMORROW, startTime: '08:00', endTime: '10:00', type: 'admin', note: 'Administration duties' },
  { id: 'BLK007', physicianId: 'PHY006', date: DAY3, startTime: '15:00', endTime: '17:00', type: 'unavailable', note: 'Grand rounds' },
];
