import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JDInput from './components/JDInput';
import Interview from './components/Interview';
import Report from './components/Report';
import PastReports from './components/PastReports';
import Login from './auth/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import Navbar from './components/Navbar'; 
import ReportDetails from './components/ReportDetails';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Show Navbar ONLY on JDInput page */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <ProtectedRoute><JDInput /></ProtectedRoute>
            </>
          }
        />

        <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><PastReports /></ProtectedRoute>} />
        <Route path="/report/:id" element={<ReportDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
