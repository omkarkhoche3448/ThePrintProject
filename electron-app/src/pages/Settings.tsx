import { useState, useEffect } from 'react';
import { Save, User, Bell, Shield, Printer, Monitor, Loader2, Key } from 'lucide-react';
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import authService from '@/services/authService';

const Settings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Loading and saving states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Form states
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    printCosts: {
      blackAndWhite: 1,
      color: 5
    }
  });
  
  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Setting states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        printCosts: user.printCosts || {
          blackAndWhite: 1,
          color: 5
        }
      });
      setIsLoading(false);
    }
  }, [user]);
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await authService.updateProfile(profile);
      
      if (response.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: response.message || "Failed to update profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Change password
  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const response = await authService.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (response.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been changed successfully.",
        });
        
        // Reset password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast({
          title: "Password Change Failed",
          description: response.message || "Failed to change password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error('Password change error:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  return (
    <div className="min-h-screen flex bg-background font-gemini">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-3' : 'ml-6'}`}>
        <div className="ml-10 mt-8">
        <Header userName={user?.name} />
        </div>        
        <div className="px-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 ml-2">Settings</h1>
          
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
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            name="name"
                            value={profile.name} 
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            name="email"
                            type="email" 
                            value={profile.email}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input 
                            id="phoneNumber" 
                            name="phoneNumber"
                            value={profile.phoneNumber} 
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-4">
                        <h3 className="text-lg font-medium">Shop Address</h3>
                        <div className="space-y-2">
                          <Label htmlFor="address.street">Street Address</Label>
                          <Input 
                            id="address.street" 
                            name="address.street"
                            value={profile.address.street} 
                            onChange={handleProfileChange}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address.city">City</Label>
                            <Input 
                              id="address.city" 
                              name="address.city"
                              value={profile.address.city} 
                              onChange={handleProfileChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address.state">State/Province</Label>
                            <Input 
                              id="address.state" 
                              name="address.state"
                              value={profile.address.state} 
                              onChange={handleProfileChange}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address.zipCode">Zip/Postal Code</Label>
                            <Input 
                              id="address.zipCode" 
                              name="address.zipCode"
                              value={profile.address.zipCode} 
                              onChange={handleProfileChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address.country">Country</Label>
                            <Input 
                              id="address.country" 
                              name="address.country"
                              value={profile.address.country} 
                              onChange={handleProfileChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4">
                        <h3 className="text-lg font-medium">Print Costs</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="printCosts.blackAndWhite">Black & White (per page)</Label>
                            <Input 
                              id="printCosts.blackAndWhite" 
                              name="printCosts.blackAndWhite"
                              type="number"
                              min="0"
                              step="0.01"
                              value={profile.printCosts.blackAndWhite} 
                              onChange={handleProfileChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="printCosts.color">Color (per page)</Label>
                            <Input 
                              id="printCosts.color" 
                              name="printCosts.color"
                              type="number"
                              min="0"
                              step="0.01"
                              value={profile.printCosts.color} 
                              onChange={handleProfileChange}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="flex items-center"
                    onClick={handleSaveProfile}
                    disabled={isLoading || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
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
                <CardContent className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      
                      <Button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Changing Password...
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Login Notifications</h4>
                        <p className="text-sm text-gray-500">Be notified of new sign-ins to your account</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
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