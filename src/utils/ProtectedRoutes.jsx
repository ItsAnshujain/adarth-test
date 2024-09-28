import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import shallow from 'zustand/shallow';
import useUserStore from '../store/user.store';

const ProtectedRoutes = () => {
  const { token, hasAcceptedTerms } = useUserStore(
    state => ({ token: state.token, hasAcceptedTerms: state.hasAcceptedTerms }),
    shallow,
  );

  if (token && !hasAcceptedTerms) {
    return <Navigate to="/terms-conditions" replace />;
  }
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
