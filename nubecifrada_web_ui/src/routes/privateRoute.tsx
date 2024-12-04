import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function PrivateRoute({ children }: { children: ReactNode }) {

  const location = useLocation();
  const token = localStorage.getItem('token');

  return token ? children : <Navigate to="/login" state={{ from: location }} />;
}

export default PrivateRoute;
