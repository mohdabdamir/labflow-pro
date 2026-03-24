import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Clock, ChevronRight, UserCheck, PhoneCall, AlertTriangle,
  Users, RefreshCw, Filter, ArrowUp, ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppointmentsData } from '@/hooks/useAppointmentsData';
import { cn } from '@/lib/utils';
import type { QueueEntry } from '@/types/appointments';

const QUEUE_STATUS_STYLES: Record<string, string> = {
  waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  called: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  in_room: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  skipped: 'bg-gray-100 text-gray-600',
};

function QueueCard({ entry, onCall, onMove, onSkip }: {
  entry: QueueEntry;
  onCall: () => void;
  onMove: (status: QueueEntry['status']) => void;
  onSkip: () => void;
}) {
  const apt = entry.appointment;
  const patientName = `${apt.patient.firstName} ${apt.patient.lastName}`;

  return (
    <div className={cn(
      'border rounded-xl p-4 transition-all',
      entry.isUrgent
        ? 'border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/10'
        : 'border-border bg-card hover:border-border/80',
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
          entry.isUrgent ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-muted text-muted-foreground'
        )}>
          {entry.position}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{patientName}</p>
            {entry.isUrgent && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 rounded-full">
                <AlertTriangle className="h-2.5 w-2.5" /> URGENT
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{apt.patient.mrn} · {apt.chiefComplaint}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Appt: {apt.startTime}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              {entry.waitMinutes > 0 ? `Waiting ${entry.waitMinutes}m` : 'Just arrived'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge className={cn('text-[10px]', QUEUE_STATUS_STYLES[entry.status])}>
            {entry.status.replace('_', ' ')}
          </Badge>
          {entry.status === 'waiting' && (
            <div className="flex gap-1">
              <Button size="sm" className="h-7 text-xs bg-rose-500 hover:bg-rose-600 text-white px-2" onClick={onCall}>
                <PhoneCall className="h-3 w-3 mr-1" /> Call
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={onSkip}>Skip</Button>
            </div>
          )}
          {entry.status === 'called' && (
            <Button size="sm" className="h-7 text-xs" onClick={() => onMove('in_room')}>
              <UserCheck className="h-3 w-3 mr-1" /> In Room
            </Button>
          )}
          {entry.status === 'in_room' && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onMove('completed')}>
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientQueue() {
  const { physicians, queue, waitlist, callNextPatient, updateQueueStatus, reorderQueue, updateAppointmentStatus, notifyWaitlistPatient, removeFromWaitlist } = useAppointmentsData();
  const [selectedPhysician, setSelectedPhysician] = useState('all');

  const physicianQueue = queue.filter(q =>
    selectedPhysician === 'all' || q.physicianId === selectedPhysician
  ).sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return a.position - b.position;
  });

  const waiting = physicianQueue.filter(q => q.status === 'waiting');
  const active = physicianQueue.filter(q => ['called', 'in_room'].includes(q.status));
  const done = physicianQueue.filter(q => ['completed', 'skipped'].includes(q.status));

  function handleCall(entry: QueueEntry) {
    updateQueueStatus(entry.id, 'called');
    updateAppointmentStatus(entry.appointmentId, 'checked_in');
  }

  function handleMove(entry: QueueEntry, status: QueueEntry['status']) {
    updateQueueStatus(entry.id, status);
    if (status === 'completed') updateAppointmentStatus(entry.appointmentId, 'completed');
  }

  function handleSkip(entry: QueueEntry) {
    updateQueueStatus(entry.id, 'skipped');
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Patient Queue</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{queue.length} total · {waiting.length} waiting · {active.length} active</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPhysician} onValueChange={setSelectedPhysician}>
            <SelectTrigger className="h-9 text-xs w-52">
              <SelectValue placeholder="All Physicians" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Physicians</SelectItem>
              {physicians.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {selectedPhysician !== 'all' && (
            <Button variant="outline" size="sm" onClick={() => callNextPatient(selectedPhysician)} className="h-9">
              <ChevronRight className="h-4 w-4 mr-1" /> Call Next
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-9" onClick={() => selectedPhysician !== 'all' && reorderQueue(selectedPhysician)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Now Serving / Active */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
              Now Active ({active.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {active.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-6">No active patients</p>
            ) : active.map(entry => (
              <QueueCard
                key={entry.id} entry={entry}
                onCall={() => handleCall(entry)}
                onMove={status => handleMove(entry, status)}
                onSkip={() => handleSkip(entry)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Waiting */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Waiting ({waiting.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
            {waiting.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-6">Queue is empty</p>
            ) : waiting.map(entry => (
              <QueueCard
                key={entry.id} entry={entry}
                onCall={() => handleCall(entry)}
                onMove={status => handleMove(entry, status)}
                onSkip={() => handleSkip(entry)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Waitlist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Waitlist ({waitlist.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
            {waitlist.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-6">No one on waitlist</p>
            ) : waitlist.map(w => {
              const physician = physicians.find(p => p.id === w.physicianId);
              const priorityColor = w.priority === 'stat' ? 'border-red-300 bg-red-50 dark:bg-red-950/20' :
                w.priority === 'urgent' ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20' : 'border-border bg-card';
              return (
                <div key={w.id} className={cn('border rounded-xl p-3', priorityColor)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{w.patient.firstName} {w.patient.lastName}</p>
                      <p className="text-xs text-muted-foreground">{w.patient.mrn}</p>
                      <p className="text-xs text-muted-foreground mt-1">{physician?.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {w.preferredDates.slice(0, 2).map(d => (
                          <Badge key={d} variant="secondary" className="text-[10px] h-4 px-1.5">{d}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {!w.notified && (
                        <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => notifyWaitlistPatient(w.id)}>
                          Notify
                        </Button>
                      )}
                      {w.notified && <Badge variant="outline" className="text-[10px] border-green-300 text-green-600">Notified</Badge>}
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-destructive" onClick={() => removeFromWaitlist(w.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                  {w.notes && <p className="text-[10px] text-muted-foreground mt-1.5 italic">{w.notes}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Completed today */}
      {done.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed Today ({done.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {done.map(entry => (
                <div key={entry.id} className="bg-muted/30 rounded-lg px-3 py-2">
                  <p className="text-xs font-medium">{entry.appointment.patient.firstName} {entry.appointment.patient.lastName}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.appointment.startTime} · {entry.appointment.physician.name}</p>
                  <Badge className="text-[10px] mt-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">{entry.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
