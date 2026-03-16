// ============================================================
// Pharmacy Module — Central Data & State Hook
// ============================================================
import { useState, useCallback } from 'react';
import type {
  QueueTicket, Prescription, InventoryItem, HL7Connection,
  RobotSystem, PharmacyCounter, ReorderAlert, HL7MessageLog,
  PharmacyPatient, PrescriptionStatus, PharmacyQueueStatus,
} from '@/types/pharmacy';
import {
  mockQueueTickets, mockPrescriptions, mockInventory,
  mockHL7Connections, mockRobotSystems, mockCounters,
  mockReorderAlerts, mockHL7Logs, mockPharmacyPatients,
  mockPharmacyMetrics, mockInventoryTransactions,
} from '@/data/pharmacyMockData';

export function usePharmacyData() {
  const [queue, setQueue] = useState<QueueTicket[]>(mockQueueTickets);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [hl7Connections, setHL7Connections] = useState<HL7Connection[]>(mockHL7Connections);
  const [robots, setRobots] = useState<RobotSystem[]>(mockRobotSystems);
  const [counters, setCounters] = useState<PharmacyCounter[]>(mockCounters);
  const [reorderAlerts] = useState<ReorderAlert[]>(mockReorderAlerts);
  const [hl7Logs, setHL7Logs] = useState<HL7MessageLog[]>(mockHL7Logs);
  const [patients] = useState<PharmacyPatient[]>(mockPharmacyPatients);
  const metrics = mockPharmacyMetrics;
  const transactions = mockInventoryTransactions;

  // ── Queue Actions ─────────────────────────────────────
  const callNextTicket = useCallback((counterId: number) => {
    const waiting = queue
      .filter(t => t.status === 'waiting')
      .sort((a, b) => {
        const pOrder = { urgent: 0, elderly_disabled: 1, pediatric: 2, normal: 3 };
        return pOrder[a.priority] - pOrder[b.priority];
      });
    if (!waiting.length) return;
    const next = waiting[0];
    setQueue(q => q.map(t =>
      t.id === next.id
        ? { ...t, status: 'called', calledAt: new Date().toISOString(), counter: counterId }
        : t
    ));
    setCounters(c => c.map(ct =>
      ct.id === counterId
        ? { ...ct, currentTicketId: next.id, currentPatientName: next.patient.firstName + ' ' + next.patient.lastName }
        : ct
    ));
  }, [queue]);

  const updateTicketStatus = useCallback((ticketId: string, status: PharmacyQueueStatus) => {
    setQueue(q => q.map(t =>
      t.id === ticketId ? { ...t, status, ...(status === 'dispensed' ? { collectedAt: new Date().toISOString() } : {}) } : t
    ));
  }, []);

  const addQueueTicket = useCallback((patient: PharmacyPatient, prescriptionIds: string[]) => {
    const existing = queue.filter(t => ['waiting', 'called', 'processing'].includes(t.status));
    const nextNum = 40 + existing.length + 1;
    const ticket: QueueTicket = {
      id: `Q${Date.now()}`, ticketNumber: `A${String(nextNum).padStart(3, '0')}`,
      qrCode: `QR-A${nextNum}-2025`, patientId: patient.id, patient,
      status: 'waiting', priority: 'normal', prescriptionIds,
      issuedAt: new Date().toISOString(), estimatedWait: existing.length * 7, source: 'staff',
    };
    setQueue(q => [...q, ticket]);
  }, [queue]);

  // ── Prescription Actions ─────────────────────────────
  const updatePrescriptionStatus = useCallback((rxId: string, status: PrescriptionStatus, notes?: string) => {
    setPrescriptions(p => p.map(rx =>
      rx.id === rxId
        ? {
            ...rx, status,
            dispensingHistory: notes ? [
              ...rx.dispensingHistory,
              { id: `DE${Date.now()}`, timestamp: new Date().toISOString(), action: `Status → ${status}`, userId: 'USR', userName: 'Current User', details: notes },
            ] : rx.dispensingHistory,
          }
        : rx
    ));
  }, []);

  const dispenseItem = useCallback((rxId: string, itemId: string) => {
    setPrescriptions(p => p.map(rx =>
      rx.id === rxId
        ? {
            ...rx,
            items: rx.items.map(item =>
              item.id === itemId
                ? { ...item, status: 'dispensed' as const, dispensedAt: new Date().toISOString(), dispensedBy: 'Current Pharmacist' }
                : item
            ),
            dispensingHistory: [
              ...rx.dispensingHistory,
              { id: `DE${Date.now()}`, timestamp: new Date().toISOString(), action: 'Item Dispensed', userId: 'USR', userName: 'Current Pharmacist', details: `Dispensed: ${rx.items.find(i => i.id === itemId)?.drugName}` },
            ],
          }
        : rx
    ));
  }, []);

  // ── Inventory Actions ────────────────────────────────
  const adjustInventory = useCallback((itemId: string, delta: number, reason: string) => {
    setInventory(inv => inv.map(item => {
      if (item.id !== itemId) return item;
      const newQty = Math.max(0, item.quantity + delta);
      const drug = item.drug;
      const status = newQty === 0 ? 'out_of_stock' : newQty < drug.reorderPoint ? 'low_stock' : 'in_stock';
      return { ...item, quantity: newQty, availableQuantity: Math.max(0, item.availableQuantity + delta), status: status as any };
    }));
  }, []);

  // ── HL7 Actions ──────────────────────────────────────
  const testHL7Connection = useCallback(async (connId: string) => {
    setHL7Connections(c => c.map(h => h.id === connId ? { ...h, status: 'testing' } : h));
    await new Promise(r => setTimeout(r, 2000));
    const success = Math.random() > 0.3;
    setHL7Connections(c => c.map(h => {
      if (h.id !== connId) return h;
      const newLog: HL7MessageLog = {
        id: `LOG${Date.now()}`, connectionId: connId, connectionName: h.name,
        messageType: 'ACK', direction: 'out', status: success ? 'acked' : 'error',
        messageId: `TEST-${Date.now()}`,
        processedAt: new Date().toISOString(), latencyMs: success ? Math.floor(Math.random() * 80 + 20) : 0,
        errorDetails: success ? undefined : 'Connection refused. Host unreachable.',
      };
      setHL7Logs(l => [newLog, ...l]);
      return {
        ...h,
        status: success ? 'connected' : 'error',
        lastActivity: new Date().toISOString(),
        latencyMs: success ? Math.floor(Math.random() * 80 + 20) : undefined,
        messagesErrored: success ? h.messagesErrored : h.messagesErrored + 1,
      };
    }));
  }, []);

  const testAllConnections = useCallback(() => {
    hl7Connections.forEach(h => testHL7Connection(h.id));
  }, [hl7Connections, testHL7Connection]);

  // ── Computed Stats ───────────────────────────────────
  const queueStats = {
    total: queue.filter(t => ['waiting', 'called', 'processing'].includes(t.status)).length,
    waiting: queue.filter(t => t.status === 'waiting').length,
    urgent: queue.filter(t => t.status === 'waiting' && t.priority === 'urgent').length,
    ready: queue.filter(t => t.status === 'ready_for_collection').length,
    avgWait: 11,
  };

  const rxStats = {
    total: prescriptions.length,
    new: prescriptions.filter(r => r.actionType === 'new' && r.status === 'received').length,
    clinicalReview: prescriptions.filter(r => r.status === 'clinical_review').length,
    clarification: prescriptions.filter(r => r.actionType === 'clarification').length,
    counseling: prescriptions.filter(r => r.counselingRequired && r.status !== 'dispensed').length,
    ready: prescriptions.filter(r => r.status === 'ready').length,
    dispensed: prescriptions.filter(r => r.status === 'dispensed').length,
    urgentCount: prescriptions.filter(r => r.actionType === 'urgent').length,
  };

  const inventoryStats = {
    lowStock: inventory.filter(i => i.status === 'low_stock').length,
    outOfStock: inventory.filter(i => i.status === 'out_of_stock').length,
    expiringSoon: inventory.filter(i => {
      const days = Math.floor((new Date(i.expiry).getTime() - Date.now()) / 86400000);
      return days <= 60 && days > 0;
    }).length,
    fridgeItems: inventory.filter(i => i.location === 'fridge').length,
    robotItems: inventory.filter(i => i.location === 'robot').length,
    totalValue: inventory.reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
  };

  return {
    queue, prescriptions, inventory, hl7Connections, robots,
    counters, reorderAlerts, hl7Logs, patients, metrics, transactions,
    queueStats, rxStats, inventoryStats,
    callNextTicket, updateTicketStatus, addQueueTicket,
    updatePrescriptionStatus, dispenseItem,
    adjustInventory,
    testHL7Connection, testAllConnections,
  };
}
