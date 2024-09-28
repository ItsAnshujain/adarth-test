import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const InventoryPage = () => {
  const { pathname } = useLocation();
  let headerTitle = '';

  if (pathname.includes('view')) {
    headerTitle = 'Spaces Details';
  } else if (pathname.includes('create')) {
    headerTitle = 'Create Spaces';
  } else {
    headerTitle = 'Inventories';
  }

  return (
    <div>
      <Header title={headerTitle} />
      <div className="grid grid-cols-12 h-[calc(100vh-60px)]">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default InventoryPage;
