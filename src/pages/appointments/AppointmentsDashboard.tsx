import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  CalendarDays, Clock, Users, CheckCircle2, XCircle, UserX,
  TrendingUp, AlertTriangle, Plus, ChevronRight, Activity,
  ClipboardList, Stethoscope, CalendarClock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppointmentsData } from '@/hooks/useAppointmentsData';
import { BookAppointmentDialog } from '@/components/appointments/BookAppointmentDialog';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/appointments';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  checked_in: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  no_show: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  rescheduled: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  waitlisted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
};

const PRIORITY_DOT: Record<string, string> = {
  routine: 'bg-blue-400',
  urgent: 'bg-orange-400',
  stat: 'bg-red-500',
  follow_up: 'bg-teal-400',
};

function statusLabel(s: string) {
  return s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function AppointmentRow({ apt, onUpdateStatus }: { apt: Appointment; onUpdateStatus: (id: string, status: Appointment['status']) => void }) {
  const patientName = `${apt.patient.firstName} ${apt.patient.lastName}`;
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/50 last:border-0">
      <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[apt.priority])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{patientName}</p>
        <p className="text-xs text-muted-foreground truncate">{apt.chiefComplaint}</p>
      </div>
      <div className="text-center shrink-0">
        <p className="text-sm font-semibold">{apt.startTime}</p>
        <p className="text-xs text-muted-foreground">{apt.duration}m</p>
      </div>
      <div className="shrink-0 hidden sm:block text-right">
        <p className="text-xs text-muted-foreground truncate max-w-[120px]">{apt.physician.name}</p>
      </div>
      <Badge className={cn('text-[10px] shrink-0', STATUS_COLORS[apt.status])}>
        {statusLabel(apt.status)}
      </Badge>
    </div>
  );
}

export default function AppointmentsDashboard() {
  const navigate = useNavigate();
  const { stats, todayAppointments, waitlist, queue, physicians, updateAppointmentStatus, createAppointment } = useAppointmentsData();
  const [bookOpen, setBookOpen] = useState(false);

  const statCards = [
    { label: "Today's Appointments", value: stats.totalToday, icon: CalendarDays, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Active / Upcoming', value: stats.scheduled, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/40' },
    { label: 'No-Shows', value: stats.noShow, icon: UserX, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/40' },
    { label: 'Waitlisted', value: stats.waitlisted, icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  ];

  const sorted = [...todayAppointments].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const upcoming = sorted.filter(a => ['scheduled', 'confirmed'].includes(a.status)).slice(0, 8);
  const active = sorted.filter(a => ['checked_in', 'in_progress'].includes(a.status));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · {stats.totalToday} appointments today
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/appointments/calendar')}>
            <CalendarDays className="h-4 w-4 mr-2" /> View Calendar
          </Button>
          <Button className="bg-rose-500 hover:bg-rose-600 text-white" onClick={() => setBookOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Book Appointment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border">
              <CardContent className="pt-5 pb-4">
                <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center mb-3', s.bg)}>
                  <Icon className={cn('h-5 w-5', s.color)} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Utilization + Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Slot Utilization</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold">{stats.utilizationPercent}%</span>
              <span className="text-muted-foreground text-sm mb-1">of capacity</span>
            </div>
            <Progress value={stats.utilizationPercent} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">No-Show Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-red-500">{stats.noShowRate}%</span>
              <span className="text-muted-foreground text-sm mb-1">today</span>
            </div>
            <Progress value={stats.noShowRate} className="h-2 [&>div]:bg-red-400" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Avg. Wait Time</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-amber-500">{stats.averageWaitMinutes}</span>
              <span className="text-muted-foreground text-sm mb-1">minutes</span>
            </div>
            <Progress value={Math.min((stats.averageWaitMinutes / 60) * 100, 100)} className="h-2 [&>div]:bg-amber-400" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's Timeline */}
        <div className="xl:col-span-2 space-y-4">
          {/* Currently Active */}
          {active.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500 animate-pulse" />
                  Currently Active ({active.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {active.map(apt => (
                  <AppointmentRow key={apt.id} apt={apt} onUpdateStatus={updateAppointmentStatus} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Upcoming Today</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/appointments/calendar')}>
                See All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {upcoming.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No upcoming appointments</p>
              ) : upcoming.map(apt => (
                <AppointmentRow key={apt.id} apt={apt} onUpdateStatus={updateAppointmentStatus} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-4">
          {/* Physician Queue Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" /> Physician Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {physicians.slice(0, 5).map(phy => {
                const phyQueue = queue.filter(q => q.physicianId === phy.id && ['waiting', 'called', 'in_room'].includes(q.status));
                const inRoom = phyQueue.find(q => q.status === 'in_room');
                return (
                  <div key={phy.id} className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: phy.color }}
                    >
                      {phy.name.split(' ').filter(n => n.startsWith('Dr.') ? false : true).map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{phy.name}</p>
                      <p className="text-[10px] text-muted-foreground">{phy.specialty}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{phyQueue.length}</p>
                      <p className="text-[10px] text-muted-foreground">{inRoom ? '🟢 Active' : '⚪ Free'}</p>
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate('/appointments/queue')}>
                <Clock className="h-3.5 w-3.5 mr-1" /> Manage Queue
              </Button>
            </CardContent>
          </Card>

          {/* Waitlist */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" /> Waitlist
                <Badge variant="secondary" className="ml-auto">{waitlist.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {waitlist.slice(0, 4).map(w => (
                <div key={w.id} className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg">
                  <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[w.priority])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{w.patient.firstName} {w.patient.lastName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {physicians.find(p => p.id === w.physicianId)?.name}
                    </p>
                  </div>
                  {w.notified && (
                    <Badge variant="outline" className="text-[10px] border-green-300 text-green-600">Notified</Badge>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate('/appointments/waitlist')}>
                View All Waitlist <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Urgent alerts */}
          <Card className="border-red-200 dark:border-red-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" /> Urgent / STAT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayAppointments.filter(a => ['stat', 'urgent'].includes(a.priority) && !['completed', 'cancelled'].includes(a.status)).slice(0, 3).map(apt => (
                <div key={apt.id} className="flex gap-2 items-start p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/40">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">{apt.patient.firstName} {apt.patient.lastName}</p>
                    <p className="text-[10px] text-muted-foreground">{apt.chiefComplaint}</p>
                    <p className="text-[10px] font-medium text-red-600">{apt.startTime} · {apt.physician.name}</p>
                  </div>
                </div>
              ))}
              {todayAppointments.filter(a => ['stat', 'urgent'].includes(a.priority) && !['completed', 'cancelled'].includes(a.status)).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No urgent cases</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BookAppointmentDialog open={bookOpen} onClose={() => setBookOpen(false)} onSave={createAppointment} />
    </div>
  );
}
