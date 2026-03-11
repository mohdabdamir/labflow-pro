import React, { useState } from 'react';
import type { APCaseMessage, APUnitType, APMessagePriority } from '@/types/anatomicPathology';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle, Send, CheckCircle2, Clock, AlertTriangle,
  ChevronDown, ChevronUp, Plus, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/hooks/useUserStore';

const UNIT_LABELS: Record<APUnitType, string> = {
  pathology:        'Pathology',
  lab:              'Laboratory',
  billing:          'Billing',
  logistics:        'Logistics',
  customer_service: 'Customer Service',
  reception:        'Reception',
  management:       'Management',
};

const UNIT_COLORS: Record<APUnitType, string> = {
  pathology:        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  lab:              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  billing:          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  logistics:        'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  customer_service: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  reception:        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  management:       'bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300',
};

const STATUS_COLORS: Record<string, string> = {
  pending:      'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  acknowledged: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  resolved:     'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  escalated:    'text-destructive bg-destructive/10',
};

const PRIORITY_ICONS: Record<APMessagePriority, React.ComponentType<{className?:string}>> = {
  routine:  Clock,
  urgent:   AlertTriangle,
  critical: AlertTriangle,
};

const PRIORITY_COLORS: Record<APMessagePriority, string> = {
  routine:  'text-muted-foreground',
  urgent:   'text-amber-600',
  critical: 'text-destructive',
};

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

interface Props {
  caseId: string;
  messages: APCaseMessage[];
  onUpdate: (messages: APCaseMessage[]) => void;
}

export function APCaseCommunication({ caseId, messages, onUpdate }: Props) {
  const { toast } = useToast();
  const { currentUser } = useUserStore();
  const [composing, setComposing] = useState(false);
  const [expandedMsgId, setExpandedMsgId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [form, setForm] = useState({
    toUnit: 'lab' as APUnitType,
    subject: '',
    body: '',
    priority: 'routine' as APMessagePriority,
  });
  const [replyBody, setReplyBody] = useState('');

  const resolveUnitFromRole = (): APUnitType => {
    const role = currentUser?.role;
    if (role === 'pathologist' || role === 'medical_director') return 'pathology';
    if (role === 'technician') return 'lab';
    if (role === 'billing') return 'billing';
    if (role === 'receptionist') return 'reception';
    return 'management';
  };

  const handleSend = () => {
    if (!form.subject || !form.body) { toast({ title: 'Please fill in subject and message.', variant: 'destructive' }); return; }
    const msg: APCaseMessage = {
      id: genId(), caseId,
      fromUnit: resolveUnitFromRole(),
      fromUserId: currentUser?.id ?? 'USR001',
      fromUserName: currentUser?.fullName ?? 'System User',
      toUnit: form.toUnit,
      subject: form.subject,
      body: form.body,
      priority: form.priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    onUpdate([msg, ...messages]);
    setForm({ toUnit: 'lab', subject: '', body: '', priority: 'routine' });
    setComposing(false);
    toast({ title: 'Message sent', description: `Sent to ${UNIT_LABELS[form.toUnit]}` });
  };

  const handleAcknowledge = (msgId: string) => {
    onUpdate(messages.map(m => m.id === msgId ? {
      ...m, status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: currentUser?.fullName ?? 'User',
    } : m));
    toast({ title: 'Message acknowledged' });
  };

  const handleResolve = (msgId: string, note: string) => {
    onUpdate(messages.map(m => m.id === msgId ? {
      ...m, status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: currentUser?.fullName ?? 'User',
      resolutionNote: note,
    } : m));
    setReplyingTo(null);
    setReplyBody('');
    toast({ title: 'Message resolved' });
  };

  const sortedMsgs = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pending = messages.filter(m => m.status === 'pending').length;
  const acknowledged = messages.filter(m => m.status === 'acknowledged').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-violet-500" />
          <span className="font-semibold text-foreground">Case Communication</span>
          {pending > 0 && <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-0">{pending} pending</Badge>}
          {acknowledged > 0 && <Badge variant="secondary">{acknowledged} in progress</Badge>}
        </div>
        <Button size="sm" onClick={() => setComposing(c => !c)} variant={composing ? 'outline' : 'default'} className="gap-1.5">
          {composing ? <><X className="h-3.5 w-3.5" />Cancel</> : <><Plus className="h-3.5 w-3.5" />New Message</>}
        </Button>
      </div>

      {/* Compose Form */}
      {composing && (
        <div className="border border-primary/30 rounded-xl p-4 bg-primary/5 space-y-3">
          <h4 className="font-semibold text-sm text-foreground">Send a Message</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">To Unit</Label>
              <Select value={form.toUnit} onValueChange={v => setForm(f => ({ ...f, toUnit: v as APUnitType }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(UNIT_LABELS) as APUnitType[]).map(u => (
                    <SelectItem key={u} value={u}>{UNIT_LABELS[u]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as APMessagePriority }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Subject</Label>
            <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="h-8 text-xs" placeholder="Message subject..." />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Message</Label>
            <Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={3} className="text-xs" placeholder="Enter your message..." />
          </div>
          <Button size="sm" onClick={handleSend} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />Send Message
          </Button>
        </div>
      )}

      {/* Message List */}
      {sortedMsgs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          No messages yet for this case.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedMsgs.map(msg => {
            const PriorityIcon = PRIORITY_ICONS[msg.priority];
            const expanded = expandedMsgId === msg.id;
            return (
              <div key={msg.id} className={cn('border rounded-xl overflow-hidden transition-all', msg.status === 'pending' && 'border-amber-300 dark:border-amber-700')}>
                {/* Message Header */}
                <div
                  className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpandedMsgId(expanded ? null : msg.id)}
                >
                  <div className="mt-0.5 flex flex-col gap-1">
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', UNIT_COLORS[msg.fromUnit])}>{UNIT_LABELS[msg.fromUnit]}</span>
                    <span className="text-[9px] text-muted-foreground text-center">→</span>
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', UNIT_COLORS[msg.toUnit])}>{UNIT_LABELS[msg.toUnit]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{msg.subject}</p>
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', STATUS_COLORS[msg.status])}>
                        {msg.status}
                      </span>
                      <PriorityIcon className={cn('h-3.5 w-3.5', PRIORITY_COLORS[msg.priority])} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {msg.fromUserName} · {format(parseISO(msg.createdAt), 'dd MMM yyyy HH:mm')}
                    </p>
                    {!expanded && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{msg.body}</p>}
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
                </div>

                {/* Expanded */}
                {expanded && (
                  <div className="border-t border-border px-4 pb-4 space-y-3 bg-muted/10">
                    <p className="text-sm text-foreground pt-3 whitespace-pre-wrap">{msg.body}</p>

                    {(msg.acknowledgedBy || msg.resolvedBy) && (
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {msg.acknowledgedBy && <p>✓ Acknowledged by <span className="font-medium">{msg.acknowledgedBy}</span> at {msg.acknowledgedAt && format(parseISO(msg.acknowledgedAt), 'dd MMM HH:mm')}</p>}
                        {msg.resolvedBy && <p>✓ Resolved by <span className="font-medium">{msg.resolvedBy}</span> at {msg.resolvedAt && format(parseISO(msg.resolvedAt), 'dd MMM HH:mm')}</p>}
                        {msg.resolutionNote && <p className="italic">Note: {msg.resolutionNote}</p>}
                      </div>
                    )}

                    {/* Reply / Resolve area */}
                    {msg.status !== 'resolved' && (
                      <div className="flex gap-2 flex-wrap">
                        {msg.status === 'pending' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAcknowledge(msg.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5" />Acknowledge
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}>
                          Resolve with Note
                        </Button>
                      </div>
                    )}

                    {replyingTo === msg.id && (
                      <div className="space-y-2">
                        <Textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} rows={2} className="text-xs" placeholder="Enter resolution note..." />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleResolve(msg.id, replyBody)}>
                            <CheckCircle2 className="h-3.5 w-3.5" />Mark Resolved
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setReplyingTo(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
