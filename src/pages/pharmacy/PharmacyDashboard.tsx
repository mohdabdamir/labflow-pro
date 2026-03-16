import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePharmacyData } from '@/hooks/usePharmacyData';
import {
  Users, Clock, AlertTriangle, CheckCircle2, Package, Wifi,
  ChevronRight, Bell, Activity, TrendingUp, Robot, Cpu,
  ClipboardList, Pill, RefreshCw, PhoneCall,
} from 'lucide-react';
import type { QueueTicket } from '@/types/pharmacy';

const PRIORITY_COLORS = {
  urgent: 'bg-destructive/10 text-destructive border-destructive/30',
  elderly_disabled: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400',
  pediatric: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400',
  normal: 'bg-muted text-muted-foreground border-border',
};

const STATUS_COLORS: Record<string, string> = {
  waiting: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400',
  called: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400',
  processing: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400',
  ready_for_collection: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400',
  dispensed: 'bg-muted text-muted-foreground border-border',
};

export default function PharmacyDashboard() {
  const navigate = useNavigate();
  const {
    queue, counters, queueStats, rxStats, inventoryStats,
    callNextTicket, updateTicketStatus, metrics, robots, hl7Connections,
  } = usePharmacyData();

  const [lastRefresh] = useState(new Date());

  const activeQueue = queue.filter(t => ['waiting', 'called', 'processing', 'ready_for_collection'].includes(t.status));
  const today = metrics[metrics.length - 1];
  const yesterday = metrics[metrics.length - 2];

  const disconnectedHL7 = hl7Connections.filter(h => h.status === 'error' || h.status === 'disconnected').length;

  function formatWait(issuedAt: string) {
    const mins = Math.floor((Date.now() - new Date(issuedAt).getTime()) / 60000);
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── KPI Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard icon={<Users className="h-5 w-5 text-blue-500" />} label="Queue" value={queueStats.total} sub={`${queueStats.waiting} waiting`} color="blue" onClick={() => {}} />
        <KPICard icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} label="Urgent" value={queueStats.urgent} sub="priority tickets" color="amber" alert={queueStats.urgent > 0} />
        <KPICard icon={<ClipboardList className="h-5 w-5 text-purple-500" />} label="Rx Actions" value={rxStats.clinicalReview + rxStats.clarification} sub="need attention" color="purple" alert={(rxStats.clinicalReview + rxStats.clarification) > 0} onClick={() => navigate('/pharmacy/prescriptions')} />
        <KPICard icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Ready" value={queueStats.ready} sub="for collection" color="green" onClick={() => navigate('/pharmacy/prescriptions')} />
        <KPICard icon={<Package className="h-5 w-5 text-red-500" />} label="Out of Stock" value={inventoryStats.outOfStock} sub={`${inventoryStats.lowStock} low`} color="red" alert={inventoryStats.outOfStock > 0} onClick={() => navigate('/pharmacy/inventory')} />
        <KPICard icon={<Activity className="h-5 w-5 text-teal-500" />} label="Today Rx" value={today?.prescriptionsFilled ?? 0} sub={`↑ ${today && yesterday ? today.prescriptionsFilled - yesterday.prescriptionsFilled : 0} vs yesterday`} color="teal" />
      </div>

      {/* ── Main Layout: Queue + Counters ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Queue Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Patient Queue
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Updated {lastRefresh.toLocaleTimeString()}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Priority legend */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { label: 'URGENT', cls: 'bg-destructive/10 text-destructive border-destructive/30 border' },
              { label: 'ELDERLY / DISABLED', cls: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400' },
              { label: 'PEDIATRIC', cls: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400' },
              { label: 'NORMAL', cls: 'bg-muted text-muted-foreground border border-border' },
            ].map(p => (
              <span key={p.label} className={cn('px-2 py-0.5 rounded-full font-medium', p.cls)}>{p.label}</span>
            ))}
          </div>

          <div className="space-y-2">
            {activeQueue.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-xl">
                Queue is currently empty
              </div>
            ) : (
              activeQueue
                .sort((a, b) => {
                  const pOrder = { urgent: 0, elderly_disabled: 1, pediatric: 2, normal: 3 };
                  const sOrder: Record<string, number> = { called: 0, processing: 0, ready_for_collection: 1, waiting: 2 };
                  return (sOrder[a.status] ?? 3) - (sOrder[b.status] ?? 3) || pOrder[a.priority] - pOrder[b.priority];
                })
                .map(ticket => (
                  <QueueTicketRow
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={(status) => updateTicketStatus(ticket.id, status)}
                    waitTime={formatWait(ticket.issuedAt)}
                  />
                ))
            )}
          </div>
        </div>

        {/* Right Panel: Counters + System Status */}
        <div className="space-y-4">
          {/* Dispensing Counters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-green-500" />
                Dispensing Counters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {counters.map(counter => (
                <div key={counter.id} className={cn(
                  'p-3 rounded-lg border transition-colors',
                  counter.isOpen ? 'border-border bg-card' : 'border-dashed border-border/50 bg-muted/30',
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-foreground">{counter.name}</span>
                    <Badge variant="outline" className={cn(
                      'text-[10px]',
                      counter.isOpen ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' : 'bg-muted text-muted-foreground',
                    )}>
                      {counter.isOpen ? 'OPEN' : 'CLOSED'}
                    </Badge>
                  </div>
                  {counter.isOpen && counter.staffName && (
                    <p className="text-xs text-muted-foreground truncate mb-2">{counter.staffName}</p>
                  )}
                  {counter.isOpen && counter.currentPatientName && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded px-2 py-1 text-xs text-blue-700 dark:text-blue-400 mb-2">
                      Serving: <span className="font-semibold">{counter.currentPatientName}</span>
                    </div>
                  )}
                  {counter.isOpen && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs gap-1"
                      onClick={() => callNextTicket(counter.id)}
                    >
                      <Bell className="h-3 w-3" />
                      Call Next
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Robot Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-500" />
                Robot Systems
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {robots.map(robot => (
                <div key={robot.id} className="p-2.5 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground truncate">{robot.name}</span>
                    <RobotStatusBadge status={robot.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{robot.currentOperation}</p>
                  {robot.status === 'busy' && (
                    <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '65%' }} />
                    </div>
                  )}
                  <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>Bins: {robot.occupiedBins}/{robot.totalBins}</span>
                    <span>Queue: {robot.queuedCommands}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* HL7 Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  HL7 Interfaces
                </span>
                {disconnectedHL7 > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground text-[10px]">{disconnectedHL7} issues</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {hl7Connections.slice(0, 4).map(conn => (
                <div key={conn.id} className="flex items-center justify-between py-1">
                  <span className="text-xs text-foreground/80 truncate flex-1 mr-2">{conn.name}</span>
                  <HL7StatusDot status={conn.status} />
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full h-7 text-xs mt-1" onClick={() => navigate('/pharmacy/integrations')}>
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Today's Performance ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Avg Wait Time" value={`${today?.avgWaitTime ?? 0} min`} icon="⏱" trend={today && yesterday ? today.avgWaitTime - yesterday.avgWaitTime : 0} invertTrend />
        <MetricCard label="Rx Filled Today" value={String(today?.prescriptionsFilled ?? 0)} icon="💊" trend={today && yesterday ? today.prescriptionsFilled - yesterday.prescriptionsFilled : 0} />
        <MetricCard label="CDS Interventions" value={String(today?.interventions ?? 0)} icon="🔬" trend={0} />
        <MetricCard label="Revenue Today" value={`SAR ${(today?.revenue ?? 0).toLocaleString()}`} icon="💰" trend={today && yesterday ? today.revenue - yesterday.revenue : 0} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────

function KPICard({ icon, label, value, sub, color, alert, onClick }: {
  icon: React.ReactNode; label: string; value: number; sub: string;
  color: string; alert?: boolean; onClick?: () => void;
}) {
  return (
    <Card
      className={cn('relative overflow-hidden transition-all cursor-pointer hover:shadow-md', alert && 'ring-2 ring-destructive/40')}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          {icon}
          {alert && <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />}
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-medium text-foreground/80 truncate">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

function QueueTicketRow({ ticket, onStatusChange, waitTime }: {
  ticket: QueueTicket;
  onStatusChange: (s: any) => void;
  waitTime: string;
}) {
  const { patient } = ticket;
  const hasAllergy = patient.allergies.some(a => a.severity === 'life_threatening' || a.severity === 'severe');
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border transition-all',
      ticket.priority === 'urgent' ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card hover:bg-muted/40',
    )}>
      {/* Ticket Number */}
      <div className={cn(
        'h-12 w-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border-2',
        ticket.priority === 'urgent' ? 'bg-destructive text-destructive-foreground border-destructive' :
          ticket.priority === 'pediatric' ? 'bg-blue-500 text-white border-blue-500' :
            'bg-primary text-primary-foreground border-primary',
      )}>
        {ticket.ticketNumber}
      </div>

      {/* Patient Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-foreground truncate">
            {patient.firstName} {patient.lastName}
          </span>
          {hasAllergy && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground shrink-0">
              ⚠ ALLERGY
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>MRN: {patient.mrn}</span>
          <span>·</span>
          <span>Wait: {waitTime}</span>
          {ticket.counter && <><span>·</span><span>Counter {ticket.counter}</span></>}
        </div>
      </div>

      {/* Status + Priority */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <Badge variant="outline" className={cn('text-[10px]', STATUS_COLORS[ticket.status] ?? 'bg-muted text-muted-foreground')}>
          {ticket.status.replace('_', ' ').toUpperCase()}
        </Badge>
        <Badge variant="outline" className={cn('text-[10px]', PRIORITY_COLORS[ticket.priority])}>
          {ticket.priority.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Quick Action */}
      {ticket.status === 'ready_for_collection' && (
        <Button size="sm" variant="default" className="text-xs h-7 px-2.5 bg-green-600 hover:bg-green-700" onClick={() => onStatusChange('dispensed')}>
          ✓ Collected
        </Button>
      )}
    </div>
  );
}

function RobotStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    online: { label: 'Online', cls: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' },
    busy: { label: 'Busy', cls: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400' },
    offline: { label: 'Offline', cls: 'bg-muted text-muted-foreground' },
    error: { label: 'Error', cls: 'bg-destructive/10 text-destructive border-destructive/30' },
    maintenance: { label: 'Maint.', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  };
  const s = map[status] ?? map.offline;
  return <Badge variant="outline" className={cn('text-[10px]', s.cls)}>{s.label}</Badge>;
}

function HL7StatusDot({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    connected: { color: 'bg-green-500', label: 'Connected' },
    disconnected: { color: 'bg-muted-foreground', label: 'Disconnected' },
    error: { color: 'bg-destructive', label: 'Error' },
    testing: { color: 'bg-blue-500 animate-pulse', label: 'Testing' },
  };
  const s = map[status] ?? map.disconnected;
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full shrink-0', s.color)} />
      <span className="text-[10px] text-muted-foreground">{s.label}</span>
    </div>
  );
}

function MetricCard({ label, value, icon, trend, invertTrend }: {
  label: string; value: string; icon: string; trend: number; invertTrend?: boolean;
}) {
  const isPositive = invertTrend ? trend < 0 : trend > 0;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg">{icon}</span>
          {trend !== 0 && (
            <span className={cn('text-xs font-semibold', isPositive ? 'text-green-600' : 'text-destructive')}>
              {trend > 0 ? '+' : ''}{trend}{typeof trend === 'number' && Math.abs(trend) < 100 && !String(trend).includes('.') ? '' : ''}
            </span>
          )}
        </div>
        <p className="font-bold text-foreground text-sm">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}
