import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppointmentsData } from '@/hooks/useAppointmentsData';
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle2, XCircle } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

const STATUS_COLORS_PIE: Record<string, string> = {
  completed: '#10b981',
  cancelled: '#ef4444',
  no_show: '#6b7280',
  scheduled: '#3b82f6',
  confirmed: '#22c55e',
  rescheduled: '#f59e0b',
};

export default function AppointmentsReports() {
  const { appointments, physicians } = useAppointmentsData();
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  const today = new Date();
  const days = parseInt(period, 10);
  const dateRange = eachDayOfInterval({ start: subDays(today, days - 1), end: today });

  // Daily trend data
  const dailyData = useMemo(() => dateRange.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayApts = appointments.filter(a => a.date === dateStr);
    return {
      date: format(day, days <= 7 ? 'EEE' : 'MMM d'),
      total: dayApts.length,
      completed: dayApts.filter(a => a.status === 'completed').length,
      cancelled: dayApts.filter(a => a.status === 'cancelled').length,
      noShow: dayApts.filter(a => a.status === 'no_show').length,
    };
  }), [appointments, dateRange, days]);

  // Status distribution
  const statusDist = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  }, [appointments]);

  // Physician utilization
  const physicianStats = useMemo(() =>
    physicians.map(phy => {
      const phyApts = appointments.filter(a =>
        a.physicianId === phy.id &&
        a.date >= format(subDays(today, days - 1), 'yyyy-MM-dd') &&
        a.date <= format(today, 'yyyy-MM-dd')
      );
      const completed = phyApts.filter(a => a.status === 'completed').length;
      const noShow = phyApts.filter(a => a.status === 'no_show').length;
      const cancelled = phyApts.filter(a => a.status === 'cancelled').length;
      return {
        name: phy.name.replace('Dr. ', ''),
        total: phyApts.length,
        completed, noShow, cancelled,
        utilization: phyApts.length > 0 ? Math.round((completed / phyApts.length) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total),
    [appointments, physicians, days]
  );

  // Appointment type breakdown
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => { counts[a.type] = (counts[a.type] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.replace('_', ' '), value }))
      .sort((a, b) => b.value - a.value);
  }, [appointments]);

  const totalInPeriod = appointments.filter(a =>
    a.date >= format(subDays(today, days - 1), 'yyyy-MM-dd')
  ).length;

  const completedInPeriod = appointments.filter(a =>
    a.date >= format(subDays(today, days - 1), 'yyyy-MM-dd') && a.status === 'completed'
  ).length;

  const noShowInPeriod = appointments.filter(a =>
    a.date >= format(subDays(today, days - 1), 'yyyy-MM-dd') && a.status === 'no_show'
  ).length;

  const cancInPeriod = appointments.filter(a =>
    a.date >= format(subDays(today, days - 1), 'yyyy-MM-dd') && a.status === 'cancelled'
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Appointment performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={v => setPeriod(v as typeof period)}>
            <SelectTrigger className="h-9 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 text-xs">Export Report</Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Appointments', value: totalInPeriod, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Completed', value: completedInPeriod, sub: `${totalInPeriod > 0 ? Math.round((completedInPeriod / totalInPeriod) * 100) : 0}% completion`, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/40' },
          { label: 'No-Show Rate', value: `${totalInPeriod > 0 ? Math.round((noShowInPeriod / totalInPeriod) * 100) : 0}%`, sub: `${noShowInPeriod} patients`, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40' },
          { label: 'Cancellation Rate', value: `${totalInPeriod > 0 ? Math.round((cancInPeriod / totalInPeriod) * 100) : 0}%`, sub: `${cancInPeriod} cancelled`, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/40' },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="pt-5 pb-4">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${kpi.bg}`}>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                {kpi.sub && <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Daily trend */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Daily Appointment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[2, 2, 0, 0]} />
                <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" radius={[2, 2, 0, 0]} />
                <Bar dataKey="noShow" fill="#9ca3af" name="No-Show" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" outerRadius={65} dataKey="value" nameKey="name">
                  {statusDist.map((entry, i) => (
                    <Cell key={entry.name} fill={STATUS_COLORS_PIE[entry.name.replace(' ', '_')] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 w-full mt-1">
              {statusDist.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS_PIE[entry.name.replace(' ', '_')] || COLORS[i % COLORS.length] }} />
                  <span className="capitalize text-muted-foreground">{entry.name}</span>
                  <span className="font-medium ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Physician utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Physician Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={physicianStats} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" stackId="a" />
                <Bar dataKey="noShow" fill="#9ca3af" name="No-Show" stackId="a" />
                <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" stackId="a" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment type breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Appointment Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {typeData.map((item, i) => {
              const pct = Math.round((item.value / appointments.length) * 100);
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-xs capitalize text-muted-foreground w-32 shrink-0">{item.name}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{item.value}</span>
                  <span className="text-[10px] text-muted-foreground w-8">{pct}%</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Per-physician table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physician Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 pr-4 font-medium">Physician</th>
                  <th className="text-center py-2 px-3 font-medium">Total</th>
                  <th className="text-center py-2 px-3 font-medium">Completed</th>
                  <th className="text-center py-2 px-3 font-medium">Cancelled</th>
                  <th className="text-center py-2 px-3 font-medium">No-Show</th>
                  <th className="text-center py-2 px-3 font-medium">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {physicianStats.map(s => (
                  <tr key={s.name} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 pr-4 font-medium">Dr. {s.name}</td>
                    <td className="text-center py-2.5 px-3">{s.total}</td>
                    <td className="text-center py-2.5 px-3 text-green-600">{s.completed}</td>
                    <td className="text-center py-2.5 px-3 text-red-500">{s.cancelled}</td>
                    <td className="text-center py-2.5 px-3 text-muted-foreground">{s.noShow}</td>
                    <td className="text-center py-2.5 px-3">
                      <Badge className={`text-[10px] ${s.utilization >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : s.utilization >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {s.utilization}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
