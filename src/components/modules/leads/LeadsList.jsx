import { useEffect, useMemo, useState } from 'react';
import { useModals } from '@mantine/modals';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { ActionIcon, Badge } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons';
import dayjs from 'dayjs';
import { generateSlNo, serialize } from '../../../utils';
import Table from '../../Table/Table';
import LeadsListHeader from './LeadsListHeader';
import LeadMenuPopover from '../../Popovers/LeadMenuPopover';
import modalConfig from '../../../utils/modalConfig';
import AddFollowUpContent from './AddFollowUpContent';
import RowsPerPage from '../../RowsPerPage';
import Search from '../../Search';
import ViewLeadDrawer from './ViewLeadDrawer';
import useLeads from '../../../apis/queries/leads.queries';
import {
  DATE_SECOND_FORMAT,
  leadPriorityOptions,
  leadSourceOptions,
  leadStageOptions,
} from '../../../utils/constants';

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'font-dmSans text-2xl font-bold px-4',
    header: 'p-4 border-b border-gray-450',
    body: 'px-8',
    close: 'mr-4',
  },
  size: 800,
};

const LeadsList = () => {
  const modals = useModals();
  const [searchInput, setSearchInput] = useState('');
  const [leadId, setLeadId] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [viewLeadDrawerOpened, viewLeadDrawerActions] = useDisclosure();
  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: debouncedSearch,
  });

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const removeUnwantedQueries = removeArr => {
    const params = [...searchParams];
    let updatedParams = params.filter(elem => !removeArr.includes(elem[0]));
    updatedParams = Object.fromEntries(updatedParams);
    return serialize(updatedParams);
  };

  const leadsQuery = useLeads(removeUnwantedQueries(['leadDetailTab', 'stage', 'priority']));

  const toggleAddFollowUp = id =>
    modals.openModal({
      title: 'Add Follow Up',
      modalId: 'addFollowUpModal',
      children: (
        <AddFollowUpContent onCancel={() => modals.closeModal('addFollowUpModal')} leadId={id} />
      ),
      ...updatedModalConfig,
    });

  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);

    setSearchParams(searchParams);
  };

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

  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, page, limit)}</p>, []),
      },
      {
        Header: 'COMPANY NAME',
        accessor: 'leadCompany.companyName',
      },
      {
        Header: 'CONTACT PERSON',
        accessor: 'contact.name',
      },
      {
        Header: 'STAGE',
        accessor: 'stage',
        Cell: ({
          row: {
            original: { stage },
          },
        }) =>
          useMemo(() => {
            const leadStage = leadStageOptions?.filter(({ value }) => value === stage)?.[0];
            return leadStage ? (
              <Badge bg={leadStage?.color} className="text-white capitalize">
                {leadStage?.label}
              </Badge>
            ) : (
              '-'
            );
          }, []),
      },
      {
        Header: 'DISPLAY BRAND',
        accessor: 'brandDisplay',
        Cell: ({
          row: {
            original: { brandDisplay },
          },
        }) =>
          useMemo(
            () => (
              <div className="max-w-xs truncate" title={brandDisplay}>
                {brandDisplay || '-'}
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'OBJECTIVE',
        accessor: 'objective',
        Cell: ({
          row: {
            original: { objective },
          },
        }) =>
          useMemo(
            () => (
              <div className="max-w-xs truncate" title={objective}>
                {objective || '-'}
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'PRIORITY',
        accessor: 'priority',
        Cell: ({
          row: {
            original: { priority },
          },
        }) =>
          useMemo(() => {
            const leadPriority = leadPriorityOptions?.filter(
              ({ value }) => value === priority,
            )?.[0];
            return leadPriority ? (
              <Badge bg={leadPriority?.color} className="text-white capitalize">
                {leadPriority?.label}
              </Badge>
            ) : (
              '-'
            );
          }, []),
      },
      {
        Header: 'LEAD SOURCE',
        accessor: 'leadSource',
        Cell: ({
          row: {
            original: { leadSource },
          },
        }) =>
          useMemo(() => {
            const leadSourceOption = leadSourceOptions?.filter(
              ({ value }) => value === leadSource,
            )?.[0];
            return (
              <p className="max-w-xs truncate">
                {leadSourceOption ? leadSourceOption?.label : '-'}
              </p>
            );
          }, []),
      },
      {
        Header: 'PRIMARY INCHARGE',
        accessor: 'primaryInCharge.name',
      },
      {
        Header: 'SECONDARY INCHARGE',
        accessor: 'secondaryInCharge.name',
      },
      {
        Header: 'LAST FOLLOWUP',
        accessor: 'lastFollowUp.followUpDate',
        Cell: ({
          row: {
            original: { lastFollowUp },
          },
        }) =>
          useMemo(
            () => (
              <div>
                {lastFollowUp?.followUpDate
                  ? dayjs(lastFollowUp?.followUpDate).format(DATE_SECOND_FORMAT)
                  : '-'}
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'LEAD START DATE',
        accessor: 'targetStartDate',
        Cell: ({
          row: {
            original: { targetStartDate },
          },
        }) =>
          useMemo(
            () => (
              <div>{targetStartDate ? dayjs(targetStartDate).format(DATE_SECOND_FORMAT) : '-'}</div>
            ),
            [],
          ),
      },
      {
        Header: 'TARGET DATE',
        accessor: 'targetEndDate',
        Cell: ({
          row: {
            original: { targetEndDate },
          },
        }) =>
          useMemo(
            () => (
              <div>{targetEndDate ? dayjs(targetEndDate).format(DATE_SECOND_FORMAT) : '-'}</div>
            ),
            [],
          ),
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({ row: { original } }) =>
          useMemo(
            () => (
              <LeadMenuPopover
                itemId={original._id}
                toggleAddFollowUp={() => toggleAddFollowUp(original._id)}
                toggleViewLead={() => {
                  setLeadId(original._id);
                  viewLeadDrawerActions.open();
                  searchParams.set('leadDetailTab', 'overview');
                  setSearchParams(searchParams, { replace: true });
                }}
              />
            ),
            [],
          ),
      },
      {
        Header: '',
        accessor: 'action1',
        disableSortBy: true,
        sticky: true,
        Cell: ({ row: { original } }) =>
          useMemo(
            () => (
              <ActionIcon
                className="bg-purple-450"
                onClick={() => {
                  setLeadId(original._id);
                  viewLeadDrawerActions.open();
                  searchParams.set('leadDetailTab', 'overview');
                  setSearchParams(searchParams, { replace: true });
                }}
              >
                <IconChevronLeft size={20} color="white" />
              </ActionIcon>
            ),
            [],
          ),
      },
    ],
    [leadsQuery?.data?.docs],
  );

  const handleSearch = () => {
    searchParams.set('search', debouncedSearch);
    searchParams.set('page', 1);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    handleSearch();
    if (debouncedSearch === '') {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  }, [debouncedSearch]);

  const handleTableRowClick = id => {
    viewLeadDrawerActions.open();
    setLeadId(id);
  };

  return (
    <div className="mx-2 px-4">
      <LeadsListHeader />
      <div className="flex justify-between h-20 items-center">
        <RowsPerPage
          setCount={currentLimit => {
            handlePagination('limit', currentLimit);
          }}
          count="20"
        />
        <Search search={searchInput} setSearch={setSearchInput} />
      </div>
      <Table
        data={leadsQuery?.data?.docs || []}
        COLUMNS={columns}
        activePage={leadsQuery?.data?.page}
        totalPages={leadsQuery?.data?.totalPages}
        setActivePage={currentPage => handlePagination('page', currentPage)}
        rowCountLimit={20}
        handleSorting={handleSortByColumn}
        loading={leadsQuery?.isLoading}
        handleTableRowClick={handleTableRowClick}
      />

      <ViewLeadDrawer
        isOpened={viewLeadDrawerOpened}
        onClose={viewLeadDrawerActions.close}
        leadId={leadId}
      />
    </div>
  );
};

export default LeadsList;
