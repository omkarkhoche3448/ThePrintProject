import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import PrintPage from './pages/PrintPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/print-page" element={<PrintPage />} />
        {/* Add other routes as needed */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;