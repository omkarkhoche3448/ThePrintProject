import { useState } from 'react';
import { Save, User, Bell, Shield, Printer, Monitor } from 'lucide-react';
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Setting states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  return (
    <div className="min-h-screen flex bg-background font-gemini">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header />
        
        <div className="px-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
          
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="account" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="printers" className="flex items-center">
                <Printer className="w-4 h-4 mr-2" />
                Printers
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                Display
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your account details and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="john.doe@example.com" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue="Admin" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" defaultValue="Property Management" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage your notification settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive email updates about your property activity</p>
                    </div>
                    <Switch 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Receive push notifications about your property activity</p>
                    </div>
                    <Switch 
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Printer Alerts</h4>
                      <p className="text-sm text-gray-500">Get notified about printer status and issues</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="printers">
              <Card>
                <CardHeader>
                  <CardTitle>Printer Management</CardTitle>
                  <CardDescription>Configure and manage your connected printers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <Printer className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium">Office Printer</h4>
                        <p className="text-xs text-gray-500">ID: PR001 • Status: Ready</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <Printer className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium">Reception Printer</h4>
                        <p className="text-xs text-gray-500">ID: PR002 • Status: Ready</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <Printer className="w-5 h-5 text-red-500 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium">Marketing Printer</h4>
                        <p className="text-xs text-red-500">ID: PR003 • Status: Error</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="flex items-center mr-2">
                    <Printer className="w-4 h-4 mr-2" />
                    Add Printer
                  </Button>
                  <Button variant="outline">
                    Refresh Status
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your security preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="display">
              <Card>
                <CardHeader>
                  <CardTitle>Display Settings</CardTitle>
                  <CardDescription>Customize your dashboard appearance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Compact View</h4>
                      <p className="text-sm text-gray-500">Make the schedule and running jobs boxes more compact</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Show Statistics</h4>
                      <p className="text-sm text-gray-500">Display detailed statistics on the dashboard</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Auto-refresh Dashboard</h4>
                      <p className="text-sm text-gray-500">Automatically update the dashboard data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;