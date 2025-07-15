import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const email = useSelector((state: RootState) => state.auth.email);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  if (!isLoggedIn) return null;
  

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand">AI Interviewer</span>
      <div className="ms-auto">
        {email && <span className="text-white me-4">Logged in as: {email}</span>}
        <Link to="/reports" className="btn btn-outline-light btn-sm">View Past Reports</Link>
      </div>
    </nav>
  );
};

export default Navbar;
