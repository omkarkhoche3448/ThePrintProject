
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  percentChange: number;
  icon: React.ReactNode;
  additionalInfo?: string;
}

const StatsCard = ({ title, value, percentChange, icon, additionalInfo }: StatsCardProps) => {
  const isPositive = percentChange > 0;
  
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            {icon}
          </div>
          <h3 className="text-base font-medium text-gray-800">{title}</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Info className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{value}</h2>
        <div className="flex items-center text-sm">
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{isPositive ? '+' : ''}{percentChange}%</span>
          </div>
          {additionalInfo && (
            <span className="text-gray-500 ml-3">{additionalInfo}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
