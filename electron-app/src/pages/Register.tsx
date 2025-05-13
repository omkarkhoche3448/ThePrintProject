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
    discountRules: [],
    shopHours: {},
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password) {
      toast({
        title: "Registration Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await register(formData);
      
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
  };

  const goToPreviousTab = () => {
    if (activeTab === 'pricing') setActiveTab('shop');
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="shop">Shop Details</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
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
                
                <p className="text-sm text-muted-foreground">
                  You can add more detailed pricing and business hours in your profile settings after registration.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousTab}>Previous</Button>
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
