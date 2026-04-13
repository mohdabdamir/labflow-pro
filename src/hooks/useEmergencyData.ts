import { useState, useEffect, useCallback, useRef } from 'react';
import {
  EDPatient, BPAAlert, HandoverTask, MCIPatient, DischargeWorkflow,
  SIRSCriteria, EDEvent, Vitals, LabResult, AcuityLevel, EDZone,
} from '@/types/emergency';
import {
  initialEDPatients, initialBPAAlerts, initialHandoverTasks,
  ED_PHYSICIANS, ED_NURSES,
} from '@/data/emergencyMockData';

/* ─── Event Bus ─── */
type EventHandler = (event: EDEvent) => void;
const subscribers = new Set<EventHandler>();
function publishEvent(event: EDEvent) { subscribers.forEach(fn => fn(event)); }

/* ─── SIRS evaluator ─── */
export function evaluateSIRS(vitals: Vitals | undefined, labs: LabResult[]): SIRSCriteria {
  const hr = vitals ? vitals.hr > 90 : false;
  const rr = vitals ? vitals.rr > 20 : false;
  const temp = vitals ? (vitals.temp > 38 || vitals.temp < 36) : false;
  const wbc = labs.some(l => l.testName === 'WBC' && (l.value > 12 || l.value < 4));
  const lactate = labs.some(l => l.testName === 'Lactate' && l.value > 2.0);
  const count = [hr, rr, temp, wbc, lactate].filter(Boolean).length;
  return { hrMet: hr, rrMet: rr, tempMet: temp, wbcMet: wbc, lactateMet: lactate, criteriaCount: count, isSIRS: count >= 2 };
}

/* ─── Acuity suggestion ─── */
export function suggestAcuity(complaint: string, age: number, vitals?: Vitals): AcuityLevel {
  const c = complaint.toLowerCase();
  if (['cardiac arrest', 'unresponsive', 'apneic', 'pulseless'].some(k => c.includes(k))) return 1;
  if (vitals) {
    if (vitals.spo2 < 90 || vitals.sbp < 80 || vitals.gcs !== undefined && vitals.gcs < 9) return 1;
    if (c.includes('chest pain') && (age > 50 || vitals.hr > 100)) return 2;
    if (vitals.temp > 39 && age < 3) return 2;
    if (vitals.hr > 120 || vitals.rr > 28 || vitals.temp > 39) return 2;
    if (c.includes('fracture') || c.includes('laceration') || c.includes('asthma')) return 3;
  }
  if (['stroke', 'seizure', 'gi bleed', 'hemorrhage', 'overdose'].some(k => c.includes(k))) return 2;
  if (['headache', 'back pain', 'rash', 'sore throat', 'cough'].some(k => c.includes(k))) return 4;
  if (['refill', 'prescription', 'suture removal', 'paperwork'].some(k => c.includes(k))) return 5;
  return 3;
}

/* ─── Main Hook ─── */
export function useEmergencyData() {
  const [patients, setPatients] = useState<EDPatient[]>(() => {
    const stored = localStorage.getItem('ed_patients');
    return stored ? JSON.parse(stored) : initialEDPatients;
  });
  const [alerts, setAlerts] = useState<BPAAlert[]>(() => {
    const stored = localStorage.getItem('ed_alerts');
    return stored ? JSON.parse(stored) : initialBPAAlerts;
  });
  const [handoverTasks, setHandoverTasks] = useState<HandoverTask[]>(() => {
    const stored = localStorage.getItem('ed_handover');
    return stored ? JSON.parse(stored) : initialHandoverTasks;
  });
  const [mciActive, setMciActive] = useState(false);
  const [mciPatients, setMciPatients] = useState<MCIPatient[]>([]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<EDEvent[]>([]);
  const [surgeView, setSurgeView] = useState(false);
  const [dischargeWorkflows, setDischargeWorkflows] = useState<DischargeWorkflow[]>([]);
  const mciSeqRef = useRef({ green: 0, yellow: 0, red: 0, black: 0 });

  // Persist
  useEffect(() => { localStorage.setItem('ed_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('ed_alerts', JSON.stringify(alerts)); }, [alerts]);
  useEffect(() => { localStorage.setItem('ed_handover', JSON.stringify(handoverTasks)); }, [handoverTasks]);

  /* ─── SIRS Background Listener ─── */
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients(prev => {
        let newAlerts: BPAAlert[] = [];
        prev.forEach(p => {
          if (['discharged', 'admitted', 'transferred', 'left_without_being_seen'].includes(p.status)) return;
          const latestVitals = p.vitals[p.vitals.length - 1];
          const sirs = evaluateSIRS(latestVitals, p.labs);
          if (sirs.isSIRS) {
            const existing = alerts.find(a => a.patientId === p.id && a.type === 'sepsis_sirs' && !a.acknowledged);
            if (!existing) {
              newAlerts.push({
                id: `BPA-${Date.now()}-${p.id}`,
                patientId: p.id, patientName: p.name,
                type: 'sepsis_sirs', severity: 'critical',
                title: '⚠️ SIRS Alert — Sepsis Screening Required',
                message: `${sirs.criteriaCount}/5 SIRS criteria met: ${[sirs.hrMet && 'HR', sirs.rrMet && 'RR', sirs.tempMet && 'Temp', sirs.wbcMet && 'WBC', sirs.lactateMet && 'Lactate'].filter(Boolean).join(', ')}`,
                timestamp: new Date(), acknowledged: false,
              });
            }
          }
        });
        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev]);
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [alerts]);

  /* ─── Simulated Event Stream (random vitals/labs every 8s) ─── */
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients(prev => {
        const active = prev.filter(p => !['discharged', 'admitted', 'transferred', 'left_without_being_seen', 'waiting', 'discharge_ready'].includes(p.status));
        if (active.length === 0) return prev;
        const target = active[Math.floor(Math.random() * active.length)];
        const lastV = target.vitals[target.vitals.length - 1];
        if (!lastV) return prev;
        const jitter = (v: number, range: number) => Math.round(v + (Math.random() - 0.5) * range);
        const newVital: Vitals = {
          id: `V-${Date.now()}`, timestamp: new Date(),
          hr: jitter(lastV.hr, 8), rr: jitter(lastV.rr, 4),
          sbp: jitter(lastV.sbp, 10), dbp: jitter(lastV.dbp, 6),
          temp: +(lastV.temp + (Math.random() - 0.5) * 0.3).toFixed(1),
          spo2: Math.min(100, Math.max(85, jitter(lastV.spo2, 2))),
          painScale: lastV.painScale,
        };
        const event: EDEvent = {
          id: `E-${Date.now()}`, patientId: target.id,
          type: 'VITAL_ENTERED', description: `HR ${newVital.hr}, RR ${newVital.rr}, Temp ${newVital.temp}°C`,
          timestamp: new Date(),
        };
        publishEvent(event);
        return prev.map(p => p.id === target.id ? { ...p, vitals: [...p.vitals, newVital], events: [...p.events, event] } : p);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  /* ─── Actions ─── */
  const addPatient = useCallback((patient: EDPatient) => {
    setPatients(prev => [patient, ...prev]);
  }, []);

  const updatePatient = useCallback((id: string, updates: Partial<EDPatient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const triagePatient = useCallback((id: string, acuity: AcuityLevel, zone: EDZone, bed: string, md: string, rn: string) => {
    setPatients(prev => prev.map(p => p.id === id ? {
      ...p, acuity, zone, bed, assignedMD: md, assignedRN: rn,
      status: 'assigned' as const, triageTime: new Date(),
      events: [...p.events, { id: `E-${Date.now()}`, patientId: id, type: 'TRIAGE', description: `ESI ${acuity}, Zone: ${zone}, Bed: ${bed}`, timestamp: new Date() }],
    } : p));
  }, []);

  const acknowledgeAlert = useCallback((alertId: string, by: string, action?: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true, acknowledgedBy: by, actionTaken: action } : a));
  }, []);

  const orderSepsisBundle = useCallback((patientId: string) => {
    setPatients(prev => prev.map(p => p.id === patientId ? {
      ...p,
      orders: [...p.orders,
        { id: `O-${Date.now()}-1`, type: 'lab' as const, description: 'Blood Cultures x2', status: 'ordered' as const, orderedBy: 'SEPSIS PROTOCOL', orderedAt: new Date() },
        { id: `O-${Date.now()}-2`, type: 'lab' as const, description: 'Lactate Level', status: 'ordered' as const, orderedBy: 'SEPSIS PROTOCOL', orderedAt: new Date() },
        { id: `O-${Date.now()}-3`, type: 'medication' as const, description: 'NS 30mL/kg IV Bolus', status: 'ordered' as const, orderedBy: 'SEPSIS PROTOCOL', orderedAt: new Date() },
        { id: `O-${Date.now()}-4`, type: 'medication' as const, description: 'Broad-spectrum Abx (per protocol)', status: 'ordered' as const, orderedBy: 'SEPSIS PROTOCOL', orderedAt: new Date() },
      ],
      events: [...p.events, { id: `E-${Date.now()}`, patientId, type: 'SEPSIS_BUNDLE', description: 'Sepsis bundle ordered via BPA one-click', timestamp: new Date() }],
    } : p));
  }, []);

  const acknowledgeHandover = useCallback((taskId: string, by: string) => {
    setHandoverTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'acknowledged' as const, assignedTo: by, acknowledgedAt: new Date() } : t));
  }, []);

  const completeHandover = useCallback((taskId: string) => {
    setHandoverTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' as const } : t));
  }, []);

  const addHandoverTask = useCallback((task: Omit<HandoverTask, 'id'>) => {
    setHandoverTasks(prev => [{ ...task, id: `HT-${Date.now()}` }, ...prev]);
  }, []);

  const initiateDischarge = useCallback((patientId: string) => {
    const p = patients.find(pt => pt.id === patientId);
    if (!p) return;
    const wf: DischargeWorkflow = {
      patientId, status: 'pending',
      prescriptionSent: false, followUpScheduled: false,
      pcpGapAlert: !p.pcp, instructions: '',
    };
    setDischargeWorkflows(prev => [...prev, wf]);
    updatePatient(patientId, { status: 'discharge_ready' });
  }, [patients, updatePatient]);

  const completeDischarge = useCallback((patientId: string, instructions: string) => {
    setDischargeWorkflows(prev => prev.map(w => w.patientId === patientId ? {
      ...w, status: 'completed' as const, prescriptionSent: true, followUpScheduled: true, instructions, completedAt: new Date(),
    } : w));
    updatePatient(patientId, { status: 'discharged' });
  }, [updatePatient]);

  /* ─── MCI ─── */
  const activateMCI = useCallback(() => {
    setMciActive(true);
    mciSeqRef.current = { green: 0, yellow: 0, red: 0, black: 0 };
  }, []);

  const deactivateMCI = useCallback(() => { setMciActive(false); }, []);

  const registerMCIPatient = useCallback((color: MCIPatient['triageColor'], complaint: string, vitals?: Partial<Vitals>, notes = '') => {
    mciSeqRef.current[color]++;
    const seq = mciSeqRef.current[color];
    const tag = `MCI-${color.toUpperCase()}-${String(seq).padStart(3, '0')}`;
    const p: MCIPatient = { id: `MCI-${Date.now()}`, mciTag: tag, triageColor: color, chiefComplaint: complaint, vitals, registeredAt: new Date(), notes };
    setMciPatients(prev => [p, ...prev]);
    if (offlineMode) {
      setOfflineQueue(prev => [...prev, { id: `E-${Date.now()}`, patientId: p.id, type: 'MCI_TRIAGE', description: `${tag}: ${complaint}`, timestamp: new Date() }]);
    }
    return p;
  }, [offlineMode]);

  const toggleOfflineMode = useCallback(() => setOfflineMode(prev => !prev), []);

  const syncOfflineQueue = useCallback(() => {
    offlineQueue.forEach(e => publishEvent(e));
    setOfflineQueue([]);
  }, [offlineQueue]);

  const resetData = useCallback(() => {
    localStorage.removeItem('ed_patients');
    localStorage.removeItem('ed_alerts');
    localStorage.removeItem('ed_handover');
    setPatients(initialEDPatients);
    setAlerts(initialBPAAlerts);
    setHandoverTasks(initialHandoverTasks);
  }, []);

  /* ─── Computed ─── */
  const activePatients = patients.filter(p => !['discharged', 'admitted', 'transferred', 'left_without_being_seen'].includes(p.status));
  const criticalAlerts = alerts.filter(a => !a.acknowledged);
  const pendingHandovers = handoverTasks.filter(t => t.status === 'pending');
  const zoneBreakdown = activePatients.reduce<Record<string, number>>((acc, p) => { acc[p.zone] = (acc[p.zone] || 0) + 1; return acc; }, {});

  const sortedPatients = surgeView
    ? [...activePatients].sort((a, b) => b.predictedDischargeScore - a.predictedDischargeScore)
    : [...activePatients].sort((a, b) => a.acuity - b.acuity || new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime());

  return {
    patients, activePatients, sortedPatients, alerts, criticalAlerts,
    handoverTasks, pendingHandovers,
    mciActive, mciPatients, offlineMode, offlineQueue,
    surgeView, setSurgeView, dischargeWorkflows,
    zoneBreakdown,
    addPatient, updatePatient, triagePatient,
    acknowledgeAlert, orderSepsisBundle,
    acknowledgeHandover, completeHandover, addHandoverTask,
    initiateDischarge, completeDischarge,
    activateMCI, deactivateMCI, registerMCIPatient,
    toggleOfflineMode, syncOfflineQueue, resetData,
    physicians: ED_PHYSICIANS, nurses: ED_NURSES,
  };
}
