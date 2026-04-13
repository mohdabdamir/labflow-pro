export type AcuityLevel = 1 | 2 | 3 | 4 | 5;

export type EDZone = 'resuscitation' | 'acute' | 'minor' | 'fast_track' | 'waiting' | 'observation';

export type EDPatientStatus =
  | 'waiting'
  | 'triage'
  | 'assigned'
  | 'in_treatment'
  | 'pending_results'
  | 'pending_disposition'
  | 'discharge_ready'
  | 'discharged'
  | 'admitted'
  | 'transferred'
  | 'left_without_being_seen';

export interface Vitals {
  id: string;
  timestamp: Date;
  hr: number;
  rr: number;
  sbp: number;
  dbp: number;
  temp: number;
  spo2: number;
  painScale: number;
  gcs?: number;
}

export interface LabResult {
  id: string;
  testName: string;
  value: number;
  unit: string;
  normalRange: string;
  isCritical: boolean;
  timestamp: Date;
}

export interface EDOrder {
  id: string;
  type: 'lab' | 'imaging' | 'medication' | 'procedure' | 'consult';
  description: string;
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  orderedBy: string;
  orderedAt: Date;
  completedAt?: Date;
  resultAcknowledged?: boolean;
  resultAcknowledgedBy?: string;
}

export interface BPAAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'sepsis_sirs' | 'critical_result' | 'wait_time_breach' | 'acuity_override';
  severity: 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  actionTaken?: string;
}

export interface TriageRecord {
  chiefComplaint: string;
  suggestedAcuity: AcuityLevel;
  assignedAcuity: AcuityLevel;
  varianceOverride: boolean;
  vitals: Vitals;
  allergies: string[];
  medications: string[];
  notes: string;
  triageNurse: string;
  timestamp: Date;
  nlpHistory?: FHIRHistoryItem[];
}

export interface FHIRHistoryItem {
  date: string;
  type: string;
  description: string;
  provider: string;
  result?: string;
}

export interface EDPatient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  dob: string;
  acuity: AcuityLevel;
  status: EDPatientStatus;
  zone: EDZone;
  bed?: string;
  arrivalTime: Date;
  triageTime?: Date;
  assignedMD?: string;
  assignedRN?: string;
  chiefComplaint: string;
  triage?: TriageRecord;
  vitals: Vitals[];
  labs: LabResult[];
  orders: EDOrder[];
  predictedDischargeScore: number; // 0-100
  hasCriticalResult: boolean;
  isPediatric: boolean;
  weight?: number;
  weightDate?: Date;
  pcp?: string;
  insuranceVerified: boolean;
  allergies: string[];
  events: EDEvent[];
}

export interface EDEvent {
  id: string;
  patientId: string;
  type: string;
  description: string;
  timestamp: Date;
  userId?: string;
  data?: Record<string, unknown>;
}

export interface HandoverTask {
  id: string;
  patientId: string;
  patientName: string;
  description: string;
  priority: 'routine' | 'urgent' | 'critical';
  status: 'pending' | 'acknowledged' | 'completed';
  createdBy: string;
  createdAt: Date;
  assignedTo?: string;
  acknowledgedAt?: Date;
  isStaleResult: boolean;
  relatedOrderId?: string;
}

export interface MCIPatient {
  id: string;
  mciTag: string; // MCI-GREEN-001, MCI-RED-002
  triageColor: 'green' | 'yellow' | 'red' | 'black';
  chiefComplaint: string;
  vitals?: Partial<Vitals>;
  registeredAt: Date;
  location?: string;
  notes: string;
}

export interface DischargeWorkflow {
  patientId: string;
  status: 'pending' | 'rx_sent' | 'followup_scheduled' | 'completed';
  prescriptionSent: boolean;
  followUpScheduled: boolean;
  followUpDate?: Date;
  followUpProvider?: string;
  pcpGapAlert: boolean;
  instructions: string;
  completedAt?: Date;
}

export interface SIRSCriteria {
  hrMet: boolean;   // HR > 90
  rrMet: boolean;   // RR > 20
  tempMet: boolean; // Temp > 38 or < 36
  wbcMet: boolean;  // WBC > 12 or < 4
  lactateMet: boolean; // Lactate > 2.0
  criteriaCount: number;
  isSIRS: boolean;  // >= 2 criteria met
}

export const ACUITY_CONFIG: Record<AcuityLevel, { label: string; color: string; bgColor: string; borderColor: string; maxWaitMinutes: number }> = {
  1: { label: 'Resuscitation', color: 'text-white', bgColor: 'bg-red-600', borderColor: 'border-red-600', maxWaitMinutes: 0 },
  2: { label: 'Emergent', color: 'text-white', bgColor: 'bg-orange-500', borderColor: 'border-orange-500', maxWaitMinutes: 15 },
  3: { label: 'Urgent', color: 'text-white', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-500', maxWaitMinutes: 30 },
  4: { label: 'Less Urgent', color: 'text-white', bgColor: 'bg-green-500', borderColor: 'border-green-500', maxWaitMinutes: 60 },
  5: { label: 'Non-Urgent', color: 'text-white', bgColor: 'bg-blue-500', borderColor: 'border-blue-500', maxWaitMinutes: 120 },
};

export const ZONE_CONFIG: Record<EDZone, { label: string; color: string }> = {
  resuscitation: { label: 'Resus', color: 'text-red-600' },
  acute: { label: 'Acute', color: 'text-orange-600' },
  minor: { label: 'Minor', color: 'text-green-600' },
  fast_track: { label: 'Fast Track', color: 'text-blue-600' },
  waiting: { label: 'Waiting', color: 'text-muted-foreground' },
  observation: { label: 'Obs', color: 'text-purple-600' },
};
