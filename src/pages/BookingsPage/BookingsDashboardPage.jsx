import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'react-feather';
import { Button, Select, Text, ActionIcon } from '@mantine/core';
import dayjs from 'dayjs';
import classNames from 'classnames';
import multiDownload from 'multi-download';
import shallow from 'zustand/shallow';
import { IconEye } from '@tabler/icons';
import Table from '../../components/Table/Table';
import RowsPerPage from '../../components/RowsPerPage';
import Search from '../../components/Search';
import AreaHeader from '../../components/modules/bookings/Header';
import {
  useBookings,
  useUpdateBooking,
  useUpdateBookingStatus,
} from '../../apis/queries/booking.queries';
import {
  checkCampaignStats,
  financialEndDate,
  financialStartDate,
  generateSlNo,
  serialize,
} from '../../utils';
import { useFetchMasters } from '../../apis/queries/masters.queries';
import toIndianCurrency from '../../utils/currencyFormat';
import BookingStatisticsView from '../../components/modules/bookings/BookingStatisticsView';
import NoData from '../../components/shared/NoData';
import BookingsMenuPopover from '../../components/Popovers/BookingsMenuPopover';
import useLayoutView from '../../store/layout.store';
import { BOOKING_PAID_STATUS } from '../../utils/constants';
import PriceBreakdownDrawer from '../../components/modules/bookings/ViewOrders/PriceBreakdownDrawer';
import { useLeadAgencyStats } from '../../apis/queries/leads.queries';

const statusSelectStyle = {
  rightSection: { pointerEvents: 'none' },
};

const DATE_FORMAT = 'DD MMM YYYY';

const BookingsDashboardPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedBookingData, setSelectedBookingData] = useState([]);
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [drawerOpened, drawerActions] = useDisclosure();
  const { activeLayout, setActiveLayout } = useLayoutView(
    state => ({
      activeLayout: state.activeLayout,
      setActiveLayout: state.setActiveLayout,
    }),
    shallow,
  );
  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: activeLayout.bookingLimit || 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const { data: bookingData, isLoading: isLoadingBookingData } = useBookings(
    searchParams.toString(),
  );
  const { data: leadStats, isLoading: isLeadStatsLoading } = useLeadAgencyStats(
    serialize({
      from: financialStartDate,
      to: financialEndDate,
    }),
  );
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
              <Link to={`/bookings/view-details/${_id}`} className="text-purple-450 font-medium">
                <Text
                  className="overflow-hidden text-ellipsis max-w-[180px] underline"
                  lineClamp={1}
                  title={campaign?.name}
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
                classNames={{ rightSection: 'pointer-events-none' }}
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
        Header: 'CAMPAIGN INCHARGE',
        accessor: 'campaign.incharge.name',
        Cell: ({
          row: {
            original: { campaign },
          },
        }) => useMemo(() => <p>{campaign?.incharge?.name || '-'}</p>, []),
      },
      {
        Header: 'SALES PERSON',
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
            original: { campaign }
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
            []
          ),
      },
      {
        Header: 'OUTSTANDING PO',
        accessor: 'outStandingPurchaseOrder',
        Cell: ({
          row: {
            original: { outStandingPurchaseOrder },
          },
        }) => useMemo(() => toIndianCurrency(outStandingPurchaseOrder || 0), []),
      },
      {
        Header: 'OUTSTANDING RO',
        accessor: 'outStandingReleaseOrder',
        Cell: ({
          row: {
            original: { outStandingReleaseOrder },
          },
        }) => useMemo(() => toIndianCurrency(outStandingReleaseOrder || 0), []),
      },
      {
        Header: 'OUTSTANDING INVOICE',
        accessor: 'outStandingInvoice',
        Cell: ({
          row: {
            original: { outStandingInvoice },
          },
        }) => useMemo(() => toIndianCurrency(outStandingInvoice || 0), []),
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
        Header: 'DOWNLOAD ARTWORK',
        accessor: '',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { campaign },
          },
        }) =>
          useMemo(
            () => (
              <Button
                className={classNames(
                  campaign?.medias?.length
                    ? 'text-purple-450 cursor-pointer'
                    : 'pointer-events-none text-gray-450 bg-white',
                  'font-medium  text-base',
                )}
                disabled={!campaign?.medias?.length}
                onClick={() => multiDownload(campaign?.medias)}
              >
                Download
              </Button>
            ),
            [],
          ),
      },
      {
        Header: 'TOTAL SPACES',
        accessor: 'totalSpaces',
      },
      {
        Header: 'PURCHASE ORDER',
        accessor: 'purchaseOrder',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { purchaseOrder },
          },
        }) =>
          useMemo(
            () => (
              <a
                href={purchaseOrder}
                className={classNames(
                  purchaseOrder
                    ? 'text-purple-450 cursor-pointer'
                    : 'pointer-events-none text-gray-450',
                  'font-medium',
                )}
                target="_blank"
                download
                rel="noopener noreferrer"
              >
                Download
              </a>
            ),
            [],
          ),
      },
      {
        Header: 'RELEASE ORDER',
        accessor: 'releaseOrder',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { releaseOrder },
          },
        }) =>
          useMemo(
            () => (
              <a
                href={releaseOrder}
                className={classNames(
                  releaseOrder
                    ? 'text-purple-450 cursor-pointer'
                    : 'pointer-events-none text-gray-450',
                  'font-medium',
                )}
                target="_blank"
                download
                rel="noopener noreferrer"
              >
                Download
              </a>
            ),
            [],
          ),
      },
      {
        Header: 'INVOICE',
        accessor: 'invoice',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { invoice },
          },
        }) =>
          useMemo(
            () => (
              <a
                href={invoice}
                className={classNames(
                  invoice ? 'text-purple-450 cursor-pointer' : 'pointer-events-none text-gray-450',
                  'font-medium',
                )}
                target="_blank"
                download
                rel="noopener noreferrer"
              >
                Download
              </a>
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

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-5">
      <AreaHeader text="Order" />
      <BookingStatisticsView LeadStats={leadStats} isLoading={isLeadStatsLoading} />
      <div className="flex justify-between h-20 items-center">
        <RowsPerPage
          setCount={currentLimit => {
            handlePagination('limit', currentLimit);
            setActiveLayout({ ...activeLayout, bookingLimit: currentLimit });
          }}
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
      <PriceBreakdownDrawer
        isOpened={drawerOpened}
        onClose={drawerActions.close}
        spaces={selectedBookingData}
        type="booking"
      />
    </div>
  );
};

export default BookingsDashboardPage;
