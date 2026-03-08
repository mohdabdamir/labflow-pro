import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme';
import { useUserStore } from '@/hooks/useUserStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { useUsers } from '@/hooks/useLabData';
import {
  FlaskConical,
  Microscope,
  Radiation,
  Pill,
  CalendarDays,
  HeartPulse,
  Stethoscope,
  Bed,
  ChevronRight,
  ArrowLeftRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Module {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  ready: boolean;
  color: string;
  bgGradient: string;
  borderColor: string;
  category: 'laboratory' | 'imaging' | 'pharmacy' | 'clinical' | 'management';
  stats?: { label: string; value: string }[];
}

const MODULES: Module[] = [
  {
    id: 'clinical-pathology',
    title: 'Clinical Pathology',
    subtitle: 'Lab tests, results, case management & billing',
    icon: FlaskConical,
    href: '/lab',
    ready: true,
    color: 'text-sky-600',
    bgGradient: 'from-sky-50 to-cyan-50 dark:from-sky-950/40 dark:to-cyan-950/40',
    borderColor: 'border-sky-200 dark:border-sky-800',
    category: 'laboratory',
    stats: [
      { label: 'Active Tests', value: '48' },
      { label: 'Today\'s Cases', value: '12' },
    ],
  },
  {
    id: 'anatomic-pathology',
    title: 'Anatomic Pathology',
    subtitle: 'Histopathology, cytology & autopsy reports',
    icon: Microscope,
    href: '/anatomic-pathology',
    ready: false,
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    category: 'laboratory',
  },
  {
    id: 'radiology',
    title: 'Radiology',
    subtitle: 'X-Ray, CT, MRI, Ultrasound & PACS integration',
    icon: Radiation,
    href: '/radiology',
    ready: true,
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40',
    borderColor: 'border-orange-200 dark:border-orange-800',
    category: 'imaging',
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy',
    subtitle: 'Dispensing, inventory, prescriptions & drug interactions',
    icon: Pill,
    href: '/pharmacy',
    ready: false,
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40',
    borderColor: 'border-green-200 dark:border-green-800',
    category: 'pharmacy',
  },
  {
    id: 'appointments',
    title: 'Appointments',
    subtitle: 'Scheduling, booking management & patient flow',
    icon: CalendarDays,
    href: '/appointments',
    ready: false,
    color: 'text-rose-600',
    bgGradient: 'from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800',
    category: 'management',
  },
  {
    id: 'emergency',
    title: 'Emergency Unit',
    subtitle: 'Triage, ER tracking, critical alerts & resuscitation',
    icon: HeartPulse,
    href: '/emergency',
    ready: false,
    color: 'text-red-600',
    bgGradient: 'from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40',
    borderColor: 'border-red-200 dark:border-red-800',
    category: 'clinical',
  },
  {
    id: 'outpatient',
    title: 'Outpatient Clinic',
    subtitle: 'OPD visits, consultations, referrals & follow-ups',
    icon: Stethoscope,
    href: '/outpatient',
    ready: false,
    color: 'text-teal-600',
    bgGradient: 'from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/40',
    borderColor: 'border-teal-200 dark:border-teal-800',
    category: 'clinical',
  },
  {
    id: 'inpatient',
    title: 'Inpatient (Ward)',
    subtitle: 'Admissions, bed management, nursing notes & discharge',
    icon: Bed,
    href: '/inpatient',
    ready: false,
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    category: 'clinical',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  laboratory: 'Laboratory Services',
  imaging: 'Imaging & Diagnostics',
  pharmacy: 'Pharmacy',
  clinical: 'Clinical Units',
  management: 'Management',
};

const CATEGORIES = ['laboratory', 'imaging', 'pharmacy', 'clinical', 'management'] as const;

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  technician: 'bg-blue-500/10 text-blue-600 border-blue-200',
  pathologist: 'bg-purple-500/10 text-purple-600 border-purple-200',
  medical_director: 'bg-primary/10 text-primary border-primary/20',
  receptionist: 'bg-green-500/10 text-green-600 border-green-200',
  billing: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
};

function roleLabel(role: string) {
  return role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, logout } = useUserStore();
  const { users } = useUsers();

  const handleModuleClick = (mod: Module) => {
    navigate(mod.href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary rounded-lg">
            <HeartPulse className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-sm leading-none">MediCenter</h1>
            <p className="text-[10px] text-muted-foreground">Hospital Information System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Switch User (demo) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Switch User
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-2">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">Demo — switch active user</p>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-muted ${currentUser?.id === u.id ? 'bg-primary/10' : ''}`}
                >
                  <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{u.fullName}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel(u.role)}</p>
                  </div>
                  {currentUser?.id === u.id && (
                    <Badge variant="default" className="text-[10px] px-1.5">Active</Badge>
                  )}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">
                    {currentUser?.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'A'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{currentUser?.fullName ?? 'Unknown'}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${ROLE_COLORS[currentUser?.role ?? ''] ?? 'bg-muted text-muted-foreground'}`}>
                      {roleLabel(currentUser?.role ?? '')}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-widest mb-2">
                Hospital Information System
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                Welcome back, {currentUser?.fullName.split(' ')[0] ?? 'User'}
              </h2>
              <p className="text-primary-foreground/75 text-base">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                <p className="text-2xl font-bold text-primary-foreground">1</p>
                <p className="text-xs text-primary-foreground/70">Active Module</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                <p className="text-2xl font-bold text-primary-foreground">7</p>
                <p className="text-xs text-primary-foreground/70">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {CATEGORIES.map(category => {
          const mods = MODULES.filter(m => m.category === category);
          if (!mods.length) return null;
          return (
            <section key={category}>
              <div className="flex items-center gap-3 mb-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{mods.length} module{mods.length > 1 ? 's' : ''}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mods.map(mod => (
                  <ModuleCard key={mod.id} mod={mod} onClick={() => handleModuleClick(mod)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 mt-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>MediCenter HIS &copy; {new Date().getFullYear()}</span>
          <span>v1.0.0 — Clinical Pathology Module Active</span>
        </div>
      </footer>
    </div>
  );
}

function ModuleCard({ mod, onClick }: { mod: Module; onClick: () => void }) {
  const Icon = mod.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-2xl border p-5 transition-all duration-200',
        'bg-gradient-to-br shadow-sm',
        mod.bgGradient,
        mod.borderColor,
        mod.ready
          ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
          : 'cursor-pointer opacity-80 hover:opacity-100 hover:shadow-md',
      )}
    >
      {/* Status badge */}
      <div className="absolute top-3.5 right-3.5">
        {mod.ready ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        ) : (
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            Soon
          </span>
        )}
      </div>

      {/* Icon */}
      <div className={cn(
        'h-11 w-11 rounded-xl flex items-center justify-center mb-4 border',
        'bg-white/60 dark:bg-white/5',
        mod.borderColor,
      )}>
        <Icon className={cn('h-6 w-6', mod.color)} />
      </div>

      {/* Text */}
      <h4 className="font-semibold text-foreground text-sm mb-1 leading-snug">{mod.title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{mod.subtitle}</p>

      {/* Stats (ready modules only) */}
      {mod.ready && mod.stats && (
        <div className="flex gap-3 mb-3">
          {mod.stats.map(stat => (
            <div key={stat.label} className="bg-white/50 dark:bg-white/5 rounded-lg px-2.5 py-1.5 flex-1 text-center">
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className={cn(
        'flex items-center text-xs font-semibold gap-1 transition-all',
        mod.ready ? mod.color : 'text-muted-foreground',
        'group-hover:gap-2',
      )}>
        {mod.ready ? (
          <>Open Module <ChevronRight className="h-3.5 w-3.5" /></>
        ) : (
          <>View Roadmap <ChevronRight className="h-3.5 w-3.5" /></>
        )}
      </div>
    </button>
  );
}
