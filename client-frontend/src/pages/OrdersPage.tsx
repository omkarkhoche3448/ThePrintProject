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
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Existing state
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

  // User context
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  // Apply theme
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

  // Rest of your existing methods
  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  const handleLogout = () => {
    signOut(() => navigate('/'));
  };

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
          color: 'text-green-500',
          label: 'Completed'
        };
      case 'processing':
        return { 
          icon: <RefreshCw className="h-5 w-5" />, 
          color: 'text-blue-500',
          label: 'Processing'
        };
      case 'failed':
        return { 
          icon: <AlertCircle className="h-5 w-5" />, 
          color: 'text-red-500',
          label: 'Failed'
        };
      case 'cancelled':
        return { 
          icon: <AlertCircle className="h-5 w-5" />, 
          color: 'text-red-500',
          label: 'Cancelled'
        };
      default:
        return { 
          icon: <Hourglass className="h-5 w-5" />, 
          color: 'text-yellow-500',
          label: 'Pending'
        };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen transition-colors duration-500 
        ${isDarkTheme 
          ? 'bg-[#121212] text-white' 
          : 'bg-white text-black'
        }`}
    >
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 
          ${isDarkTheme 
            ? 'bg-black/80 text-white' 
            : 'bg-white/80 text-black'
          } backdrop-blur-lg shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Printer className={`h-8 w-8 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-black'}`}>PrintEasy</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/print-page"
              className={`px-4 py-2 rounded-full transition-colors
                ${isDarkTheme 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
            >
              <FileText className="h-5 w-5" />
            </Link>
            
            <Link 
              to="/"
              className={`px-4 py-2 rounded-full transition-colors
                ${isDarkTheme 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
            >
              <BookOpen className="h-5 w-5" />
            </Link>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className={`text-lg font-medium ${isDarkTheme ? 'text-white' : 'text-black'}`}>
                  Hi, {user.firstName || user.username}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </div>
            )}

            <motion.button
              whileHover={{ rotate: 15 }}
              whileTap={{ rotate: -15 }}
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors 
                ${isDarkTheme 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
            >
              {isDarkTheme ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            {selectedOrder ? 'Order Details' : 'My Orders'}
          </h1>
          
          {selectedOrder ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedOrder(null)}
              className={`flex items-center px-4 py-2 rounded-full
                ${isDarkTheme 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </motion.button>
          ) : (
            <div className="flex items-center space-x-4">
              {/* View mode selection */}
              <div className={`flex rounded-lg overflow-hidden ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-4 py-2 text-sm font-medium transition-colors
                    ${viewMode === 'all' 
                      ? isDarkTheme 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-blue-500 text-white'
                      : ''
                    }`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => setViewMode('active')}
                  className={`px-4 py-2 text-sm font-medium transition-colors
                    ${viewMode === 'active' 
                      ? isDarkTheme 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-blue-500 text-white'
                      : ''
                    }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setViewMode('completed')}
                  className={`px-4 py-2 text-sm font-medium transition-colors
                    ${viewMode === 'completed' 
                      ? isDarkTheme 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-blue-500 text-white'
                      : ''
                    }`}
                >
                  Completed
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchOrders}
                disabled={isRefreshing}
                className={`flex items-center px-4 py-2 rounded-full transition-colors
                  ${isDarkTheme 
                    ? 'bg-blue-700 text-white hover:bg-blue-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  } ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
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
              className="flex justify-center items-center h-64"
            >
              <RefreshCw className={`h-10 w-10 animate-spin ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} />
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`p-6 rounded-lg text-center ${isDarkTheme ? 'bg-red-900/30' : 'bg-red-100'}`}
            >
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 text-lg">{error}</p>
              <button 
                onClick={fetchOrders}
                className={`mt-4 px-4 py-2 rounded-lg 
                  ${isDarkTheme ? 'bg-red-700 hover:bg-red-600' : 'bg-red-500 hover:bg-red-400'} 
                  text-white transition-colors`}
              >
                Try Again
              </button>
            </motion.div>
          ) : selectedOrder ? (
            <OrderDetails 
              order={selectedOrder} 
              isDarkTheme={isDarkTheme} 
            />
          ) : (
            <motion.div 
              key="orders-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {groupedOrders.length === 0 ? (
                <div className={`p-8 rounded-lg text-center ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <ClipboardList className={`h-16 w-16 mx-auto mb-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                  <h3 className="text-xl font-medium mb-2">No Orders Found</h3>
                  <p className={`mb-6 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    You haven't placed any print orders yet
                  </p>
                  <Link 
                    to="/print-page"
                    className={`px-6 py-3 rounded-full transition-colors
                      ${isDarkTheme 
                        ? 'bg-blue-700 text-white hover:bg-blue-600' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  >
                    Create Your First Order
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupedOrders.map((orderGroup, groupIndex) => {
                    // Get the first order in the group (they all have the same creation time and shop)
                    const firstOrder = orderGroup[0];
                    const groupStatus = getGroupStatus(orderGroup);
                    const isPriority = isGroupPriority(orderGroup);
                    const statusInfo = getStatusInfo(groupStatus);
                    
                    return (
                      <motion.div
                        key={groupIndex}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOrder(firstOrder)}
                        className={`p-6 rounded-lg cursor-pointer transition-colors
                          ${isPriority 
                            ? isDarkTheme 
                              ? 'bg-amber-900/40 hover:bg-amber-900/60 border border-amber-500/50' 
                              : 'bg-amber-50 hover:bg-amber-100 border border-amber-200'
                            : isDarkTheme 
                              ? 'bg-gray-800 hover:bg-gray-700' 
                              : 'bg-white hover:bg-gray-50'
                          } shadow-lg`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-lg mb-1">
                              Order #{firstOrder._id.substring(firstOrder._id.length - 6)}
                            </h3>
                            <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                              {orderGroup.length} {orderGroup.length === 1 ? 'file' : 'files'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isPriority && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${isDarkTheme ? 'bg-amber-900/60 text-amber-300' : 'bg-amber-100 text-amber-800'}`}
                              >
                                Priority
                              </span>
                            )}
                            <div className={`flex items-center px-3 py-1 rounded-full 
                              ${statusInfo.color} ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'}`}
                            >
                              {statusInfo.icon}
                              <span className="ml-2 text-sm font-medium">{statusInfo.label}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4 pb-4 border-b border-gray-700">
                          <div className="flex items-center mb-2">
                            <Printer className="h-4 w-4 mr-2 opacity-70" />
                            <span className="text-sm">
                              {firstOrder.printConfig.copies} {firstOrder.printConfig.copies > 1 ? 'copies' : 'copy'}, {' '}
                              {firstOrder.printConfig.colorMode === 'blackAndWhite' ? 'B&W' : 'Color'}, {' '}
                              {firstOrder.printConfig.pageSize}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 opacity-70" />
                            <span className="text-sm">{formatDate(firstOrder.createdAt)}</span>
                          </div>
                        </div>
                        
                        {/* File List Preview */}
                        <div className="mb-4 max-h-24 overflow-y-auto">
                          <p className="text-xs font-medium mb-1">Files:</p>
                          <ul className="text-xs space-y-1">
                            {orderGroup.map((order, i) => (
                              <li key={i} className="truncate">
                                {i + 1}. {order.file.originalName}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {firstOrder.shopkeeperId ? (
                              <span>{firstOrder.shopkeeperId.name}</span>
                            ) : (
                              <span className="text-gray-500">No shop assigned</span>
                            )}
                          </div>
                          <div className={`text-sm ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`}>
                            View Details →
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
    </motion.div>
  );
};

// Order Details Component
interface OrderDetailsProps {
  order: Order;
  isDarkTheme: boolean;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, isDarkTheme }) => {
  const statusInfo = getStatusInfo(order.status);
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Pending';
    
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
  
  // Helper function for status icons and colors
  function getStatusInfo(status: string) {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckSquare className="h-5 w-5" />, 
          color: 'text-green-500',
          label: 'Completed',
          bgColor: isDarkTheme ? 'bg-green-900/20' : 'bg-green-100'
        };
      case 'processing':
        return { 
          icon: <RefreshCw className="h-5 w-5" />, 
          color: 'text-blue-500',
          label: 'Processing',
          bgColor: isDarkTheme ? 'bg-blue-900/20' : 'bg-blue-100'
        };
      case 'failed':
        return { 
          icon: <AlertCircle className="h-5 w-5" />, 
          color: 'text-red-500',
          label: 'Failed',
          bgColor: isDarkTheme ? 'bg-red-900/20' : 'bg-red-100'
        };
      case 'cancelled':
        return { 
          icon: <AlertCircle className="h-5 w-5" />, 
          color: 'text-red-500',
          label: 'Cancelled',
          bgColor: isDarkTheme ? 'bg-red-900/20' : 'bg-red-100'
        };
      default:
        return { 
          icon: <Hourglass className="h-5 w-5" />, 
          color: 'text-yellow-500',
          label: 'Pending',
          bgColor: isDarkTheme ? 'bg-yellow-900/20' : 'bg-yellow-100'
        };
    }
  }
  
  // Steps for the order process
  const steps = [
    { 
      label: 'Order Placed', 
      date: order.timeline.created,
      icon: <FileText className="h-6 w-6" />,
      completed: true
    },
    { 
      label: 'Payment', 
      date: order.timeline.paid,
      icon: <FileText className="h-6 w-6" />,
      completed: !!order.timeline.paid
    },
    { 
      label: 'Processing', 
      date: order.timeline.processing,
      icon: <RefreshCw className="h-6 w-6" />,
      completed: !!order.timeline.processing
    },
    { 
      label: 'Ready for Pickup', 
      date: order.timeline.ready,
      icon: <CheckSquare className="h-6 w-6" />,
      completed: !!order.timeline.ready
    },
    { 
      label: 'Completed', 
      date: order.timeline.completed,
      icon: <CheckSquare className="h-6 w-6" />,
      completed: !!order.timeline.completed
    }
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Order Header */}
      <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Order #{order._id.substring(order._id.length - 6)}</h2>
            <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
              {new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div className={`flex items-center px-4 py-2 rounded-lg ${statusInfo.bgColor}`}>
            <div className={`${statusInfo.color} mr-2`}>{statusInfo.icon}</div>
            <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
        </div>
      </div>
      
      {/* Order Timeline Animation */}
      <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className="text-xl font-semibold mb-6">Order Progress</h3>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700 z-0"></div>
          
          {/* Steps */}
          <div className="space-y-8 relative z-10">
            {steps.map((step, index) => {
              const isActive = step.completed;
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <motion.div 
                    initial={isActive ? { scale: 0.5, opacity: 0 } : {}}
                    animate={isActive ? { scale: 1, opacity: 1 } : {}}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`rounded-full p-3 z-10 mr-4 
                      ${isActive 
                        ? `${isDarkTheme ? 'bg-blue-700' : 'bg-blue-500'} text-white` 
                        : `${isDarkTheme ? 'bg-gray-700' : 'bg-gray-300'}`}
                    `}
                  >
                    {step.icon}
                  </motion.div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium text-lg 
                      ${isActive 
                        ? isDarkTheme ? 'text-white' : 'text-black' 
                        : isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                      {step.label}
                    </h4>
                    <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(step.date || '')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Details */}
        <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-xl font-semibold mb-4">Document Details</h3>
          
          <div className={`space-y-3 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex justify-between">
              <span className="font-medium">File Name:</span>
              <span className="max-w-[200px] truncate">{order.file.originalName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Upload Date:</span>
              <span>{formatDate(order.file.uploadDate)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Color Mode:</span>
              <span>
                {order.printConfig.colorMode === 'blackAndWhite' ? 'Black & White' : 'Color'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Paper Size:</span>
              <span>{order.printConfig.pageSize}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Orientation:</span>
              <span className="capitalize">{order.printConfig.orientation}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Double-sided:</span>
              <span>{order.printConfig.duplexPrinting ? 'Yes' : 'No'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Pages:</span>
              <span>{order.printConfig.pageRange}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Copies:</span>
              <span>{order.printConfig.copies}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Pages Per Sheet:</span>
              <span>{order.printConfig.pagesPerSheet}</span>
            </div>
          </div>
        </div>
        
        {/* Shop and Payment Details */}
        <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-xl font-semibold mb-4">Shop & Payment Details</h3>
          
          {order.shopkeeperId ? (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Print Shop</h4>
              <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-lg font-medium mb-1">{order.shopkeeperId.name}</p>
                <address className={`not-italic ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  {order.shopkeeperId.address.street}<br />
                  {order.shopkeeperId.address.city}, {order.shopkeeperId.address.state} {order.shopkeeperId.address.pincode}<br />
                  {order.shopkeeperId.address.country}
                </address>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Print Shop</h4>
              <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-lg italic">No shop assigned</p>
              </div>
            </div>
          )}
          
          <div>
            <h4 className="font-medium mb-2">Payment Information</h4>
            <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between mb-2">
                <span>Payment Method:</span>
                <span className="capitalize">{order.payment.method}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Payment Status:</span>
                <span className={`capitalize font-medium 
                  ${order.payment.status === 'completed' 
                    ? 'text-green-500' 
                    : order.payment.status === 'pending' 
                      ? 'text-yellow-500' 
                      : 'text-red-500'
                  }`}>
                  {order.payment.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span className="capitalize">{order.deliveryMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrdersPage;