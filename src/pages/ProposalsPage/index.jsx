import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const ProposalsPage = () => {
  const { pathname } = useLocation();

  let headerTitle = '';
  if (pathname.includes('view')) {
    headerTitle = 'Proposal Details';
  } else if (pathname.includes('create')) {
    headerTitle = 'Create Proposal';
  } else {
    headerTitle = 'Proposals';
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

export default ProposalsPage;
