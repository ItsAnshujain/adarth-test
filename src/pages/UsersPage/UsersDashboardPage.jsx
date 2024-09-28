import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pagination, Skeleton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import AreaHeader from '../../components/modules/users/Header';
import RowsPerPage from '../../components/RowsPerPage';
import Search from '../../components/Search';
import Card from '../../components/modules/users/Card';
import { useFetchUsers } from '../../apis/queries/users.queries';
import useTokenIdStore from '../../store/user.store';

const paginationStyles = {
  item: {
    fontSize: 12,
  },
};

const skeletonList = () =>
  Array.apply('', Array(8)).map(_ => <Skeleton height={178} radius="sm" key={uuidv4()} />);

const UsersDashboardPage = () => {
  const queryClient = useQueryClient();
  const userId = useTokenIdStore(state => state.id);
  const userCachedData = queryClient.getQueryData(['users-by-id', userId]);
  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: 20,
    sortOrder: 'desc',
    sortBy: 'createdAt',
    filter: userCachedData?.role === 'admin' ? 'all' : 'team',
  });
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const { data: userData, isLoading: isLoadingUserData } = useFetchUsers(searchParams.toString());

  const filter = searchParams.get('filter');
  const limit = searchParams.get('limit');
  const page = searchParams.get('page');

  const handleSearch = () => {
    searchParams.set('search', debouncedSearch);
    searchParams.set('page', debouncedSearch === '' ? page : 1);
    setSearchParams(searchParams);
  };
  const handleFilter = currentVal => {
    searchParams.set('filter', currentVal);
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
      <AreaHeader setFilter={handleFilter} filter={filter} userId={userId} />
      <div className="flex justify-between h-20 items-center">
        <RowsPerPage
          setCount={currentLimit => handlePagination('limit', currentLimit)}
          count={limit}
        />
        <Search search={searchInput} setSearch={setSearchInput} />
      </div>
      <div className="relative pb-10">
        {!userData?.docs?.length && !isLoadingUserData ? (
          <div className="w-full min-h-[400px] flex justify-center items-center">
            <p className="text-xl">No records found</p>
          </div>
        ) : null}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-4 relative mb-20">
          {userData?.docs?.map(user => (
            <Link to={`view-details/${user?._id}`} key={user?._id}>
              <Card {...user} />
            </Link>
          ))}
          {isLoadingUserData ? skeletonList() : null}
        </div>
        <Pagination
          styles={paginationStyles}
          className="absolute bottom-0 right-10 text-sm mb-10"
          page={userData?.page || 1}
          onChange={currentPage => handlePagination('page', currentPage)}
          total={userData?.totalPages || 1}
        />
      </div>
    </div>
  );
};

export default UsersDashboardPage;
