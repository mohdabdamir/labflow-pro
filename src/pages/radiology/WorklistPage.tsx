import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_RADIOLOGY_STUDIES, RADIOLOGISTS } from '@/data/radiologyMockData';
import type { Study, StudyStatus, StudyPriority, Modality } from '@/types/radiology';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Search, Filter, RefreshCw, Eye, UserCheck, Printer,
  XCircle, MoreHorizontal, AlertTriangle, Clock, CheckCircle2,
  FileText, Activity, Calendar, ChevronUp, ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

const STATUS_CONFIG: Record<StudyStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Scheduled': { label: 'Scheduled', color: 'bg-muted text-muted-foreground border-border', icon: Calendar },
  'In Progress': { label: 'In Progress', color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900', icon: Activity },
  'Completed': { label: 'Completed', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900', icon: Clock },
  'Read': { label: 'Read', color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900', icon: FileText },
  'Verified': { label: 'Verified', color: 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-900', icon: CheckCircle2 },
  'Dictated': { label: 'Dictated', color: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900', icon: FileText },
};

const PRIORITY_CONFIG: Record<StudyPriority, { color: string; dot: string }> = {
  'Routine': { color: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  'Urgent': { color: 'text-orange-500', dot: 'bg-orange-500' },
  'STAT': { color: 'text-destructive font-bold', dot: 'bg-destructive animate-pulse' },
};

const MODALITY_COLORS: Record<Modality, string> = {
  CT: 'bg-blue-500/15 text-blue-600',
  MR: 'bg-purple-500/15 text-purple-600',
  XR: 'bg-gray-500/15 text-gray-600',
  US: 'bg-cyan-500/15 text-cyan-600',
  PET: 'bg-rose-500/15 text-rose-600',
  NM: 'bg-teal-500/15 text-teal-600',
  MG: 'bg-pink-500/15 text-pink-600',
  FL: 'bg-yellow-500/15 text-yellow-600',
};

type Tab = 'all' | 'stat' | 'unread' | 'today' | 'mine';
type SortKey = 'studyDate' | 'priority' | 'patient' | 'modality' | 'status';

export default function WorklistPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [modFilter, setModFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('studyDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [studies, setStudies] = useState<Study[]>(ALL_RADIOLOGY_STUDIES);

  const today = new Date().toISOString().split('T')[0];

  const tabCounts = useMemo(() => ({
    all: studies.length,
    stat: studies.filter(s => s.priority === 'STAT').length,
    unread: studies.filter(s => !['Read', 'Verified', 'Dictated'].includes(s.status)).length,
    today: studies.filter(s => s.studyDate === '2024-12-15').length,
    mine: studies.filter(s => s.readingRadiologist === RADIOLOGISTS[0]).length,
  }), [studies]);

  const filtered = useMemo(() => {
    let list = [...studies];

    // Tab filter
    if (activeTab === 'stat') list = list.filter(s => s.priority === 'STAT');
    else if (activeTab === 'unread') list = list.filter(s => !['Read', 'Verified', 'Dictated'].includes(s.status));
    else if (activeTab === 'today') list = list.filter(s => s.studyDate === '2024-12-15');
    else if (activeTab === 'mine') list = list.filter(s => s.readingRadiologist === RADIOLOGISTS[0]);

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.patient.fullName.toLowerCase().includes(q) ||
        s.patient.mrn.toLowerCase().includes(q) ||
        s.accessionNumber.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }

    // Modality
    if (modFilter !== 'all') list = list.filter(s => s.modality === modFilter);

    // Status
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);

    // Sort
    list.sort((a, b) => {
      let av: string, bv: string;
      if (sortKey === 'patient') { av = a.patient.fullName; bv = b.patient.fullName; }
      else if (sortKey === 'priority') {
        const order = { STAT: 0, Urgent: 1, Routine: 2 };
        return sortDir === 'asc' ? order[a.priority] - order[b.priority] : order[b.priority] - order[a.priority];
      }
      else { av = (a as any)[sortKey]; bv = (b as any)[sortKey]; }
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  }, [studies, activeTab, search, modFilter, statusFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const assignToSelf = (id: string) => {
    setStudies(s => s.map(st => st.id === id ? { ...st, readingRadiologist: RADIOLOGISTS[0] } : st));
    toast({ title: 'Study assigned', description: 'Assigned to Dr. Alexandra Reeves' });
  };

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3 ml-1 inline" /> : <ChevronDown className="h-3 w-3 ml-1 inline" />)
    : null;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Studies' },
    { key: 'stat', label: 'STAT' },
    { key: 'unread', label: 'Unread' },
    { key: 'today', label: 'Today' },
    { key: 'mine', label: 'My Worklist' },
  ];

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 bg-card border-b border-border px-4 py-3 space-y-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                activeTab === t.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {t.label}
              <span className={cn(
                'min-w-[18px] text-center rounded-full text-[10px] font-bold px-1',
                activeTab === t.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/20'
              )}>
                {tabCounts[t.key]}
              </span>
            </button>
          ))}
          <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0 rounded-md" onClick={() => {}}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search patient, MRN, accession…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={modFilter} onValueChange={setModFilter}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Modality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modalities</SelectItem>
              {['CT', 'MR', 'XR', 'US', 'PET', 'MG', 'NM'].map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.keys(STATUS_CONFIG).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>{filtered.length} studies</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground w-6"></th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('patient')}>
                Patient <SortIcon k="patient" />
              </th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Accession</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('studyDate')}>
                Date <SortIcon k="studyDate" />
              </th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('modality')}>
                Mod <SortIcon k="modality" />
              </th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Description</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('status')}>
                Status <SortIcon k="status" />
              </th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('priority')}>
                Priority <SortIcon k="priority" />
              </th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground hidden xl:table-cell">Radiologist</th>
              <th className="px-3 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((study, i) => {
              const prioConf = PRIORITY_CONFIG[study.priority];
              const statConf = STATUS_CONFIG[study.status];
              const StatIcon = statConf.icon;
              return (
                <tr
                  key={study.id}
                  className={cn(
                    'border-b border-border/50 transition-colors cursor-pointer group',
                    i % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                    'hover:bg-primary/5',
                    study.priority === 'STAT' && 'border-l-2 border-l-destructive'
                  )}
                  onClick={() => navigate(`/radiology/viewer/${study.id}`)}
                >
                  {/* Priority dot */}
                  <td className="px-3 py-2.5">
                    <span className={cn('h-2 w-2 rounded-full block mx-auto', prioConf.dot)} />
                  </td>
                  {/* Patient */}
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-foreground text-xs leading-tight">{study.patient.fullName}</div>
                    <div className="text-[10px] text-muted-foreground">{study.patient.mrn} · {study.patient.age}y {study.patient.gender}</div>
                  </td>
                  {/* Accession */}
                  <td className="px-3 py-2.5 hidden md:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">{study.accessionNumber}</span>
                  </td>
                  {/* Date */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-foreground">{study.studyDate}</span>
                    <div className="text-[10px] text-muted-foreground">{study.studyTime}</div>
                  </td>
                  {/* Modality */}
                  <td className="px-3 py-2.5">
                    <span className={cn('text-[11px] font-bold px-1.5 py-0.5 rounded', MODALITY_COLORS[study.modality])}>
                      {study.modality}
                    </span>
                  </td>
                  {/* Description */}
                  <td className="px-3 py-2.5 hidden lg:table-cell">
                    <span className="text-xs text-foreground line-clamp-1 max-w-[200px]">{study.description}</span>
                    <div className="text-[10px] text-muted-foreground">{study.bodyPart}</div>
                  </td>
                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border', statConf.color)}>
                      <StatIcon className="h-2.5 w-2.5" />
                      {statConf.label}
                    </span>
                  </td>
                  {/* Priority */}
                  <td className="px-3 py-2.5">
                    <span className={cn('text-xs', prioConf.color)}>{study.priority}</span>
                  </td>
                  {/* Radiologist */}
                  <td className="px-3 py-2.5 hidden xl:table-cell">
                    <span className="text-xs text-muted-foreground line-clamp-1">{study.readingRadiologist ?? '—'}</span>
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => navigate(`/radiology/viewer/${study.id}`)}>
                          <Eye className="h-3.5 w-3.5 mr-2" />Open in Viewer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => assignToSelf(study.id)}>
                          <UserCheck className="h-3.5 w-3.5 mr-2" />Assign to Me
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/radiology/reports/${study.id}`)}>
                          <FileText className="h-3.5 w-3.5 mr-2" />Open Report
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Printer className="h-3.5 w-3.5 mr-2" />Print Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="h-3.5 w-3.5 mr-2" />Reject Study
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="text-center py-16 text-muted-foreground text-sm">No studies match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
