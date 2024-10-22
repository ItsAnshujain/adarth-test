import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const OtherTagsWiseReport = () => {
  return (
    <div>
      <Header title="" />
      <div className="grid grid-cols-12 h-[calc(100vh-60px)]">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default OtherTagsWiseReport;
