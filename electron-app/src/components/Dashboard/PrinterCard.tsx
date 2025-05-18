import { useState } from 'react';
import { Printer } from 'lucide-react';

interface PrinterCardProps {
  name: string;
  id: string;
  initialOnline?: boolean;
  onStatusChange?: (id: string, isOnline: boolean) => void;
}

const PrinterCard = ({ name, id, initialOnline = false, onStatusChange }: PrinterCardProps) => {
  const [isOnline, setIsOnline] = useState(initialOnline);

  const toggleStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
  };

  return (
    <div 
      className="bg-white p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={toggleStatus}
    >
      <div className="flex items-center">
        <Printer className={`w-5 h-5 ${isOnline ? 'text-green-500' : 'text-gray-500'} mr-3`} />
        <div>
          <span className="text-sm font-medium text-gray-800">{name}</span>
          <div className="flex items-center mt-1">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <span className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-500">ID: {id}</span>
    </div>
  );
};

export default PrinterCard;