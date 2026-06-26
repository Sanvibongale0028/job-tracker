import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Analytics from './pages/Analytics';
import Resume from './pages/Resume';
import Reminders from './pages/Reminders';
import { useAuth } from './context/AuthContext';


function App() {
  const { token, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/applications" element={token ? <Applications /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        <Route path="/analytics" element={token ? <Analytics /> : <Navigate to="/login" />} />
        <Route path="/Resume" element={token ? <Resume /> : <Navigate to="/login" />} />
        <Route path="/Reminders" element={token ? <Reminders /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;