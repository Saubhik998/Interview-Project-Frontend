// Navbar component that appears only when the user is logged in
// Displays the logged-in email and a button to view past reports

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  // Access email and login status from Redux
  const email = useSelector((state: RootState) => state.auth.email);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  // If not logged in, do not render the navbar
  if (!isLoggedIn) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand">AI Interviewer</span>

      <div className="ms-auto d-flex align-items-center">
        {email && (
          <span className="text-white me-4">
            Logged in as: {email}
          </span>
        )}
        <Link to="/reports" className="btn btn-outline-light btn-sm">
          View Past Reports
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
