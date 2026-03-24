import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import type {
  Appointment, AppointmentStatus, QueueEntry, WaitlistEntry,
  ScheduleBlock, AppointmentFilters, AuditEntry
} from '@/types/appointments';
import {
  MOCK_APPOINTMENTS, MOCK_QUEUE, MOCK_WAITLIST,
  MOCK_SCHEDULE_BLOCKS, MOCK_PHYSICIANS, MOCK_CLINICS
} from '@/data/appointmentsMockData';

function generateId(prefix: string) {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

function makeAudit(action: string, performer = 'System User', details?: string): AuditEntry {
  return {
    id: generateId('AUD'),
    timestamp: new Date().toISOString(),
    action, performedBy: performer, details,
  };
}

export function useAppointmentsData() {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [queue, setQueue] = useState<QueueEntry[]>(MOCK_QUEUE);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(MOCK_WAITLIST);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(MOCK_SCHEDULE_BLOCKS);
  const [filters, setFilters] = useState<AppointmentFilters>({
    search: '', status: 'all', priority: 'all',
    physicianId: 'all', department: 'all',
    dateFrom: format(new Date(), 'yyyy-MM-dd'),
    dateTo: '',
    type: 'all',
  });

  // ── Derived / filtered ─────────────────────────────────────────────────────
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          `${apt.patient.firstName} ${apt.patient.lastName}`.toLowerCase().includes(q) ||
          apt.patient.mrn.toLowerCase().includes(q) ||
          apt.appointmentNo.toLowerCase().includes(q) ||
          apt.physician.name.toLowerCase().includes(q) ||
          apt.chiefComplaint.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.status !== 'all' && apt.status !== filters.status) return false;
      if (filters.priority !== 'all' && apt.priority !== filters.priority) return false;
      if (filters.physicianId !== 'all' && apt.physicianId !== filters.physicianId) return false;
      if (filters.department !== 'all' && apt.physician.department !== filters.department) return false;
      if (filters.type !== 'all' && apt.type !== filters.type) return false;
      if (filters.dateFrom && apt.date < filters.dateFrom) return false;
      if (filters.dateTo && apt.date > filters.dateTo) return false;
      return true;
    });
  }, [appointments, filters]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayAppointments = useMemo(
    () => appointments.filter(a => a.date === todayStr),
    [appointments, todayStr]
  );

  const stats = useMemo(() => {
    const all = todayAppointments;
    const total = all.length;
    const completed = all.filter(a => a.status === 'completed').length;
    const cancelled = all.filter(a => a.status === 'cancelled').length;
    const noShow = all.filter(a => a.status === 'no_show').length;
    const scheduled = all.filter(a => ['scheduled', 'confirmed', 'checked_in', 'in_progress'].includes(a.status)).length;
    return {
      totalToday: total,
      scheduled,
      completed,
      cancelled,
      noShow,
      waitlisted: waitlist.length,
      averageWaitMinutes: 18,
      utilizationPercent: total > 0 ? Math.round(((completed + scheduled) / total) * 100) : 0,
      noShowRate: total > 0 ? Math.round((noShow / total) * 100) : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
    };
  }, [todayAppointments, waitlist]);

  // ── Appointment CRUD ───────────────────────────────────────────────────────
  const createAppointment = useCallback((data: Partial<Appointment>): Appointment => {
    const physician = MOCK_PHYSICIANS.find(p => p.id === data.physicianId) || MOCK_PHYSICIANS[0];
    const clinic = MOCK_CLINICS.find(c => c.id === data.clinicId) || MOCK_CLINICS[0];
    const newApt: Appointment = {
      id: generateId('APT'),
      appointmentNo: `APT-${Date.now().toString().slice(-7)}`,
      patientId: data.patientId || '',
      patient: data.patient!,
      physicianId: physician.id,
      physician,
      clinicId: clinic.id,
      clinic,
      date: data.date || format(new Date(), 'yyyy-MM-dd'),
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '09:30',
      duration: data.duration || 30,
      type: data.type || 'consultation',
      status: 'scheduled',
      priority: data.priority || 'routine',
      chiefComplaint: data.chiefComplaint || '',
      notes: data.notes,
      recurrence: data.recurrence || 'none',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminderSent: false,
      billingLinked: false,
      auditLog: [makeAudit('Appointment Created', 'Current User', `New ${data.type || 'consultation'} appointment booked`)],
      ...data,
    };
    setAppointments(prev => [...prev, newApt]);
    return newApt;
  }, []);

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus, reason?: string, performer = 'Current User') => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id !== id) return apt;
      const now = new Date().toISOString();
      const updated: Appointment = {
        ...apt, status, updatedAt: now,
        ...(status === 'confirmed' ? { confirmedAt: now } : {}),
        ...(status === 'checked_in' ? { checkedInAt: now } : {}),
        ...(status === 'completed' ? { completedAt: now, billingLinked: true } : {}),
        ...(status === 'cancelled' ? { cancelledAt: now, cancellationReason: reason } : {}),
        auditLog: [
          ...apt.auditLog,
          makeAudit('Status Changed', performer, `${apt.status} → ${status}${reason ? ` — ${reason}` : ''}`),
        ],
      };
      return updated;
    }));
    // Update queue entries accordingly
    if (status === 'checked_in') {
      const apt = appointments.find(a => a.id === id);
      if (apt) {
        const entry: QueueEntry = {
          id: generateId('Q'),
          appointmentId: id, appointment: apt,
          physicianId: apt.physicianId, clinicId: apt.clinicId,
          position: queue.filter(q => q.physicianId === apt.physicianId).length + 1,
          arrivalTime: new Date().toISOString(),
          estimatedCallTime: new Date().toISOString(),
          status: 'waiting',
          waitMinutes: 0,
          isUrgent: apt.priority === 'stat' || apt.priority === 'urgent',
        };
        setQueue(prev => [...prev, entry]);
      }
    }
    if (status === 'completed' || status === 'cancelled' || status === 'no_show') {
      setQueue(prev => prev.filter(q => q.appointmentId !== id));
    }
  }, [appointments, queue]);

  const rescheduleAppointment = useCallback((id: string, newDate: string, newStart: string, newEnd: string) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id !== id) return apt;
      return {
        ...apt,
        date: newDate, startTime: newStart, endTime: newEnd,
        status: 'rescheduled' as AppointmentStatus,
        updatedAt: new Date().toISOString(),
        auditLog: [
          ...apt.auditLog,
          makeAudit('Appointment Rescheduled', 'Current User',
            `From ${apt.date} ${apt.startTime} → ${newDate} ${newStart}`),
        ],
      };
    }));
  }, []);

  const cancelAppointment = useCallback((id: string, reason: string) => {
    updateAppointmentStatus(id, 'cancelled', reason);
  }, [updateAppointmentStatus]);

  // ── Queue management ───────────────────────────────────────────────────────
  const callNextPatient = useCallback((physicianId: string) => {
    setQueue(prev => {
      const waiting = prev
        .filter(q => q.physicianId === physicianId && q.status === 'waiting')
        .sort((a, b) => {
          if (a.isUrgent && !b.isUrgent) return -1;
          if (!a.isUrgent && b.isUrgent) return 1;
          return a.position - b.position;
        });
      if (!waiting.length) return prev;
      const next = waiting[0];
      return prev.map(q =>
        q.id === next.id ? { ...q, status: 'called' as const } : q
      );
    });
  }, []);

  const updateQueueStatus = useCallback((queueId: string, status: QueueEntry['status']) => {
    setQueue(prev => prev.map(q => q.id === queueId ? { ...q, status } : q));
  }, []);

  const reorderQueue = useCallback((physicianId: string) => {
    setQueue(prev => {
      const physQueue = prev
        .filter(q => q.physicianId === physicianId && q.status === 'waiting')
        .sort((a, b) => {
          if (a.isUrgent && !b.isUrgent) return -1;
          if (!a.isUrgent && b.isUrgent) return 1;
          return a.position - b.position;
        })
        .map((q, i) => ({ ...q, position: i + 1 }));
      const others = prev.filter(q => q.physicianId !== physicianId || q.status !== 'waiting');
      return [...others, ...physQueue];
    });
  }, []);

  // ── Waitlist ───────────────────────────────────────────────────────────────
  const addToWaitlist = useCallback((entry: Omit<WaitlistEntry, 'id' | 'addedAt' | 'notified'>) => {
    const newEntry: WaitlistEntry = {
      ...entry, id: generateId('WL'),
      addedAt: new Date().toISOString(), notified: false,
    };
    setWaitlist(prev => [...prev, newEntry]);
  }, []);

  const removeFromWaitlist = useCallback((id: string) => {
    setWaitlist(prev => prev.filter(w => w.id !== id));
  }, []);

  const notifyWaitlistPatient = useCallback((id: string) => {
    setWaitlist(prev => prev.map(w => w.id === id ? { ...w, notified: true } : w));
  }, []);

  // ── Schedule blocks ────────────────────────────────────────────────────────
  const addScheduleBlock = useCallback((block: Omit<ScheduleBlock, 'id'>) => {
    const newBlock: ScheduleBlock = { ...block, id: generateId('BLK') };
    setScheduleBlocks(prev => [...prev, newBlock]);
  }, []);

  const removeScheduleBlock = useCallback((id: string) => {
    setScheduleBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  // ── Utilities ──────────────────────────────────────────────────────────────
  const getAppointmentsForDate = useCallback((date: string) =>
    appointments.filter(a => a.date === date),
    [appointments]
  );

  const getAppointmentsForPhysician = useCallback((physicianId: string, date?: string) =>
    appointments.filter(a =>
      a.physicianId === physicianId && (date ? a.date === date : true)
    ),
    [appointments]
  );

  const getQueueForPhysician = useCallback((physicianId: string) =>
    queue
      .filter(q => q.physicianId === physicianId)
      .sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return a.position - b.position;
      }),
    [queue]
  );

  const physicians = MOCK_PHYSICIANS;
  const clinics = MOCK_CLINICS;

  return {
    appointments, filteredAppointments, todayAppointments,
    queue, waitlist, scheduleBlocks, filters, stats,
    physicians, clinics,
    setFilters,
    createAppointment, updateAppointmentStatus, rescheduleAppointment, cancelAppointment,
    callNextPatient, updateQueueStatus, reorderQueue,
    addToWaitlist, removeFromWaitlist, notifyWaitlistPatient,
    addScheduleBlock, removeScheduleBlock,
    getAppointmentsForDate, getAppointmentsForPhysician, getQueueForPhysician,
  };
}
