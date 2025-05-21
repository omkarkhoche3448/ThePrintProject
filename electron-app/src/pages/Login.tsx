import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Use useEffect for navigation
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast({
        title: "Login Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate auth loading with animation (to enhance UX)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await login(email, password);
      
      if (response.success) {
        setLoginSuccess(true);
        
        toast({
          title: "Login Successful",
          description: "Welcome back to Print Project!"
        });
        
        // Longer delay before navigating to see the success animation
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error('Login error:', error);
    } finally {
      if (!loginSuccess) {
        setIsLoading(false);
      }
    }
  };// Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5,
        ease: "easeInOut"
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  // Define success animation variant
  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background px-4">      <motion.div 
        className="w-full max-w-md px-4 sm:px-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >        <motion.div 
          className="relative bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-100 overflow-hidden"
          whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary opacity-10 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
          
          <motion.div 
            className="relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="text-center mb-8"
              variants={itemVariants}
            >              <div className="flex justify-center mb-4">
                <motion.div 
                  className="w-16 h-16 flex items-center justify-center bg-primary rounded-lg transform rotate-12 shadow-lg"
                  whileHover={{ rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </div>
              <motion.h1 
                className="text-3xl font-bold text-gray-800"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Welcome back!
              </motion.h1>
              <motion.p 
                className="text-primary mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Sign in to continue to Print Project
              </motion.p>
              
              {/* Animated indicators */}
              <div className="flex justify-center space-x-1 mt-4">
                {[0, 1].map((dot) => (
                  <motion.div
                    key={dot}
                    className={`h-1 w-6 rounded-full ${dot === 0 ? 'bg-primary' : 'bg-gray-200'}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: dot * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
            
            <motion.form
              onSubmit={handleLogin} 
              className="space-y-5"
              variants={containerVariants}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <Label htmlFor="email" className="text-gray-800 font-medium">Email</Label>
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <Mail className="h-4 w-4 text-primary/70" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    className="pl-10 bg-muted/30 border-muted focus-visible:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </motion.div>
              </motion.div>
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-800 font-medium">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <Lock className="h-4 w-4 text-primary/70" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 bg-muted/30 border-muted focus-visible:ring-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-primary/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-primary/70" />
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
              <motion.div variants={itemVariants}>                
                <motion.button
                  type="submit" 
                  className={`w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg flex items-center justify-center font-medium ${
                    isLoading ? 'opacity-90' : ''
                  }`}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 1 }}
                  animate={{ 
                    opacity: isLoading ? 0.9 : 1,
                    transition: { duration: 0.2 }
                  }}
                >
                  {isLoading ? (
                    <motion.div 
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </motion.div>

              <motion.div 
                className="text-center pt-2"
                variants={itemVariants}
              >
                <p className="text-gray-600">
                  Don't have an account? 
                  <motion.span
                    className="text-primary font-medium hover:underline cursor-pointer ml-1"
                    onClick={() => navigate('/register')}
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign up
                  </motion.span>
                </p>
              </motion.div>

              <motion.div 
                className="text-center pt-4"
                variants={itemVariants}
              >
                <motion.button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                  whileHover={{ x: -3 }}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to home
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;