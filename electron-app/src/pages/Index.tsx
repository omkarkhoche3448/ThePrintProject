
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard
    navigate('/dashboard');
  }, [navigate]);

  // Render the Dashboard as fallback
  return <Dashboard />;
};

export default Index;
