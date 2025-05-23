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
    <div className={`rounded-2xl backdrop-blur-lg border ${
      isDarkTheme 
        ? 'bg-white/5 border-white/10' 
        : 'bg-white/80 border-black/5 shadow-lg'
    }`}>
      <div className="p-6">
        <h3 className={`text-xl font-medium mb-4 ${
          isDarkTheme ? 'text-white' : 'text-gray-900'
        }`}>
          Select Print Shop
        </h3>

        {loading ? (
          <div className={`text-center ${isDarkTheme ? 'text-white/70' : 'text-gray-600'}`}>
            Loading shopkeepers...
          </div>
        ) : error ? (
          <div className={`p-4 rounded-xl flex items-start space-x-3 ${
            isDarkTheme 
              ? 'bg-red-900/30 border border-red-800/50 text-red-200' 
              : 'bg-red-50 border border-red-100 text-red-800'
          }`}>
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <select
                onChange={handleShopkeeperSelect}
                value={selectedShopkeeper?._id || ""}
                className={`w-full p-3 pr-10 rounded-xl border appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${isDarkTheme 
                    ? 'bg-black/40 border-white/10 text-white placeholder:text-white/50 hover:bg-black/60 focus:bg-black/60'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 hover:bg-gray-50 focus:bg-gray-50'
                  }`}
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
              >
                <option value="" disabled className={isDarkTheme ? "bg-[#23272f] text-white" : "bg-white text-black"}>
                  Select a print shop...
                </option>
                {shopkeepers.map((shopkeeper) => (
                  <option
                    key={shopkeeper._id}
                    value={shopkeeper._id}
                    className={isDarkTheme
                      ? 'bg-[#23272f] text-white'
                      : 'bg-white text-black'
                    }
                  >
                    {shopkeeper.name}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <svg
                  className={`h-5 w-5 ${isDarkTheme ? 'text-white/70' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {selectedShopkeeper && (
              <div className={`mt-6 rounded-xl border ${
                isDarkTheme 
                  ? 'bg-black/20 border-white/10' 
                  : 'bg-black/5 border-black/5'
              }`}>
                <div className="p-4">
                  <h4 className={`font-medium mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    Shop Details
                  </h4>
                  <div className="space-y-4">
                    {/* Location Section */}
                    <div className={`p-3 rounded-xl ${
                      isDarkTheme ? 'bg-white/5' : 'bg-white/60'
                    }`}>
                      <span className={`font-medium block mb-1 ${
                        isDarkTheme ? 'text-white/90' : 'text-gray-900'
                      }`}>📍 Location:</span>
                      <span className={isDarkTheme ? 'text-white/70' : 'text-gray-600'}>
                        {`${selectedShopkeeper.address.street}, ${selectedShopkeeper.address.city}`}
                      </span>
                    </div>

                    ``

                    {/* Printing Costs Section */}
                    <div className={`p-3 rounded-xl ${
                      isDarkTheme ? 'bg-white/5' : 'bg-white/60'
                    }`}>
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
                      <div className={`p-3 rounded-xl ${
                        isDarkTheme ? 'bg-white/5' : 'bg-white/60'
                      }`}>
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};