import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppointmentsData } from '@/hooks/useAppointmentsData';
import { cn } from '@/lib/utils';
import type { Appointment, AppointmentPatient } from '@/types/appointments';

const MOCK_PATIENTS: AppointmentPatient[] = [
  { id: 'PAT001', mrn: 'MRN-10001', firstName: 'Emma', lastName: 'Thompson', dob: '1985-06-15', gender: 'F', phone: '+1-555-1001', email: 'emma.t@email.com', insurance: 'BlueCross', allergies: ['Penicillin'] },
  { id: 'PAT002', mrn: 'MRN-10002', firstName: 'Michael', lastName: 'Harrison', dob: '1962-03-22', gender: 'M', phone: '+1-555-1002', email: 'm.harrison@email.com', insurance: 'Aetna' },
  { id: 'PAT003', mrn: 'MRN-10003', firstName: 'Sophia', lastName: 'Al-Rashid', dob: '1990-11-08', gender: 'F', phone: '+1-555-1003', email: 'sophia.ar@email.com', insurance: 'UnitedHealth' },
  { id: 'PAT004', mrn: 'MRN-10004', firstName: 'David', lastName: 'Nguyen', dob: '1955-07-30', gender: 'M', phone: '+1-555-1004', email: 'd.nguyen@email.com', insurance: 'Medicare', allergies: ['Sulfa'] },
  { id: 'PAT005', mrn: 'MRN-10005', firstName: 'Olivia', lastName: 'Fernandez', dob: '2018-01-12', gender: 'F', phone: '+1-555-1005', email: 'o.fern@email.com', insurance: 'Cigna' },
  { id: 'PAT006', mrn: 'MRN-10006', firstName: 'James', lastName: 'O\'Brien', dob: '1948-09-03', gender: 'M', phone: '+1-555-1006', email: 'j.obrien@email.com', insurance: 'Medicare' },
  { id: 'PAT007', mrn: 'MRN-10007', firstName: 'Amira', lastName: 'Hassan', dob: '1978-04-17', gender: 'F', phone: '+1-555-1007', email: 'a.hassan@email.com', insurance: 'BlueCross' },
  { id: 'PAT008', mrn: 'MRN-10008', firstName: 'Thomas', lastName: 'Walker', dob: '1970-12-05', gender: 'M', phone: '+1-555-1008', email: 't.walker@email.com' },
  { id: 'PAT009', mrn: 'MRN-10009', firstName: 'Fatima', lastName: 'Al-Zahra', dob: '1995-08-20', gender: 'F', phone: '+1-555-1009', email: 'f.alzahra@email.com', insurance: 'Aetna' },
  { id: 'PAT010', mrn: 'MRN-10010', firstName: 'Carlos', lastName: 'Rivera', dob: '1982-05-28', gender: 'M', phone: '+1-555-1010', email: 'c.rivera@email.com', insurance: 'UnitedHealth' },
];

const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'lab_review', label: 'Lab Review' },
  { value: 'radiology_review', label: 'Radiology Review' },
  { value: 'pre_op', label: 'Pre-operative' },
  { value: 'post_op', label: 'Post-operative' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'screening', label: 'Screening' },
];

const PRIORITIES = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'stat', label: 'STAT' },
  { value: 'follow_up', label: 'Follow-up' },
];

const DURATIONS = [15, 20, 30, 45, 60, 90, 120];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Appointment>) => Appointment;
  defaultDate?: string;
}

export function BookAppointmentDialog({ open, onClose, onSave, defaultDate }: Props) {
  const { physicians, clinics } = useAppointmentsData();
  const [step, setStep] = useState(1);
  const [patientId, setPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [physicianId, setPhysicianId] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [date, setDate] = useState(defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState('consultation');
  const [priority, setPriority] = useState('routine');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState('none');

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === patientId);
  const filteredPatients = MOCK_PATIENTS.filter(p =>
    !patientSearch ||
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.mrn.toLowerCase().includes(patientSearch.toLowerCase())
  );

  function endTime() {
    const [h, m] = startTime.split(':').map(Number);
    const total = h * 60 + m + duration;
    return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
  }

  function handleSave() {
    if (!patientId || !physicianId || !clinicId || !chiefComplaint) return;
    const patient = MOCK_PATIENTS.find(p => p.id === patientId)!;
    onSave({
      patientId, patient,
      physicianId, clinicId,
      date, startTime, endTime: endTime(), duration,
      type: type as Appointment['type'],
      priority: priority as Appointment['priority'],
      chiefComplaint, notes,
      recurrence: recurrence as Appointment['recurrence'],
    });
    handleClose();
  }

  function handleClose() {
    setStep(1); setPatientId(''); setPatientSearch('');
    setPhysicianId(''); setClinicId(''); setChiefComplaint(''); setNotes('');
    onClose();
  }

  const canProceed = step === 1
    ? !!patientId
    : step === 2
    ? !!physicianId && !!clinicId && !!date && !!startTime
    : !!chiefComplaint;

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex gap-2 my-2">
          {['Patient', 'Schedule', 'Details'].map((label, i) => (
            <div key={label} className={cn(
              'flex-1 text-center text-xs py-1.5 rounded-md font-medium transition-colors',
              step === i + 1 ? 'bg-rose-500 text-white' :
              step > i + 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
              'bg-muted text-muted-foreground'
            )}>
              {i + 1}. {label}
            </div>
          ))}
        </div>

        {/* Step 1 — Patient Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Search Patient</Label>
              <Input
                className="mt-1.5 h-9 text-sm"
                placeholder="Name or MRN..."
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto rounded-lg border border-border">
              {filteredPatients.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPatientId(p.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0',
                    patientId === p.id && 'bg-rose-50 dark:bg-rose-950/20'
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-muted-foreground">{p.mrn} · {p.gender === 'M' ? 'Male' : 'Female'} · DOB {p.dob}</p>
                  </div>
                  {p.allergies && p.allergies.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium shrink-0">⚠ Allergy</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Schedule */}
        {step === 2 && (
          <div className="space-y-4">
            {selectedPatient && (
              <div className="bg-muted/40 rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </div>
                <span className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                <span className="text-muted-foreground text-xs">· {selectedPatient.mrn}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Physician *</Label>
                <Select value={physicianId} onValueChange={v => { setPhysicianId(v); setClinicId(''); }}>
                  <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue placeholder="Select physician..." /></SelectTrigger>
                  <SelectContent>
                    {physicians.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Clinic *</Label>
                <Select value={clinicId} onValueChange={setClinicId}>
                  <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue placeholder="Select clinic..." /></SelectTrigger>
                  <SelectContent>
                    {clinics.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Date *</Label>
                <Input type="date" className="mt-1.5 h-9 text-xs" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Start Time *</Label>
                <Input type="time" className="mt-1.5 h-9 text-xs" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Duration</Label>
                <Select value={String(duration)} onValueChange={v => setDuration(Number(v))}>
                  <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map(d => <SelectItem key={d} value={String(d)} className="text-xs">{d} minutes</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Recurrence</Label>
                <Select value={recurrence} onValueChange={setRecurrence}>
                  <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">One-time</SelectItem>
                    <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                    <SelectItem value="biweekly" className="text-xs">Bi-weekly</SelectItem>
                    <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Clinical Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Appointment Type *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Chief Complaint / Purpose *</Label>
              <Textarea
                className="mt-1.5 text-sm resize-none"
                rows={3}
                placeholder="Reason for appointment..."
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Additional Notes</Label>
              <Textarea
                className="mt-1.5 text-sm resize-none"
                rows={2}
                placeholder="Any extra instructions..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Summary */}
            <div className="bg-muted/40 rounded-lg p-3 text-xs space-y-1">
              <p className="font-semibold mb-1.5">Booking Summary</p>
              <p><span className="text-muted-foreground">Patient: </span>{selectedPatient?.firstName} {selectedPatient?.lastName} ({selectedPatient?.mrn})</p>
              <p><span className="text-muted-foreground">Physician: </span>{physicians.find(p => p.id === physicianId)?.name}</p>
              <p><span className="text-muted-foreground">Date/Time: </span>{date} at {startTime} ({duration} min)</p>
              <p><span className="text-muted-foreground">Clinic: </span>{clinics.find(c => c.id === clinicId)?.name}</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 mt-2">
          {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>}
          <Button
            className={cn('flex-1', step < 3 ? 'bg-primary' : 'bg-rose-500 hover:bg-rose-600')}
            onClick={() => step < 3 ? setStep(s => s + 1) : handleSave()}
            disabled={!canProceed}
          >
            {step < 3 ? 'Next' : 'Book Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
