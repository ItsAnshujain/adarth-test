import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Select } from '@mantine/core';
import { Plus, ChevronDown } from 'react-feather';
import { useQueryClient } from '@tanstack/react-query';
import Filter from './Filter';

const styles = {
  rightSection: { pointerEvents: 'none' },
};

const AreaHeader = ({ setFilter = () => {}, filter, userId }) => {
  const [showFilter, setShowFilter] = useState(false);
  const toggleFilter = () => setShowFilter(!showFilter);
  const handleFilter = val => setFilter(val?.toLowerCase());
  const queryClient = useQueryClient();

  const userCachedData = queryClient.getQueryData(['users-by-id', userId]);

  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
      <Select
        value={filter.charAt(0).toUpperCase() + filter.slice(1)}
        onChange={handleFilter}
        data={userCachedData?.role === 'admin' ? ['All', 'Team', 'Peer'] : ['Team', 'Peer']}
        styles={styles}
        rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
      />

      <div className="flex justify-around">
        <div className="mr-2">
          <Button onClick={toggleFilter} variant="default">
            <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
          </Button>
          {showFilter && <Filter isOpened={showFilter} setShowFilter={setShowFilter} />}
        </div>
        <div>
          <Link
            to="/users/create-user"
            className="bg-purple-450 flex items-center text-white rounded-md px-4 h-full font-medium"
          >
            <Plus size={16} className="mr-1" />
            <span className="text-sm">Add User</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AreaHeader;
