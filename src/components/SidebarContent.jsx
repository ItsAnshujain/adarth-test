import React, { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { ChevronDown } from 'react-feather';
import { Box, Image } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import NestedSidebarContent from './NestedSidebarContent';
import HomeIcon from '../assets/home-default.svg';
import InventoryIcon from '../assets/inventory-default.svg';
import BookingIcon from '../assets/booking-default.svg';
import ProposalIcon from '../assets/proposal-default.svg';
import UsersIcon from '../assets/users-default.svg';
import MastersIcon from '../assets/masters-default.svg';
import CampaignIcon from '../assets/campaign-default.svg';
import ReportIcon from '../assets/report-default.svg';
import FinanceIcon from '../assets/finance-default.svg';
import GalleryIcon from '../assets/gallery-default.svg';
import LeadsIcon from '../assets/leadsIcon.svg';
import RoleBased from './RoleBased';
import { masterTypes, ROLES, serialize } from '../utils';
import { useFetchMastersTypes } from '../apis/queries/masters.queries';

const SidebarContent = ({ className }) => {
  const { pathname } = useLocation();
  const [toggleNestedTab, setToggleNestedTab] = useState(
    pathname.includes('masters') || pathname.includes('reports') || pathname.includes('repository'),
  );
  const { data, isSuccess: isMasterLoaded } = useFetchMastersTypes();

  const renderList = useMemo(() => {
    const queries = serialize({
      parentId: null,
      limit: 10,
      page: 1,
    });

    const tempList = [];
    if (data) {
      const values = Object.values(data);
      values.map(key => {
        tempList.push({
          label: masterTypes[key],
          type: key,
          subPath: `?type=${key}&${queries}`,
        });
        return tempList;
      });
    }

    return tempList;
  }, [data]);

  const sidebarMenuList = useMemo(
    () => [
      {
        label: 'Home',
        path: '/home',
        icon: HomeIcon,
        acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      },
      {
        label: 'Inventories',
        path: '/inventory',
        icon: InventoryIcon,
        acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      },
      {
        label: 'Bookings',
        path: '/bookings',
        icon: BookingIcon,
        acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      },
      {
        label: 'Proposals',
        path: '/proposals',
        icon: ProposalIcon,
        acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      },
      {
        label: 'Users',
        path: '/users',
        icon: UsersIcon,
        acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR],
      },
      {
        label: 'Masters',
        path: '/masters',
        nested: renderList || [],
        icon: MastersIcon,
        acceptedRoles: [ROLES.ADMIN],
      },
      {
        label: 'Campaigns',
        path: '/campaigns',
        icon: CampaignIcon,
        acceptedRoles: [ROLES.ADMIN],
      },
      {
        label: 'Reports',
        path: '/reports',
        nested: [
          { label: 'Campaign Reports', subPath: '/campaign' },
          { label: 'Revenue Reports', subPath: '/revenue' },
          { label: 'Inventory Reports', subPath: '/inventories' },
        ],
        icon: ReportIcon,
        acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR],
      },
      {
        label: 'Finances',
        path: '/finance',
        icon: FinanceIcon,
        acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR],
      },
      {
        label: 'Gallery',
        path: '/gallery',
        icon: GalleryIcon,
        acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      },
      
      {
        label: 'Leads',
        path: '/leads/leads-dashboard',
        icon: LeadsIcon,
        acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      },
      {
        label: 'Reports_new',
        path: '/newReports',
        icon: ReportIcon,
        acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      },
      // {
      //   label: 'Ranking_report',
      //   path: '/performanceReport',
      //   icon: ReportIcon,
      //   acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      // },
      // {
      //   label: 'Client_Details',
      //   path: '/tagsWiseReport',
      //   icon: ReportIcon,
      //   acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      // },
      // {
      //   label: 'mediawiseRepo',
      //   path: '/mediaWiseReport',
      //   icon: ReportIcon,
      //   acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      // },
      // {
      //   label: 'SampleRepo',
      //   path: '/sampleReport',
      //   icon: ReportIcon,
      //   acceptedRoles: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR, ROLES.ASSOCIATE],
      // },
    ],
    [isMasterLoaded],
  );

  return (
    <div className={classNames('flex flex-col items-start', className)}>
      {sidebarMenuList.map(item => (
        <RoleBased acceptedRoles={item.acceptedRoles} key={uuidv4()}>
          <div
            className={classNames(
              'w-full flex flex-col rounded-[4px]',
              pathname.includes(item.path) && 'bg-gradient-to-r from-orange-400 to-red-500',
            )}
          >
            <Box
              className={classNames(
                'flex items-center justify-between',
                pathname.includes(item.path) &&
                  item.nested &&
                  'bg-gradient-to-r from-orange-400 to-red-500 rounded-t-[4px]',
              )}
              onClick={() => setToggleNestedTab(!toggleNestedTab)}
            >
              <div className="pl-3 pr-1">
                <Image src={item.icon} height={24} width={24} fit="contain" />
              </div>
              <Link
                to={item.nested ? `${item.path}${item.nested[0]?.subPath}` : item.path}
                className={classNames('p-2 flex w-full h-[40px]')}
              >
                <span className="font-medium text-base text-white">{item.label}</span>
              </Link>
              {item?.nested ? <ChevronDown className="h-4 mr-5" color="white" /> : null}
            </Box>
            <NestedSidebarContent
              list={item.nested || []}
              path={item.path}
              toggleNestedTab={toggleNestedTab}
            />
          </div>
         </RoleBased>
      ))}
    </div>
  );
};

export default SidebarContent;
