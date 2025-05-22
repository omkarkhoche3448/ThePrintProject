
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './UserMenu';

interface HeaderProps {
  userName?: string;
}

const Header = ({ userName }: HeaderProps) => {
  const { user } = useAuth();
  const displayName = userName || user?.name || 'Shopkeeper';
  
  return (
    <div className="flex justify-between items-center mb-8 pr-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Hello, {displayName}!</h1>
        <p className="text-sm text-gray-600 mt-1">Explore information and activity about your print shop</p>
      </div>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="py-2 pl-10 pr-4 border border-gray-200 rounded-full bg-white w-48 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>        <UserMenu />
      </div>
    </div>
  );
};

export default Header;
