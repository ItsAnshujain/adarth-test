import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'react-feather';
import { ActionIcon, Group, Select, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { Link, useSearchParams } from 'react-router-dom';
import { IconEye } from '@tabler/icons';
import { checkCampaignStats, generateSlNo, serialize } from '../../../../utils';
import { useUpdateBooking, useUpdateBookingStatus } from '../../../../apis/queries/booking.queries';
import { useFetchMasters } from '../../../../apis/queries/masters.queries';
import toIndianCurrency from '../../../../utils/currencyFormat';
import Table from '../../../Table/Table';
import RowsPerPage from '../../../RowsPerPage';
import Search from '../../../Search';
import NoData from '../../../shared/NoData';
import BookingsMenuPopover from '../../../Popovers/BookingsMenuPopover';
import { BOOKING_PAID_STATUS } from '../../../../utils/constants';
import DateAndFilterHeader from './DateAndFilterHeader';
import PriceBreakdownDrawer from '../../bookings/ViewOrders/PriceBreakdownDrawer';

const statusSelectStyle = {
  rightSection: { pointerEvents: 'none' },
};

const sortOrders = order => {
  switch (order) {
    case 'asc':
      return 'desc';
    case 'desc':
      return 'asc';

    default:
      return 'asc';
  }
};

const DATE_FORMAT = 'DD MMM YYYY';

const SalesViewTable = ({ data: bookingData, isLoading, activeChildTab }) => {
  const [selectedBookingData, setSelectedBookingData] = useState([]);
  const [drawerOpened, drawerActions] = useDisclosure();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);

  const { data: campaignStatus } = useFetchMasters(
    serialize({
      type: 'booking_campaign_status',
      parentId: null,
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'desc',
    }),
  );
  const { data: paymentStatus } = useFetchMasters(
    serialize({
      type: 'payment_status',
      parentId: null,
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'desc',
    }),
  );
  const { mutate: update } = useUpdateBooking();
  const { mutateAsync: updateBookingStatus } = useUpdateBookingStatus();

  const { limit, page } = useMemo(
    () => ({
      limit: searchParams.get('limit'),
      page: Number(searchParams.get('page')),
    }),
    [searchParams],
  );

  const handlePaymentUpdate = (bookingId, data) => {
    if (data) {
      updateBookingStatus({ id: bookingId, query: serialize({ paymentStatus: data }) });
    }
  };

  const handleCampaignUpdate = (bookingId, data) => {
    if (data) {
      updateBookingStatus({ id: bookingId, query: serialize({ campaignStatus: data }) });
    }
  };

  const handlePaymentStatusUpdate = (bookingId, data) => {
    if (data !== '') {
      update({ id: bookingId, data: { hasPaid: data } });
    }
  };

  const paymentList = useMemo(
    () =>
      paymentStatus?.docs?.map(item => ({
        label:
          item.name?.toLowerCase() === 'unpaid'
            ? 'No'
            : item.name?.toLowerCase() === 'paid'
            ? 'Yes'
            : item.name,
        value: item.name,
      })) || [],
    [paymentStatus],
  );
  const campaignList = useMemo(
    () => campaignStatus?.docs?.map(item => ({ label: item.name, value: item.name })) || [],
    [campaignStatus],
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
        Header: 'CAMPAIGN NAME',
        accessor: 'campaign.name',
        Cell: ({
          row: {
            original: { campaign, _id },
          },
        }) =>
          useMemo(
            () => (
              <Link to={`/bookings/view-details/${_id}`} className="font-medium underline">
                <Text
                  className="overflow-hidden text-ellipsis max-w-[180px] text-purple-450"
                  lineClamp={1}
                >
                  {campaign?.name || '-'}
                </Text>
              </Link>
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
        Header: 'CLIENT',
        accessor: 'client.name',
        Cell: ({
          row: {
            original: { client },
          },
        }) => useMemo(() => <p>{client?.name}</p>, []),
      },
      {
        Header: 'ORDER DATE',
        accessor: 'createdAt',
        Cell: ({ row: { original } }) =>
          useMemo(
            () => (
              <p className="font-medium bg-gray-450 px-2 rounded-sm min-w-[120px] text-center">
                {dayjs(original.createdAt).format(DATE_FORMAT)}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'BOOKING TYPE',
        accessor: 'type',
        Cell: ({
          row: {
            original: { type },
          },
        }) => useMemo(() => <p className="capitalize">{type}</p>, []),
      },
      {
        Header: 'SALES INCHARGE',
        accessor: 'salesPerson',
        Cell: info => useMemo(() => <p>{info.row.original.salesPerson?.name || '-'}</p>, []),
      },
      {
        Header: 'PAYMENT STATUS',
        accessor: 'hasPaid',
        Cell: info =>
          useMemo(() => {
            const updatedBookingPaid = [...BOOKING_PAID_STATUS];
            updatedBookingPaid.unshift({ label: 'Select', value: '' });

            return (
              <Select
                className="mr-2"
                data={updatedBookingPaid}
                styles={statusSelectStyle}
                rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
                rightSectionWidth={40}
                onChange={e => handlePaymentStatusUpdate(info.row.original?._id, e)}
                defaultValue={info.row.original?.hasPaid ?? ''}
              />
            );
          }, []),
      },
      {
        Header: 'OUTSTANDING AMOUNT',
        accessor: 'outstandingAmount',
        disableSortBy: true,
        Cell: info =>
          useMemo(
            () => (
              <p>
                {info.row.original.unpaidAmount
                  ? toIndianCurrency(info.row.original.unpaidAmount)
                  : '-'}
              </p>
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
        }) =>
          useMemo(
            () => (
              <div className="flex items-center justify-between max-w-min">
                {toIndianCurrency(campaign?.totalPrice || 0)}
                <ActionIcon
                  onClick={() => {
                    setSelectedBookingData(campaign?.spaces);
                    drawerActions.open();
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
        Header: 'TOTAL SPACES',
        accessor: 'totalSpaces',
      },
      {
        Header: 'CAMPAIGN STATUS',
        accessor: 'currentStatus.campaignStatus',
        Cell: ({
          row: {
            original: { _id, currentStatus },
          },
        }) =>
          useMemo(() => {
            const updatedCampaignList = [...campaignList];
            if (!currentStatus?.campaignStatus) {
              updatedCampaignList.unshift({ label: 'Select', value: '' });
            }

            const filteredList = updatedCampaignList.map(item => ({
              ...item,
              disabled: checkCampaignStats(currentStatus, item.value),
            }));

            return (
              <Select
                className="mr-2"
                data={filteredList}
                disabled={
                  currentStatus?.mountingStatus?.toLowerCase() !== 'completed' ||
                  currentStatus?.campaignStatus?.toLowerCase() === 'completed'
                }
                styles={statusSelectStyle}
                rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
                rightSectionWidth={40}
                onChange={e => handleCampaignUpdate(_id, e)}
                defaultValue={currentStatus?.campaignStatus || ''}
              />
            );
          }, []),
      },
      {
        Header: 'BOOKING CONFIRMATION STATUS',
        accessor: 'currentStatus.paymentStatus',
        Cell: ({
          row: {
            original: { _id, currentStatus, paymentStatus: p = {} },
          },
        }) =>
          useMemo(() => {
            const updatedPaymentList = [...paymentList];
            if (!currentStatus?.paymentStatus) {
              updatedPaymentList.unshift({ label: 'Select', value: '' });
            }

            const filteredList = updatedPaymentList.map(item => ({
              ...item,
              disabled: Object.keys(p).includes(item.value),
            }));

            return (
              <Select
                className="mr-2"
                data={filteredList}
                styles={statusSelectStyle}
                disabled={currentStatus?.paymentStatus?.toLowerCase() === 'paid'}
                rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
                rightSectionWidth={40}
                onChange={e => handlePaymentUpdate(_id, e)}
                defaultValue={currentStatus?.paymentStatus || ''}
              />
            );
          }, []),
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
              <p className="w-[200px]">
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
              <p className="w-[200px]">
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
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { _id },
          },
        }) => useMemo(() => <BookingsMenuPopover itemId={_id} />, []),
      },
    ],
    [bookingData?.docs, campaignStatus, paymentStatus],
  );

  const handleSortByColumn = colId => {
    searchParams.set('sortBy', colId);
    searchParams.set(
      'sortOrder',
      searchParams.get('sortBy') === colId ? sortOrders(searchParams.get('sortOrder')) : 'asc',
    );
    setSearchParams(searchParams);
  };

  const handleSearch = () => {
    searchParams.set('search', debouncedSearch);
    searchParams.set('page', 1);
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

  return (
    <div>
      <div className="flex justify-between h-20 items-center px-4">
        <RowsPerPage
          setCount={currentLimit => handlePagination('limit', currentLimit)}
          count={bookingData.limit?.toString()}
        />
        <Group>
          <Search search={searchInput} setSearch={setSearchInput} />
          <DateAndFilterHeader activeChildTab={activeChildTab} />
        </Group>
      </div>

      <Table
        data={bookingData?.docs || []}
        COLUMNS={column}
        activePage={bookingData?.page || 1}
        totalPages={bookingData?.totalPages || 1}
        setActivePage={currentPage => handlePagination('page', currentPage)}
        rowCountLimit={bookingData?.limit || 10}
        handleSorting={handleSortByColumn}
        loading={isLoading}
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

export default SalesViewTable;
