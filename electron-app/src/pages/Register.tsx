import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, Building, Printer, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Tabs,
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { ShopkeeperRegistrationData } from '@/services/authService';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<ShopkeeperRegistrationData>({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    printCosts: {
      blackAndWhite: 1,
      color: 5,
    },
    discountRules: [{
      discountPercentage: 10,
      minimumOrderAmount: 100
    }],
    shopHours: {
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "17:00" },
      saturday: { open: "10:00", close: "15:00" },
      sunday: { open: "Closed", close: "Closed" }
    },
    priorityRate: 1.5, // Default priority rate (50% extra for express service)
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof ShopkeeperRegistrationData];
        if (parentObj && typeof parentObj === 'object') {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: type === 'number' ? parseFloat(value) || 0 : value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Required fields validation
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password) {
      toast({
        title: "Registration Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Registration Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    // Phone validation
    if (formData.phoneNumber.length < 10) {
      toast({
        title: "Registration Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }
    
    // Password strength validation
    if (formData.password.length < 8) {
      toast({
        title: "Registration Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }
      // Ensure we have all the data required by the backend
    const registrationData: ShopkeeperRegistrationData = {
      ...formData,
      // Ensure these fields exist with at least default values
      address: formData.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      printCosts: formData.printCosts || {
        blackAndWhite: 1,
        color: 5
      },
      priorityRate: formData.priorityRate || 1.5,
      discountRules: formData.discountRules || [{ 
        discountPercentage: 10, 
        minimumOrderAmount: 100 
      }],
      shopHours: {
        monday: formData.shopHours?.monday || { open: "09:00", close: "17:00" },
        tuesday: formData.shopHours?.tuesday || { open: "09:00", close: "17:00" },
        wednesday: formData.shopHours?.wednesday || { open: "09:00", close: "17:00" },
        thursday: formData.shopHours?.thursday || { open: "09:00", close: "17:00" },
        friday: formData.shopHours?.friday || { open: "09:00", close: "17:00" },
        saturday: formData.shopHours?.saturday || { open: "10:00", close: "15:00" },
        sunday: formData.shopHours?.sunday || { open: "Closed", close: "Closed" }
      }
    };
    
    setIsLoading(true);
    
    try {
      const response = await register(registrationData);
      
      if (response.success) {
        toast({
          title: "Registration Successful",
          description: "Welcome to Print Project!"
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Registration Failed",
          description: response.message || "Failed to register account",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const goToNextTab = () => {
    if (activeTab === 'basic') setActiveTab('shop');
    else if (activeTab === 'shop') setActiveTab('pricing');
    else if (activeTab === 'pricing') setActiveTab('hours');
  };

  const goToPreviousTab = () => {
    if (activeTab === 'hours') setActiveTab('pricing');
    else if (activeTab === 'pricing') setActiveTab('shop');
    else if (activeTab === 'shop') setActiveTab('basic');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Register Your Shop</CardTitle>
          <CardDescription>Create an account to start managing your print shop</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="shop">Shop Details</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="hours">Hours & Discounts</TabsTrigger>
            </TabsList>
            
            {/* Basic Info Tab */}
            <TabsContent value="basic">
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="+1 123-456-7890"
                      className="pl-10"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Already have an account?
                </Button>
                <Button type="button" onClick={goToNextTab}>Next</Button>
              </CardFooter>
            </TabsContent>
            
            {/* Shop Details Tab */}
            <TabsContent value="shop">
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="address.street">Street Address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <Building className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="address.street"
                      name="address.street"
                      placeholder="123 Main St"
                      className="pl-10"
                      value={formData.address?.street}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address.city">City</Label>
                    <Input
                      id="address.city"
                      name="address.city"
                      placeholder="Anytown"
                      value={formData.address?.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address.state">State</Label>
                    <Input
                      id="address.state"
                      name="address.state"
                      placeholder="State"
                      value={formData.address?.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address.zipCode">ZIP Code</Label>
                    <Input
                      id="address.zipCode"
                      name="address.zipCode"
                      placeholder="12345"
                      value={formData.address?.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address.country">Country</Label>
                    <Input
                      id="address.country"
                      name="address.country"
                      placeholder="Country"
                      value={formData.address?.country}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousTab}>Previous</Button>
                <Button type="button" onClick={goToNextTab}>Next</Button>
              </CardFooter>
            </TabsContent>
            
            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="printCosts.blackAndWhite">
                    Black & White Price Per Page
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <Printer className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="printCosts.blackAndWhite"
                      name="printCosts.blackAndWhite"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="1.00"
                      className="pl-10"
                      value={formData.printCosts?.blackAndWhite}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                  <div className="space-y-2">
                  <Label htmlFor="printCosts.color">
                    Color Price Per Page
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <Printer className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="printCosts.color"
                      name="printCosts.color"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="5.00"
                      className="pl-10"
                      value={formData.printCosts?.color}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priorityRate">
                    Priority Rate Multiplier
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="priorityRate"
                      name="priorityRate"
                      type="number"
                      min="1"
                      step="0.1"
                      placeholder="1.5"
                      className="pl-10"
                      value={formData.priorityRate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Multiplier for express/priority print jobs (e.g., 1.5 = 50% extra charge)
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousTab}>Previous</Button>
                <Button type="button" onClick={() => setActiveTab('hours')}>Next</Button>
              </CardFooter>
            </TabsContent>
            
            {/* Hours & Discounts Tab */}
            <TabsContent value="hours">
              <CardContent className="space-y-4 pt-4">
                <h3 className="text-lg font-medium mb-2">Shop Hours</h3>
                
                {/* Monday */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-medium">Monday:</div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.monday.open">Opening Time</Label>
                    <Input
                      id="shopHours.monday.open"
                      name="shopHours.monday.open"
                      placeholder="09:00"
                      value={formData.shopHours?.monday?.open}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.monday.close">Closing Time</Label>
                    <Input
                      id="shopHours.monday.close"
                      name="shopHours.monday.close"
                      placeholder="17:00"
                      value={formData.shopHours?.monday?.close}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {/* Tuesday */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-medium">Tuesday:</div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.tuesday.open">Opening Time</Label>
                    <Input
                      id="shopHours.tuesday.open"
                      name="shopHours.tuesday.open"
                      placeholder="09:00"
                      value={formData.shopHours?.tuesday?.open}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.tuesday.close">Closing Time</Label>
                    <Input
                      id="shopHours.tuesday.close"
                      name="shopHours.tuesday.close"
                      placeholder="17:00"
                      value={formData.shopHours?.tuesday?.close}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {/* Wednesday */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-medium">Wednesday:</div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.wednesday.open">Opening Time</Label>
                    <Input
                      id="shopHours.wednesday.open"
                      name="shopHours.wednesday.open"
                      placeholder="09:00"
                      value={formData.shopHours?.wednesday?.open}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.wednesday.close">Closing Time</Label>
                    <Input
                      id="shopHours.wednesday.close"
                      name="shopHours.wednesday.close"
                      placeholder="17:00"
                      value={formData.shopHours?.wednesday?.close}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {/* Thursday */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-medium">Thursday:</div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.thursday.open">Opening Time</Label>
                    <Input
                      id="shopHours.thursday.open"
                      name="shopHours.thursday.open"
                      placeholder="09:00"
                      value={formData.shopHours?.thursday?.open}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.thursday.close">Closing Time</Label>
                    <Input
                      id="shopHours.thursday.close"
                      name="shopHours.thursday.close"
                      placeholder="17:00"
                      value={formData.shopHours?.thursday?.close}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {/* Friday */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-medium">Friday:</div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.friday.open">Opening Time</Label>
                    <Input
                      id="shopHours.friday.open"
                      name="shopHours.friday.open"
                      placeholder="09:00"
                      value={formData.shopHours?.friday?.open}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.friday.close">Closing Time</Label>
                    <Input
                      id="shopHours.friday.close"
                      name="shopHours.friday.close"
                      placeholder="17:00"
                      value={formData.shopHours?.friday?.close}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {/* Saturday */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-medium">Saturday:</div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.saturday.open">Opening Time</Label>
                    <Input
                      id="shopHours.saturday.open"
                      name="shopHours.saturday.open"
                      placeholder="10:00"
                      value={formData.shopHours?.saturday?.open}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.saturday.close">Closing Time</Label>
                    <Input
                      id="shopHours.saturday.close"
                      name="shopHours.saturday.close"
                      placeholder="15:00"
                      value={formData.shopHours?.saturday?.close}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {/* Sunday */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-medium">Sunday:</div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.sunday.open">Opening Time</Label>
                    <Input
                      id="shopHours.sunday.open"
                      name="shopHours.sunday.open"
                      placeholder="Closed"
                      value={formData.shopHours?.sunday?.open}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shopHours.sunday.close">Closing Time</Label>
                    <Input
                      id="shopHours.sunday.close"
                      name="shopHours.sunday.close"
                      placeholder="Closed"
                      value={formData.shopHours?.sunday?.close}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {/* Discount Section */}
                <h3 className="text-lg font-medium mt-4 mb-2">Discount Rule</h3>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <Label htmlFor="discountPercentage">Discount Percentage</Label>
                    <Input
                      id="discountPercentage"
                      name="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="10"
                      value={formData.discountRules?.[0]?.discountPercentage || 10}
                      onChange={(e) => {
                        const discountPercentage = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({
                          ...prev,
                          discountRules: [
                            { 
                              discountPercentage, 
                              minimumOrderAmount: prev.discountRules?.[0]?.minimumOrderAmount || 100 
                            }
                          ]
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="minimumOrderAmount">Minimum Order Amount</Label>
                    <Input
                      id="minimumOrderAmount"
                      name="minimumOrderAmount"
                      type="number"
                      min="0"
                      placeholder="100"
                      value={formData.discountRules?.[0]?.minimumOrderAmount || 100}
                      onChange={(e) => {
                        const minimumOrderAmount = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({
                          ...prev,
                          discountRules: [
                            { 
                              discountPercentage: prev.discountRules?.[0]?.discountPercentage || 10, 
                              minimumOrderAmount 
                            }
                          ]
                        }));
                      }}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('pricing')}>Previous</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </form>
      </Card>
    </div>
  );
};

export default Register;
