import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducer';

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface FeaturesGridProps {
  features: Feature[];
}

const FeaturesGrid: React.FC<FeaturesGridProps> = ({ features }) => {
  const isDarkTheme = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12  `}>
      {features.map((feature, index) => (
        <div
          key={index}
          className={`rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className={`mb-4 ${isDarkTheme ? 'text-blue-400' : 'text-blue-500'}`}>
            {feature.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className={isDarkTheme ? 'text-gray-300' : 'text-gray-600'}>
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeaturesGrid;
