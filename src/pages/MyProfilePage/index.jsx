import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const MyProfilePage = () => (
  <div>
    <Header title="My Profile" />
    <div className="grid grid-cols-12 h-[calc(100vh-60px)]">
      <Sidebar />
      <Outlet />
    </div>
  </div>
);

export default MyProfilePage;
