import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const RepositoryPage = () => {
  const [searchParams] = useSearchParams();
  const share = searchParams.get('share');
  const location = useLocation();
  return (
    <div>
      {share !== 'repository' && location.pathname.includes('terms-and-conditions') ? (
        <Header title="Repository" />
      ) : location.pathname.includes('parent-companies') ? (
        <Header title="Parent Company Details" />
      ) : location.pathname.includes('sister-companies') ? (
        <Header title="Sister Company Details" />
      ) : location.pathname.includes('companies') ? (
        <Header title="Company Details" />
      ) : location.pathname.includes('co-company') ? (
        <Header title="Co-Companies" />
      ) : location.pathname.includes('company') ? (
        <Header title="Companies" />
      ) : location.pathname.includes('contact') ? (
        <Header title="Contacts" />
      ) : location.pathname.includes('parent-companies') ? (
        <Header title="Parent Company Details" />
      ) : location.pathname.includes('companies') ? (
        <Header title="Company Details" />
      ) : null}
      <div className="grid grid-cols-12 h-[calc(100vh-60px)]">
        {share !== 'repository' ? <Sidebar /> : null}
        <Outlet />
      </div>
    </div>
  );
};

export default RepositoryPage;
