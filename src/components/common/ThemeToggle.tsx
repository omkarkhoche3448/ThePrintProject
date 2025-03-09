import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../slices/themeSlice';
import { Moon, Sun } from 'lucide-react'; 

export const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkTheme = useSelector((state: { theme: { isDarkMode: boolean } }) => state.theme.isDarkMode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className={`
        p-2.5 rounded-full transition-all duration-300
        ${isDarkTheme 
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 hover:text-yellow-300' 
          : 'bg-white text-gray-800 hover:bg-gray-100 hover:text-gray-900'
        } shadow-lg
      `}
      aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};
