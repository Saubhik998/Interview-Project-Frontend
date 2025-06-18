/**
 * App.tsx
 * ---------------------------
 * Main application entry point.
 * Uses React Router to navigate between:
 * - JDInput (Job Description Input screen)
 * - Interview (Audio interview interface)
 * - Report (Final report view)
 * ---------------------------
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your page components
import JDInput from './components/JDInput';
import Interview from './components/Interview';
import Report from './components/Report';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Route for the Job Description Input screen */}
        <Route path="/" element={<JDInput />} />

        {/* Route for the Interview screen */}
        <Route path="/interview" element={<Interview />} />

        {/* Route for the Report screen */}
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
};

export default App;
