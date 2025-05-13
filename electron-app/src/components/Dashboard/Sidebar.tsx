
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Grid3X3, 
  FileText, 
  Calendar, 
  Settings, 
  HelpCircle, 
  ArrowLeft,
  LogOut,
  Printer
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={`h-screen bg-white rounded-r-3xl py-8 flex flex-col justify-between transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
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
          <NavItem icon={<Printer />} label="Printers" path="/printers" collapsed={collapsed} active={currentPath === '/printers'} />
          <NavItem icon={<FileText />} label="Documents" path="/documents" collapsed={collapsed} active={currentPath === '/documents'} />
          <NavItem icon={<Calendar />} label="Calendar" path="/calendar" collapsed={collapsed} active={currentPath === '/calendar'} />
          <NavItem icon={<Settings />} label="Settings" path="/settings" collapsed={collapsed} active={currentPath === '/settings'} />
          <NavItem icon={<HelpCircle />} label="Help" path="/help" collapsed={collapsed} active={currentPath === '/help'} />
        </div>
      </div>

      <div className="px-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center mb-8 w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className={`w-5 h-5 text-gray-500 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-200">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80" 
              alt="User profile" 
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">John Doe</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          )}
        </div>
        <NavItem icon={<LogOut />} label="Sign Out" path="/login" collapsed={collapsed} />
      </div>
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
