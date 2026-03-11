import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorageState } from '@/hooks/useAPData';
import type { APCase, APCaseMessage, APUnitType } from '@/types/anatomicPathology';
import { mockAPCases } from '@/data/apMockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search, Plus, Filter, Microscope, MessageCircle, Clock,
  AlertTriangle, CheckCircle2, Mail, Upload, ChevronRight,
  Activity, FlaskConical, FileText, Users, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  registered:    { label: 'Registered',    color: 'text-blue-700 dark:text-blue-300',     bg: 'bg-blue-100 dark:bg-blue-900/30' },
  grossing:      { label: 'Grossing',      color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  processing:    { label: 'Processing',    color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  embedding:     { label: 'Embedding',     color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  sectioning:    { label: 'Sectioning',    color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  staining:      { label: 'Staining',      color: 'text-cyan-700 dark:text-cyan-300',     bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  transcription: { label: 'Transcription', color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  review:        { label: 'Review',        color: 'text-amber-700 dark:text-amber-300',   bg: 'bg-amber-100 dark:bg-amber-900/30' },
  finalized:     { label: 'Finalized',     color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  amended:       { label: 'Amended',       color: 'text-rose-700 dark:text-rose-300',     bg: 'bg-rose-100 dark:bg-rose-900/30' },
  cancelled:     { label: 'Cancelled',     color: 'text-muted-foreground',                bg: 'bg-muted' },
};

const DELIVERY_CONFIG: Record<string, { icon: React.ComponentType<{className?:string}>; label: string; color: string }> = {
  pending:         { icon: Clock,         label: 'Pending',         color: 'text-muted-foreground' },
  emailed:         { icon: Mail,          label: 'Emailed',         color: 'text-blue-600' },
  portal_uploaded: { icon: Upload,        label: 'Portal',          color: 'text-violet-600' },
  both:            { icon: CheckCircle2,  label: 'Emailed + Portal',color: 'text-emerald-600' },
  failed:          { icon: AlertTriangle, label: 'Failed',          color: 'text-destructive' },
};

const CANCER_COLORS: Record<string, string> = {
  benign:       'text-emerald-600',
  intermediate: 'text-amber-600',
  malignant:    'text-destructive',
  pending:      'text-muted-foreground',
};

export default function APDashboard() {
  const navigate = useNavigate();
  const [cases] = useLocalStorageState<APCase>('ap_cases', mockAPCases);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDelivery, setFilterDelivery] = useState('all');
  const [filterCaseType, setFilterCaseType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'critical' | 'messages'>('all');

  const stats = {
    total: cases.length,
    pending: cases.filter(c => !['finalized', 'cancelled'].includes(c.status)).length,
    finalized: cases.filter(c => c.status === 'finalized').length,
    critical: cases.filter(c => c.isCritical).length,
    unread: cases.reduce((sum, c) => sum + (c.unreadMessageCount || 0), 0),
  };

  const filtered = cases.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.caseNumber.toLowerCase().includes(q) ||
      c.patientName.toLowerCase().includes(q) ||
      c.patientId.toLowerCase().includes(q) ||
      c.clientName.toLowerCase().includes(q) ||
      c.treatingPhysician.toLowerCase().includes(q) ||
      c.caseType.toLowerCase().includes(q);

    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchDelivery = filterDelivery === 'all' || c.deliveryStatus === filterDelivery;
    const matchType = filterCaseType === 'all' || c.caseType === filterCaseType;
    const matchPriority = filterPriority === 'all' || c.priority === filterPriority;

    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && !['finalized', 'cancelled'].includes(c.status)) ||
      (activeTab === 'critical' && c.isCritical) ||
      (activeTab === 'messages' && (c.unreadMessageCount ?? 0) > 0);

    return matchSearch && matchStatus && matchDelivery && matchType && matchPriority && matchTab;
  });

  const uniqueCaseTypes = [...new Set(cases.map(c => c.caseType))];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Cases', value: stats.total, icon: Microscope, color: 'text-primary' },
          { label: 'In Progress', value: stats.pending, icon: Activity, color: 'text-amber-600' },
          { label: 'Finalized', value: stats.finalized, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Unread Messages', value: stats.unread, icon: MessageCircle, color: 'text-violet-600' },
        ].map(s => (
          <Card key={s.label} className="border-border">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{s.value}</p>
                </div>
                <s.icon className={cn('h-8 w-8 opacity-20', s.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {([
          { key: 'all',      label: 'All Cases',      count: stats.total },
          { key: 'pending',  label: 'In Progress',    count: stats.pending },
          { key: 'critical', label: 'Critical',       count: stats.critical },
          { key: 'messages', label: 'Unread Messages',count: stats.unread },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}>{tab.count}</span>
            )}
          </button>
        ))}
        <div className="flex-1" />
        <Button size="sm" className="mb-1 gap-1.5" onClick={() => navigate('/ap/cases/new')}>
          <Plus className="h-3.5 w-3.5" />New Case
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search case no, patient, client, physician..." className="pl-9 h-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCaseType} onValueChange={setFilterCaseType}>
          <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="Case Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueCaseTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDelivery} onValueChange={setFilterDelivery}>
          <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="Delivery" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Delivery</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="emailed">Emailed</SelectItem>
            <SelectItem value="portal_uploaded">Portal</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="stat">STAT</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="routine">Routine</SelectItem>
          </SelectContent>
        </Select>
        {(search || filterStatus !== 'all' || filterDelivery !== 'all' || filterCaseType !== 'all' || filterPriority !== 'all') && (
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => { setSearch(''); setFilterStatus('all'); setFilterDelivery('all'); setFilterCaseType('all'); setFilterPriority('all'); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Case Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Case No.</th>
                <th className="text-left px-4 py-3 font-medium">Patient</th>
                <th className="text-left px-4 py-3 font-medium">Client / Physician</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Specimens</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Report</th>
                <th className="text-left px-4 py-3 font-medium">Delivery</th>
                <th className="text-left px-4 py-3 font-medium">Msgs</th>
                <th className="text-left px-4 py-3 font-medium">Registered</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-16 text-muted-foreground">No cases found</td></tr>
              ) : filtered.map(c => {
                const sc = STATUS_CONFIG[c.status];
                const dc = DELIVERY_CONFIG[c.deliveryStatus];
                const DelivIcon = dc.icon;
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/ap/cases/${c.id}`)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.priority === 'stat' && <span className="text-[9px] font-black bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded">STAT</span>}
                        {c.priority === 'urgent' && <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded">URG</span>}
                        <span className="font-mono font-medium text-foreground text-xs">{c.caseNumber}</span>
                        {c.isCritical && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{c.patientName}</p>
                      <p className="text-xs text-muted-foreground">{c.patientId} · {c.patientGender} · {c.patientAge}y</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground text-xs font-medium">{c.clientName}</p>
                      <p className="text-xs text-muted-foreground">{c.treatingPhysician}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground">{c.caseType}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-foreground font-medium">{c.numberOfSpecimens}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[11px] font-semibold px-2 py-1 rounded-full', sc.bg, sc.color)}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {c.overallCancerType ? (
                        <span className={cn('text-xs font-semibold capitalize', CANCER_COLORS[c.overallCancerType])}>
                          {c.overallCancerType}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className={cn('flex items-center gap-1 text-xs', dc.color)}>
                        <DelivIcon className="h-3.5 w-3.5" />
                        <span>{dc.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {(c.unreadMessageCount ?? 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-violet-600">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {c.unreadMessageCount}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{c.messages.length}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {format(parseISO(c.registeredAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground">
          Showing {filtered.length} of {cases.length} cases
        </div>
      </div>
    </div>
  );
}
