import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const Reports_new = () => {
  return (
    <div>
      <Header title="New Reports" />
      <div className="grid grid-cols-12 h-[calc(100vh-60px)]">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default Reports_new;
