import React, { useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCases, useServices, useClients } from '@/hooks/useLabData';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Users,
  TestTubes
} from 'lucide-react';
import { StatusBadge, PriorityIndicator } from '@/components/cases';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { cases } = useCases();
  const { services } = useServices();
  const { clients } = useClients();

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayCases = cases.filter(c => new Date(c.receivedDate).toDateString() === today);
    
    return {
      totalCasesToday: todayCases.length,
      pendingCases: cases.filter(c => c.status === 'received').length,
      inProcessCases: cases.filter(c => c.status === 'in-process').length,
      completedCases: cases.filter(c => c.status === 'completed' || c.status === 'reported').length,
      urgentCases: cases.filter(c => c.priority === 'urgent' || c.priority === 'stat').length,
      totalServices: services.filter(s => s.isActive).length,
      totalClients: clients.filter(c => c.isActive).length,
    };
  }, [cases, services, clients]);

  const recentCases = useMemo(() => {
    return [...cases]
      .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
      .slice(0, 5);
  }, [cases]);

  const statCards = [
    { 
      title: 'Pending Cases', 
      value: stats.pendingCases, 
      icon: Clock, 
      color: 'text-status-received',
      bgColor: 'bg-status-received/10'
    },
    { 
      title: 'In Process', 
      value: stats.inProcessCases, 
      icon: Activity, 
      color: 'text-status-in-process',
      bgColor: 'bg-status-in-process/10'
    },
    { 
      title: 'Completed', 
      value: stats.completedCases, 
      icon: CheckCircle, 
      color: 'text-status-completed',
      bgColor: 'bg-status-completed/10'
    },
    { 
      title: 'Urgent/STAT', 
      value: stats.urgentCases, 
      icon: AlertTriangle, 
      color: 'text-result-critical',
      bgColor: 'bg-result-critical/10'
    },
  ];

  const quickStats = [
    { title: 'Active Tests', value: stats.totalServices, icon: TestTubes },
    { title: 'Active Clients', value: stats.totalClients, icon: Users },
  ];

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Welcome to PathLab LIS</h2>
                <p className="text-primary-foreground/80">
                  Laboratory Information System • {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <Link to="/lab/cases">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <FileText className="mr-2 h-4 w-4" />
                  New Case
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={cn('p-3 rounded-full', stat.bgColor)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Cases</CardTitle>
              <Link to="/lab/cases">
                <Button variant="ghost" size="sm">
                  View All
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCases.map((caseItem) => (
                  <div 
                    key={caseItem.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-sm">{caseItem.caseNumber}</p>
                        <p className="text-xs text-muted-foreground">{caseItem.patientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PriorityIndicator priority={caseItem.priority} size="sm" />
                      <StatusBadge status={caseItem.status} size="sm" />
                    </div>
                  </div>
                ))}
                {recentCases.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No cases found. Create your first case to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickStats.map((stat) => (
                  <div key={stat.title} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <stat.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{stat.title}</span>
                    </div>
                    <span className="text-lg font-bold">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/lab/cases" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Create New Case
                  </Button>
                </Link>
                <Link to="/lab/services" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TestTubes className="mr-2 h-4 w-4" />
                    Manage Services
                  </Button>
                </Link>
                <Link to="/lab/clients" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Clients
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
