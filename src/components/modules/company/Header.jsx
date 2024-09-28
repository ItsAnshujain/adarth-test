import { Tabs } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useModals } from '@mantine/modals';
import { generateSlNo } from '../../../utils';
import Table from '../../Table/Table';
import CompanyMenuPopover from '../../Popovers/CompanyMenuPopover';
import RowsPerPage from '../../RowsPerPage';
import Search from '../../Search';
import modalConfig from '../../../utils/modalConfig';
import AddCompanyContent from './AddCompanyContent';
import useCompanies from '../../../apis/queries/companies.queries';
import SuccessModal from '../../shared/Modal';
import AddCompanyMenuPopover from '../../Popovers/AddCompanyMenuPopover';
import { CompanyTypeOptions } from '../../../utils/constants';

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

const Header = () => {
  const modals = useModals();
  const [successModalOpened, setOpenSuccessModal] = useState(false);
  const [successModalText, setSuccessModalText] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);

  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: debouncedSearch,
    tab: 'companies',
  });

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');
  const tab = searchParams.get('tab');

  const companiesQuery = useCompanies({
    page,
    limit,
    sortBy,
    sortOrder,
    search: debouncedSearch,
    type: 'lead-company',
    isParent: tab === 'parent-companies',
  });
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

  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);
    setSearchParams(searchParams);
  };

  const handleOnSuccess = text => {
    setOpenSuccessModal(true);
    setSuccessModalText(text);
  };

  const toggleAddCompanyModal = () => {
    modals.openModal({
      title: 'Add Company',
      modalId: 'addCompanyModal',
      children: (
        <AddCompanyContent
          type="company"
          mode="add"
          tab="companies"
          onCancel={() => modals.closeModal('addCompanyModal')}
          onSuccess={() => handleOnSuccess('Company')}
        />
      ),
      ...updatedModalConfig,
    });
  };

  const toggleAddParentCompanyModal = () => {
    modals.openModal({
      title: 'Add Parent Company',
      modalId: 'addCompanyModal',
      children: (
        <AddCompanyContent
          type="company"
          mode="add"
          tab="parent-companies"
          onCancel={() => modals.closeModal('addCompanyModal')}
          onSuccess={() => handleOnSuccess('Parent Company')}
        />
      ),
      ...updatedModalConfig,
    });
  };

  const toggleEditCompanyModal = companyData => {
    modals.openModal({
      title: 'Edit Company',
      modalId: 'editCompanyModal',
      children: (
        <AddCompanyContent
          type="company"
          mode="edit"
          tab="companies"
          companyData={companyData}
          onCancel={() => modals.closeModal('editCompanyModal')}
        />
      ),
      ...updatedModalConfig,
    });
  };

  const toggleEditParentCompanyModal = companyData => {
    modals.openModal({
      title: 'Edit Parent Company',
      modalId: 'editCompanyModal',
      children: (
        <AddCompanyContent
          type="company"
          mode="edit"
          tab="parent-companies"
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
        show: true,
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, page, limit)}</p>, []),
      },
      {
        Header: 'COMPANY NAME',
        show: true,
        accessor: 'companyName',
      },
      {
        Header: 'CITY',
        show: true,
        accessor: 'companyAddress.city',
      },
      {
        Header: 'STATE & STATE CODE',
        show: true,
        accessor: 'companyAddress.state',
        Cell: ({
          row: {
            original: { companyAddress },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {companyAddress?.stateCode && companyAddress?.state
                  ? `(${companyAddress?.stateCode}) ${companyAddress?.state}`
                  : '-'}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'GSTIN',
        show: true,
        accessor: 'companyGstNumber',
        disableSortBy: true,
      },
      {
        Header: 'COMPANY TYPE',
        show: true,
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
        show: tab === 'companies',
        accessor: 'parentCompany.companyName',
      },
      {
        Header: 'NATURE OF ACCOUNT',
        show: true,
        accessor: 'natureOfAccount',
      },
      {
        Header: 'CONTACT NUMBER',
        show: true,
        accessor: 'contactNumber',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { contactNumber },
          },
        }) => useMemo(() => <p>{contactNumber ? `+91 ${contactNumber}` : '-'}</p>, []),
      },
      {
        Header: 'EMAIL',
        show: true,
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
        show: true,
        accessor: 'action',
        disableSortBy: true,
        Cell: ({ row: { original } }) =>
          useMemo(
            () => (
              <CompanyMenuPopover
                itemId={original._id}
                type="company"
                tab={tab}
                toggleEdit={() =>
                  tab === 'companies'
                    ? toggleEditCompanyModal(original)
                    : toggleEditParentCompanyModal(original)
                }
              />
            ),
            [],
          ),
      },
    ],
    [tab, companiesQuery?.data?.docs],
  );

  const memoizedColumns = useMemo(() => {
    if (tab === 'companies') {
      return columns;
    }
    return columns.filter(col => col.show);
  }, [tab, companiesQuery?.data?.docs]);

  return (
    <div className="flex justify-between py-4">
      <Tabs className="w-full" value={tab}>
        <Tabs.List className="border-b">
          <div className="flex justify-between w-full pb-0">
            <div className="flex gap-4 mb-0">
              <Tabs.Tab
                value="companies"
                className={classNames(
                  'p-0 border-0 text-lg pb-2',
                  tab === 'companies' ? 'border border-b-2 border-purple-450 text-purple-450' : '',
                )}
                onClick={() => {
                  searchParams.set('tab', 'companies');
                  searchParams.set('page', 1);
                  searchParams.set('limit', 20);
                  setSearchParams(searchParams, { replace: true });
                }}
              >
                Companies
              </Tabs.Tab>
              <Tabs.Tab
                value="parent-companies"
                className={classNames(
                  'p-0 border-0 text-lg pb-2',
                  tab === 'parent-companies'
                    ? 'border border-b-2 border-purple-450 text-purple-450'
                    : '',
                )}
                onClick={() => {
                  searchParams.set('tab', 'parent-companies');
                  searchParams.set('page', 1);
                  searchParams.set('limit', 20);
                  setSearchParams(searchParams, { replace: true });
                }}
              >
                Parent Companies
              </Tabs.Tab>
            </div>
            <AddCompanyMenuPopover
              toggleAddCompanyModal={toggleAddCompanyModal}
              toggleAddParentCompanyModal={toggleAddParentCompanyModal}
            />
          </div>
        </Tabs.List>
        <Tabs.Panel value="companies">
          <div className="mt-4 text-lg font-bold">Companies List</div>
          <div className="flex justify-between h-20 items-center">
            <RowsPerPage
              setCount={currentLimit => {
                handlePagination('limit', currentLimit);
              }}
              count="20"
            />
            <Search search={searchInput} setSearch={setSearchInput} />
          </div>

          {tab !== 'parent-companies' ? (
            <Table
              data={companiesQuery?.data?.docs || []}
              COLUMNS={memoizedColumns}
              activePage={companiesQuery?.data?.page}
              totalPages={companiesQuery?.data?.totalPages || 1}
              setActivePage={currentPage => handlePagination('page', currentPage)}
              rowCountLimit={20}
              handleSorting={handleSortByColumn}
              loading={companiesQuery?.isLoading}
            />
          ) : null}
        </Tabs.Panel>
        <Tabs.Panel value="parent-companies">
          <div className="mt-4 text-lg font-bold">Parent Companies List</div>
          <div className="flex justify-between h-20 items-center">
            <RowsPerPage
              setCount={currentLimit => {
                handlePagination('limit', currentLimit);
              }}
              count="20"
            />
            <Search search={searchInput} setSearch={setSearchInput} />
          </div>
          {tab === 'parent-companies' ? (
            <Table
              data={companiesQuery?.data?.docs || []}
              COLUMNS={memoizedColumns}
              activePage={companiesQuery?.data?.page}
              totalPages={companiesQuery?.data?.totalPages || 1}
              setActivePage={currentPage => handlePagination('page', currentPage)}
              rowCountLimit={20}
              handleSorting={handleSortByColumn}
              loading={companiesQuery?.isLoading}
            />
          ) : null}
        </Tabs.Panel>
      </Tabs>
      <SuccessModal
        title={`${successModalText} Successfully Added`}
        prompt="Close"
        open={successModalOpened}
        setOpenSuccessModal={setOpenSuccessModal}
      />
    </div>
  );
};

export default Header;
