import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import PrintPage from './pages/PrintPage';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page - Always Accessible */}
        <Route path="/" element={<HomePage />} />
        
        {/* We keep these routes for direct deep linking, but the modal is preferred */}
        <Route path="/sign-in" element={<Navigate to="/" replace />} />
        <Route path="/sign-up" element={<Navigate to="/" replace />} />
        
        {/* Protected Pages */}
        <Route 
          path="/print-page" 
          element={
            <>
              <SignedIn>
                <PrintPage />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" replace />
              </SignedOut>
            </>
          } 
        />
        
        <Route 
          path="/orders" 
          element={
            <>
              <SignedIn>
                <OrdersPage />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" replace />
              </SignedOut>
            </>
          } 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
