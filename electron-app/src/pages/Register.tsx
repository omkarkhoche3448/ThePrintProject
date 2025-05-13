import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, Building, Printer, Clock, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      } 
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const formCompletionSteps = {
    basic: 25,
    shop: 50,
    pricing: 75,
    hours: 100
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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
        setRegistrationComplete(true);
        toast({
          title: "Registration Successful",
          description: "Welcome to Print Project!"
        });
        
        // Redirect after showing success animation
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
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

  // Success animation component
  const SuccessAnimation = () => (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white p-16 rounded-xl shadow-2xl flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.3 }}
        >
          <CheckCircle2 className="h-24 w-24 text-green-500" />
        </motion.div>
        <motion.h2 
          className="text-2xl font-bold mt-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Registration Complete!
        </motion.h2>
        <motion.p 
          className="text-gray-600 mt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Redirecting to your dashboard...
        </motion.p>
      </motion.div>
    </motion.div>
  );

  if (registrationComplete) {
    return <SuccessAnimation />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mb-8 text-center"
      >
        <h1 className="text-4xl font-bold text-blue-900">Print Project</h1>
        <p className="text-blue-600 mt-2">Manage your print shop with ease</p>
      </motion.div>

      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border border-gray-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
            <CardTitle className="text-2xl">Register Your Shop</CardTitle>
            <CardDescription className="text-blue-100">Create an account to start managing your print shop</CardDescription>
            
            {/* Progress bar */}
            <div className="w-full bg-blue-800 h-3 rounded-full mt-4 overflow-hidden">
              <motion.div 
                className="h-full bg-blue-300"
                initial={{ width: 0 }}
                animate={{ width: `${formCompletionSteps[activeTab as keyof typeof formCompletionSteps]}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
              />
            </div>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {['basic', 'shop', 'pricing', 'hours'].map((tab, index) => (
                  <TabsTrigger 
                    key={tab} 
                    value={tab}
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center"
                    >
                      <span className="mr-2 inline-flex items-center justify-center w-6 h-6 rounded-full border border-current text-xs">
                        {index + 1}
                      </span>
                      {tab === 'basic' && 'Basic Info'}
                      {tab === 'shop' && 'Shop Details'}
                      {tab === 'pricing' && 'Pricing'}
                      {tab === 'hours' && 'Hours'}
                    </motion.div>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CardContent className="space-y-6 pt-6">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          className="pl-10 focus-visible:ring-blue-500"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-2">
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
                          className="pl-10 focus-visible:ring-blue-500"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          placeholder="+1 123-456-7890"
                          className="pl-10 focus-visible:ring-blue-500"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-2">
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
                          className="pl-10 focus-visible:ring-blue-500"
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
                    </motion.div>
                  </CardContent>
                  <CardFooter className="flex justify-between py-4 border-t">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/login')}
                        className="group"
                      >
                        <span>Already have an account?</span>
                        <span className="ml-1 text-blue-600 group-hover:underline">Sign in</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        type="button" 
                        onClick={goToNextTab}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <span>Next</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </CardFooter>
                </motion.div>
              </TabsContent>
              
              {/* Shop Details Tab */}
              <TabsContent value="shop">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CardContent className="space-y-6 pt-6">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="address.street">Street Address</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <Building className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          id="address.street"
                          name="address.street"
                          placeholder="123 Main St"
                          className="pl-10 focus-visible:ring-blue-500"
                          value={formData.address?.street}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address.city">City</Label>
                        <Input
                          id="address.city"
                          name="address.city"
                          placeholder="Anytown"
                          className="focus-visible:ring-blue-500"
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
                          className="focus-visible:ring-blue-500"
                          value={formData.address?.state}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address.zipCode">ZIP Code</Label>
                        <Input
                          id="address.zipCode"
                          name="address.zipCode"
                          placeholder="12345"
                          className="focus-visible:ring-blue-500"
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
                          className="focus-visible:ring-blue-500"
                          value={formData.address?.country}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                  </CardContent>
                  <CardFooter className="flex justify-between py-4 border-t">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        onClick={goToPreviousTab} 
                        className="flex items-center"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span>Previous</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        type="button" 
                        onClick={goToNextTab}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center"
                      >
                        <span>Next</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </CardFooter>
                </motion.div>
              </TabsContent>
              
              {/* Pricing Tab */}
              <TabsContent value="pricing">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CardContent className="space-y-6 pt-6">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="printCosts.blackAndWhite" className="flex items-center">
                        <span>Black & White Price Per Page</span>
                        <span className="ml-1 text-xs text-blue-500">($/page)</span>
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
                          className="pl-10 focus-visible:ring-blue-500"
                          value={formData.printCosts?.blackAndWhite}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="printCosts.color" className="flex items-center">
                        <span>Color Price Per Page</span>
                        <span className="ml-1 text-xs text-blue-500">($/page)</span>
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
                          className="pl-10 focus-visible:ring-blue-500"
                          value={formData.printCosts?.color}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="priorityRate" className="flex items-center">
                        <span>Priority Rate Multiplier</span>
                        <span className="ml-1 text-xs text-blue-500">(e.g., 1.5 = 50% extra charge)</span>
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
                          className="pl-10 focus-visible:ring-blue-500"
                          value={formData.priorityRate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Multiplier for express/priority print jobs (e.g., 1.5 = 50% extra charge)
                      </p>
                    </motion.div>
                  </CardContent>
                  <CardFooter className="flex justify-between py-4 border-t">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        onClick={goToPreviousTab}
                        className="flex items-center"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span>Previous</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        type="button" 
                        onClick={goToNextTab}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center"
                      >
                        <span>Next</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </CardFooter>
                </motion.div>
              </TabsContent>
              
              {/* Hours & Discounts Tab */}
              <TabsContent value="hours">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CardContent className="space-y-6 pt-6">
                    <motion.h3 
                      variants={itemVariants} 
                      className="text-lg font-medium mb-2 text-blue-800"
                    >
                      Shop Hours
                    </motion.h3>
                    
                    {/* Days of the week */}
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => (
                      <motion.div 
                        key={day}
                        variants={itemVariants}
                        custom={index}
                        className="grid grid-cols-3 gap-4 items-center p-3 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium capitalize">{day}:</div>
                        <div className="space-y-1">
                          <Label htmlFor={`shopHours.${day}.open`}>Opening Time</Label>
                          <Input
                            id={`shopHours.${day}.open`}
                            name={`shopHours.${day}.open`}
                            placeholder={day === 'sunday' ? "Closed" : "09:00"}
                            className="focus-visible:ring-blue-500"
                            value={formData.shopHours?.[day as keyof typeof formData.shopHours]?.open}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`shopHours.${day}.close`}>Closing Time</Label>
                          <Input
                            id={`shopHours.${day}.close`}
                            name={`shopHours.${day}.close`}
                            placeholder={day === 'sunday' ? "Closed" : "17:00"}
                            className="focus-visible:ring-blue-500"
                            value={formData.shopHours?.[day as keyof typeof formData.shopHours]?.close}
                            onChange={handleInputChange}
                          />
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Discount Section */}
                    <motion.h3 
                      variants={itemVariants}
                      className="text-lg font-medium mt-6 mb-2 text-blue-800"
                    >
                      Discount Rule
                    </motion.h3>
                    <motion.div 
                      variants={itemVariants}
                      className="grid grid-cols-2 gap-4 items-center p-3 rounded-md bg-blue-50"
                    >
                      <div className="space-y-1">
                        <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                        <Input
                          id="discountPercentage"
                          name="discountPercentage"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="10"
                          className="focus-visible:ring-blue-500"
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
                        <Label htmlFor="minimumOrderAmount">Minimum Order Amount ($)</Label>
                        <Input
                          id="minimumOrderAmount"
                          name="minimumOrderAmount"
                          type="number"
                          min="0"
                          placeholder="100"
                          className="focus-visible:ring-blue-500"
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
                    </motion.div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between py-4 border-t">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        onClick={goToPreviousTab}
                        className="flex items-center"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span>Previous</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Registering...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            <span>Complete Registration</span>
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </motion.div>
              </TabsContent>
            </Tabs>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
