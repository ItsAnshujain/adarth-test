import { useMemo, useEffect, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { Link, useSearchParams } from 'react-router-dom';
import { Text } from '@mantine/core';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SubHeader from '../components/modules/masters/SubHeader';
import MastersMenuPopover from '../components/Popovers/MastersMenuPopover';
import Table from '../components/Table/Table';
import { generateSlNo, masterTypes } from '../utils';
import { useFetchMasters } from '../apis/queries/masters.queries';
import RowsPerPage from '../components/RowsPerPage';
import Search from '../components/Search';

const MastersPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [searchParams, setSearchParams] = useSearchParams({
    'type': 'category',
    'parentId': null,
    'limit': 10,
    'page': 1,
    'sortOrder': 'desc',
    'sortBy': 'name',
  });

  const { data: masterData, isLoading: isMasterDataLoading } = useFetchMasters(
    searchParams.toString(),
  );

  const type = searchParams.get('type');
  const parentId = searchParams.get('parentId');
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const handleSearch = () => {
    searchParams.set('search', debouncedSearch);
    searchParams.set('page', debouncedSearch === '' ? page : 1);
    setSearchParams(searchParams);
  };

  const handlePagination = (key, val) => {
    if (val !== '') {
      searchParams.set(key, val);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
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
        Header: 'NAME',
        accessor: 'name',
        Cell: ({
          row: {
            original: { _id, name },
          },
        }) =>
          useMemo(
            () => (
              <div>
                {parentId === 'null' ? (
                  <Link
                    className="text-purple-450 underline"
                    to={`/masters?type=${searchParams.get('type')}&parentId=${_id}`}
                  >
                    {name}
                  </Link>
                ) : (
                  <Text>{name}</Text>
                )}
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        footer: props => props.column.id,
        disableSortBy: true,
        Cell: ({
          row: {
            original: { _id, name },
          },
        }) => useMemo(() => <MastersMenuPopover itemId={_id} name={name} />, []),
      },
    ],
    [masterData],
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

  useEffect(() => {
    setSearchInput('');
  }, [type, parentId]);

  return (
    <div>
      <Header title="Masters" />
      <div className="grid grid-cols-12 h-[calc(100vh-60px)]">
        <Sidebar />
        <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto">
          <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-5">
            <SubHeader text={masterTypes[type]} />
            <div className="flex justify-between h-20 items-center">
              <RowsPerPage
                setCount={currentLimit => handlePagination('limit', currentLimit)}
                count={limit}
              />

              <Search search={searchInput} setSearch={setSearchInput} />
            </div>

            <Table
              data={masterData?.docs || []}
              COLUMNS={COLUMNS}
              activePage={masterData?.page || 1}
              totalPages={masterData?.totalPages || 1}
              setActivePage={currentPage => handlePagination('page', currentPage)}
              rowCountLimit={limit}
              handleSorting={handleSortByColumn}
              loading={isMasterDataLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MastersPage;
