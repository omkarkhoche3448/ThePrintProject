import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  Sun, 
  Moon, 
  LogOut, 
  FileText, 
  ClipboardList,
  Clock,
  CheckSquare,
  AlertCircle,
  RefreshCw,
  Hourglass,
  Home,
  ArrowLeft,
  ChevronRight,
  Filter,
  Calendar,
  MapPin,
  CreditCard,
  User,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface PrintConfig {
  copies: number;
  colorMode: string;
  pageSize: string;
  orientation: string;
  duplexPrinting: boolean;
  pageRange: string;
  pagesPerSheet: number;
  isPriority?: boolean;
}

interface OrderFile {
  filename: string;
  originalName: string;
  uploadDate: string;
  fileId: string;
}

interface ShopkeeperInfo {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

interface Order {
  _id: string;
  userId: string;
  shopkeeperId: ShopkeeperInfo;
  file: OrderFile;
  printConfig: PrintConfig;
  status: string;
  payment: {
    status: string;
    method: string;
  };
  timeline: {
    created: string;
    paid?: string;
    processing?: string;
    ready?: string;
    completed?: string;
    cancelled?: string;
  };
  deliveryMethod: string;
  createdAt: string;
  updatedAt: string;
}

const OrdersPage: React.FC = () => {
  // Theme state with localStorage
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
           (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'completed'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User context
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  
  // Scroll animations
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

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

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsRefreshing(true);
      const response = await fetch(`http://localhost:3000/orders/user/${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Helper function to group orders by submission time and shopkeeper
  const groupOrders = (orders: Order[]): Order[][] => {
    const groups: Record<string, Order[]> = {};
    
    // Sort orders by creation time (newest first)
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Group orders that were created within 60 seconds of each other with the same shopkeeper
    sortedOrders.forEach(order => {
      const orderTime = new Date(order.createdAt).getTime();
      const shopId = order.shopkeeperId?._id || 'unknown';
      
      // Try to find an existing group this order belongs to
      let foundGroup = false;
      
      Object.keys(groups).forEach(groupKey => {
        const [groupShopId, groupTimeStr] = groupKey.split('_');
        const groupTime = parseInt(groupTimeStr);
        
        // If same shop and within 60 seconds
        if (groupShopId === shopId && Math.abs(orderTime - groupTime) < 60000) {
          groups[groupKey].push(order);
          foundGroup = true;
        }
      });
      
      // If no matching group was found, create a new one
      if (!foundGroup) {
        const groupKey = `${shopId}_${orderTime}`;
        groups[groupKey] = [order];
      }
    });
    
    // Convert the groups object to an array of order groups
    return Object.values(groups);
  };

  // Filter orders based on view mode
  const filteredOrders = useMemo(() => {
    if (viewMode === 'all') return orders;
    if (viewMode === 'completed') return orders.filter(order => order.status === 'completed');
    return orders.filter(order => order.status !== 'completed');
  }, [orders, viewMode]);

  // Group orders by submission time
  const groupedOrders = useMemo(() => groupOrders(filteredOrders), [filteredOrders]);

  // Check if any order in a group is a priority order
  const isGroupPriority = (orderGroup: Order[]): boolean => {
    return orderGroup.some(order => order.printConfig.isPriority);
  };

  // Get overall status for a group of orders
  const getGroupStatus = (orderGroup: Order[]): string => {
    // If any order is processing, the group is processing
    if (orderGroup.some(order => order.status === 'processing')) return 'processing';
    // If all orders are completed, the group is completed
    if (orderGroup.every(order => order.status === 'completed')) return 'completed';
    // If any order is failed, the group is failed
    if (orderGroup.some(order => order.status === 'failed')) return 'failed';
    // If any order is cancelled, the group is cancelled
    if (orderGroup.some(order => order.status === 'cancelled')) return 'cancelled';
    // Default to pending
    return 'pending';
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  // Logout handler
  const handleLogout = () => {
    signOut(() => navigate('/'));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckSquare className="h-5 w-5" />, 
          color: isDarkTheme ? 'text-green-400' : 'text-green-500',
          bg: isDarkTheme ? 'bg-green-400/10' : 'bg-green-500/10',
          border: isDarkTheme ? 'border-green-400/20' : 'border-green-500/20',
          label: 'Completed'
        };
      case 'processing':
        return { 
          icon: <RefreshCw className="h-5 w-5" />, 
          color: isDarkTheme ? 'text-blue-400' : 'text-blue-500',
          bg: isDarkTheme ? 'bg-blue-400/10' : 'bg-blue-500/10',
          border: isDarkTheme ? 'border-blue-400/20' : 'border-blue-500/20',
          label: 'Processing'
        };
      case 'failed':
        return { 
          icon: <AlertCircle className="h-5 w-5" />, 
          color: isDarkTheme ? 'text-red-400' : 'text-red-500',
          bg: isDarkTheme ? 'bg-red-400/10' : 'bg-red-500/10',
          border: isDarkTheme ? 'border-red-400/20' : 'border-red-500/20',
          label: 'Failed'
        };
      case 'cancelled':
        return { 
          icon: <AlertCircle className="h-5 w-5" />, 
          color: isDarkTheme ? 'text-red-400' : 'text-red-500',
          bg: isDarkTheme ? 'bg-red-400/10' : 'bg-red-500/10',
          border: isDarkTheme ? 'border-red-400/20' : 'border-red-500/20',
          label: 'Cancelled'
        };
      default:
        return { 
          icon: <Hourglass className="h-5 w-5" />, 
          color: isDarkTheme ? 'text-amber-400' : 'text-amber-500',
          bg: isDarkTheme ? 'bg-amber-400/10' : 'bg-amber-500/10',
          border: isDarkTheme ? 'border-amber-400/20' : 'border-amber-500/20',
          label: 'Pending'
        };
    }
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
          <Link to="/">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Printer className={`h-7 w-7 ${isDarkTheme ? 'text-white' : 'text-[#1d1d1f]'}`} />
              <h1 className="text-xl font-medium tracking-tight">PrintEasy</h1>
            </motion.div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                ${isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20' 
                  : 'bg-black/5 hover:bg-black/10'
                }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/print-page"
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                ${isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20' 
                  : 'bg-black/5 hover:bg-black/10'
                }`}
            >
              <FileText className="h-4 w-4" />
              <span>Print</span>
            </Link>
            
            {user && (
              <div className="flex items-center space-x-6">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm font-medium px-4 py-2 rounded-full
                    ${isDarkTheme ? 'bg-white/10' : 'bg-black/5'}`}>
                  Hello, {user.firstName || user.username}
                </motion.div>
                
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
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 rounded-full transition-all
                ${isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20' 
                  : 'bg-black/5 hover:bg-black/10'
                }`}
            >
              <Menu className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden overflow-hidden
                ${isDarkTheme 
                  ? 'bg-black/50 border-b border-white/5' 
                  : 'bg-white/50 border-b border-black/5'
                } backdrop-blur-xl`}
            >
              <div className="px-6 py-3 space-y-3">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isDarkTheme 
                      ? 'bg-white/10 hover:bg-white/20' 
                      : 'bg-black/5 hover:bg-black/10'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                
                <Link
                  to="/print-page"
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isDarkTheme 
                      ? 'bg-white/10 hover:bg-white/20' 
                      : 'bg-black/5 hover:bg-black/10'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  <span>Print</span>
                </Link>
                
                {user && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isDarkTheme 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                      }`}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                  </motion.button>
                )}
                
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isDarkTheme 
                      ? 'bg-white/10 hover:bg-white/20' 
                      : 'bg-black/5 hover:bg-black/10'
                    }`}
                >
                  {isDarkTheme 
                    ? <Sun className="h-5 w-5 text-yellow-300" /> 
                    : <Moon className="h-5 w-5 text-blue-700" />
                  }
                  <span>{isDarkTheme ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`text-3xl md:text-4xl font-medium tracking-tight
                ${isDarkTheme ? 'text-white' : 'text-[#1d1d1f]'}`}
            >
              {selectedOrder ? 'Order Details' : 'My Orders'}
            </motion.h1>
            
            {selectedOrder ? (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedOrder(null)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                  ${isDarkTheme 
                    ? 'bg-white/10 hover:bg-white/20' 
                    : 'bg-black/5 hover:bg-black/10'
                  }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Orders</span>
              </motion.button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* View mode selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`rounded-full overflow-hidden flex items-center p-1
                    ${isDarkTheme 
                      ? 'bg-white/10 border border-white/10' 
                      : 'bg-black/5 border border-black/5'
                    }`}
                >
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all
                      ${viewMode === 'all' 
                        ? isDarkTheme 
                          ? 'bg-white text-black' 
                          : 'bg-[#1d1d1f] text-white'
                        : ''
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setViewMode('active')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all
                      ${viewMode === 'active' 
                        ? isDarkTheme 
                          ? 'bg-white text-black' 
                          : 'bg-[#1d1d1f] text-white'
                        : ''
                      }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setViewMode('completed')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all
                      ${viewMode === 'completed' 
                        ? isDarkTheme 
                          ? 'bg-white text-black' 
                          : 'bg-[#1d1d1f] text-white'
                        : ''
                      }`}
                  >
                    Completed
                  </button>
                </motion.div>
                
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={fetchOrders}
                  disabled={isRefreshing}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                    ${isDarkTheme 
                      ? 'bg-white text-black hover:bg-white/90' 
                      : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                    } ${isRefreshing ? 'opacity-70' : ''}`}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </motion.button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 gap-4"
              >
                <RefreshCw className={`h-10 w-10 animate-spin 
                  ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} 
                />
                <p className={`text-lg ${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}>
                  Loading your orders...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-2xl backdrop-blur-lg border overflow-hidden p-8 text-center
                  ${isDarkTheme 
                    ? 'bg-red-900/20 border-red-800/30' 
                    : 'bg-red-50 border-red-100'
                  }`}
              >
                <AlertCircle className={`h-16 w-16 mx-auto mb-4 
                  ${isDarkTheme ? 'text-red-400' : 'text-red-500'}`} 
                />
                <h3 className={`text-xl font-medium mb-2 
                  ${isDarkTheme ? 'text-red-400' : 'text-red-600'}`}>
                  Error Loading Orders
                </h3>
                <p className={`mb-6 max-w-md mx-auto
                  ${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}>
                  {error}
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={fetchOrders}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all
                    ${isDarkTheme 
                      ? 'bg-white text-black hover:bg-white/90' 
                      : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                    }`}
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : selectedOrder ? (
              <OrderDetails 
                order={selectedOrder} 
                isDarkTheme={isDarkTheme}
                formatDate={formatDate}
                getStatusInfo={getStatusInfo}
              />
            ) : (
              <motion.div 
                key="orders-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {groupedOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`rounded-2xl backdrop-blur-lg border overflow-hidden p-8 text-center
                      ${isDarkTheme 
                        ? 'bg-white/5 border-white/10' 
                        : 'bg-white/80 border-black/5 shadow-lg'
                      }`}
                  >
                    <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full blur-3xl opacity-10 bg-blue-500" />
                    <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full blur-3xl opacity-10 bg-purple-500" />
                    
                    <div className="relative z-10">
                      <ClipboardList className={`h-16 w-16 mx-auto mb-4 
                        ${isDarkTheme ? 'text-white/40' : 'text-black/40'}`} 
                      />
                      <h3 className="text-2xl font-medium mb-3">No Orders Found</h3>
                      <p className={`mb-8 max-w-md mx-auto
                        ${isDarkTheme ? 'text-white/60' : 'text-black/60'}`}>
                        You haven't placed any print orders yet. Start by uploading documents for printing.
                      </p>
                      <Link 
                        to="/print-page"
                        className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full text-base font-medium transition-all
                          ${isDarkTheme 
                            ? 'bg-white text-black hover:bg-white/90' 
                            : 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90'
                          }`}
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        Create Your First Order
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedOrders.map((orderGroup, groupIndex) => {
                      // Get the first order in the group (they all have the same creation time and shop)
                      const firstOrder = orderGroup[0];
                      const groupStatus = getGroupStatus(orderGroup);
                      const isPriority = isGroupPriority(orderGroup);
                      const statusInfo = getStatusInfo(groupStatus);
                      
                      return (
                        <motion.div
                          key={groupIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: groupIndex * 0.05 }}
                          whileHover={{ 
                            y: -8,
                            transition: { type: "spring", stiffness: 400, damping: 10 }
                          }}
                          onClick={() => setSelectedOrder(firstOrder)}
                          className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all border backdrop-blur-lg
                            ${isPriority 
                              ? isDarkTheme 
                                ? 'bg-amber-900/20 border-amber-800/30 hover:border-amber-700/40' 
                                : 'bg-amber-50 hover:bg-amber-100/80 border-amber-200'
                              : isDarkTheme 
                                ? 'bg-white/5 border-white/10 hover:border-white/20' 
                                : 'bg-white/80 hover:bg-white border-black/5 shadow-lg'
                            }`}
                        >
                          {/* Glassmorphic decorative elements */}
                          {isPriority ? (
                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-lg opacity-20 bg-amber-500" />
                          ) : (
                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-lg opacity-10 bg-gradient-to-br from-blue-400 to-purple-400" />
                          )}
                          
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-medium text-lg mb-1">
                                  Order #{firstOrder._id.substring(firstOrder._id.length - 6)}
                                </h3>
                                <p className={`text-sm 
                                  ${isDarkTheme ? 'text-white/60' : 'text-black/60'}`}
                                >
                                  {orderGroup.length} {orderGroup.length === 1 ? 'file' : 'files'}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {isPriority && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                                    ${isDarkTheme 
                                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' 
                                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                                    }`}
                                  >
                                    Priority
                                  </span>
                                )}
                                <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium
                                  ${statusInfo.color} ${statusInfo.bg} border ${statusInfo.border}`}
                                >
                                  {statusInfo.icon}
                                  <span className="ml-1.5">{statusInfo.label}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`mb-4 pb-4 border-b 
                              ${isDarkTheme ? 'border-white/10' : 'border-black/10'}`}
                            >
                              <div className="flex items-center mb-2">
                                <Printer className={`h-4 w-4 mr-2 
                                  ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`} 
                                />
                                <span className={`text-sm 
                                  ${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}
                                >
                                  {firstOrder.printConfig.copies} {firstOrder.printConfig.copies > 1 ? 'copies' : 'copy'}, {' '}
                                  {firstOrder.printConfig.colorMode === 'blackAndWhite' ? 'B&W' : 'Color'}, {' '}
                                  {firstOrder.printConfig.pageSize}
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <Calendar className={`h-4 w-4 mr-2 
                                  ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`} 
                                />
                                <span className={`text-sm 
                                  ${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}
                                >
                                  {formatDate(firstOrder.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            {/* File List Preview */}
                            <div className="mb-4 max-h-24 overflow-y-auto">
                              <p className={`text-xs font-medium mb-1.5 
                                ${isDarkTheme ? 'text-white/70' : 'text-black/70'}`}
                              >
                                Files
                              </p>
                              <ul className={`text-xs space-y-1.5 
                                ${isDarkTheme ? 'text-white/60' : 'text-black/60'}`}
                              >
                                {orderGroup.map((order, i) => (
                                  <li key={i} className="truncate flex items-center">
                                    <FileText className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                    {order.file.originalName}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm">
                                <MapPin className={`h-4 w-4 mr-1.5 
                                  ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`} 
                                />
                                {firstOrder.shopkeeperId ? (
                                  <span>{firstOrder.shopkeeperId.name}</span>
                                ) : (
                                  <span className={isDarkTheme ? 'text-white/50' : 'text-black/50'}>
                                    No shop assigned
                                  </span>
                                )}
                              </div>
                              <motion.div 
                                whileHover={{ x: 3 }}
                                className={`text-sm flex items-center 
                                  ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`}
                              >
                                View Details
                                <ChevronRight className="h-4 w-4 ml-0.5" />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Order Details Component
interface OrderDetailsProps {
  order: Order;
  isDarkTheme: boolean;
  formatDate: (dateString: string) => string;
  getStatusInfo: (status: string) => {
    icon: JSX.Element;
    color: string;
    bg: string;
    border: string;
    label: string;
  };
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ 
  order, 
  isDarkTheme,
  formatDate,
  getStatusInfo
}) => {
  const statusInfo = getStatusInfo(order.status);
  
  // Steps for the order process
  const steps = [
    { 
      label: 'Order Placed', 
      date: order.timeline.created,
      icon: <FileText className="h-5 w-5" />,
      completed: true
    },
    { 
      label: 'Payment', 
      date: order.timeline.paid,
      icon: <CreditCard className="h-5 w-5" />,
      completed: !!order.timeline.paid
    },
    { 
      label: 'Processing', 
      date: order.timeline.processing,
      icon: <RefreshCw className="h-5 w-5" />,
      completed: !!order.timeline.processing
    },
    { 
      label: 'Ready for Pickup', 
      date: order.timeline.ready,
      icon: <Clock className="h-5 w-5" />,
      completed: !!order.timeline.ready
    },
    { 
      label: 'Completed', 
      date: order.timeline.completed,
      icon: <CheckSquare className="h-5 w-5" />,
      completed: !!order.timeline.completed
    }
  ];
  
  return (
    <div className="space-y-8">
      {/* Order Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`rounded-2xl overflow-hidden p-6 backdrop-blur-lg border
          ${isDarkTheme 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white/80 border-black/5 shadow-lg'
          }`}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-medium mb-1">Order #{order._id.substring(order._id.length - 6)}</h2>
            <p className={`${isDarkTheme ? 'text-white/60' : 'text-black/60'}`}>
              {formatDate(order.createdAt)}
            </p>
          </div>
          
          <div className={`flex items-center px-4 py-2 rounded-full ${statusInfo.bg} border ${statusInfo.border}`}>
            <div className={`${statusInfo.color} mr-2`}>{statusInfo.icon}</div>
            <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Order Timeline Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`rounded-2xl overflow-hidden p-6 backdrop-blur-lg border
          ${isDarkTheme 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white/80 border-black/5 shadow-lg'
          }`}
      >
        <h3 className="text-xl font-medium mb-8">Order Progress</h3>
        
        <div className="relative">
          {/* Progress Line */}
          <div className={`absolute left-6 top-8 bottom-8 w-0.5 
            ${isDarkTheme ? 'bg-white/10' : 'bg-black/10'} z-0`}
          ></div>
          
          {/* Steps */}
          <div className="space-y-8 relative z-10">
            {steps.map((step, index) => {
              const isActive = step.completed;
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="flex items-start"
                >
                  <motion.div 
                    initial={isActive ? { scale: 0.5, opacity: 0 } : {}}
                    animate={isActive ? { scale: 1, opacity: 1 } : {}}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`rounded-full p-3 z-10 mr-5 ${isActive 
                      ? isDarkTheme 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'bg-blue-100 text-blue-600 border border-blue-200'
                      : isDarkTheme 
                        ? 'bg-white/10 text-white/30 border border-white/10' 
                        : 'bg-black/5 text-black/30 border border-black/10'
                    }`}
                  >
                    {step.icon}
                  </motion.div>
                  
                  <div className="pt-1.5">
                    <h4 className={`font-medium ${isActive 
                      ? isDarkTheme ? 'text-white' : 'text-black' 
                      : isDarkTheme ? 'text-white/40' : 'text-black/40'
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-sm mt-0.5 ${isDarkTheme ? 'text-white/60' : 'text-black/60'}`}>
                      {step.date ? formatDate(step.date) : 'Pending'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
      
      {/* Document & Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-2xl overflow-hidden p-6 backdrop-blur-lg border
            ${isDarkTheme 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white/80 border-black/5 shadow-lg'
            }`}
        >
          <h3 className="text-xl font-medium mb-6">Document Details</h3>
          
          <div className={`space-y-4 ${isDarkTheme ? 'text-white/80' : 'text-black/80'}`}>
            <div className={`p-4 rounded-xl ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
              <div className="flex items-start mb-2">
                <FileText className={`h-5 w-5 mt-0.5 mr-3 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">File Name</p>
                  <p className="text-sm break-words">{order.file.originalName}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className={`h-5 w-5 mt-0.5 mr-3 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Upload Date</p>
                  <p className="text-sm">{formatDate(order.file.uploadDate)}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
              <h4 className="text-sm font-medium mb-3">Print Configuration</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className={`mb-1 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`}>Color Mode</p>
                  <p className="font-medium">
                    {order.printConfig.colorMode === 'blackAndWhite' ? 'Black & White' : 'Color'}
                  </p>
                </div>
                <div>
                  <p className={`mb-1 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`}>Paper Size</p>
                  <p className="font-medium">{order.printConfig.pageSize}</p>
                </div>
                <div>
                  <p className={`mb-1 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`}>Orientation</p>
                  <p className="font-medium capitalize">{order.printConfig.orientation}</p>
                </div>
                <div>
                  <p className={`mb-1 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`}>Double-sided</p>
                  <p className="font-medium">{order.printConfig.duplexPrinting ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className={`mb-1 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`}>Pages</p>
                  <p className="font-medium">{order.printConfig.pageRange}</p>
                </div>
                <div>
                  <p className={`mb-1 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`}>Copies</p>
                  <p className="font-medium">{order.printConfig.copies}</p>
                </div>
                <div>
                  <p className={`mb-1 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`}>Pages Per Sheet</p>
                  <p className="font-medium">{order.printConfig.pagesPerSheet}</p>
                </div>
                <div>
                  <p className={`mb-1 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`}>Priority</p>
                  <p className="font-medium">{order.printConfig.isPriority ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Shop and Payment Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`rounded-2xl overflow-hidden p-6 backdrop-blur-lg border
            ${isDarkTheme 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white/80 border-black/5 shadow-lg'
            }`}
        >
          <h3 className="text-xl font-medium mb-6">Shop & Payment Details</h3>
          
          {order.shopkeeperId ? (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Print Shop</h4>
              <div className={`p-4 rounded-xl ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
                <div className="flex items-start">
                  <MapPin className={`h-5 w-5 mt-0.5 mr-3 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`} />
                  <div>
                    <p className="font-medium mb-1">{order.shopkeeperId.name}</p>
                    <address className={`not-italic text-sm ${isDarkTheme ? 'text-white/60' : 'text-black/60'}`}>
                      {order.shopkeeperId.address.street}<br />
                      {order.shopkeeperId.address.city}, {order.shopkeeperId.address.state} {order.shopkeeperId.address.pincode}<br />
                      {order.shopkeeperId.address.country}
                    </address>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Print Shop</h4>
              <div className={`p-4 rounded-xl ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
                <p className="italic text-center">No shop assigned</p>
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium mb-3">Payment Information</h4>
            <div className={`p-4 rounded-xl ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
              <div className="flex items-start mb-4">
                <CreditCard className={`h-5 w-5 mt-0.5 mr-3 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-sm capitalize">{order.payment.method}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Payment Status</p>
                    <span className={`text-sm capitalize font-medium px-2 py-0.5 rounded-full
                      ${order.payment.status === 'completed' 
                        ? isDarkTheme ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700'
                        : order.payment.status === 'pending'
                          ? isDarkTheme ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'
                          : isDarkTheme ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700'
                      }`}>
                      {order.payment.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className={`h-5 w-5 mt-0.5 mr-3 ${isDarkTheme ? 'text-white/50' : 'text-black/50'}`} />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Delivery Method</p>
                    <p className="text-sm capitalize">{order.deliveryMethod}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrdersPage;