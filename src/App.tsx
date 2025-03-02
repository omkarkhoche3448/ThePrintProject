import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import PrintPage from './pages/PrintPage';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import { useSelector } from 'react-redux';
import { RootState } from './reducer';
import "./index.css";


function App() {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode); 
  const themeClass = isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';

  return (
    <Router>
      <div className={`min-h-screen ${themeClass} transition-colors duration-300`}>
        <Routes>
          <Route path="/print-page" element={<PrintPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;