import { Link } from 'react-router-dom';
import { Printer, Sun, Moon } from 'lucide-react';
import SignIn from '../components/auth/SignIn';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../slices/themeSlice';

const SignInPage = () => {
  const dispatch = useDispatch();
  const isDarkTheme = useSelector((state: { theme: { isDarkMode: boolean } }) => state.theme.isDarkMode);

  const themeClass = isDarkTheme 
    ? 'bg-gray-900 text-white' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-50';

  return (
    <div className={`min-h-screen ${themeClass} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-3">
            <Printer className={`h-8 w-8 ${isDarkTheme ? 'text-blue-400' : 'text-blue-500'}`} />
            <h1 className="text-3xl font-bold">PrintService</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-full ${
                isDarkTheme 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              } shadow-lg transition-colors duration-300`}
            >
              {isDarkTheme ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="mt-12">
          <SignIn isDarkTheme={isDarkTheme} />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;