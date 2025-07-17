// ProtectedRoute.tsx
// -------------------------------------------------
// This component is used to guard private routes.
// It checks whether the user is authenticated.
// If not logged in, it redirects the user to the login page.

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../redux/store';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Access the Redux store to determine login status
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  // If authenticated, render the protected component
  // Otherwise, redirect to the login page
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
