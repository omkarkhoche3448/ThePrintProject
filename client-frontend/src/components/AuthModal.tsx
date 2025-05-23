import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'signIn' | 'signUp';
  isDarkTheme: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialView = 'signIn',
  isDarkTheme
}) => {
  const [view, setView] = useState<'signIn' | 'signUp'>(initialView);
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // If modal is closed, don't render anything
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`relative w-full max-w-md mx-auto rounded-2xl shadow-xl overflow-hidden
                ${isDarkTheme 
                  ? 'bg-[#1a1a1a] border border-white/10' 
                  : 'bg-white border border-black/10'
                }`}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 p-2 rounded-full z-10
                  ${isDarkTheme 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-black/5 hover:bg-black/10 text-black'
                  }`}
              >
                <X className="h-5 w-5" />
              </button>
              
              {/* Auth content */}
              <div className="p-6">
                {view === 'signIn' ? (
                  <div className="h-[600px] overflow-auto">
                    <SignIn signUpUrl="#" />
                  </div>
                ) : (
                  <div className="h-[600px] overflow-auto">
                    <SignUp signInUrl="#" />
                  </div>
                )}
              </div>
              
              {/* Footer with toggle */}
              <div 
                className={`p-4 text-center text-sm
                  ${isDarkTheme ? 'border-t border-white/10' : 'border-t border-black/10'}`}
              >
                {view === 'signIn' ? (
                  <p className={isDarkTheme ? 'text-white/70' : 'text-black/70'}>
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setView('signUp')} 
                      className={`font-medium ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p className={isDarkTheme ? 'text-white/70' : 'text-black/70'}>
                    Already have an account?{' '}
                    <button 
                      onClick={() => setView('signIn')} 
                      className={`font-medium ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
