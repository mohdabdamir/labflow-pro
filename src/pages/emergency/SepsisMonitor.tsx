import React from 'react';
import { useEmergencyData, evaluateSIRS } from '@/hooks/useEmergencyData';
import { ACUITY_CONFIG, BPAAlert } from '@/types/emergency';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle, CheckCircle, HeartPulse, ShieldAlert,
  Syringe, Clock,
} from 'lucide-react';

export default function SepsisMonitor() {
  const { alerts, acknowledgeAlert, orderSepsisBundle, activePatients } = useEmergencyData();
  const { toast } = useToast();

  const sepsisAlerts = alerts.filter(a => a.type === 'sepsis_sirs');
  const criticalResults = alerts.filter(a => a.type === 'critical_result');
  const unacknowledged = alerts.filter(a => !a.acknowledged);

  // Live SIRS scan
  const sirsPatients = activePatients.map(p => {
    const latestVitals = p.vitals[p.vitals.length - 1];
    const sirs = evaluateSIRS(latestVitals, p.labs);
    return { patient: p, sirs, latestVitals };
  }).filter(s => s.sirs.criteriaCount > 0).sort((a, b) => b.sirs.criteriaCount - a.sirs.criteriaCount);

  const handleAck = (alert: BPAAlert) => {
    acknowledgeAlert(alert.id, 'Current User', 'Reviewed');
    toast({ title: 'Alert acknowledged' });
  };

  const handleOrderBundle = (patientId: string, alertId: string) => {
    orderSepsisBundle(patientId);
    acknowledgeAlert(alertId, 'Current User', 'Sepsis bundle ordered');
    toast({ title: 'Sepsis bundle ordered', description: '4 orders placed via protocol' });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-destructive" />
          Sepsis & Critical Alert Monitor
        </h1>
        <p className="text-sm text-muted-foreground">Background SIRS sentinel • Continuous monitoring every 5 seconds</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className={cn(unacknowledged.length > 0 && 'border-destructive bg-destructive/5')}>
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldAlert className={cn('h-8 w-8', unacknowledged.length > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground')} />
            <div>
              <div className="text-2xl font-bold">{unacknowledged.length}</div>
              <div className="text-xs text-muted-foreground">Unacknowledged Alerts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div>
              <div className="text-2xl font-bold">{sirsPatients.filter(s => s.sirs.isSIRS).length}</div>
              <div className="text-xs text-muted-foreground">Patients Meeting SIRS</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Syringe className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{alerts.filter(a => a.actionTaken?.includes('bundle')).length}</div>
              <div className="text-xs text-muted-foreground">Bundles Ordered Today</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active BPA Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Best Practice Advisory Alerts
              {unacknowledged.length > 0 && <Badge variant="destructive" className="text-[10px]">{unacknowledged.length} new</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {alerts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No alerts. Monitoring active.</p>}
                {alerts.map(alert => (
                  <div key={alert.id} className={cn('border rounded-lg p-3 space-y-2', !alert.acknowledged && 'border-destructive bg-destructive/5', alert.acknowledged && 'opacity-60')}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.patientName} • {new Date(alert.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <Badge variant={alert.acknowledged ? 'secondary' : 'destructive'} className="text-[10px]">
                        {alert.acknowledged ? 'ACK' : alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs">{alert.message}</p>
                    {!alert.acknowledged && (
                      <div className="flex gap-2">
                        {alert.type === 'sepsis_sirs' && (
                          <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => handleOrderBundle(alert.patientId, alert.id)}>
                            <Syringe className="h-3 w-3" /> One-Click: Order Sepsis Bundle
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAck(alert)}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Acknowledge
                        </Button>
                      </div>
                    )}
                    {alert.acknowledged && alert.actionTaken && (
                      <p className="text-[10px] text-muted-foreground">Action: {alert.actionTaken} by {alert.acknowledgedBy}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Live SIRS Scan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-amber-500" />
              Live SIRS Criteria Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {sirsPatients.map(({ patient, sirs, latestVitals }) => (
                  <div key={patient.id} className={cn('border rounded-lg p-3', sirs.isSIRS && 'border-amber-500 bg-amber-50 dark:bg-amber-950/20')}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded text-white', ACUITY_CONFIG[patient.acuity].bgColor)}>ESI {patient.acuity}</span>
                        <span className="text-sm font-semibold">{patient.name}</span>
                      </div>
                      <Badge variant={sirs.isSIRS ? 'destructive' : 'secondary'} className="text-[10px]">
                        {sirs.criteriaCount}/5 criteria
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-[10px]">
                      {[
                        { label: `HR ${latestVitals?.hr || '—'}`, met: sirs.hrMet, rule: '>90' },
                        { label: `RR ${latestVitals?.rr || '—'}`, met: sirs.rrMet, rule: '>20' },
                        { label: `Temp ${latestVitals?.temp || '—'}°`, met: sirs.tempMet, rule: '>38/<36' },
                        { label: 'WBC', met: sirs.wbcMet, rule: '>12/<4' },
                        { label: 'Lactate', met: sirs.lactateMet, rule: '>2.0' },
                      ].map((c, i) => (
                        <div key={i} className={cn('text-center p-1 rounded', c.met ? 'bg-destructive/20 text-destructive font-bold' : 'bg-muted text-muted-foreground')}>
                          <div>{c.label}</div>
                          <div className="text-[8px]">{c.rule}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {sirsPatients.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No patients with positive SIRS criteria</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
