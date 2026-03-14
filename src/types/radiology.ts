// Radiology Module Types

export type Modality = 'CT' | 'MR' | 'XR' | 'US' | 'PET' | 'NM' | 'MG' | 'FL';
export type StudyStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Read' | 'Verified' | 'Dictated';
export type StudyPriority = 'Routine' | 'Urgent' | 'STAT';
export type ReportStatus = 'Draft' | 'Preliminary' | 'Final' | 'Addendum';
export type UserRole = 'Radiologist' | 'Technician' | 'Referring Physician' | 'Admin';

export interface RadiologyPatient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  address: string;
  allergies: string[];
  bloodType: string;
}

export interface ImageSeries {
  id: string;
  seriesNumber: number;
  description: string;
  modality: Modality;
  imageCount: number;
  sliceThickness?: string;
  bodyPart: string;
  // Simulated image color/pattern
  color: string;
  pattern: 'axial' | 'sagittal' | 'coronal' | 'scout';
}

export interface Study {
  id: string;
  accessionNumber: string;
  patientId: string;
  patient: RadiologyPatient;
  studyDate: string;
  studyTime: string;
  modality: Modality;
  description: string;
  bodyPart: string;
  status: StudyStatus;
  priority: StudyPriority;
  orderingPhysician: string;
  referringDepartment: string;
  clinicalHistory: string;
  patientLocation: string;
  readingRadiologist?: string;
  assignedTechnician?: string;
  series: ImageSeries[];
  report?: RadiologyReport;
  hasPriors: boolean;
  priorStudyIds?: string[];
  aiFindings?: AIFinding[];
  createdAt: string;
  updatedAt: string;
}

export interface RadiologyReport {
  id: string;
  studyId: string;
  status: ReportStatus;
  template?: string;
  findings: string;
  impression: string;
  recommendations?: string;
  radsScore?: RADSScore;
  criticalFindings: boolean;
  criticalFindingsNote?: string;
  signedBy?: string;
  signedAt?: string;
  draftedAt: string;
  versions: ReportVersion[];
}

export interface ReportVersion {
  id: string;
  timestamp: string;
  author: string;
  status: ReportStatus;
  findings: string;
  impression: string;
}

export interface RADSScore {
  system: 'BI-RADS' | 'PI-RADS' | 'LI-RADS' | 'NI-RADS' | 'Lung-RADS';
  score: number;
  descriptor: string;
  recommendation: string;
}

export interface AIFinding {
  id: string;
  type: 'nodule' | 'bleed' | 'fracture' | 'mass' | 'effusion' | 'atelectasis' | 'pneumonia';
  description: string;
  confidence: number;
  seriesId: string;
  sliceIndex: number;
  location: string;
  severity: 'low' | 'medium' | 'high';
  accepted?: boolean;
  rejected?: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  modality: Modality | 'ALL';
  bodyPart: string;
  category: string;
  content: {
    findings: string;
    impression: string;
  };
  radsSystem?: RADSScore['system'];
}

export interface Measurement {
  id: string;
  type: 'length' | 'angle' | 'area' | 'roi';
  value: number;
  unit: string;
  seriesId: string;
  sliceIndex: number;
  label?: string;
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
}

export interface Annotation {
  id: string;
  type: 'arrow' | 'text' | 'circle' | 'freehand';
  seriesId: string;
  sliceIndex: number;
  text?: string;
  x: number;
  y: number;
  color: string;
}

export interface ViewerLayout {
  rows: number;
  cols: number;
  label: string;
}

export interface WindowLevel {
  name: string;
  window: number;
  level: number;
}

export interface DicomNode {
  id: string;
  name: string;
  aeTitle: string;
  ip: string;
  port: number;
  modality: string;
  type: 'SCU' | 'SCP' | 'MWL' | 'Store';
  status: 'Connected' | 'Disconnected' | 'Error' | 'Testing';
  lastPing?: string;
  latencyMs?: number;
  errorMessage?: string;
}

export interface HUReading {
  id: string;
  x: number;
  y: number;
  value: number;
  min?: number;
  max?: number;
  mean?: number;
  seriesId: string;
  sliceIndex: number;
}
