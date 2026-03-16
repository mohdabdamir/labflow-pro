import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePharmacyData } from '@/hooks/usePharmacyData';
import {
  BarChart3, TrendingUp, Clock, Users, Pill,
  ShieldAlert, DollarSign, Activity, Bot,
} from 'lucide-react';

export default function PharmacyAnalytics() {
  const { metrics, prescriptions, inventory } = usePharmacyData();
  const today = metrics[metrics.length - 1];
  const weekTotal = metrics.reduce((s, m) => s + m.prescriptionsFilled, 0);
  const weekRevenue = metrics.reduce((s, m) => s + m.revenue, 0);
  const weekInterventions = metrics.reduce((s, m) => s + m.interventions, 0);
  const avgWait = Math.round(metrics.reduce((s, m) => s + m.avgWaitTime, 0) / metrics.length);

  const maxRx = Math.max(...metrics.map(m => m.prescriptionsFilled));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Pharmacy Analytics & Reporting
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Operational, clinical, and financial insights</p>
      </div>

      {/* Week KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={<Pill className="h-5 w-5 text-blue-500" />} label="Rx Filled (7d)" value={weekTotal} sub={`avg ${Math.round(weekTotal / 7)}/day`} />
        <SummaryCard icon={<DollarSign className="h-5 w-5 text-green-500" />} label="Revenue (7d)" value={`SAR ${weekRevenue.toLocaleString()}`} sub={`avg ${Math.round(weekRevenue / 7).toLocaleString()}/day`} />
        <SummaryCard icon={<Clock className="h-5 w-5 text-amber-500" />} label="Avg Wait Time" value={`${avgWait} min`} sub="7-day average" />
        <SummaryCard icon={<ShieldAlert className="h-5 w-5 text-orange-500" />} label="CDS Interventions" value={weekInterventions} sub="7-day total" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescriptions Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Daily Prescriptions (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {metrics.map((m, i) => {
                const pct = (m.prescriptionsFilled / maxRx) * 100;
                const isToday = i === metrics.length - 1;
                return (
                  <div key={m.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{m.prescriptionsFilled}</span>
                    <div
                      className={cn('w-full rounded-t-sm transition-all', isToday ? 'bg-primary' : 'bg-primary/30')}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(m.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Wait Time Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Avg Wait Time Trend (min)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {metrics.map((m, i) => {
                const maxWait = Math.max(...metrics.map(x => x.avgWaitTime));
                const pct = (m.avgWaitTime / maxWait) * 100;
                const isToday = i === metrics.length - 1;
                return (
                  <div key={m.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{m.avgWaitTime}</span>
                    <div
                      className={cn('w-full rounded-t-sm', isToday ? 'bg-amber-500' : 'bg-amber-500/30')}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(m.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical + Robot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-orange-500" />
              Clinical Interventions (7d)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.map((m, i) => (
              <div key={m.date} className="flex items-center justify-between text-xs py-0.5">
                <span className="text-muted-foreground">{new Date(m.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-orange-400/30 overflow-hidden" style={{ width: '80px' }}>
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${(m.interventions / 15) * 100}%` }} />
                  </div>
                  <span className="font-semibold text-foreground w-4 text-right">{m.interventions}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              Robot Dispenses (7d)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.map(m => (
              <div key={m.date} className="flex items-center justify-between text-xs py-0.5">
                <span className="text-muted-foreground">{new Date(m.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-purple-400/30 overflow-hidden" style={{ width: '80px' }}>
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(m.robotDispenses / 85) * 100}%` }} />
                  </div>
                  <span className="font-semibold text-foreground w-4 text-right">{m.robotDispenses}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Revenue (7d)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.map(m => {
              const maxRev = Math.max(...metrics.map(x => x.revenue));
              return (
                <div key={m.date} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-muted-foreground">{new Date(m.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-green-400/30 overflow-hidden" style={{ width: '80px' }}>
                      <div className="h-full bg-green-400 rounded-full" style={{ width: `${(m.revenue / maxRev) * 100}%` }} />
                    </div>
                    <span className="font-semibold text-foreground text-right" style={{ minWidth: '60px' }}>
                      {(m.revenue / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Value by Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Inventory Summary by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(['main_shelf', 'robot', 'fridge', 'controlled', 'floor_stock'] as const).map(loc => {
              const items = inventory.filter(i => i.location === loc);
              const val = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
              const locLabels: Record<string, string> = { main_shelf: 'Main Shelf', robot: 'Robot', fridge: 'Fridge', controlled: 'Controlled', floor_stock: 'Floor' };
              return (
                <div key={loc} className="p-3 rounded-lg border border-border bg-muted/30 text-center">
                  <p className="text-xs font-medium text-muted-foreground">{locLabels[loc]}</p>
                  <p className="text-lg font-bold text-foreground mt-1">{items.length}</p>
                  <p className="text-[10px] text-muted-foreground">SKUs</p>
                  <p className="text-xs font-semibold text-foreground mt-1">SAR {Math.round(val / 1000)}k</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2">{icon}</div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-medium text-foreground/80">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}
