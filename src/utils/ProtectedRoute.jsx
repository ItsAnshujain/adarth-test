import { useQueryClient } from '@tanstack/react-query';
import { Loader } from '@mantine/core';
import useTokenIdStore from '../store/user.store';
import NoMatchFoundPage from '../pages/NoMatchFoundPage';

const ProtectedRoute = ({ accepted, children }) => {
  const userId = useTokenIdStore(state => state.id);
  const queryClient = useQueryClient();
  const userCachedData = queryClient.getQueryData(['users-by-id', userId]);

  if (!userCachedData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }
  return accepted?.includes(userCachedData?.role) ? children : <NoMatchFoundPage />;
};

export default ProtectedRoute;
