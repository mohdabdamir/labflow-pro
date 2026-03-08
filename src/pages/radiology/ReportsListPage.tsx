import React, { useState } from 'react';
import { ALL_RADIOLOGY_STUDIES } from '@/data/radiologyMockData';
import type { Study, ReportStatus } from '@/types/radiology';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, FileText, Eye, CheckCircle2, AlertTriangle, Clock, Edit } from 'lucide-react';

const STATUS_COLORS: Record<ReportStatus, string> = {
  Draft: 'bg-muted text-muted-foreground border-border',
  Preliminary: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900',
  Final: 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-900',
  Addendum: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900',
};

export default function ReportsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const studiesWithReports = ALL_RADIOLOGY_STUDIES.filter(s => s.report);

  const filtered = studiesWithReports.filter(s => {
    if (statusFilter !== 'all' && s.report?.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.patient.fullName.toLowerCase().includes(q) ||
        s.patient.mrn.toLowerCase().includes(q) ||
        s.accessionNumber.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: studiesWithReports.length,
    Draft: studiesWithReports.filter(s => s.report?.status === 'Draft').length,
    Preliminary: studiesWithReports.filter(s => s.report?.status === 'Preliminary').length,
    Final: studiesWithReports.filter(s => s.report?.status === 'Final').length,
    Addendum: studiesWithReports.filter(s => s.report?.status === 'Addendum').length,
  };

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      <div className="shrink-0 px-4 py-3 bg-card border-b border-border space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'Draft', 'Preliminary', 'Final', 'Addendum'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {s === 'all' ? 'All Reports' : s}
              <span className={cn('text-[10px] font-bold px-1 rounded-full', statusFilter === s ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/20')}>
                {(counts as any)[s]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search patient, MRN…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 content-start">
        {filtered.map(study => {
          const r = study.report!;
          return (
            <div key={study.id} className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{study.patient.fullName}</p>
                  <p className="text-xs text-muted-foreground">{study.patient.mrn} · {study.patient.age}y {study.patient.gender}</p>
                </div>
                <span className={cn('shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border', STATUS_COLORS[r.status])}>
                  {r.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium truncate">{study.description}</p>
                <p className="text-[10px] text-muted-foreground">{study.accessionNumber} · {study.studyDate} · {study.modality}</p>
              </div>
              {r.impression && (
                <p className="text-xs text-muted-foreground line-clamp-2 italic border-l-2 border-border pl-2">{r.impression}</p>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                {r.criticalFindings && (
                  <span className="flex items-center gap-1 text-[10px] text-destructive px-1.5 py-0.5 bg-destructive/10 rounded border border-destructive/20">
                    <AlertTriangle className="h-2.5 w-2.5" />Critical
                  </span>
                )}
                {r.signedBy && (
                  <span className="flex items-center gap-1 text-[10px] text-green-600 px-1.5 py-0.5 bg-green-500/10 rounded border border-green-200 dark:border-green-900">
                    <CheckCircle2 className="h-2.5 w-2.5" />{r.signedBy}
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 pt-1">
                <Button variant="outline" size="sm" className="h-7 text-xs flex-1 gap-1" onClick={() => navigate(`/radiology/viewer/${study.id}`)}>
                  <Eye className="h-3.5 w-3.5" />View Images
                </Button>
                <Button size="sm" className="h-7 text-xs flex-1 gap-1" onClick={() => navigate(`/radiology/reports/${study.id}`)}>
                  <Edit className="h-3.5 w-3.5" />
                  {r.status === 'Final' ? 'View Report' : 'Edit Report'}
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
            No reports found.
          </div>
        )}
      </div>
    </div>
  );
}
