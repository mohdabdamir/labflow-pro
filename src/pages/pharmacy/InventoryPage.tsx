import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePharmacyData } from '@/hooks/usePharmacyData';
import type { InventoryItem } from '@/types/pharmacy';
import {
  Package, Search, AlertTriangle, Filter, Thermometer,
  Cpu, FlaskConical, Shield, TrendingDown, RefreshCw,
  ChevronRight, CheckCircle2, Clock, X, BarChart2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LOCATION_LABELS: Record<string, string> = {
  main_shelf: 'Main Shelf',
  robot: 'Robot (Auto)',
  fridge: '❄ Fridge',
  controlled: '🔒 Controlled',
  floor_stock: 'Floor Stock',
  returns: 'Returns',
};

const STATUS_CONFIG = {
  in_stock:    { label: 'In Stock',     cls: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800' },
  low_stock:   { label: 'Low Stock',    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800' },
  out_of_stock:{ label: 'Out of Stock', cls: 'bg-destructive/10 text-destructive border-destructive/30' },
  expired:     { label: 'Expired',      cls: 'bg-destructive/20 text-destructive border-destructive/50' },
  recalled:    { label: '⚠ Recalled',   cls: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400' },
};

export default function InventoryPage() {
  const { inventory, inventoryStats, reorderAlerts, transactions, adjustInventory } = usePharmacyData();
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = inventory.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      item.drug.brandName.toLowerCase().includes(q) ||
      item.drug.genericName.toLowerCase().includes(q) ||
      item.drug.ndc.toLowerCase().includes(q) ||
      item.lot.toLowerCase().includes(q) ||
      item.supplierName.toLowerCase().includes(q);
    const matchLoc = locFilter === 'all' || item.location === locFilter;
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchLoc && matchStatus;
  });

  // Expiry alerts
  const expiryAlerts = inventory.filter(item => {
    const days = Math.floor((new Date(item.expiry).getTime() - Date.now()) / 86400000);
    return days <= 90 && days > 0;
  }).sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());

  function daysUntilExpiry(expiry: string) {
    return Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000);
  }

  function expiryColor(days: number) {
    if (days <= 30) return 'text-destructive font-semibold';
    if (days <= 60) return 'text-amber-600 dark:text-amber-400 font-semibold';
    return 'text-muted-foreground';
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Inventory Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time multi-location drug inventory with FEFO tracking</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Robot
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <InvKPI icon={<Package className="h-4 w-4 text-blue-500" />} label="Total SKUs" value={inventory.length} />
        <InvKPI icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} label="In Stock" value={inventory.filter(i => i.status === 'in_stock').length} />
        <InvKPI icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} label="Low Stock" value={inventoryStats.lowStock} alert />
        <InvKPI icon={<X className="h-4 w-4 text-destructive" />} label="Out of Stock" value={inventoryStats.outOfStock} alert />
        <InvKPI icon={<Clock className="h-4 w-4 text-orange-500" />} label="Expiring ≤60d" value={inventoryStats.expiringSoon} alert={inventoryStats.expiringSoon > 0} />
        <InvKPI icon={<BarChart2 className="h-4 w-4 text-purple-500" />} label="Stock Value" value={`SAR ${Math.round(inventoryStats.totalValue / 1000)}k`} />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Inventory Table */}
        <div className="xl:col-span-3 space-y-4">
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drug name, NDC, lot, supplier..."
                className="pl-9 bg-card"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Tabs value={locFilter} onValueChange={setLocFilter}>
              <TabsList className="h-9 text-xs">
                <TabsTrigger value="all" className="text-xs px-2.5">All</TabsTrigger>
                <TabsTrigger value="main_shelf" className="text-xs px-2.5">Shelf</TabsTrigger>
                <TabsTrigger value="robot" className="text-xs px-2.5">
                  <Cpu className="h-3 w-3 mr-1" />Robot
                </TabsTrigger>
                <TabsTrigger value="fridge" className="text-xs px-2.5">
                  <Thermometer className="h-3 w-3 mr-1" />Fridge
                </TabsTrigger>
                <TabsTrigger value="controlled" className="text-xs px-2.5">
                  <Shield className="h-3 w-3 mr-1" />Controlled
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Drug</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lot / Expiry</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => {
                    const days = daysUntilExpiry(item.expiry);
                    const sc = STATUS_CONFIG[item.status];
                    return (
                      <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {item.drug.isHighRisk && <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" title="High-risk drug" />}
                            {item.drug.requiresRefrigeration && <Thermometer className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                            {item.drug.isControlled && <Shield className="h-3.5 w-3.5 text-purple-500 shrink-0" />}
                            <div>
                              <p className="font-medium text-foreground">{item.drug.brandName}</p>
                              <p className="text-xs text-muted-foreground">{item.drug.genericName} {item.drug.strength}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {item.isRobotManaged && <Cpu className="h-3.5 w-3.5 text-purple-500 shrink-0" />}
                            <span className="text-xs text-foreground/80">{LOCATION_LABELS[item.location]}</span>
                            {item.robotBin && <span className="text-[10px] text-muted-foreground">({item.robotBin})</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className={cn('text-sm font-bold', item.status === 'out_of_stock' ? 'text-destructive' : item.status === 'low_stock' ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>
                            {item.availableQuantity}
                          </div>
                          {item.reservedQuantity > 0 && (
                            <p className="text-[10px] text-muted-foreground">{item.reservedQuantity} reserved</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-xs font-mono text-foreground/80">{item.lot}</p>
                          <p className={cn('text-xs', expiryColor(days))}>
                            {days <= 0 ? 'EXPIRED' : days <= 30 ? `⚠ ${days}d` : days <= 60 ? `⏱ ${days}d` : item.expiry}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={cn('text-[10px]', sc.cls)}>
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => adjustInventory(item.id, 100, 'Receive — manual')}>
                              + Receive
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
                              Adjust
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">No items found</div>
              )}
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {transactions.slice(0, 6).map(txn => (
                <div key={txn.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn('text-[10px] capitalize', txn.type === 'receive' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' : txn.type === 'dispense' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-muted text-muted-foreground')}>
                      {txn.type}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-foreground">{txn.drugName}</p>
                      <p className="text-xs text-muted-foreground">{txn.performedBy} · {txn.referenceId}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className={cn('font-bold', txn.quantity > 0 ? 'text-green-600' : 'text-destructive')}>
                      {txn.quantity > 0 ? '+' : ''}{txn.quantity}
                    </p>
                    <p className="text-muted-foreground">{txn.balanceAfter} rem.</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Alerts */}
        <div className="space-y-4">
          {/* Reorder Alerts */}
          <Card className={cn(reorderAlerts.length > 0 && 'ring-1 ring-amber-500/30')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                Reorder Alerts
                {reorderAlerts.length > 0 && (
                  <Badge className="bg-amber-500 text-white text-[10px] ml-auto">{reorderAlerts.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reorderAlerts.map(alert => (
                <div key={alert.id} className={cn(
                  'p-3 rounded-lg border text-xs',
                  alert.status === 'ordered' ? 'border-green-200 bg-green-50 dark:bg-green-950/30' : alert.estimatedDaysRemaining === 0 ? 'border-destructive/30 bg-destructive/5' : 'border-amber-200 bg-amber-50 dark:bg-amber-950/30',
                )}>
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-semibold text-foreground leading-snug">{alert.drugName}</p>
                    <Badge variant="outline" className={cn('text-[10px] shrink-0', alert.status === 'ordered' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                      {alert.status}
                    </Badge>
                  </div>
                  <p className={cn('mt-1', alert.estimatedDaysRemaining === 0 ? 'text-destructive font-bold' : 'text-amber-700 dark:text-amber-400')}>
                    {alert.estimatedDaysRemaining === 0 ? '🚨 OUT OF STOCK' : `${alert.estimatedDaysRemaining}d remaining`}
                  </p>
                  <p className="text-muted-foreground mt-1">Stock: {alert.currentStock} / Reorder at: {alert.reorderPoint}</p>
                  <p className="text-muted-foreground">Supplier: {alert.supplierName}</p>
                  {alert.status === 'pending' && (
                    <Button size="sm" variant="outline" className="w-full h-6 text-[10px] mt-2">
                      Create PO
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Expiry Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Expiry Alerts (FEFO)
                <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 ml-auto">
                  {expiryAlerts.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expiryAlerts.slice(0, 8).map(item => {
                const days = daysUntilExpiry(item.expiry);
                return (
                  <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0 text-xs">
                    <div>
                      <p className="font-medium text-foreground">{item.drug.brandName}</p>
                      <p className="text-muted-foreground">Lot: {item.lot} · Qty: {item.quantity}</p>
                    </div>
                    <span className={expiryColor(days)}>
                      {days}d
                    </span>
                  </div>
                );
              })}
              {expiryAlerts.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No expiry alerts</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InvKPI({ icon, label, value, alert }: { icon: React.ReactNode; label: string; value: string | number; alert?: boolean }) {
  return (
    <Card className={cn(alert && 'ring-1 ring-amber-500/30')}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">{icon}{alert && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}</div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
