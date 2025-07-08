import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JDInput from './components/JDInput';
import Interview from './components/Interview';
import Report from './components/Report';
import Login from './auth/Login';
import ProtectedRoute from './auth/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '1rem'
      }}>
        <img src="/logo192.png" alt="AI Interview Logo" style={{ height: '200px' }} />
      </div>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><JDInput /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
