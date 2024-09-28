import { Button } from '@mantine/core';
import classNames from 'classnames';
import { ArrowLeft } from 'react-feather';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ROLES } from '../../../../utils';
import RoleBased from '../../../RoleBased';

const Header = ({ tabs, setTabs }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <Button onClick={() => navigate(-1)} className="mr-4 px-0 text-black">
          <ArrowLeft />
        </Button>
        <Button
          onClick={() => setTabs('overview')}
          className={classNames(
            tabs === 'overview'
              ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3  after:bg-purple-450'
              : 'text-black',
            'px-0',
          )}
        >
          Campaign Overview
        </Button>
        <Button
          onClick={() => setTabs('spaces')}
          className={classNames(
            tabs === 'spaces'
              ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3  after:bg-purple-450'
              : 'text-black',
          )}
        >
          Spaces List
        </Button>
        <Button
          onClick={() => setTabs('bookings')}
          className={classNames(
            tabs === 'bookings'
              ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3  after:bg-purple-450'
              : 'text-black',
            'px-0',
          )}
        >
          Total Bookings
        </Button>
      </div>
      <RoleBased acceptedRoles={[ROLES.ADMIN]}>
        <div>
          <Link
            to={`/campaigns/edit-details/${id}`}
            className="bg-purple-450 flex items-center text-white rounded-md px-4 py-2 h-full font-bold text-sm"
          >
            Edit Campaign
          </Link>
        </div>
      </RoleBased>
    </div>
  );
};

export default Header;
