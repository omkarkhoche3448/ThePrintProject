import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface Shopkeeper {
  _id: string;
  name: string;
  printCosts: {
    blackAndWhite: number;
    color: number;
  };
  priorityRate: number; // Add this line
  discountRules: Array<{
    discountPercentage: number;
    minimumOrderAmount: number;
  }>;
  shopHours: {
    [key: string]: { open: string; close: string };
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

interface ShopkeeperSelectorProps {
  onSelect: (shopkeeper: Shopkeeper | null) => void;
  isDarkTheme: boolean;
}

const formatTime = (time: string | null) => {
  if (!time || time === '') return 'Closed';
  
  // Add validation for time format
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (!timeRegex.test(time)) return 'Closed';
  
  try {
    const date = new Date(`1970-01-01T${time}`);
    if (isNaN(date.getTime())) return 'Closed';
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).replace(/\s+/g, ' ').trim();
  } catch {
    return 'Closed';
  }
};

export const ShopkeeperSelector: React.FC<ShopkeeperSelectorProps> = ({ 
  onSelect,
  isDarkTheme 
}) => {
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<Shopkeeper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopkeepers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/shopkeepers');
        const result = await response.json();
        
        if (result.success) {
          setShopkeepers(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch shopkeepers');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shopkeepers');
      } finally {
        setLoading(false);
      }
    };

    fetchShopkeepers();
  }, []);

  const handleShopkeeperSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = shopkeepers.find(s => s._id === e.target.value) || null;
    setSelectedShopkeeper(selected);
    onSelect(selected);
  };

  return (
    <div className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-medium mb-4 ${isDarkTheme ? 'text-white' : 'text-black'}`}>
        Select Print Shop
      </h3>

      {loading ? (
        <div className={`text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading shopkeepers...
        </div>
      ) : error ? (
        <div className="flex items-center space-x-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <select
            onChange={handleShopkeeperSelect}
            className={`w-full p-2 rounded-md border ${
              isDarkTheme 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-black'
            }`}
          >
            <option value="">Select a print shop...</option>
            {shopkeepers.map((shopkeeper) => (
              <option key={shopkeeper._id} value={shopkeeper._id}>
                {shopkeeper.name}
              </option>
            ))}
          </select>

          {selectedShopkeeper && (
            <div className={`mt-4 p-4 rounded-lg ${
              isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h4 className="font-medium mb-4 text-lg">Shop Details</h4>
              <div className="space-y-4 text-sm">
                {/* Location Section */}
                <div className="bg-opacity-50 p-3 rounded-md bg-gray-100 dark:bg-gray-600">
                  <span className="font-medium block mb-1">📍 Location:</span>
                  <span className="ml-4">{`${selectedShopkeeper.address.street}, ${selectedShopkeeper.address.city}`}</span>
                </div>
                
                {/* Shop Hours Section */}
                <div className="bg-opacity-50 p-3 rounded-md bg-gray-100 dark:bg-gray-600">
                  <span className="font-medium block mb-2">🕒 Shop Hours:</span>
                  <div className="grid grid-cols-1 gap-1">
                    {Object.entries(selectedShopkeeper.shopHours).map(([day, hours]) => {
                      const isOpen = hours.open && hours.close;
                      return (
                        <div key={day} 
                          className="flex justify-between items-center py-1 border-b last:border-b-0 border-gray-200 dark:border-gray-500">
                          <span className="capitalize w-24">{day}</span>
                          <span className={`${!isOpen ? 'text-red-500' : ''} font-medium`}>
                            {isOpen 
                              ? `${formatTime(hours.open)} - ${formatTime(hours.close)}`
                              : 'Closed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Printing Costs Section */}
                <div className="bg-opacity-50 p-3 rounded-md bg-gray-100 dark:bg-gray-600">
                  <span className="font-medium block mb-2">💰 Printing Costs:</span>
                  <ul className="ml-4 space-y-1">
                    <li className="flex justify-between">
                      <span>Black & White:</span>
                      <span className="font-medium">₹{selectedShopkeeper.printCosts.blackAndWhite}/page</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Color:</span>
                      <span className="font-medium">₹{selectedShopkeeper.printCosts.color}/page</span>
                    </li>
                    <li className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-500">
                      <span>Priority Rate:</span>
                      <span className={`font-medium ${
                        selectedShopkeeper.priorityRate > 1.5 ? 'text-red-500' : 
                        selectedShopkeeper.priorityRate > 1.2 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {selectedShopkeeper.priorityRate}x
                      </span>
                    </li>
                    <li className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Final cost = Base cost × Priority rate
                    </li>
                  </ul>
                </div>

                {/* Discount Rules Section */}
                {selectedShopkeeper.discountRules.length > 0 && (
                  <div className="bg-opacity-50 p-3 rounded-md bg-gray-100 dark:bg-gray-600">
                    <span className="font-medium block mb-2">🏷️ Available Discounts:</span>
                    <ul className="ml-4 space-y-1">
                      {selectedShopkeeper.discountRules.map((rule, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{rule.discountPercentage}% off</span>
                          <span className="font-medium">on orders above ₹{rule.minimumOrderAmount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};