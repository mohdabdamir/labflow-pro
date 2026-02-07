import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Building2, 
  Printer, 
  Database, 
  Bell,
  Palette,
  Shield
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <MainLayout title="Settings">
      <div className="max-w-4xl space-y-6">
        {/* Laboratory Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Laboratory Information</CardTitle>
            </div>
            <CardDescription>Basic information about your laboratory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labName">Laboratory Name</Label>
                <Input id="labName" defaultValue="PathLab Clinical Laboratory" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labCode">Lab Code</Label>
                <Input id="labCode" defaultValue="PATHLAB001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="123 Medical Center Drive, Metro City" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+1 555-0100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="info@pathlab.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue="www.pathlab.com" />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Report Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              <CardTitle>Report Settings</CardTitle>
            </div>
            <CardDescription>Configure PDF report generation settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Laboratory Logo</Label>
                <p className="text-sm text-muted-foreground">Display logo in report header</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Reference Ranges</Label>
                <p className="text-sm text-muted-foreground">Include normal ranges in results</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Highlight Abnormal Results</Label>
                <p className="text-sm text-muted-foreground">Use color coding for abnormal values</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="footer">Report Footer Text</Label>
              <Input 
                id="footer" 
                defaultValue="Results should be correlated with clinical findings. For queries, contact the laboratory." 
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>Manage your laboratory data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save Changes</Label>
                <p className="text-sm text-muted-foreground">Automatically save data to local storage</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex gap-3">
              <Button variant="outline">Export All Data</Button>
              <Button variant="outline">Import Data</Button>
              <Button variant="destructive">Reset to Defaults</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: This demo uses localStorage. Data is stored in your browser and will persist across sessions.
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Critical Result Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified for critical values</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>TAT Overdue Warnings</Label>
                <p className="text-sm text-muted-foreground">Alert when cases exceed turnaround time</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>STAT Case Notifications</Label>
                <p className="text-sm text-muted-foreground">Priority alerts for urgent cases</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark color scheme</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Security and access settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This is a demo version. In production, security features like user authentication, 
              role-based access control, and audit logging would be enabled here.
            </p>
            <Button variant="outline" disabled>Configure Security (Demo Mode)</Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
