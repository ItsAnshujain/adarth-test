import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { Select, Text, ActionIcon } from '@mantine/core';
import dayjs from 'dayjs';
import { ChevronDown } from 'react-feather';
import shallow from 'zustand/shallow';
import { IconEye } from '@tabler/icons';
import AreaHeader from '../../components/modules/proposals/Header';
import RowsPerPage from '../../components/RowsPerPage';
import Search from '../../components/Search';
import Table from '../../components/Table/Table';
import GridView from '../../components/modules/proposals/Grid';
import { useFetchProposals, useUpdateProposal } from '../../apis/queries/proposal.queries';
import useLayoutView from '../../store/layout.store';
import toIndianCurrency from '../../utils/currencyFormat';
import { generateSlNo, serialize } from '../../utils';
import { useFetchMasters } from '../../apis/queries/masters.queries';
import ProposalsMenuPopover from '../../components/Popovers/ProposalsMenuPopover';
import PriceBreakdownDrawer from '../../components/modules/bookings/ViewOrders/PriceBreakdownDrawer';

const nativeSelectStyles = {
  rightSection: { pointerEvents: 'none' },
};
const DATE_FORMAT = 'DD MMM YYYY';

const ProposalDashboardPage = () => {
  const [drawerOpened, drawerActions] = useDisclosure();
  const [selectedProposalData, setSelectedProposalData] = useState([]);
  const { activeLayout, setActiveLayout } = useLayoutView(
    state => ({
      activeLayout: state.activeLayout,
      setActiveLayout: state.setActiveLayout,
    }),
    shallow,
  );
  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: activeLayout.proposalLimit || 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);

  const { mutate: update, isLoading: isUpdateProposalLoading } = useUpdateProposal();
  const { data: proposalsData, isLoading: isLoadingProposalsData } = useFetchProposals(
    searchParams.toString(),
  );
  const { data: proposalStatusData, isLoading: isProposalStatusLoading } = useFetchMasters(
    serialize({ type: 'proposal_status', parentId: null, limit: 100, page: 1 }),
  );

  const viewType = useLayoutView(state => state.activeLayout);

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

  const handleUpdateStatus = (proposalId, statusId) => {
    const data = { status: statusId };
    update({ proposalId, data });
  };

  const COLUMNS = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, page, limit)}</p>, []),
      },
      {
        Header: 'PROPOSAL NAME',
        accessor: 'name',
        Cell: ({
          row: {
            original: { _id, name },
          },
        }) =>
          useMemo(
            () => (
              <Link to={`view-details/${_id}`} className="text-purple-450 font-medium">
                <Text
                  className="overflow-hidden text-ellipsis max-w-[180px] underline"
                  lineClamp={1}
                  title={name}
                >
                  {name || '-'}
                </Text>
              </Link>
            ),
            [],
          ),
      },
      {
        Header: 'PROPOSAL ID',
        accessor: 'proposalId',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{info.row.original.proposalId || '-'}</p>, []),
      },
      {
        Header: 'CREATOR',
        accessor: 'creator.name',
        Cell: ({
          row: {
            original: { creator },
          },
        }) =>
          useMemo(
            () => (
              <Text
                className="text-black font-medium max-w-[250px] text-ellipsis"
                lineClamp={1}
                title={creator?.name}
              >
                {creator?.name || '-'}
              </Text>
            ),
            [],
          ),
      },
      {
        Header: 'STATUS',
        accessor: 'status.name',
        Cell: ({
          row: {
            original: { _id, status },
          },
        }) =>
          useMemo(
            () => (
              <Select
                className="mr-2"
                value={status?._id || ''}
                onChange={e => handleUpdateStatus(_id, e)}
                data={
                  proposalStatusData?.docs?.map(item => ({
                    label: item?.name,
                    value: item?._id,
                  })) || []
                }
                styles={nativeSelectStyles}
                rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
                rightSectionWidth={40}
                disabled={isProposalStatusLoading || isUpdateProposalLoading}
              />
            ),
            [],
          ),
      },
      {
        Header: 'START DATE',
        accessor: 'startDate',
        Cell: ({
          row: {
            original: { startDate },
          },
        }) =>
          useMemo(
            () => (
              <p className="font-medium bg-gray-450 px-2 rounded-sm min-w-[120px] text-center">
                {dayjs(startDate).format(DATE_FORMAT)}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'END DATE',
        accessor: 'endDate',
        Cell: ({
          row: {
            original: { endDate },
          },
        }) =>
          useMemo(
            () => (
              <p className="font-medium bg-gray-450 px-2 rounded-sm min-w-[120px] text-center">
                {dayjs(endDate).format(DATE_FORMAT)}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'CLIENT',
        accessor: 'client.name',
        Cell: ({
          row: {
            original: { client },
          },
        }) => useMemo(() => <p>{client?.company || '-'}</p>, []),
      },
      {
        Header: 'TOTAL PLACES',
        accessor: 'totalPlaces',
      },
      {
        Header: 'PRICING',
        accessor: 'price',
        Cell: ({ row: { original } }) =>
          useMemo(
            () => (
              <div className="flex items-center justify-between max-w-min">
                {toIndianCurrency(original?.price || 0)}
                <ActionIcon
                  onClick={() => {
                    setSelectedProposalData(original?.spaces);
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
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { _id, creator, totalPlaces, bookingId },
          },
        }) =>
          useMemo(
            () => (
              <ProposalsMenuPopover
                itemId={_id}
                enableEdit={creator && !creator?.isPeer}
                enableDelete={creator && !creator?.isPeer}
                enableConvert
                proposalLimit={totalPlaces}
                bookingId={bookingId}
              />
            ),
            [],
          ),
      },
    ],
    [proposalsData?.docs, limit, proposalStatusData],
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

  useEffect(() => {
    handleSearch();
    if (debouncedSearch === '') {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  }, [debouncedSearch]);

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-5">
      <AreaHeader text="Proposals List" />
      <div className="flex justify-between h-20 items-center">
        <RowsPerPage
          setCount={currentLimit => {
            handlePagination('limit', currentLimit);
            setActiveLayout({ ...activeLayout, proposalLimit: currentLimit });
          }}
          count={limit}
        />
        <Search search={searchInput} setSearch={setSearchInput} />
      </div>

      {viewType.proposal === 'list' ? (
        <Table
          data={proposalsData?.docs || []}
          COLUMNS={COLUMNS}
          activePage={proposalsData?.page || 1}
          totalPages={proposalsData?.totalPages || 1}
          setActivePage={currentPage => handlePagination('page', currentPage)}
          rowCountLimit={limit}
          handleSorting={handleSortByColumn}
          loading={isLoadingProposalsData}
        />
      ) : viewType.proposal === 'grid' && proposalsData?.docs?.length ? (
        <GridView
          count={limit}
          list={proposalsData?.docs || []}
          activePage={proposalsData?.page}
          totalPages={proposalsData?.totalPages}
          setActivePage={currentPage => handlePagination('page', currentPage)}
          isLoadingList={isLoadingProposalsData}
          setSelectedProposalData={setSelectedProposalData}
          onOpen={drawerActions.open}
        />
      ) : null}
      <PriceBreakdownDrawer
        isOpened={drawerOpened}
        onClose={drawerActions.close}
        type="proposal"
        spaces={selectedProposalData || []}
      />
    </div>
  );
};

export default ProposalDashboardPage;
