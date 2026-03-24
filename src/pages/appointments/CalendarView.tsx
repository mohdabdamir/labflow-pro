import React, { useState, useMemo } from 'react';
import {
  format, addDays, subDays, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  isSameMonth, parseISO, addMonths, subMonths, addWeeks, subWeeks,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Plus, Filter, Search, CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppointmentsData } from '@/hooks/useAppointmentsData';
import { BookAppointmentDialog } from '@/components/appointments/BookAppointmentDialog';
import { AppointmentDetailDrawer } from '@/components/appointments/AppointmentDetailDrawer';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/appointments';

type ViewMode = 'month' | 'week' | 'day';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500',
  confirmed: 'bg-emerald-500',
  checked_in: 'bg-amber-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-400',
  no_show: 'bg-gray-400',
  rescheduled: 'bg-orange-400',
  waitlisted: 'bg-yellow-400',
};

const HOURS = Array.from({ length: 11 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

function ApptChip({ apt, onClick }: { apt: Appointment; onClick: () => void }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={cn(
        'text-[10px] leading-tight px-1.5 py-0.5 rounded cursor-pointer text-white truncate mb-0.5',
        STATUS_COLORS[apt.status],
      )}
      title={`${apt.patient.firstName} ${apt.patient.lastName} — ${apt.chiefComplaint}`}
    >
      {apt.startTime} {apt.patient.firstName} {apt.patient.lastName[0]}.
    </div>
  );
}

export default function CalendarView() {
  const { appointments, physicians, createAppointment, updateAppointmentStatus, rescheduleAppointment, cancelAppointment } = useAppointmentsData();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [filterPhysician, setFilterPhysician] = useState('all');
  const [bookOpen, setBookOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [bookDate, setBookDate] = useState<string>('');

  function navigate(dir: 1 | -1) {
    if (viewMode === 'month') setCurrentDate(d => dir === 1 ? addMonths(d, 1) : subMonths(d, 1));
    else if (viewMode === 'week') setCurrentDate(d => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    else setCurrentDate(d => dir === 1 ? addDays(d, 1) : subDays(d, 1));
  }

  const filtered = useMemo(() => appointments.filter(a => {
    if (filterPhysician !== 'all' && a.physicianId !== filterPhysician) return false;
    if (search) {
      const q = search.toLowerCase();
      return `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase().includes(q) ||
        a.chiefComplaint.toLowerCase().includes(q) || a.appointmentNo.toLowerCase().includes(q);
    }
    return true;
  }), [appointments, search, filterPhysician]);

  function aptsForDate(date: Date) {
    return filtered.filter(a => a.date === format(date, 'yyyy-MM-dd'))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // ── Month view ─────────────────────────────────────────────────────────────
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // ── Week view ──────────────────────────────────────────────────────────────
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const headerTitle = viewMode === 'month'
    ? format(currentDate, 'MMMM yyyy')
    : viewMode === 'week'
    ? `${format(startOfWeek(currentDate), 'MMM d')} – ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
    : format(currentDate, 'EEEE, MMMM d, yyyy');

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border bg-card/60">
        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[200px] text-center">{headerTitle}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 ml-auto">
          {(['day', 'week', 'month'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={cn(
                'px-3 py-1 rounded text-xs font-medium transition-colors capitalize',
                viewMode === v ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >{v}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-xs w-44"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterPhysician} onValueChange={setFilterPhysician}>
            <SelectTrigger className="h-8 text-xs w-44">
              <SelectValue placeholder="All Physicians" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Physicians</SelectItem>
              {physicians.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white h-8" onClick={() => { setBookDate(''); setBookOpen(true); }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Book
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2 bg-card/40 border-b border-border text-[10px] text-muted-foreground overflow-x-auto">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1 shrink-0">
            <span className={cn('h-2.5 w-2.5 rounded-sm', color)} />
            <span className="capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Calendar area */}
      <div className="flex-1 overflow-auto">
        {/* ── MONTH VIEW ── */}
        {viewMode === 'month' && (
          <div className="p-1">
            <div className="grid grid-cols-7">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-l border-t border-border">
              {monthDays.map(day => {
                const daApts = aptsForDate(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => { setBookDate(format(day, 'yyyy-MM-dd')); setBookOpen(true); }}
                    className={cn(
                      'min-h-[110px] border-r border-b border-border p-1.5 cursor-pointer hover:bg-muted/30 transition-colors',
                      !isCurrentMonth && 'bg-muted/20',
                    )}
                  >
                    <div className={cn(
                      'text-xs font-semibold mb-1 h-6 w-6 flex items-center justify-center rounded-full',
                      isToday ? 'bg-rose-500 text-white' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                    )}>
                      {format(day, 'd')}
                    </div>
                    {daApts.slice(0, 3).map(a => <ApptChip key={a.id} apt={a} onClick={() => setSelectedApt(a)} />)}
                    {daApts.length > 3 && (
                      <div className="text-[10px] text-muted-foreground pl-0.5">+{daApts.length - 3} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── WEEK VIEW ── */}
        {viewMode === 'week' && (
          <div className="flex flex-col min-w-[700px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-card z-10">
              <div className="py-3 px-2 text-xs text-muted-foreground text-right border-r border-border" />
              {weekDays.map(day => {
                const isToday = isSameDay(day, new Date());
                const count = aptsForDate(day).length;
                return (
                  <div key={day.toISOString()} className={cn(
                    'py-2 text-center border-r border-border',
                    isToday && 'bg-rose-50 dark:bg-rose-950/20'
                  )}>
                    <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                    <p className={cn(
                      'text-base font-bold mx-auto mt-0.5 h-8 w-8 flex items-center justify-center rounded-full',
                      isToday ? 'bg-rose-500 text-white' : 'text-foreground'
                    )}>{format(day, 'd')}</p>
                    {count > 0 && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 mt-0.5">{count}</Badge>}
                  </div>
                );
              })}
            </div>
            {/* Time slots */}
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-border/50 min-h-[60px]">
                <div className="text-[10px] text-muted-foreground text-right pr-2 pt-1 border-r border-border">{hour}</div>
                {weekDays.map(day => {
                  const dayApts = aptsForDate(day).filter(a => a.startTime.startsWith(hour.slice(0, 2)));
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => { setBookDate(format(day, 'yyyy-MM-dd')); setBookOpen(true); }}
                      className={cn(
                        'p-0.5 border-r border-border cursor-pointer hover:bg-muted/30',
                        isToday && 'bg-rose-50/50 dark:bg-rose-950/10'
                      )}
                    >
                      {dayApts.map(a => <ApptChip key={a.id} apt={a} onClick={() => setSelectedApt(a)} />)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── DAY VIEW ── */}
        {viewMode === 'day' && (
          <div className="flex flex-col min-w-[400px]">
            {/* Header */}
            <div className="grid grid-cols-[80px_1fr] border-b border-border">
              <div />
              <div className="py-3 text-center">
                <p className="text-xs text-muted-foreground">{format(currentDate, 'EEEE')}</p>
                <p className="text-xl font-bold">{format(currentDate, 'd MMMM')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{aptsForDate(currentDate).length} appointments</p>
              </div>
            </div>
            {HOURS.map(hour => {
              const hourApts = aptsForDate(currentDate).filter(a => a.startTime.startsWith(hour.slice(0, 2)));
              return (
                <div key={hour} className="grid grid-cols-[80px_1fr] border-b border-border/50 min-h-[70px]">
                  <div className="text-xs text-muted-foreground text-right pr-3 pt-2 border-r border-border">{hour}</div>
                  <div className="p-1.5 space-y-1">
                    {hourApts.map(a => (
                      <div
                        key={a.id}
                        onClick={() => setSelectedApt(a)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-white text-xs hover:opacity-90 transition-opacity',
                          STATUS_COLORS[a.status],
                        )}
                      >
                        <span className="font-semibold shrink-0">{a.startTime}–{a.endTime}</span>
                        <span className="font-medium">{a.patient.firstName} {a.patient.lastName}</span>
                        <span className="opacity-80 truncate hidden sm:block">{a.chiefComplaint}</span>
                        <span className="ml-auto opacity-80 shrink-0">{a.physician.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BookAppointmentDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onSave={createAppointment}
        defaultDate={bookDate}
      />
      {selectedApt && (
        <AppointmentDetailDrawer
          appointment={selectedApt}
          open={!!selectedApt}
          onClose={() => setSelectedApt(null)}
          onUpdateStatus={updateAppointmentStatus}
          onReschedule={rescheduleAppointment}
          onCancel={cancelAppointment}
        />
      )}
    </div>
  );
}
