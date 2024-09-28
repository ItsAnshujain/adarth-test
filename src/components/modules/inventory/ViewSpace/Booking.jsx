import { useState, useMemo, useEffect } from 'react';
import { Text, Button, Image, ActionIcon } from '@mantine/core';
import { ChevronDown } from 'react-feather';
import { Link, useSearchParams } from 'react-router-dom';
import { useClickOutside, useDebouncedValue, useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { IconEye } from '@tabler/icons';
import DateRange from '../../../DateRange';
import Filter from '../../bookings/Filter';
import calendar from '../../../../assets/data-table.svg';
import Table from '../../../Table/Table';
import toIndianCurrency from '../../../../utils/currencyFormat';
import RowsPerPage from '../../../RowsPerPage';
import Search from '../../../Search';
import { useFetchBookingsByInventoryId } from '../../../../apis/queries/inventory.queries';
import NoData from '../../../shared/NoData';
import BookingsMenuPopover from '../../../Popovers/BookingsMenuPopover';
import { generateSlNo } from '../../../../utils';
import PriceBreakdownDrawer from '../../bookings/ViewOrders/PriceBreakdownDrawer';

const DATE_FORMAT = 'DD MMM YYYY';

const Booking = ({ inventoryId }) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedBookingData, setSelectedBookingData] = useState([]);
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const ref = useClickOutside(() => setShowDatePicker(false));
  const [drawerOpened, drawerActions] = useDisclosure();

  const [searchParams, setSearchParams] = useSearchParams({
    'page': 1,
    'limit': 10,
    'sortBy': 'createdAt',
    'sortOrder': 'desc',
  });

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const { data: bookingData, isLoading: isLoadingBookingData } = useFetchBookingsByInventoryId({
    inventoryId,
    query: searchParams.toString(),
  });

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const toggleFilter = () => setShowFilter(!showFilter);

  const COLUMNS = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, page, limit)}</p>, []),
      },
      {
        Header: 'CLIENT',
        accessor: 'client.name',
        Cell: ({
          row: {
            original: { client },
          },
        }) =>
          useMemo(
            () => (
              <Text className="overflow-hidden text-ellipsis max-w-[180px]" lineClamp={1}>
                {client?.name}
              </Text>
            ),
            [],
          ),
      },
      {
        Header: 'BOOKING ID',
        accessor: 'bookingId',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{info.row.original.bookingId || '-'}</p>, []),
      },
      {
        Header: 'CAMPAIGN NAME',
        accessor: 'campaign.name',
        Cell: ({
          row: {
            original: { campaignName, _id },
          },
        }) =>
          useMemo(
            () => (
              <Link to={`/bookings/view-details/${_id}`} className="text-black font-medium">
                <Text className="overflow-hidden text-ellipsis max-w-[180px]" lineClamp={1}>
                  {campaignName || '-'}
                </Text>
              </Link>
            ),
            [],
          ),
      },
      {
        Header: 'CAMPAIGN INCHARGE',
        accessor: 'incharge.name',
        Cell: ({
          row: {
            original: { incharge },
          },
        }) => useMemo(() => <p>{incharge?.name || '-'}</p>, []),
      },
      {
        Header: 'SALES PERSON',
        accessor: 'salesPerson',
        Cell: info => useMemo(() => <p>{info.row.original.salesPerson?.name || '-'}</p>, []),
      },
      {
        Header: 'PRINTING STATUS',
        accessor: 'currentStatus.printingStatus',
        Cell: ({
          row: {
            original: { currentStatus },
          },
        }) =>
          useMemo(
            () => (
              <p
                className={classNames(
                  currentStatus?.printingStatus?.toLowerCase()?.includes('upcoming')
                    ? 'text-blue-600'
                    : currentStatus?.printingStatus?.toLowerCase()?.includes('in progress')
                    ? 'text-purple-450'
                    : currentStatus?.printingStatus?.toLowerCase()?.includes('completed')
                    ? 'text-green-400'
                    : '-',
                  'w-[200px]',
                )}
              >
                {currentStatus?.printingStatus?.toLowerCase()?.includes('upcoming')
                  ? 'Upcoming'
                  : currentStatus?.printingStatus?.toLowerCase()?.includes('in progress')
                  ? 'In progress'
                  : currentStatus?.printingStatus?.toLowerCase()?.includes('completed')
                  ? 'Completed'
                  : 'Upcoming'}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'MOUNTING STATUS',
        accessor: 'currentStatus.mountingStatus',
        Cell: ({
          row: {
            original: { currentStatus },
          },
        }) =>
          useMemo(
            () => (
              <p
                className={classNames(
                  currentStatus?.mountingStatus?.toLowerCase()?.includes('upcoming')
                    ? 'text-blue-600'
                    : currentStatus?.mountingStatus?.toLowerCase()?.includes('in progress')
                    ? 'text-purple-450'
                    : currentStatus?.mountingStatus?.toLowerCase()?.includes('completed')
                    ? 'text-green-400'
                    : '-',
                  'w-[200px]',
                )}
              >
                {currentStatus?.mountingStatus?.toLowerCase()?.includes('upcoming')
                  ? 'Upcoming'
                  : currentStatus?.mountingStatus?.toLowerCase()?.includes('in progress')
                  ? 'In progress'
                  : currentStatus?.mountingStatus?.toLowerCase()?.includes('completed')
                  ? 'Completed'
                  : 'Upcoming'}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'BOOKING CONFIRMATION STATUS',
        accessor: 'currentStatus.paymentStatus',
        Cell: ({
          row: {
            original: { currentStatus },
          },
        }) =>
          useMemo(
            () => (
              <p
                className={classNames(
                  currentStatus?.paymentStatus?.toLowerCase() === 'paid'
                    ? 'text-green-400'
                    : currentStatus?.paymentStatus?.toLowerCase() === 'unpaid'
                    ? 'text-yellow-500'
                    : '',
                  'font-medium',
                )}
              >
                {currentStatus?.paymentStatus?.toLowerCase() === 'unpaid'
                  ? 'No'
                  : currentStatus?.paymentStatus?.toLowerCase() === 'paid'
                  ? 'Yes'
                  : currentStatus?.paymentStatus || '-'}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'PAYMENT STATUS',
        accessor: 'paymentType',
        Cell: ({
          row: {
            original: { paymentType },
          },
        }) => useMemo(() => <p className="uppercase">{paymentType || '-'}</p>, []),
      },
      {
        Header: 'SCHEDULE',
        accessor: 'schedule',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { startDate, endDate },
          },
        }) =>
          useMemo(
            () => (
              <div className="flex items-center w-max">
                <p className="font-medium bg-gray-450 px-2 rounded-sm min-w-[120px] text-center">
                  {startDate ? dayjs(startDate).format(DATE_FORMAT) : <NoData type="na" />}
                </p>
                <span className="px-2">&gt;</span>
                <p className="font-medium bg-gray-450 px-2 rounded-sm min-w-[120px] text-center">
                  {endDate ? dayjs(endDate).format(DATE_FORMAT) : <NoData type="na" />}
                </p>
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'UNIT',
        accessor: 'unit',
        Cell: info => useMemo(() => <p>{info.row.original.unit || '-'}</p>, []),
      },
      {
        Header: 'PRICING',
        accessor: 'totalPrice',
        Cell: ({
          row: {
            original: { totalPrice, currentInventory },
          },
        }) =>
          useMemo(
            () => (
              <div className="flex items-center justify-between max-w-min">
                {toIndianCurrency(totalPrice || 0)}
                <ActionIcon
                  onClick={() => {
                    drawerActions.open();
                    setSelectedBookingData([currentInventory]);
                  }}
                >
                  <IconEye color="black" size={20} />
                </ActionIcon>
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { _id },
          },
        }) => useMemo(() => <BookingsMenuPopover itemId={_id} enableDelete={false} />, []),
      },
    ],
    [bookingData?.docs],
  );

  const handleSearch = () => {
    searchParams.set('search', debouncedSearch);
    searchParams.set('page', debouncedSearch === '' ? page : 1);
    setSearchParams(searchParams, { replace: true });
  };

  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);
    setSearchParams(searchParams, { replace: true });
  };

  const handleSortByColumn = colId => {
    if (searchParams.get('sortBy') === colId && searchParams.get('sortOrder') === 'desc') {
      searchParams.set('sortOrder', 'asc');
      setSearchParams(searchParams, { replace: true });
      return;
    }
    if (searchParams.get('sortBy') === colId && searchParams.get('sortOrder') === 'asc') {
      searchParams.set('sortOrder', 'desc');
      setSearchParams(searchParams, { replace: true });
      return;
    }

    searchParams.set('sortBy', colId);
    setSearchParams(searchParams, { replace: true });
  };

  useEffect(() => {
    handleSearch();
    if (debouncedSearch === '') {
      searchParams.delete('search');
      setSearchParams(searchParams, { replace: true });
    }
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between py-4">
        <div>
          <Text weight="bold">List of bookings / Order</Text>
        </div>
        <div className="flex">
          <div ref={ref} className="mr-2 relative">
            <Button onClick={toggleDatePicker} variant="default">
              <Image src={calendar} className="h-5" alt="calendar" />
            </Button>
            {showDatePicker && (
              <div className="absolute z-20 -translate-x-3/4 bg-white -top-0.3">
                <DateRange handleClose={toggleDatePicker} dateKeys={['from', 'to']} />
              </div>
            )}
          </div>
          <div className="mr-2">
            <Button onClick={toggleFilter} variant="default">
              <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
            </Button>
            {showFilter && (
              <Filter
                isOpened={showFilter}
                setShowFilter={setShowFilter}
                showBookingTypeOption={false}
                showCampaignStatusOption={false}
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between h-20 items-center">
        <RowsPerPage
          setCount={currentLimit => handlePagination('limit', currentLimit)}
          count={limit}
        />
        <Search search={searchInput} setSearch={setSearchInput} />
      </div>

      <Table
        data={bookingData?.docs || []}
        COLUMNS={COLUMNS}
        activePage={bookingData?.page || 1}
        totalPages={bookingData?.totalPages || 1}
        setActivePage={currentPage => handlePagination('page', currentPage)}
        rowCountLimit={limit}
        handleSorting={handleSortByColumn}
        loading={isLoadingBookingData}
      />
      <PriceBreakdownDrawer
        isOpened={drawerOpened}
        onClose={drawerActions.close}
        spaces={selectedBookingData}
        type="booking"
      />
    </div>
  );
};

export default Booking;
