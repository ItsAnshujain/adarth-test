import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Text } from '@mantine/core';
import classNames from 'classnames';
import { Plus, ChevronDown, Server, Grid } from 'react-feather';
import shallow from 'zustand/shallow';
import { useClickOutside } from '@mantine/hooks';
import calendar from '../../../assets/data-table.svg';
import DateRange from '../../DateRange';
import CampaignFilter from './Filter';
import useLayoutView from '../../../store/layout.store';
import RoleBased from '../../RoleBased';
import { ROLES } from '../../../utils';

const AreaHeader = ({ text }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const ref = useClickOutside(() => setShowDatePicker(false));
  const { activeLayout, setActiveLayout } = useLayoutView(
    state => ({
      activeLayout: state.activeLayout,
      setActiveLayout: state.setActiveLayout,
    }),
    shallow,
  );

  const handleListClick = () => setActiveLayout({ ...activeLayout, campaign: 'list' });
  const handleGridClick = () => setActiveLayout({ ...activeLayout, campaign: 'grid' });
  const toggleFilter = () => setShowFilter(!showFilter);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
      <Text weight="bold" size="md">
        {text}
      </Text>

      <div className="flex justify-around">
        <div className="mr-2 flex ">
          <Button
            className={classNames(
              'px-4 border-gray-300 border rounded-l-md rounded-r-none',
              activeLayout.campaign === 'grid' ? 'bg-white' : 'bg-purple-450',
            )}
            onClick={handleListClick}
          >
            <Server
              strokeWidth="3px"
              className={classNames(
                'max-h-5',
                activeLayout.campaign === 'grid' ? 'text-black' : 'text-white',
              )}
            />
          </Button>
          <Button
            className={classNames(
              'text-white border-gray-300 border px-4 rounded-r-md rounded-l-none',
              activeLayout.campaign === 'list' ? 'bg-white' : 'bg-purple-450',
            )}
            onClick={handleGridClick}
          >
            <Grid
              strokeWidth="3px"
              className={classNames(
                'max-h-5',
                activeLayout.campaign === 'list' ? 'text-black' : 'text-white',
              )}
            />
          </Button>
        </div>
        <div ref={ref} className="mr-2 relative">
          <Button onClick={toggleDatePicker} variant="default">
            <img src={calendar} className="h-5" alt="calendar" />
          </Button>
          {showDatePicker && (
            <div className="absolute z-20 -translate-x-1/2 bg-white -top-0.3">
              <DateRange handleClose={toggleDatePicker} dateKeys={['from', 'to']} />
            </div>
          )}
        </div>
        <div className="mr-2">
          <Button onClick={toggleFilter} variant="default" className="font-medium">
            <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
          </Button>
          {showFilter && <CampaignFilter isOpened={showFilter} onClose={toggleFilter} />}
        </div>
        <RoleBased acceptedRoles={[ROLES.ADMIN]}>
          <div>
            <Link
              to="/campaigns/create-campaign"
              className="bg-purple-450 flex items-center text-white rounded-md px-4 h-full font-medium"
            >
              <Plus size={16} className="mr-1" />
              <span className="text-sm">Add Campaign</span>
            </Link>
          </div>
        </RoleBased>
      </div>
    </div>
  );
};

export default AreaHeader;
