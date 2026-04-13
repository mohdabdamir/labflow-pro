import React, { useState } from 'react';
import { useEmergencyData } from '@/hooks/useEmergencyData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeftRight, CheckCircle, AlertTriangle, Clock,
  Plus, FileWarning, ShieldCheck,
} from 'lucide-react';

export default function HandoverPage() {
  const { handoverTasks, acknowledgeHandover, completeHandover, addHandoverTask, activePatients } = useEmergencyData();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({ patientId: '', description: '', priority: 'routine' as const });

  const pending = handoverTasks.filter(t => t.status === 'pending');
  const acknowledged = handoverTasks.filter(t => t.status === 'acknowledged');
  const completed = handoverTasks.filter(t => t.status === 'completed');
  const staleResults = pending.filter(t => t.isStaleResult);

  const handleAdd = () => {
    const p = activePatients.find(pt => pt.id === newTask.patientId);
    if (!p || !newTask.description) return;
    addHandoverTask({
      patientId: p.id, patientName: p.name,
      description: newTask.description,
      priority: newTask.priority, status: 'pending',
      createdBy: 'Current User', createdAt: new Date(),
      isStaleResult: false,
    });
    toast({ title: 'Handover task created' });
    setAddOpen(false);
    setNewTask({ patientId: '', description: '', priority: 'routine' });
  };

  const TaskCard = ({ task }: { task: typeof handoverTasks[0] }) => (
    <div className={cn(
      'border rounded-lg p-3 space-y-2',
      task.isStaleResult && 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
      task.priority === 'critical' && !task.isStaleResult && 'border-destructive/50',
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {task.isStaleResult && <FileWarning className="h-4 w-4 text-amber-500" />}
          <span className="font-semibold text-sm">{task.patientName}</span>
          <Badge variant={task.priority === 'critical' ? 'destructive' : task.priority === 'urgent' ? 'default' : 'secondary'} className="text-[10px]">
            {task.priority}
          </Badge>
        </div>
        <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
      </div>
      <p className="text-xs">{task.description}</p>
      {task.isStaleResult && (
        <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Stale Result Escrow — Mandatory acknowledgement required before result viewing
        </div>
      )}
      <div className="text-[10px] text-muted-foreground">Created by {task.createdBy} at {new Date(task.createdAt).toLocaleTimeString()}</div>
      {task.status === 'pending' && (
        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { acknowledgeHandover(task.id, 'Current User'); toast({ title: 'Task acknowledged' }); }}>
          <ShieldCheck className="h-3 w-3" /> Acknowledge & Accept
        </Button>
      )}
      {task.status === 'acknowledged' && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Accepted by {task.assignedTo}</span>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { completeHandover(task.id); toast({ title: 'Task completed' }); }}>
            <CheckCircle className="h-3 w-3" /> Mark Complete
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ArrowLeftRight className="h-6 w-6" /> Shift Handover</h1>
          <p className="text-sm text-muted-foreground">Structured pending-actions • Stale Result Escrow • Accountability chain</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Add Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Handover Task</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Patient</Label>
                <Select value={newTask.patientId} onValueChange={v => setNewTask(t => ({ ...t, patientId: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select patient..." /></SelectTrigger>
                  <SelectContent>{activePatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.mrn})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={newTask.description} onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))} rows={3} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={newTask.priority} onValueChange={v => setNewTask(t => ({ ...t, priority: v as any }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleAdd}>Create Handover Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stale Results Warning */}
      {staleResults.length > 0 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-3 flex items-center gap-3">
            <FileWarning className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{staleResults.length} Stale Result(s) in Escrow</p>
              <p className="text-xs text-muted-foreground">Results from orders placed near shift-end require mandatory acknowledgement</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Pending ({pending.length})</CardTitle></CardHeader>
          <CardContent><ScrollArea className="h-[400px]"><div className="space-y-2">{pending.map(t => <TaskCard key={t.id} task={t} />)}{pending.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No pending tasks</p>}</div></ScrollArea></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Acknowledged ({acknowledged.length})</CardTitle></CardHeader>
          <CardContent><ScrollArea className="h-[400px]"><div className="space-y-2">{acknowledged.map(t => <TaskCard key={t.id} task={t} />)}{acknowledged.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No acknowledged tasks</p>}</div></ScrollArea></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Completed ({completed.length})</CardTitle></CardHeader>
          <CardContent><ScrollArea className="h-[400px]"><div className="space-y-2">{completed.map(t => <TaskCard key={t.id} task={t} />)}{completed.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No completed tasks</p>}</div></ScrollArea></CardContent>
        </Card>
      </div>
    </div>
  );
}
