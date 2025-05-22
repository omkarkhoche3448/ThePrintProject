
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Grid3X3, 
  FileText, 
  Calendar, 
  Settings, 
  HelpCircle, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Printer
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userName?: string;
}

const Sidebar = ({ collapsed, setCollapsed, userName }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  
  // Use the provided userName, or fall back to user from context, or default to 'Shopkeeper'
  const displayName = userName || user?.name || 'Shopkeeper';

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`h-screen bg-white rounded-r-3xl py-8 flex flex-col justify-between transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} relative`}>
      <div>
        <div className="flex justify-center mb-10">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="space-y-6 px-4">
          <NavItem icon={<Grid3X3 />} label="Dashboard" path="/dashboard" collapsed={collapsed} active={currentPath === '/dashboard'} />
          {/* <NavItem icon={<Printer />} label="Printers" path="/printers" collapsed={collapsed} active={currentPath === '/printers'} /> */}
          {/* <NavItem icon={<FileText />} label="Documents" path="/documents" collapsed={collapsed} active={currentPath === '/documents'} /> */}
          {/* <NavItem icon={<Calendar />} label="Calendar" path="/calendar" collapsed={collapsed} active={currentPath === '/calendar'} /> */}
          <NavItem icon={<Settings />} label="Settings" path="/settings" collapsed={collapsed} active={currentPath === '/settings'} />
          {/* <NavItem icon={<HelpCircle />} label="Help" path="/help" collapsed={collapsed} active={currentPath === '/help'} /> */}
        </div>
      </div>

      <div className="px-4">
        {/* Improved collapse button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center justify-between w-full mb-8 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 group`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!collapsed && <span className="text-sm font-medium text-gray-700">Collapse Menu</span>}
          <div className={`${collapsed ? 'mx-auto' : ''} flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm`}>
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </div>
        </button>

        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-200">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80" 
              alt="User profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`ml-3 overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <p className="text-sm font-medium text-gray-800 whitespace-nowrap">{displayName}</p>
            <p className="text-xs text-gray-500 whitespace-nowrap">Admin</p>
          </div>
        </div>
        
        {/* Sign Out button */}
        <button 
          onClick={handleSignOut}
          className="w-full"
        >
          <div className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors text-gray-500 hover:bg-gray-100`}>
            <div className="w-6 h-6 flex items-center justify-center">
              <LogOut />
            </div>
            {!collapsed && <span className="ml-3 text-sm font-medium">Sign Out</span>}
          </div>
        </button>
      </div>

      {/* Absolute positioned collapse button for smaller screens */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute -right-3 top-20 hidden md:flex items-center justify-center w-6 h-12 bg-white rounded-r-md shadow-md border border-l-0 border-gray-200 hover:bg-gray-50 transition-colors`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  path: string;
  active?: boolean;
}

const NavItem = ({ icon, label, collapsed, path, active = false }: NavItemProps) => {
  return (
    <Link to={path} className="block">
      <div className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
        <div className="w-6 h-6 flex items-center justify-center">
          {icon}
        </div>
        {!collapsed && <span className="ml-3 text-sm font-medium">{label}</span>}
      </div>
    </Link>
  );
};

export default Sidebar;
