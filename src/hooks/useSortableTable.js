import { useSearchParams } from 'react-router-dom';

const SORT_BY = 'sortBy';
const SORT_ORDER = 'sortOrder';

const useSortableTable = (defaultSortBy, defaultSortOrder) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortByColumn = colId => {
    const currentSortBy = searchParams.get(SORT_BY);
    const currentSortOrder = searchParams.get(SORT_ORDER);
    let newSortOrder = defaultSortOrder || 'asc';

    if (currentSortBy === colId) {
      newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    }

    searchParams.set(SORT_BY, colId);
    searchParams.set(SORT_ORDER, newSortOrder);
    setSearchParams(searchParams);
  };

  return {
    handleSortByColumn,
    currentSortBy: searchParams.get(SORT_BY) || defaultSortBy || '',
    currentSortOrder: searchParams.get(SORT_ORDER) || defaultSortOrder || 'asc',
  };
};

export default useSortableTable;
