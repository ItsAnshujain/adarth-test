import { Navigate, useLocation } from 'react-router-dom';
import useTokenIdStore from '../store/user.store';

const RequireAuth = ({ children }) => {
  const id = useTokenIdStore(state => state.id);
  const location = useLocation();
  return id ? children : <Navigate to="/login" replace state={{ path: location.pathname }} />;
};

export default RequireAuth;
