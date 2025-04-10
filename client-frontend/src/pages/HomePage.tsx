import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  FileText, 
  Clock, 
  CreditCard, 
  Moon,
  Sun, 
  LogIn, 
  UserPlus,
  LogOut,
  ChevronRight,
  Upload,
  ArrowRight
} from 'lucide-react';
import { useUser, SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const HomePage = () => {
  // Theme state with localStorage
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
           (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  
  // Scroll animations
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Ref for scroll to services
  const servicesRef = useRef(null);
  
  // Apply theme to document and localStorage
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Service cards data
  const services = [
    {
      icon: <Printer className="h-8 w-8" />,
      title: "Premium Print",
      description: "Exceptional print quality with precision color matching",
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Instant Docs",
      description: "Print any document format with perfect rendering",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Express Delivery",
      description: "Ultra-fast printing with priority processing",
      gradient: "from-amber-400 to-orange-500"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Seamless Payment",
      description: "Secure, one-click transactions with instant confirmation",
      gradient: "from-emerald-400 to-teal-500"
    }
  ];

  const handleLogout = () => {
    signOut(() => navigate('/'));
  };

  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 
      ${isDarkTheme 
        ? 'bg-[#0a0a0a] text-white' 
        : 'bg-[#f5f5f7] text-[#1d1d1f]'
      }`}
    >
      {/* Glassmorphic Navigation */}
      <motion.nav 
        style={{ opacity: headerOpacity }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl
          ${isDarkTheme 
            ? 'bg-black/30 border-b border-white/5' 
            : 'bg-white/30 border-b border-black/5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Printer className={`h-7 w-7 ${isDarkTheme ? 'text-white' : 'text-[#1d1d1f]'}`} />
            <h1 className="text-xl font-medium tracking-tight">PrintEasy</h1>
          </motion.div>
          
          <div className="flex items-center space-x-8">
            <SignedOut>
              <div className="hidden md:flex items-center space-x-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/sign-in')}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all
                    ${isDarkTheme 
                      ? 'bg-white text-black hover:bg-white/90' 
                      : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                    }`}
                >
                  <span className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/sign-up')}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all
                    ${isDarkTheme 
                      ? 'bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/10' 
                      : 'bg-black/5 hover:bg-black/10 backdrop-blur-lg border border-black/10'
                    }`}
                >
                  <span className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </span>
                </motion.button>
              </div>
            </SignedOut>

            <SignedIn>
              {user && (
                <div className="flex items-center space-x-6">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm font-medium px-4 py-2 rounded-full
                      ${isDarkTheme ? 'bg-white/10' : 'bg-black/5'}`}>
                    Hello, {user.firstName || user.username}
                  </motion.div>
                  
                  <Link
                    to="/orders"
                    className={`hidden md:flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                      ${isDarkTheme 
                        ? 'bg-white/10 hover:bg-white/20' 
                        : 'bg-black/5 hover:bg-black/10'
                      }`}
                  >
                    <span>My Orders</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className={`p-2.5 rounded-full transition-all
                      ${isDarkTheme 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                      }`}
                  >
                    <LogOut className="h-5 w-5" />
                  </motion.button>
                </div>
              )}
            </SignedIn>

            <motion.button
              whileHover={{ rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all
                ${isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20' 
                  : 'bg-black/5 hover:bg-black/10'
                }`}
            >
              {isDarkTheme 
                ? <Sun className="h-5 w-5 text-yellow-300" /> 
                : <Moon className="h-5 w-5 text-blue-700" />
              }
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.header 
        style={{ scale: heroScale }}
        className={`pt-36 md:pt-44 pb-24 relative overflow-hidden`}
      >
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-0 w-72 h-72 rounded-full blur-3xl opacity-20 bg-blue-500" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-purple-500" />
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-5xl md:text-7xl font-medium tracking-tight mb-6 leading-tight
              ${isDarkTheme ? 'text-white' : 'text-[#1d1d1f]'}`}
          >
            Print Perfection.
            <br />
            <span className={`bg-clip-text text-transparent bg-gradient-to-r 
              ${isDarkTheme 
                ? 'from-blue-400 to-purple-400' 
                : 'from-blue-600 to-purple-600'
              }`}>
              Effortlessly Delivered.
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12
              ${isDarkTheme ? 'text-white/70' : 'text-[#1d1d1f]/70'}`}
          >
            Intelligent printing solutions with precision-perfect results, every time.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <SignedIn>
              <Link
                to="/print-page"
                className={`group flex items-center px-8 py-4 rounded-full text-base font-medium transition-all
                  ${isDarkTheme 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                  }`}
              >
                <span>Start Printing</span>
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="h-5 w-5 ml-2" />
                </motion.span>
              </Link>
            </SignedIn>
            
            <SignedOut>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/sign-in')}
                className={`w-full sm:w-auto px-8 py-4 rounded-full text-base font-medium transition-all
                  ${isDarkTheme 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                  }`}
              >
                Get Started
              </motion.button>
            </SignedOut>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={scrollToServices}
              className={`w-full sm:w-auto px-8 py-4 rounded-full text-base font-medium transition-all
                ${isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/10' 
                  : 'bg-black/5 hover:bg-black/10 backdrop-blur-lg border border-black/10'
                }`}
            >
              Explore Services
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      {/* Services Section with Floating Cards */}
      <section 
        ref={servicesRef}
        className={`py-20 px-6`}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-medium text-center mb-16 tracking-tight"
          >
            Remarkable Print Services
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                className={`relative overflow-hidden rounded-2xl p-6 h-64 flex flex-col justify-between
                  ${isDarkTheme 
                    ? 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20' 
                    : 'bg-white backdrop-blur-lg border border-black/5 hover:border-black/10 shadow-lg'
                  } transition-all duration-300`}
              >
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${service.gradient} opacity-10`} />
                
                <div>
                  <div className={`inline-flex items-center justify-center p-3 rounded-full mb-4
                    ${isDarkTheme 
                      ? 'bg-white/10' 
                      : 'bg-black/5'
                    }`}>
                    <div className={`text-gradient bg-gradient-to-r ${service.gradient}`}>
                      {service.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-medium mb-2">{service.title}</h3>
                  <p className={`${isDarkTheme ? 'text-white/60' : 'text-black/60'}`}>
                    {service.description}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ x: 4 }}
                  className={`flex items-center text-sm font-medium
                    ${isDarkTheme 
                      ? 'text-white/80 hover:text-white' 
                      : 'text-black/80 hover:text-black'
                    } transition-colors`}
                >
                  Learn more
                  <ChevronRight className="h-4 w-4 ml-1" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section with Drag & Drop */}
      <section className={`py-20 px-6`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`rounded-3xl p-10 text-center relative overflow-hidden
              ${isDarkTheme 
                ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-lg border border-white/10' 
                : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-black/5 shadow-xl'
              }`}
          >
            {/* Background decoration */}
            <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full blur-3xl opacity-20 bg-blue-500" />
            <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full blur-3xl opacity-20 bg-purple-500" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-medium mb-6 tracking-tight">Ready to Print?</h2>
              <p className={`text-lg mb-10 max-w-xl mx-auto
                ${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}>
                Experience our seamless printing service with drag-and-drop simplicity and real-time processing.
              </p>
              
              <SignedIn>
                <Link
                  to="/print-page"
                  className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-full text-base font-medium transition-all mx-auto w-fit
                    ${isDarkTheme 
                      ? 'bg-white text-black hover:bg-white/90' 
                      : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                    }`}
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Documents</span>
                </Link>
              </SignedIn>
              
              <SignedOut>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/sign-in')}
                  className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-full text-base font-medium transition-all mx-auto
                    ${isDarkTheme 
                      ? 'bg-white text-black hover:bg-white/90' 
                      : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                    }`}
                >
                  <LogIn className="h-5 w-5" />
                  <span>Sign In to Upload</span>
                </motion.button>
              </SignedOut>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Action Button */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 20,
            delay: 0.8
          }}
          className="fixed bottom-8 right-8 z-40"
        >
          <SignedIn>
            <Link
              to="/print-page"
              className={`flex items-center justify-center h-16 w-16 rounded-full shadow-lg transition-all
                ${isDarkTheme 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                }`}
            >
              <Printer className="h-6 w-6" />
            </Link>
          </SignedIn>
          
          <SignedOut>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/sign-up')}
              className={`flex items-center justify-center h-16 w-16 rounded-full shadow-lg transition-all
                ${isDarkTheme 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                }`}
            >
              <UserPlus className="h-6 w-6" />
            </motion.button>
          </SignedOut>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HomePage;