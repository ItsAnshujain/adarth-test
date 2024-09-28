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
import AddCoCompanyContent from './AddCoCompanyContent';
import useCompanies from '../../../apis/queries/companies.queries';
import SuccessModal from '../../shared/Modal';
import { CompanyTypeOptions } from '../../../utils/constants';
import SisterCompaniesList from './SisterCompaniesList';
import AddSisterCompanyContent from './AddSisterCompanyContent';
import AddCoCompanyMenuPopover from '../../Popovers/AddCoCompanyMenuPopover';

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
    isParent: true,
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

  const toggleAddParentCompanyModal = () => {
    modals.openModal({
      title: 'Add Parent Company',
      modalId: 'addCompanyModal',
      children: (
        <AddCoCompanyContent
          mode="add"
          type="co-company"
          tab="parent-companies"
          onCancel={() => modals.closeModal('addCompanyModal')}
          onSuccess={() => handleOnSuccess('Parent Company')}
        />
      ),
      ...updatedModalConfig,
    });
  };

  const toggleAddSisterCompanyModal = () => {
    modals.openModal({
      title: 'Add Sister Company',
      modalId: 'addCompanyModal',
      children: (
        <AddSisterCompanyContent
          mode="add"
          type="co-company"
          tab="sister-companies"
          onCancel={() => modals.closeModal('addCompanyModal')}
          onSuccess={() => handleOnSuccess('Sister Company')}
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
        <AddCoCompanyContent
          mode="edit"
          type="co-company"
          tab="parent-companies"
          companyData={companyData}
          onCancel={() => modals.closeModal('editCompanyModal')}
        />
      ),
      ...updatedModalConfig,
    });
  };

  const toggleEditSisterCompanyModal = companyData => {
    modals.openModal({
      title: 'Edit Sister Company',
      modalId: 'editSisterCompanyModal',
      children: (
        <AddSisterCompanyContent
          mode="edit"
          type="co-company"
          tab="sister-companies"
          companyData={companyData}
          onCancel={() => modals.closeModal('editSisterCompanyModal')}
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
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, page, limit)}</p>, []),
      },
      {
        Header: 'COMPANY NAME',
        accessor: 'companyName',
      },
      {
        Header: 'CITY',
        accessor: 'companyAddress.city',
      },
      {
        Header: 'STATE & STATE CODE',
        accessor: 'companyAddress.state',
        Cell: ({
          row: {
            original: { companyAddress },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {companyAddress?.stateCode
                  ? `(${companyAddress?.stateCode}) ${companyAddress?.state}`
                  : '-'}
              </p>
            ),
            [],
          ),
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
        Header: 'NATURE OF ACCOUNT',
        accessor: 'natureOfAccount',
      },
      {
        Header: 'CONTACT NUMBER',
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
                toggleEdit={() =>
                  tab === 'sisterCompanies'
                    ? toggleEditSisterCompanyModal(original)
                    : toggleEditParentCompanyModal(original)
                }
              />
            ),
            [],
          ),
      },
    ],
    [tab, coCompaniesQuery?.data?.docs],
  );

  return (
    <div className="flex justify-between py-4">
      <Tabs className="w-full" value={tab}>
        <Tabs.List className="border-b">
          <div className="flex justify-between w-full pb-0">
            <div className="flex gap-4 mb-0">
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
              <Tabs.Tab
                value="sister-companies"
                className={classNames(
                  'p-0 border-0 text-lg pb-2',
                  tab === 'sister-companies'
                    ? 'border border-b-2 border-purple-450 text-purple-450'
                    : '',
                )}
                onClick={() => {
                  searchParams.set('tab', 'sister-companies');
                  searchParams.set('page', 1);
                  searchParams.set('limit', 20);
                  setSearchParams(searchParams, { replace: true });
                }}
              >
                Sister Companies
              </Tabs.Tab>
            </div>
            <AddCoCompanyMenuPopover
              toggleAddParentCompanyModal={toggleAddParentCompanyModal}
              toggleAddSisterCompanyModal={toggleAddSisterCompanyModal}
            />
          </div>
        </Tabs.List>
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
        </Tabs.Panel>
        <Tabs.Panel value="sister-companies">
          <SisterCompaniesList />
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
