import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu, Radio } from '@mantine/core';
import { Plus, ChevronDown, DownloadCloud } from 'react-feather';
import { useClickOutside, useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import calendar from '../../../assets/data-table.svg';
import DateRange from '../../DateRange';
import Filter from './Filter';
import RoleBased from '../../RoleBased';
import { ROLES, downloadPdf } from '../../../utils';
import { useExportBookings } from '../../../apis/queries/booking.queries';
import useBookingStore from '../../../store/booking.store';

const AreaHeader = ({ text }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exportOpened, exportActions] = useDisclosure();
  const [showFilter, setShowFilter] = useState(false);
  const [exportType, setExportType] = useState('');
  const ref = useClickOutside(() => setShowDatePicker(false));

  const exportRef = useClickOutside(() => exportActions.close());

  const toggleFilter = () => setShowFilter(!showFilter);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const exportBookingsHandler = useExportBookings();

  const setBookingData = useBookingStore(state => state.setBookingData);

  const exportBookings = async () => {
    if (exportType) {
      const res = await exportBookingsHandler.mutateAsync({
        type: exportType,
        query: {
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      });
      downloadPdf(res.xlsxLink);
      showNotification({
        title: 'Download successful',
        color: 'green',
      });
      exportActions.close();
      setExportType('');
    } else {
      showNotification({
        title: 'Please select file type to download',
        color: 'red',
      });
    }
  };

  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
      <p className="text-lg font-bold">{text}</p>
      <div className="flex justify-around">
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
        <div className="mr-2" ref={exportRef}>
          <Menu closeOnItemClick={false} opened={exportOpened}>
            <Menu.Target>
              <Button variant="default" onClick={exportActions.toggle}>
                <ChevronDown size={16} className="mt-[1px] mr-1" />
                Outstanding Export
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={() => setExportType('Invoice')}>
                <Radio
                  value="Invoice"
                  label="Invoice"
                  classNames={{
                    label: 'text-base text-gray-700 cursor-pointer',
                    radio: 'cursor-pointer',
                    inner: 'mt-1',
                  }}
                  size="xs"
                  checked={exportType === 'Invoice'}
                />
              </Menu.Item>
              <Menu.Item onClick={() => setExportType('PurchaseOrder')}>
                <Radio
                  value="PurchaseOrder"
                  label="Purchase Order"
                  classNames={{
                    label: 'text-base text-gray-700 cursor-pointer',
                    radio: 'cursor-pointer',
                    inner: 'mt-1',
                  }}
                  size="xs"
                  checked={exportType === 'PurchaseOrder'}
                />
              </Menu.Item>
              <Menu.Item onClick={() => setExportType('ReleaseOrder')}>
                <Radio
                  value="ReleaseOrder"
                  label="Release Order"
                  classNames={{
                    label: 'text-base text-gray-700 cursor-pointer',
                    radio: 'cursor-pointer',
                    inner: 'mt-1',
                  }}
                  size="xs"
                  checked={exportType === 'ReleaseOrder'}
                />
              </Menu.Item>
              <Button
                variant="light"
                className="bg-purple-450 flex items-center text-white rounded-md px-4 h-full font-medium py-2 w-full mt-2"
                classNames={{ inner: 'w-full text-center' }}
                onClick={exportBookings}
                loading={exportBookingsHandler.isLoading}
              >
                <DownloadCloud size={16} className="mt-[1px] mr-2" />
                Download
              </Button>
            </Menu.Dropdown>
          </Menu>
        </div>
        <div className="mr-2">
          <Button onClick={toggleFilter} variant="default">
            <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
          </Button>
          {showFilter && <Filter isOpened={showFilter} setShowFilter={setShowFilter} />}
        </div>
        <RoleBased acceptedRoles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MANAGEMENT]}>
          <div>
            <Link
              to="/bookings/create-order"
              className="bg-purple-450 flex items-center text-white rounded-md px-4 h-full font-medium"
              onClick={() => setBookingData([])}
            >
              <Plus size={16} className="mr-1" />
              <span className="text-sm">Create Order</span>
            </Link>
          </div>
        </RoleBased>
      </div>
    </div>
  );
};

export default AreaHeader;
