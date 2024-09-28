import { Avatar, Button, Image, Menu as MenuProfile } from '@mantine/core';
import { useState } from 'react';
import { Menu } from 'react-feather';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { showNotification } from '@mantine/notifications';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import logoWhite from '../assets/logo-white.svg';
import useUserStore from '../store/user.store';
import DrawerSidebar from './DrawerSidebar';
import NotificationsIcon from '../assets/notifications.svg';
import SettingsIcon from '../assets/settings.svg';
import UserImage from '../assets/placeholders/user.png';
import useLayoutView from '../store/layout.store';
import RepositoryMenuPopover from './Popovers/RepositoryMenuPopover';

const Header = ({ title }) => {
  const { pathname } = useLocation();
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useUserStore(state => state.id);
  const user = queryClient.getQueryData(['users-by-id', userId]);

  const { setToken, setId, setHasAcceptedTerms } = useUserStore(
    state => ({
      setToken: state.setToken,
      setId: state.setId,
      setHasAcceptedTerms: state.setHasAcceptedTerms,
    }),
    shallow,
  );

  const { setActiveLayout } = useLayoutView(
    state => ({
      setActiveLayout: state.setActiveLayout,
    }),
    shallow,
  );

  const handleLogout = () => {
    setToken(null);
    setId(null);
    setHasAcceptedTerms(null);
    setHasAcceptedTerms(null);
    setActiveLayout({
      inventory: 'list',
      proposal: 'list',
      campaign: 'list',
      inventoryLimit: 20,
      bookingLimit: 20,
      proposalLimit: 20,
      campaignLimit: 20,
    });
    navigate('/login');
    showNotification({
      title: 'Logged out successfully',
      color: 'green',
    });
  };

  return (
    <>
      <header className="grid grid-cols-12 h-[60px] relative w-screen">
        <div className="flex items-center justify-center md:justify-start  col-span-2 pl-2 lg:pl-7 self-center bg-purple-450 h-full">
          <Menu onClick={() => setOpened(true)} className="mr-2 h-6 w-6 inline-block lg:hidden" />
          <Link to="/home" className="hidden md:block">
            <img className="w-16 lg:w-24" src={logoWhite} alt="logo" />
          </Link>
        </div>
        <div className="flex justify-between items-center col-span-10 border-b border-gray-450">
          <div className="pl-5">
            <p className="text-2xl font-bold tracking-wide hidden md:block">{title}</p>
          </div>

          <div className="flex items-center mr-2 md:mr-5">
            <RepositoryMenuPopover />

            <Link to="/notification" className="flex items-center">
              <Image src={NotificationsIcon} height={24} width={24} />
              <span
                className={classNames(
                  'font-medium ml-2 mr-4 hidden md:block',
                  ['/notification'].includes(pathname) ? 'text-purple-450' : 'text-gray-400',
                )}
              >
                Notifications
              </span>
            </Link>
            <Link to="/settings" className="flex items-center mx-4 md:mx-0">
              <Image src={SettingsIcon} height={24} width={24} />
              <span
                className={classNames(
                  'font-medium mr-4 ml-2 hidden md:block',
                  ['/settings'].includes(pathname) ? 'text-purple-450' : 'text-gray-400',
                )}
              >
                Settings
              </span>
            </Link>
            <MenuProfile shadow="md" width={150}>
              <MenuProfile.Target>
                <Button variant="default">
                  <Avatar
                    size="sm"
                    src={user?.image || UserImage}
                    className="rounded-full mr-2"
                    alt="user-logo"
                  />
                  <p className="font-medium text-sm max-w-[120px] min-w-[100px] overflow-hidden text-ellipsis">
                    {user?.name || 'Profile'}
                  </p>
                </Button>
              </MenuProfile.Target>

              <MenuProfile.Dropdown>
                <Link to="/profile">
                  <MenuProfile.Item>My Profile</MenuProfile.Item>
                </Link>
                <Link to="/edit-profile">
                  <MenuProfile.Item>Edit Profile</MenuProfile.Item>
                </Link>
                <MenuProfile.Item className="text-red-500" onClick={handleLogout}>
                  Logout
                </MenuProfile.Item>
              </MenuProfile.Dropdown>
            </MenuProfile>
          </div>
        </div>
      </header>
      {opened && <DrawerSidebar setOpened={setOpened} opened={opened} />}
    </>
  );
};

export default Header;
