import React from 'react';
import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import PrintPage from './pages/PrintPage';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage'; // Add this import

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page - Always Accessible */}
        <Route path="/" element={<HomePage />} />
        
        {/* Authentication Routes */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        
        {/* Protected Print Page */}
        <Route 
          path="/print-page" 
          element={
            <SignedIn>
              <PrintPage />
            </SignedIn>
          } 
        />
        
        {/* Protected Orders Page */}
        <Route 
          path="/orders" 
          element={
            <SignedIn>
              <OrdersPage />
            </SignedIn>
          } 
        />
        
        {/* Redirect Unauthenticated Users from Protected Pages */}
        <Route 
          path="/print-page" 
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          } 
        />
        
        <Route 
          path="/orders" 
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          } 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;