import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePharmacyData } from '@/hooks/usePharmacyData';
import {
  Wifi, RefreshCw, Plus, CheckCircle2, AlertTriangle,
  X, Clock, Activity, FileText, Zap, Globe, Server,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { HL7Connection } from '@/types/pharmacy';

const STATUS_CONFIG = {
  connected:    { label: 'Connected',    cls: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800', dot: 'bg-green-500' },
  disconnected: { label: 'Disconnected', cls: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
  error:        { label: 'Error',        cls: 'bg-destructive/10 text-destructive border-destructive/30', dot: 'bg-destructive' },
  testing:      { label: 'Testing…',     cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400', dot: 'bg-blue-500 animate-pulse' },
};

export default function IntegrationsPage() {
  const { hl7Connections, hl7Logs, robots, testHL7Connection, testAllConnections } = usePharmacyData();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  async function handleTest(id: string, name: string) {
    toast({ title: `Testing connection: ${name}…` });
    await testHL7Connection(id);
  }

  const connectedCount = hl7Connections.filter(h => h.status === 'connected').length;
  const errorCount = hl7Connections.filter(h => h.status === 'error' || h.status === 'disconnected').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Wifi className="h-6 w-6 text-primary" />
            HL7 / FHIR Integrations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage bidirectional HL7 v2.x, FHIR R4, and system connections
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={testAllConnections}>
            <RefreshCw className="h-3.5 w-3.5" />
            Test All
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Connection
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-foreground">{connectedCount}</p><p className="text-xs text-muted-foreground">Connected</p></CardContent></Card>
        <Card className={cn(errorCount > 0 && 'ring-1 ring-destructive/40')}><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /></div><p className="text-2xl font-bold text-foreground">{errorCount}</p><p className="text-xs text-muted-foreground">Issues</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Activity className="h-4 w-4 text-blue-500" /></div><p className="text-2xl font-bold text-foreground">{hl7Connections.reduce((s, h) => s + h.messagesProcessed, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Messages Processed</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Zap className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-foreground">{hl7Connections.reduce((s, h) => s + h.messagesErrored, 0)}</p><p className="text-xs text-muted-foreground">Errors Total</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Connections Table */}
        <div className="xl:col-span-2 space-y-3">
          <h2 className="font-semibold text-foreground text-sm">HL7 / FHIR Connections</h2>
          {hl7Connections.map(conn => {
            const sc = STATUS_CONFIG[conn.status];
            return (
              <Card key={conn.id} className={cn('overflow-hidden transition-all', conn.status === 'error' && 'ring-1 ring-destructive/30')}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <span className={cn('h-2.5 w-2.5 rounded-full inline-block', sc.dot)} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{conn.name}</span>
                        <Badge variant="outline" className={cn('text-[10px]', sc.cls)}>{sc.label}</Badge>
                        <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">{conn.protocol}</Badge>
                        <Badge variant="outline" className={cn('text-[10px]', conn.type === 'incoming' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400' : conn.type === 'outgoing' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400')}>
                          {conn.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{conn.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Server className="h-3 w-3" />{conn.host}:{conn.port}</span>
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" />HL7 {conn.hl7Version}</span>
                        {conn.latencyMs && <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-green-500" />{conn.latencyMs}ms</span>}
                        <span>{conn.messagesProcessed.toLocaleString()} processed · {conn.messagesErrored} errors</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {conn.messageTypes.map(t => (
                          <span key={t} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                        ))}
                      </div>
                      {conn.status === 'error' && (
                        <div className="mt-1 text-xs text-destructive bg-destructive/10 rounded px-2 py-1">
                          ⚠ Connection issue. Last activity: {conn.lastActivity ? new Date(conn.lastActivity).toLocaleString() : 'Unknown'}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs shrink-0 gap-1"
                      disabled={conn.status === 'testing'}
                      onClick={() => handleTest(conn.id, conn.name)}
                    >
                      {conn.status === 'testing' ? (
                        <><RefreshCw className="h-3 w-3 animate-spin" />Testing…</>
                      ) : (
                        <><Wifi className="h-3 w-3" />Test</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right: Robots + Message Log */}
        <div className="space-y-4">
          {/* Robot Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Robot Systems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {robots.map(r => (
                <div key={r.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{r.name}</span>
                    <Badge variant="outline" className={cn('text-[10px]', r.status === 'online' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' : r.status === 'busy' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400' : 'bg-destructive/10 text-destructive border-destructive/30')}>
                      {r.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.model} · {r.vendor}</p>
                  <p className="text-xs text-foreground/70 truncate">{r.currentOperation}</p>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span>IP: {r.ipAddress}</span>
                    <span>Bins: {r.occupiedBins}/{r.totalBins}</span>
                  </div>
                  {r.status === 'busy' && (
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 animate-pulse rounded-full" style={{ width: '60%' }} />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Message Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Recent HL7 Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hl7Logs.slice(0, 6).map(log => (
                <div key={log.id} className="space-y-1">
                  <div
                    className="flex items-center justify-between py-1.5 cursor-pointer"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn('h-2 w-2 rounded-full shrink-0', log.status === 'processed' || log.status === 'acked' ? 'bg-green-500' : log.status === 'error' ? 'bg-destructive' : 'bg-amber-500')} />
                      <span className="text-xs font-mono font-semibold text-foreground">{log.messageType}</span>
                      <span className="text-xs text-muted-foreground truncate">{log.patientName ?? log.connectionName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {log.latencyMs && <span className="text-[10px] text-muted-foreground">{log.latencyMs}ms</span>}
                      <Badge variant="outline" className={cn('text-[10px]', log.direction === 'in' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                        {log.direction.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  {expandedLog === log.id && (
                    <div className="bg-muted rounded-lg p-2 text-[11px] text-muted-foreground space-y-1 ml-4">
                      <p>ID: {log.messageId}</p>
                      <p>Time: {new Date(log.processedAt).toLocaleString()}</p>
                      {log.errorDetails && <p className="text-destructive font-medium">{log.errorDetails}</p>}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Connection Dialog */}
      {showAdd && (
        <Dialog open onOpenChange={() => setShowAdd(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />Add HL7 Connection
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Connection Name</Label>
                <Input placeholder="e.g. CPOE → Pharmacy" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Host / IP</Label>
                <Input placeholder="10.1.2.10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Port</Label>
                <Input placeholder="2575" type="number" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Protocol</Label>
                <Input placeholder="MLLP / HTTP / HTTPS" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">HL7 Version</Label>
                <Input placeholder="2.5" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Input placeholder="What does this connection do?" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={() => { setShowAdd(false); }}>Save Connection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
