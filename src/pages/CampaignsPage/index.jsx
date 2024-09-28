import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const CampaignsPage = () => {
  const { pathname } = useLocation();
  let headerTitle = '';

  if (pathname.includes('view')) {
    headerTitle = 'Campaign Details';
  } else if (pathname.includes('create')) {
    headerTitle = 'Create Campaign';
  } else {
    headerTitle = 'Campaigns';
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

export default CampaignsPage;
