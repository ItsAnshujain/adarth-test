import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Text, Button, Checkbox, Image } from '@mantine/core';
import classNames from 'classnames';
import { Plus, ChevronDown, Server, Grid, MapPin } from 'react-feather';
import { useClickOutside } from '@mantine/hooks';
import shallow from 'zustand/shallow';
import Filter from './Filter';
import useLayoutView from '../../../store/layout.store';
import RoleBased from '../../RoleBased';
import { ROLES } from '../../../utils';
import calendar from '../../../assets/data-table.svg';
import DateRange from '../../DateRange';
import { useFormContext } from '../../../context/formContext';

const AreaHeader = ({ text, inventoryData }) => {
  const { pathname } = useLocation();
  const [addDetailsClicked, setAddDetails] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const addDetailsButtonRef = useClickOutside(() => setAddDetails(false));
  const { values, setFieldValue } = useFormContext();
  const { activeLayout, setActiveLayout } = useLayoutView(
    state => ({
      activeLayout: state.activeLayout,
      setActiveLayout: state.setActiveLayout,
    }),
    shallow,
  );

  const ref = useClickOutside(() => setShowDatePicker(false));
  const toggleFilter = () => setShowFilter(!showFilter);
  const toggleAddDetails = () => setAddDetails(!addDetailsClicked);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const handleListClick = () => setActiveLayout({ ...activeLayout, inventory: 'list' });
  const handleGridClick = () => setActiveLayout({ ...activeLayout, inventory: 'grid' });
  const handleMapClick = () => setActiveLayout({ ...activeLayout, inventory: 'map' });

  const selectedAll = useMemo(
    () =>
      inventoryData?.docs?.length &&
      inventoryData.docs.every(
        item => values?.spaces?.find(element => element._id === item._id) || false,
      ),
    [inventoryData?.docs, values?.spaces],
  );

  const handleSelectedCards = isCheckedSelected => {
    if (inventoryData?.docs.length && isCheckedSelected) {
      const tempSpaces = [...values.spaces];
      const res = inventoryData.docs.filter(
        item => !tempSpaces.find(element => element._id === item._id),
      );
      tempSpaces.push(...res);
      setFieldValue('spaces', tempSpaces);
    } else {
      setFieldValue('spaces', []);
    }
  };

  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
      <Text size="lg" weight="bold">
        {!pathname.includes('reports') ? text : 'Inventory Report'}
      </Text>
      <div className="flex justify-around">
        <div className="mr-2 flex ">
          {activeLayout.inventory === 'grid' ? (
            <Checkbox
              className="mr-5"
              onChange={event => handleSelectedCards(event.target.checked)}
              label="Select All Product"
              classNames={{ root: 'flex flex-row-reverse', label: 'pr-2' }}
              defaultChecked={selectedAll}
            />
          ) : null}
          <Button
            className={classNames(
              'px-4 border-gray-300 border rounded-l-md rounded-r-none',
              activeLayout.inventory === 'list' ? 'bg-purple-450' : 'bg-white',
            )}
            onClick={handleListClick}
          >
            <Server
              strokeWidth="3px"
              className={classNames(
                activeLayout.inventory === 'list' ? 'text-white' : 'text-black',
                'max-h-5',
              )}
            />
          </Button>
          <Button
            className={classNames(
              `text-white border-gray-300 border px-4 rounded-none ${
                activeLayout.inventory === 'grid' ? 'bg-purple-450' : 'bg-white'
              }`,
            )}
            onClick={handleGridClick}
          >
            <Grid
              strokeWidth="3px"
              className={classNames(
                activeLayout.inventory === 'grid' ? 'text-white' : 'text-black',
                'max-h-5',
              )}
            />
          </Button>
          <Button
            className={classNames(
              `px-4 border-gray-300 border rounded-r-md rounded-l-none ${
                activeLayout.inventory === 'map' ? 'bg-purple-450' : 'bg-white'
              }`,
            )}
            onClick={handleMapClick}
          >
            <MapPin
              strokeWidth="3px"
              className={classNames(
                activeLayout.inventory === 'map' ? 'text-white' : 'text-black',
                'max-h-5',
              )}
            />
          </Button>
        </div>

        <div ref={ref} className="relative mr-2">
          <Button onClick={toggleDatePicker} variant="default">
            <Image src={calendar} className="h-5" alt="calendar" />
          </Button>
          {showDatePicker && (
            <div className="absolute z-20 -translate-x-[450px] bg-white -top-0.3">
              <DateRange
                handleClose={toggleDatePicker}
                dateKeys={['from', 'to']}
                rangeCalendarMinDate={new Date()}
                datePickerMinDate={new Date()}
              />
            </div>
          )}
        </div>

        <div className="mr-2">
          <Button onClick={toggleFilter} variant="default" className="font-medium">
            <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
          </Button>
          {showFilter && <Filter isOpened={showFilter} setShowFilter={setShowFilter} />}
        </div>
        <div className="relative">
          <RoleBased
            acceptedRoles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MANAGEMENT, ROLES.ASSOCIATE]}
          >
            <Button
              onClick={toggleAddDetails}
              className="bg-purple-450 flex align-center py-2 text-white rounded-md px-4 text-sm"
            >
              <Plus size={16} className="mt-[1px] mr-1" /> Add Space
            </Button>
          </RoleBased>
          {addDetailsClicked && (
            <div
              ref={addDetailsButtonRef}
              className="absolute text-sm z-20 bg-white shadow-lg p-4 right-7 w-36"
            >
              <Link to="create-space/single">
                <div className="mb-2 cursor-pointer">Single Entry</div>
              </Link>
              <Link to="create-space/bulk">
                <div className="cursor-pointer">Bulk/CSV Upload</div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AreaHeader;
