import { ActionIcon, Select, Text } from '@mantine/core';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'react-feather';
import { Link, useSearchParams } from 'react-router-dom';
import { IconEye } from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';
import { useFetchMasters } from '../../../../apis/queries/masters.queries';
import { useUpdateProposal } from '../../../../apis/queries/proposal.queries';
import { generateSlNo, serialize } from '../../../../utils';
import toIndianCurrency from '../../../../utils/currencyFormat';
import ProposalsMenuPopover from '../../../Popovers/ProposalsMenuPopover';
import Table from '../../../Table/Table';
import DateAndFilterHeader from './DateAndFilterHeader';
import PriceBreakdownDrawer from '../../bookings/ViewOrders/PriceBreakdownDrawer';

const nativeSelectStyles = {
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

const ProposalTableView = ({ data, isLoading, activeChildTab }) => {
  const [drawerOpened, drawerActions] = useDisclosure();
  const [selectedProposalData, setSelectedProposalData] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { mutate: update, isLoading: isUpdateProposalLoading } = useUpdateProposal();
  const { data: proposalStatusData, isLoading: isProposalStatusLoading } = useFetchMasters(
    serialize({ type: 'proposal_status', parentId: null, limit: 100, page: 1 }),
  );

  const { limit, page } = useMemo(
    () => ({
      limit: searchParams.get('limit'),
      page: Number(searchParams.get('page')),
    }),
    [searchParams],
  );

  const handleSortByColumn = colId => {
    searchParams.set('sortBy', colId);
    searchParams.set(
      'sortOrder',
      searchParams.get('sortBy') === colId ? sortOrders(searchParams.get('sortOrder')) : 'asc',
    );

    setSearchParams(searchParams);
  };

  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);

    setSearchParams(searchParams);
  };

  const handleUpdateStatus = (proposalId, statusId) =>
    update({ proposalId, data: { status: statusId } });

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
              <Link to={`/proposals/view-details/${_id}`} className="font-medium underline">
                <Text
                  className="overflow-hidden text-ellipsis max-w-[180px] text-purple-450"
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
        Cell: ({
          row: {
            original: { price, spaces },
          },
        }) =>
          useMemo(
            () => (
              <div className="flex items-center justify-between max-w-min">
                {toIndianCurrency(price || 0)}
                <ActionIcon
                  onClick={() => {
                    setSelectedProposalData(spaces);
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
    [data?.docs, proposalStatusData],
  );

  return (
    <div>
      <div className="flex justify-end h-20 items-center">
        <DateAndFilterHeader activeChildTab={activeChildTab} />
      </div>

      <Table
        data={data?.docs || []}
        COLUMNS={COLUMNS}
        activePage={data?.page || 1}
        totalPages={data?.totalPages || 1}
        setActivePage={currentPage => handlePagination('page', currentPage)}
        rowCountLimit={data.limit || 10}
        handleSorting={handleSortByColumn}
        loading={isLoading}
      />
      <PriceBreakdownDrawer
        isOpened={drawerOpened}
        onClose={drawerActions.close}
        type="proposal"
        spaces={selectedProposalData || []}
      />
    </div>
  );
};

export default ProposalTableView;
