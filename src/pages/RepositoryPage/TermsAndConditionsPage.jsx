import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import Table from '../../components/Table/Table';
import Header from '../../components/modules/termsAndConditions/Header';
import { generateSlNo } from '../../utils';
import TermsAndConditionsMenuPopover from '../../components/Popovers/TermsAndConditionsMenuPopover';
import RowsPerPage from '../../components/RowsPerPage';
import Search from '../../components/Search';
import { useDeleteProposalTerms, useProposalTerms } from '../../apis/queries/proposal.queries';
import AddTermsAndConditionsForm from '../../components/modules/proposals/CreateProposal/AddTermsAndConditionsForm';
import modalConfig from '../../utils/modalConfig';
import SuccessModal from '../../components/shared/Modal';
import ConfirmContent from '../../components/shared/ConfirmContent';

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'text-xl font-bold w-full',
    header: 'hidden',
    body: 'pb-4',
  },
};

const TermsAndConditionsPage = () => {
  const modals = useModals();
  const [searchInput, setSearchInput] = useState('');
  const [successModalOpened, setOpenSuccessModal] = useState(false);
  const [debouncedSearch] = useDebouncedValue(searchInput, 200);
  const deleteProposalTerms = useDeleteProposalTerms();

  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: 20,
    sortBy: 'isGlobal',
    sortOrder: 'desc',
  });

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  const proposalTermsQuery = useProposalTerms({
    page,
    limit,
    sortBy,
    sortOrder,
    search: debouncedSearch,
  });

  const deleteTerm = id => {
    deleteProposalTerms.mutate(id, {
      onSuccess: () =>
        showNotification({
          message: 'Term deleted successfully',
        }),
    });
  };

  const toggleDelete = id =>
    modals.openModal({
      modalId: 'deleteTermsModal',
      title: 'Delete Terms and Conditions',
      children: (
        <ConfirmContent
          onConfirm={() => {
            deleteTerm(id);
            modals.closeModal('deleteTermsModal');
            modals.closeModal('addTerms');
          }}
          onCancel={() => modals.closeModal('deleteTermsModal')}
          loading={deleteProposalTerms.isLoading}
          classNames="px-8 mt-4"
        />
      ),
      ...modalConfig,
      size: 'md',
      classNames: {
        title: 'font-dmSans text-xl px-4',
        header: 'px-4 pt-4',
        body: 'pb-4 overflow-auto',
        close: 'mr-4',
      },
    });

  const handleAddTermsAndConditions = data =>
    modals.openModal({
      modalId: 'addTerms',
      children: (
        <AddTermsAndConditionsForm
          onClose={() => modals.closeModal('addTerms')}
          onSuccess={() => setOpenSuccessModal(true)}
          termsAndConditionData={data}
          mode={data.name ? 'Edit' : 'Add'}
          toggleDelete={() => toggleDelete(data?._id)}
        />
      ),
      ...updatedModalConfig,
    });

  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, page, limit)}</p>, []),
      },
      {
        Header: 'TERMS AND CONDITIONS',
        accessor: 'name',
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({ row: { original } }) =>
          useMemo(
            () => (
              <TermsAndConditionsMenuPopover
                itemId={original._id}
                deleteTerm={() => deleteTerm(original?._id)}
                toggleEditModal={() => {
                  handleAddTermsAndConditions(original);
                }}
              />
            ),
            [],
          ),
      },
    ],
    [proposalTermsQuery?.data?.docs],
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

  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);
    setSearchParams(searchParams);
  };

  return (
    <div className="overflow-y-auto px-4 col-span-10">
      <Header handleAddTermsAndConditions={handleAddTermsAndConditions} />
      <div className="flex justify-between h-20 items-center">
        <RowsPerPage
          setCount={currentLimit => {
            handlePagination('limit', currentLimit);
          }}
          count="20"
        />
        <Search
          search={searchInput}
          setSearch={val => {
            setSearchInput(val);
            searchParams.set('page', 1);
            setSearchParams(searchParams, {
              replace: true,
            });
          }}
        />
      </div>
      <Table
        data={proposalTermsQuery?.data?.docs || []}
        COLUMNS={columns}
        activePage={searchParams.get('page')}
        totalPages={proposalTermsQuery?.data?.totalPages || 1}
        setActivePage={currentPage => handlePagination('page', currentPage)}
        rowCountLimit={20}
        handleSorting={handleSortByColumn}
        loading={proposalTermsQuery.isLoading || deleteProposalTerms.isLoading}
      />
      <SuccessModal
        title="Terms and Conditions Successfully Added"
        prompt="Close"
        open={successModalOpened}
        setOpenSuccessModal={setOpenSuccessModal}
      />
    </div>
  );
};

export default TermsAndConditionsPage;
