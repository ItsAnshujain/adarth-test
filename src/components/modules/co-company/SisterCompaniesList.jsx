import { useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import useCompanies from '../../../apis/queries/companies.queries';
import Table from '../../Table/Table';
import { generateSlNo } from '../../../utils';
import { CompanyTypeOptions } from '../../../utils/constants';
import CompanyMenuPopover from '../../Popovers/CompanyMenuPopover';
import modalConfig from '../../../utils/modalConfig';
import RowsPerPage from '../../RowsPerPage';
import Search from '../../Search';
import AddSisterCompanyContent from './AddSisterCompanyContent';

const updatedModalConfig = {
  ...modalConfig,
  size: '1000px',
  classNames: {
    title: 'font-dmSans text-2xl font-bold px-4',
    header: 'p-4 border-b border-gray-450',
    body: 'h-[600px] overflow-auto',
    close: 'mr-4',
  },
};

const SisterCompaniesList = () => {
  const modals = useModals();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: debouncedSearch,
    type: 'co-company',
    tab: 'parent-companies',
  });

  const tab = searchParams.get('tab');
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  const coCompaniesQuery = useCompanies({
    page,
    limit,
    sortBy,
    sortOrder,
    search: debouncedSearch,
    type: 'co-company',
    isParent: false,
  });

  const toggleEditSisterCompanyModal = companyData => {
    modals.openModal({
      title: 'Edit Sister Company',
      modalId: 'editCompanyModal',
      children: (
        <AddSisterCompanyContent
          mode="edit"
          type="co-company"
          tab="sister-companies"
          companyData={companyData}
          onCancel={() => modals.closeModal('editCompanyModal')}
        />
      ),
      ...updatedModalConfig,
    });
  };

  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, page, limit)}</p>, []),
      },
      {
        Header: 'COMPANY NAME',
        accessor: 'companyName',
      },
      {
        Header: 'CONTACT NUMBER',
        accessor: 'contactNumber',
        Cell: ({
          row: {
            original: { contactNumber },
          },
        }) => useMemo(() => <p>{contactNumber ? `+91 ${contactNumber}` : '-'}</p>, []),
      },
      {
        Header: 'PAN',
        accessor: 'companyPanNumber',
        disableSortBy: true,
      },
      {
        Header: 'GSTIN',
        accessor: 'companyGstNumber',
        disableSortBy: true,
      },
      {
        Header: 'COMPANY TYPE',
        accessor: 'companyType',
        Cell: ({
          row: {
            original: { companyType },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {CompanyTypeOptions?.filter(({ value }) => value === companyType)?.[0]?.label ||
                  '-'}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'PARENT COMPANY',
        accessor: 'parentCompany.companyName',
      },
      {
        Header: 'EMAIL',
        accessor: 'email',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { email },
          },
        }) => useMemo(() => <p className="text-blue-350">{email || '-'}</p>, []),
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({ row: { original } }) =>
          useMemo(
            () => (
              <CompanyMenuPopover
                itemId={original._id}
                type="co-company"
                tab={tab}
                toggleEdit={() => toggleEditSisterCompanyModal(original)}
              />
            ),
            [],
          ),
      },
    ],
    [tab, coCompaniesQuery?.data?.docs],
  );

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

  return (
    <div>
      <div className="mt-4 text-lg font-bold">Sister Companies List</div>
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
        data={coCompaniesQuery?.data?.docs || []}
        COLUMNS={columns}
        activePage={searchParams.get('page')}
        totalPages={coCompaniesQuery?.data?.totalPages || 1}
        setActivePage={currentPage => handlePagination('page', currentPage)}
        rowCountLimit={20}
        handleSorting={handleSortByColumn}
        loading={coCompaniesQuery.isLoading}
      />
    </div>
  );
};

export default SisterCompaniesList;
