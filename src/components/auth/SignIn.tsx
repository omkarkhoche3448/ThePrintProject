import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertTriangle, User } from 'lucide-react';

interface SignInProps {
  isDarkTheme?: boolean;
}

export const SignIn: React.FC<SignInProps> = ({ isDarkTheme = false }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Here you would implement your email/password authentication logic
      // For example: await authService.signInWithEmailAndPassword(email, password);
      console.log('Signing in with email:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On success, redirect to home page
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Here you would implement Google authentication
      // For example: await authService.signInWithGoogle();
      console.log('Signing in with Google');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On success, redirect to home page
      navigate('/');
    } catch (err) {
      setError('Google sign in failed. Please try again.');
      console.error('Google sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
    isDarkTheme
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClass = isDarkTheme ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className={`max-w-md mx-auto rounded-lg shadow-lg p-8 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md text-red-600 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
        <div>
          <label className={`block text-sm font-medium ${labelClass} mb-1`}>
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className={`h-5 w-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${labelClass} mb-1`}>
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className={`h-5 w-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className={`rounded border-gray-300 text-blue-500 focus:ring-blue-500 ${
                isDarkTheme ? 'bg-gray-700' : 'bg-white'
              }`}
            />
            <label htmlFor="remember-me" className={`ml-2 text-sm ${labelClass}`}>
              Remember me
            </label>
          </div>
          
          <a href="#" className="text-sm text-blue-500 hover:text-blue-600">
            Forgot password?
          </a>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200
            ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          <Lock className="h-5 w-5" />
          <span>Sign In</span>
        </button>
      </form>
      
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className={`px-2 ${isDarkTheme ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
            Or continue with
          </span>
        </div>
      </div>
      
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200
          ${isDarkTheme 
            ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600' 
            : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300'}`}
      >
        <User className="h-5 w-5 text-red-500" />
        <span>Sign in with Google</span>
      </button>
      
      <p className={`mt-6 text-center text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
        Don't have an account?{' '}
        <a href="/signup" className="text-blue-500 hover:text-blue-600 font-medium">
          Sign up
        </a>
      </p>
    </div>
  );
};

export default SignIn;