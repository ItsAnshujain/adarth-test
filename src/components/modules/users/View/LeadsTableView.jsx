import { useEffect, useMemo, useState } from 'react';
import { useModals } from '@mantine/modals';
import { useSearchParams } from 'react-router-dom';
import { useClickOutside, useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { ActionIcon, Badge, Button } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons';
import dayjs from 'dayjs';
import { ChevronDown } from 'react-feather';
import { generateSlNo, serialize } from '../../../../utils';
import Table from '../../../Table/Table';
import LeadMenuPopover from '../../../Popovers/LeadMenuPopover';
import modalConfig from '../../../../utils/modalConfig';
import AddFollowUpContent from '../../leads/AddFollowUpContent';
import RowsPerPage from '../../../RowsPerPage';
import Search from '../../../Search';
import ViewLeadDrawer from '../../leads/ViewLeadDrawer';
import useLeads from '../../../../apis/queries/leads.queries';
import {
  DATE_SECOND_FORMAT,
  leadPriorityOptions,
  leadSourceOptions,
  leadStageOptions,
} from '../../../../utils/constants';
import DateRange from '../../../DateRange';
import Filter from '../../leads/Filter';
import calendar from '../../../../assets/data-table.svg';

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

const LeadsTableView = ({ userId }) => {
  const modals = useModals();
  const [searchInput, setSearchInput] = useState('');
  const [leadId, setLeadId] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [viewLeadDrawerOpened, viewLeadDrawerActions] = useDisclosure();
  const [showFilter, setShowFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const ref = useClickOutside(() => setShowDatePicker(false));
  const toggleFilter = () => setShowFilter(!showFilter);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: debouncedSearch,
    createdByIds: userId,
  });

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const removeUnwantedQueries = removeArr => {
    const params = [...searchParams];
    let updatedParams = params.filter(elem => !removeArr.includes(elem[0]));
    updatedParams = Object.fromEntries(updatedParams);
    return serialize(updatedParams);
  };

  const leadsQuery = useLeads(removeUnwantedQueries('leadDetailTab'));

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
            () =>
              objective ? (
                <p className="w-96 truncate" title={objective}>
                  {objective}
                </p>
              ) : (
                '-'
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
            return leadSourceOption ? leadSourceOption?.label : '-';
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

  return (
    <div className="mx-2">
      {!leadsQuery?.data?.docs?.length && !leadsQuery.isLoading ? (
        <div className="w-full min-h-[380px] flex justify-center items-center">
          <p className="text-xl">No records found</p>
        </div>
      ) : null}

      {leadsQuery?.data?.docs?.length ? (
        <>
          <div className="flex justify-between h-20 items-center px-2">
            <RowsPerPage
              setCount={currentLimit => {
                handlePagination('limit', currentLimit);
              }}
              count="10"
            />
            <div className="flex gap-2">
              <Search search={searchInput} setSearch={setSearchInput} />

              <div ref={ref} className="relative">
                <Button onClick={toggleDatePicker} variant="default">
                  <img src={calendar} className="h-5" alt="calendar" />
                </Button>
                {showDatePicker && (
                  <DateRange handleClose={toggleDatePicker} dateKeys={['from', 'to']} />
                )}
              </div>
              <div>
                <Button onClick={toggleFilter} variant="default" className="font-medium">
                  <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
                </Button>
                {showFilter && <Filter isOpened={showFilter} setShowFilter={setShowFilter} />}
              </div>
            </div>
          </div>
          <Table
            data={leadsQuery?.data?.docs || []}
            COLUMNS={columns}
            activePage={leadsQuery?.data?.page}
            totalPages={leadsQuery?.data?.totalPages}
            setActivePage={currentPage => handlePagination('page', currentPage)}
            rowCountLimit={10}
            handleSorting={handleSortByColumn}
            loading={leadsQuery?.isLoading}
          />
        </>
      ) : null}

      <ViewLeadDrawer
        isOpened={viewLeadDrawerOpened}
        onClose={viewLeadDrawerActions.close}
        leadId={leadId}
      />
    </div>
  );
};

export default LeadsTableView;
