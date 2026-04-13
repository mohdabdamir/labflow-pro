import React, { useState, useEffect } from 'react';
import { useEmergencyData } from '@/hooks/useEmergencyData';
import { ACUITY_CONFIG, ZONE_CONFIG, EDPatient } from '@/types/emergency';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Clock, Search, BarChart3, Zap, Users, AlertTriangle,
  Heart, Thermometer, Droplets, Activity,
} from 'lucide-react';

function TimeSince({ date }: { date: Date }) {
  const [, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 10000); return () => clearInterval(i); }, []);
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return <span>{hrs}h {mins % 60}m</span>;
  return <span>{mins}m</span>;
}

function PatientTile({ patient, onClick }: { patient: EDPatient; onClick: () => void }) {
  const acuity = ACUITY_CONFIG[patient.acuity];
  const zone = ZONE_CONFIG[patient.zone];
  const lastVitals = patient.vitals[patient.vitals.length - 1];
  const lastLab = patient.labs[patient.labs.length - 1];
  const timeSinceLastLab = lastLab ? (Date.now() - new Date(lastLab.timestamp).getTime()) / 60000 : Infinity;
  const triageTime = patient.triageTime ? new Date(patient.triageTime) : null;
  const waitBreach = triageTime ? (Date.now() - triageTime.getTime()) / 60000 > acuity.maxWaitMinutes && patient.status === 'waiting' : false;
  const isYellow = waitBreach || (timeSinceLastLab > 30 && timeSinceLastLab < Infinity && patient.status === 'pending_results');
  const isRed = patient.hasCriticalResult;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md border-l-4',
        isRed && 'animate-pulse border-destructive bg-destructive/5',
        isYellow && !isRed && 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
        !isRed && !isYellow && acuity.borderColor,
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', acuity.bgColor, acuity.color)}>
              ESI {patient.acuity}
            </span>
            <span className="font-semibold text-sm truncate">{patient.name}</span>
            {patient.isPediatric && <span className="text-[10px] px-1 py-0.5 bg-pink-100 text-pink-700 rounded dark:bg-pink-900/40 dark:text-pink-300">PED</span>}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
            <Clock className="h-3 w-3" />
            <TimeSince date={new Date(patient.arrivalTime)} />
          </div>
        </div>

        {/* Chief complaint */}
        <p className="text-xs text-muted-foreground truncate">{patient.chiefComplaint}</p>

        {/* Vitals mini */}
        {lastVitals && (
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5 text-red-500" />{lastVitals.hr}</span>
            <span className="flex items-center gap-0.5"><Activity className="h-2.5 w-2.5 text-blue-500" />{lastVitals.sbp}/{lastVitals.dbp}</span>
            <span className="flex items-center gap-0.5"><Thermometer className="h-2.5 w-2.5 text-orange-500" />{lastVitals.temp}°</span>
            <span className="flex items-center gap-0.5"><Droplets className="h-2.5 w-2.5 text-cyan-500" />{lastVitals.spo2}%</span>
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2">
            <span className={cn('font-medium', zone.color)}>{zone.label}</span>
            {patient.bed && <span className="text-muted-foreground">• {patient.bed}</span>}
          </div>
          <div className="flex items-center gap-1">
            {isRed && <AlertTriangle className="h-3 w-3 text-destructive" />}
            <Badge variant="outline" className="text-[9px] h-4 px-1">{patient.status.replace(/_/g, ' ')}</Badge>
          </div>
        </div>

        {/* Predicted discharge */}
        <div className="flex items-center gap-1">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${patient.predictedDischargeScore}%` }} />
          </div>
          <span className="text-[9px] text-muted-foreground w-8 text-right">{patient.predictedDischargeScore}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrackingBoard() {
  const { sortedPatients, activePatients, surgeView, setSurgeView, criticalAlerts, zoneBreakdown, patients } = useEmergencyData();
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<EDPatient | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const filtered = sortedPatients.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.mrn.toLowerCase().includes(search.toLowerCase())) return false;
    if (zoneFilter !== 'all' && p.zone !== zoneFilter) return false;
    return true;
  });

  const zones = Object.entries(ZONE_CONFIG);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            ED Tracking Board
            <Badge variant="secondary" className="text-base">{activePatients.length}</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Real-time patient tracking • Auto-refreshing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={surgeView ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSurgeView(!surgeView)}
            className="gap-1"
          >
            <Zap className="h-3 w-3" />
            Surge View
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {zones.map(([key, cfg]) => (
          <Card key={key} className={cn('cursor-pointer', zoneFilter === key && 'ring-2 ring-primary')} onClick={() => setZoneFilter(zoneFilter === key ? 'all' : key)}>
            <CardContent className="p-2 text-center">
              <div className={cn('text-lg font-bold', cfg.color)}>{zoneBreakdown[key] || 0}</div>
              <div className="text-[10px] text-muted-foreground">{cfg.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patient or MRN..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        {zoneFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setZoneFilter('all')}>Clear filter</Button>
        )}
        {surgeView && (
          <Badge variant="outline" className="text-xs gap-1"><BarChart3 className="h-3 w-3" /> Sorted by discharge likelihood</Badge>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(p => (
          <PatientTile key={p.id} patient={p} onClick={() => setSelectedPatient(p)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No patients match filters</p>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={o => !o && setSelectedPatient(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', ACUITY_CONFIG[selectedPatient.acuity].bgColor, ACUITY_CONFIG[selectedPatient.acuity].color)}>
                    ESI {selectedPatient.acuity}
                  </span>
                  {selectedPatient.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">MRN:</span> {selectedPatient.mrn}</div>
                  <div><span className="text-muted-foreground">Age/Sex:</span> {selectedPatient.age}{selectedPatient.gender}</div>
                  <div><span className="text-muted-foreground">Zone:</span> {ZONE_CONFIG[selectedPatient.zone].label}</div>
                  <div><span className="text-muted-foreground">Bed:</span> {selectedPatient.bed || '—'}</div>
                  <div><span className="text-muted-foreground">MD:</span> {selectedPatient.assignedMD || '—'}</div>
                  <div><span className="text-muted-foreground">RN:</span> {selectedPatient.assignedRN || '—'}</div>
                </div>

                <div>
                  <h4 className="font-semibold text-xs mb-1">Chief Complaint</h4>
                  <p className="text-xs">{selectedPatient.chiefComplaint}</p>
                </div>

                {selectedPatient.allergies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-xs mb-1 text-destructive">Allergies</h4>
                    <div className="flex gap-1 flex-wrap">{selectedPatient.allergies.map(a => <Badge key={a} variant="destructive" className="text-[10px]">{a}</Badge>)}</div>
                  </div>
                )}

                {/* Vitals history */}
                <div>
                  <h4 className="font-semibold text-xs mb-1">Vitals</h4>
                  <div className="space-y-1">
                    {[...selectedPatient.vitals].reverse().slice(0, 3).map(v => (
                      <div key={v.id} className="flex items-center gap-2 text-[10px] bg-muted/50 rounded px-2 py-1">
                        <span className="text-muted-foreground w-12">{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>HR {v.hr}</span><span>BP {v.sbp}/{v.dbp}</span><span>T {v.temp}°</span><span>SpO₂ {v.spo2}%</span><span>RR {v.rr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Labs */}
                {selectedPatient.labs.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-xs mb-1">Labs</h4>
                    <div className="space-y-1">
                      {selectedPatient.labs.map(l => (
                        <div key={l.id} className={cn('flex items-center justify-between text-[10px] px-2 py-1 rounded', l.isCritical ? 'bg-destructive/10 text-destructive font-semibold' : 'bg-muted/50')}>
                          <span>{l.testName}</span>
                          <span>{l.value} {l.unit} <span className="text-muted-foreground">({l.normalRange})</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orders */}
                {selectedPatient.orders.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-xs mb-1">Orders</h4>
                    <div className="space-y-1">
                      {selectedPatient.orders.map(o => (
                        <div key={o.id} className="flex items-center justify-between text-[10px] bg-muted/50 rounded px-2 py-1">
                          <span>{o.description}</span>
                          <Badge variant="outline" className="text-[9px] h-4">{o.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Event log */}
                <div>
                  <h4 className="font-semibold text-xs mb-1">Event Log</h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-1">
                      {[...selectedPatient.events].reverse().map(e => (
                        <div key={e.id} className="flex gap-2 text-[10px]">
                          <span className="text-muted-foreground w-12 shrink-0">{new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <Badge variant="outline" className="text-[9px] h-4 shrink-0">{e.type}</Badge>
                          <span className="truncate">{e.description}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
