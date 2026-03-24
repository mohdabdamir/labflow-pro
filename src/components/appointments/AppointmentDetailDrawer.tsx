import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, User, Calendar, Clock, Stethoscope, FileText, AlertTriangle, CheckCircle2, Edit2, RotateCcw, Ban } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types/appointments';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  confirmed: 'bg-emerald-100 text-emerald-700',
  checked_in: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-600',
  rescheduled: 'bg-orange-100 text-orange-700',
};

const STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ['confirmed', 'cancelled', 'no_show'],
  confirmed: ['checked_in', 'cancelled', 'no_show', 'rescheduled'],
  checked_in: ['in_progress', 'no_show'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
  no_show: [],
  rescheduled: ['confirmed', 'cancelled'],
  waitlisted: ['scheduled', 'cancelled'],
};

interface Props {
  appointment: Appointment;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: AppointmentStatus, reason?: string) => void;
  onReschedule: (id: string, date: string, start: string, end: string) => void;
  onCancel: (id: string, reason: string) => void;
}

export function AppointmentDetailDrawer({ appointment: apt, open, onClose, onUpdateStatus, onReschedule, onCancel }: Props) {
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(apt.date);
  const [rescheduleStart, setRescheduleStart] = useState(apt.startTime);
  const [rescheduleEnd, setRescheduleEnd] = useState(apt.endTime);

  const transitions = STATUS_TRANSITIONS[apt.status] ?? [];

  function handleStatus(status: AppointmentStatus) {
    onUpdateStatus(apt.id, status);
  }

  function handleCancel() {
    if (!cancelReason.trim()) return;
    onCancel(apt.id, cancelReason);
    setShowCancel(false);
    onClose();
  }

  function handleReschedule() {
    if (!rescheduleDate || !rescheduleStart || !rescheduleEnd) return;
    onReschedule(apt.id, rescheduleDate, rescheduleStart, rescheduleEnd);
    setShowReschedule(false);
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              Appointment Detail
              <span className="text-sm font-normal text-muted-foreground">#{apt.appointmentNo}</span>
            </SheetTitle>
            <Badge className={cn('text-xs', STATUS_COLORS[apt.status])}>
              {apt.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Patient */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{apt.patient.firstName} {apt.patient.lastName}</p>
                <p className="text-xs text-muted-foreground">{apt.patient.mrn} · {apt.patient.gender === 'M' ? 'Male' : 'Female'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">DOB: </span>{apt.patient.dob}</div>
              <div><span className="text-muted-foreground">Phone: </span>{apt.patient.phone}</div>
              <div><span className="text-muted-foreground">Email: </span>{apt.patient.email}</div>
              {apt.patient.insurance && <div><span className="text-muted-foreground">Insurance: </span>{apt.patient.insurance}</div>}
            </div>
            {apt.patient.allergies && apt.patient.allergies.length > 0 && (
              <div className="flex items-center gap-1 mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span className="text-xs font-medium text-red-600">Allergies: {apt.patient.allergies.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{format(new Date(apt.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{apt.startTime} – {apt.endTime} ({apt.duration} min)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span>{apt.physician.name} · <span className="text-muted-foreground">{apt.physician.specialty}</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{apt.chiefComplaint}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs capitalize">{apt.type.replace('_', ' ')}</Badge>
            <Badge variant="outline" className={cn('text-xs capitalize',
              apt.priority === 'stat' ? 'border-red-300 text-red-600' :
              apt.priority === 'urgent' ? 'border-orange-300 text-orange-600' :
              apt.priority === 'follow_up' ? 'border-teal-300 text-teal-600' :
              'border-blue-300 text-blue-600'
            )}>{apt.priority}</Badge>
            <Badge variant="outline" className="text-xs">{apt.clinic.name}</Badge>
          </div>

          {apt.notes && (
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{apt.notes}</p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          {transitions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {transitions.filter(s => s !== 'cancelled' && s !== 'rescheduled').map(s => (
                  <Button key={s} variant="outline" size="sm" className="text-xs capitalize" onClick={() => { handleStatus(s); onClose(); }}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    {s.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!['completed', 'cancelled', 'no_show'].includes(apt.status) && (
              <>
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setShowReschedule(r => !r)}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reschedule
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs text-destructive border-destructive/40 hover:bg-destructive/10" onClick={() => setShowCancel(c => !c)}>
                  <Ban className="h-3.5 w-3.5 mr-1" /> Cancel
                </Button>
              </>
            )}
          </div>

          {/* Reschedule form */}
          {showReschedule && (
            <div className="bg-muted/40 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium">Reschedule Appointment</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">New Date</Label>
                  <Input type="date" className="h-9 text-xs mt-1" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start</Label>
                    <Input type="time" className="h-9 text-xs mt-1" value={rescheduleStart} onChange={e => setRescheduleStart(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">End</Label>
                    <Input type="time" className="h-9 text-xs mt-1" value={rescheduleEnd} onChange={e => setRescheduleEnd(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 text-xs" onClick={handleReschedule}>Confirm Reschedule</Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowReschedule(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Cancel form */}
          {showCancel && (
            <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 space-y-3 border border-red-100 dark:border-red-900/40">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Cancel Appointment</p>
              <div>
                <Label className="text-xs">Cancellation Reason</Label>
                <Textarea
                  className="mt-1 text-xs resize-none"
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={handleCancel}>Confirm Cancellation</Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowCancel(false)}>Back</Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Audit log */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Audit Trail</p>
            <div className="space-y-2">
              {[...apt.auditLog].reverse().map(entry => (
                <div key={entry.id} className="flex gap-3 text-xs">
                  <div className="text-muted-foreground w-16 shrink-0 pt-0.5">
                    {entry.timestamp.split('T')[1]?.slice(0, 5) ?? '--'}
                  </div>
                  <div>
                    <p className="font-medium">{entry.action}</p>
                    {entry.details && <p className="text-muted-foreground">{entry.details}</p>}
                    <p className="text-muted-foreground">{entry.performedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
