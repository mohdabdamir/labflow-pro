import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import {
  ChevronLeft, ChevronRight, Plus, Clock, Ban, Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppointmentsData } from '@/hooks/useAppointmentsData';
import { cn } from '@/lib/utils';

const HOURS = Array.from({ length: 11 }, (_, i) => ({
  label: `${(i + 7).toString().padStart(2, '0')}:00`,
  val: i + 7,
}));

const BLOCK_COLORS: Record<string, string> = {
  break: 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  admin: 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  out_of_office: 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  unavailable: 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const APT_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500',
  confirmed: 'bg-emerald-500',
  checked_in: 'bg-amber-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-400',
  no_show: 'bg-gray-400',
  rescheduled: 'bg-orange-400',
};

export default function PhysicianSchedule() {
  const { physicians, appointments, scheduleBlocks, addScheduleBlock, removeScheduleBlock } = useAppointmentsData();
  const [selectedPhysician, setSelectedPhysician] = useState(physicians[0]?.id ?? '');
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockStart, setBlockStart] = useState('12:00');
  const [blockEnd, setBlockEnd] = useState('13:00');
  const [blockType, setBlockType] = useState<'break' | 'admin' | 'out_of_office' | 'unavailable'>('break');
  const [blockNote, setBlockNote] = useState('');

  const weekDays = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const phy = physicians.find(p => p.id === selectedPhysician);

  function aptsForDay(day: Date) {
    return appointments.filter(a =>
      a.physicianId === selectedPhysician &&
      a.date === format(day, 'yyyy-MM-dd')
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  function blocksForDay(day: Date) {
    return scheduleBlocks.filter(b =>
      b.physicianId === selectedPhysician &&
      b.date === format(day, 'yyyy-MM-dd')
    );
  }

  function handleAddBlock() {
    if (!blockDate || !blockStart || !blockEnd) return;
    addScheduleBlock({
      physicianId: selectedPhysician,
      date: blockDate,
      startTime: blockStart,
      endTime: blockEnd,
      type: blockType,
      note: blockNote || undefined,
    });
    setBlockDialogOpen(false);
    setBlockNote('');
  }

  const weekAppointments = appointments.filter(a => a.physicianId === selectedPhysician &&
    weekDays.some(d => a.date === format(d, 'yyyy-MM-dd'))
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Physician Schedule</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Week of {format(weekStart, 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={selectedPhysician} onValueChange={setSelectedPhysician}>
            <SelectTrigger className="h-9 text-xs w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {physicians.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekStart(d => addDays(d, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setWeekStart(startOfWeek(new Date()))}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekStart(d => addDays(d, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" variant="outline" className="h-9" onClick={() => { setBlockDate(format(new Date(), 'yyyy-MM-dd')); setBlockDialogOpen(true); }}>
            <Ban className="h-3.5 w-3.5 mr-1.5" /> Block Time
          </Button>
        </div>
      </div>

      {/* Physician Card */}
      {phy && (
        <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
          <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            style={{ backgroundColor: phy.color }}>
            {phy.name.split(' ').filter(n => n !== 'Dr.').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{phy.name}</p>
            <p className="text-xs text-muted-foreground">{phy.specialty} · {phy.department}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold">{weekAppointments.filter(a => !['cancelled', 'no_show'].includes(a.status)).length}</p>
              <p className="text-[10px] text-muted-foreground">This Week</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{weekAppointments.filter(a => a.status === 'completed').length}</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-500">{weekAppointments.filter(a => ['cancelled', 'no_show'].includes(a.status)).length}</p>
              <p className="text-[10px] text-muted-foreground">Cancelled/NS</p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly grid */}
      <div className="overflow-auto">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-[64px_repeat(5,1fr)] border-b border-border">
            <div />
            {weekDays.map(day => {
              const isToday = isSameDay(day, new Date());
              const count = aptsForDay(day).filter(a => !['cancelled', 'no_show'].includes(a.status)).length;
              return (
                <div key={day.toISOString()} className={cn(
                  'py-3 text-center border-r border-border',
                  isToday && 'bg-rose-50/60 dark:bg-rose-950/20'
                )}>
                  <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                  <p className={cn(
                    'text-base font-bold mx-auto mt-0.5 h-8 w-8 flex items-center justify-center rounded-full',
                    isToday ? 'bg-rose-500 text-white' : 'text-foreground'
                  )}>{format(day, 'd')}</p>
                  {count > 0 && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 mt-0.5">{count} apts</Badge>}
                </div>
              );
            })}
          </div>

          {/* Hour rows */}
          {HOURS.map(({ label, val }) => (
            <div key={label} className="grid grid-cols-[64px_repeat(5,1fr)] border-b border-border/40 min-h-[72px]">
              <div className="text-[10px] text-muted-foreground text-right pr-2 pt-1.5 border-r border-border">{label}</div>
              {weekDays.map(day => {
                const isToday = isSameDay(day, new Date());
                const dayApts = aptsForDay(day).filter(a => {
                  const h = parseInt(a.startTime.split(':')[0], 10);
                  return h === val;
                });
                const dayBlocks = blocksForDay(day).filter(b => {
                  const h = parseInt(b.startTime.split(':')[0], 10);
                  return h === val;
                });
                return (
                  <div key={day.toISOString()} className={cn(
                    'p-0.5 border-r border-border',
                    isToday && 'bg-rose-50/30 dark:bg-rose-950/5'
                  )}>
                    {dayBlocks.map(blk => (
                      <div key={blk.id} className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded border mb-0.5 flex items-center justify-between group',
                        BLOCK_COLORS[blk.type]
                      )}>
                        <span>{blk.startTime}–{blk.endTime} {blk.note ?? blk.type}</span>
                        <button className="hidden group-hover:block text-destructive" onClick={() => removeScheduleBlock(blk.id)}>×</button>
                      </div>
                    ))}
                    {dayApts.map(a => (
                      <div
                        key={a.id}
                        className={cn(
                          'text-[10px] text-white px-1.5 py-0.5 rounded mb-0.5 truncate',
                          APT_STATUS_COLORS[a.status]
                        )}
                        title={`${a.patient.firstName} ${a.patient.lastName} — ${a.chiefComplaint}`}
                      >
                        {a.startTime} {a.patient.firstName} {a.patient.lastName[0]}.
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Block Time Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={v => !v && setBlockDialogOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Block Time Slot</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" className="mt-1.5 h-9 text-xs" value={blockDate} onChange={e => setBlockDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Time</Label>
                <Input type="time" className="mt-1.5 h-9 text-xs" value={blockStart} onChange={e => setBlockStart(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">End Time</Label>
                <Input type="time" className="mt-1.5 h-9 text-xs" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Block Type</Label>
              <Select value={blockType} onValueChange={v => setBlockType(v as typeof blockType)}>
                <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="admin">Administrative</SelectItem>
                  <SelectItem value="out_of_office">Out of Office</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Note (optional)</Label>
              <Input className="mt-1.5 h-9 text-xs" placeholder="Lunch, conference, etc..." value={blockNote} onChange={e => setBlockNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBlockDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddBlock}>Add Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
