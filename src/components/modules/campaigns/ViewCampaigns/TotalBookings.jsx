import { useEffect, useMemo, useState } from 'react';
import { Text, Button } from '@mantine/core';
import { useClickOutside, useDebouncedValue } from '@mantine/hooks';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import classNames from 'classnames';
import RowsPerPage from '../../../RowsPerPage';
import Search from '../../../Search';
import calendar from '../../../../assets/data-table.svg';
import DateRange from '../../../DateRange';
import Table from '../../../Table/Table';
import { useBookings } from '../../../../apis/queries/booking.queries';
import { useFetchMasters } from '../../../../apis/queries/masters.queries';
import { generateSlNo, serialize } from '../../../../utils';
import toIndianCurrency from '../../../../utils/currencyFormat';
import BookingsMenuPopover from '../../../Popovers/BookingsMenuPopover';
import NoData from '../../../shared/NoData';

const DATE_FORMAT = 'DD MMM YYYY';

const TotalBookings = ({ campaignId }) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: 10,
    sortBy: 'campaign.name',
    sortOrder: 'desc',
    campaignId,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const ref = useClickOutside(() => setShowDatePicker(false));
  const toggleDatePicker = () => setShowDatePicker(prevState => !prevState);

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const { data: bookingData, isLoading: isLoadingBookingData } = useBookings(
    searchParams.toString(),
    !!campaignId,
  );
  const { data: campaignStatus } = useFetchMasters(
    serialize({ type: 'campaign_status', parentId: null, page: 1, limit: 100 }),
  );
  const { data: paymentStatus } = useFetchMasters(
    serialize({ type: 'payment_status', parentId: null, page: 1, limit: 100 }),
  );

  const column = useMemo(
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
        }) => useMemo(() => <p className="uppercase">{paymentType}</p>, []),
      },
      {
        Header: 'SCHEDULE',
        accessor: 'schedule',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { campaign },
          },
        }) =>
          useMemo(
            () => (
              <div className="flex items-center w-max">
                <p className="font-medium bg-gray-450 px-2 rounded-sm min-w-[120px] text-center">
                  {campaign?.startDate ? (
                    dayjs(campaign?.startDate).format(DATE_FORMAT)
                  ) : (
                    <NoData type="na" />
                  )}
                </p>
                <span className="px-2">&gt;</span>
                <p className="font-medium bg-gray-450 px-2 rounded-sm min-w-[120px] text-center">
                  {campaign?.endDate ? (
                    dayjs(campaign?.endDate).format(DATE_FORMAT)
                  ) : (
                    <NoData type="na" />
                  )}
                </p>
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'PRICING',
        accessor: 'campaign.totalPrice',
        Cell: ({
          row: {
            original: { campaign },
          },
        }) => useMemo(() => toIndianCurrency(campaign?.totalPrice || 0), []),
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
    [bookingData?.docs, campaignStatus, paymentStatus],
  );

  const handleSortByColumn = colId => {
    if (searchParams.get('sortBy') === colId && searchParams.get('sortOrder') === 'desc') {
      searchParams.set('sortOrder', 'asc');
      setSearchParams(searchParams);
      return;
    }
    if (searchParams.get('sortBy') === colId && searchParams.get('sortOrder') === 'asc') {
      searchParams.set('sortOrder', 'desc');
      setSearchParams(searchParams);
      return;
    }

    searchParams.set('sortBy', colId);
    setSearchParams(searchParams);
  };

  const handleSearch = () => {
    searchParams.set('search', debouncedSearch);
    searchParams.set('page', debouncedSearch === '' ? page : 1);
    setSearchParams(searchParams);
  };

  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);

    setSearchParams(searchParams);
  };

  useEffect(() => {
    handleSearch();
    if (debouncedSearch === '') {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    searchParams.set('sortBy', 'createdAt');
    setSearchParams(searchParams);
  }, []);

  return (
    <>
      <div className="mt-5 flex justify-between">
        <Text>Booking History of the campaign</Text>
        <div className="flex">
          <div ref={ref} className="mr-2 relative">
            <Button onClick={toggleDatePicker} variant="default">
              <img src={calendar} className="h-5" alt="calendar" />
            </Button>
            {showDatePicker && (
              <div className="absolute z-20 -translate-x-[90%] bg-white -top-0.3">
                <DateRange handleClose={toggleDatePicker} dateKeys={['from', 'to']} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between h-20 items-center">
          <RowsPerPage
            setCount={currentLimit => handlePagination('limit', currentLimit)}
            count={limit}
          />
          <Search search={searchInput} setSearch={setSearchInput} />
        </div>

        <Table
          data={bookingData?.docs || []}
          COLUMNS={column}
          activePage={bookingData?.page || 1}
          totalPages={bookingData?.totalPages || 1}
          setActivePage={currentPage => handlePagination('page', currentPage)}
          rowCountLimit={limit}
          handleSorting={handleSortByColumn}
          loading={isLoadingBookingData}
        />
      </div>
    </>
  );
};

export default TotalBookings;
