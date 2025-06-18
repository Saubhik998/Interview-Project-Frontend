// Routing setup for app, including protected and public routes

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
      <Routes>
        {/* Public route for login */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes below require login */}
        <Route path="/" element={<ProtectedRoute><JDInput /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
