// ─── Appointments & Scheduling Types ─────────────────────────────────────────

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled'
  | 'waitlisted';

export type AppointmentPriority = 'routine' | 'urgent' | 'stat' | 'follow_up';

export type AppointmentType =
  | 'consultation'
  | 'follow_up'
  | 'procedure'
  | 'lab_review'
  | 'radiology_review'
  | 'pre_op'
  | 'post_op'
  | 'vaccination'
  | 'screening';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface AppointmentPatient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  insurance?: string;
  allergies?: string[];
}

export interface Physician {
  id: string;
  name: string;
  specialty: string;
  department: string;
  email: string;
  phone: string;
  color: string; // For calendar coding
  avatar?: string;
}

export interface Clinic {
  id: string;
  name: string;
  department: string;
  floor: string;
  room: string;
  capacity: number;
}

export interface TimeSlot {
  start: string; // HH:mm
  end: string;   // HH:mm
  available: boolean;
  blockedReason?: string;
}

export interface ScheduleBlock {
  id: string;
  physicianId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  type: 'unavailable' | 'break' | 'admin' | 'out_of_office';
  note?: string;
}

export interface Appointment {
  id: string;
  appointmentNo: string;
  patientId: string;
  patient: AppointmentPatient;
  physicianId: string;
  physician: Physician;
  clinicId: string;
  clinic: Clinic;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  duration: number; // minutes
  type: AppointmentType;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  chiefComplaint: string;
  notes?: string;
  recurrence: RecurrenceType;
  recurrenceEndDate?: string;
  parentAppointmentId?: string; // For follow-ups / recurrences
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  reminderSent: boolean;
  billingLinked: boolean;
  waitlistPosition?: number;

  // Audit trail
  auditLog: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
}

export interface QueueEntry {
  id: string;
  appointmentId: string;
  appointment: Appointment;
  physicianId: string;
  clinicId: string;
  position: number;
  arrivalTime: string;
  estimatedCallTime: string;
  status: 'waiting' | 'called' | 'in_room' | 'completed' | 'skipped';
  waitMinutes: number;
  isUrgent: boolean;
}

export interface WaitlistEntry {
  id: string;
  patient: AppointmentPatient;
  physicianId: string;
  preferredDates: string[];
  preferredTimes: string[];
  appointmentType: AppointmentType;
  priority: AppointmentPriority;
  notes?: string;
  addedAt: string;
  notified: boolean;
}

export interface AppointmentStats {
  totalToday: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  waitlisted: number;
  averageWaitMinutes: number;
  utilizationPercent: number;
  noShowRate: number;
  cancellationRate: number;
}

export interface PhysicianAvailability {
  physicianId: string;
  date: string;
  slots: TimeSlot[];
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
}

export interface AppointmentFilters {
  search: string;
  status: AppointmentStatus | 'all';
  priority: AppointmentPriority | 'all';
  physicianId: string | 'all';
  department: string | 'all';
  dateFrom: string;
  dateTo: string;
  type: AppointmentType | 'all';
}
