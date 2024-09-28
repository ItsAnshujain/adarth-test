import { useSearchParams } from 'react-router-dom';

const SEARCH = 'search';
const PAGE = 'page';

const useSearchableTable = (debouncedSearch, initialSearchValue, initialPage) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = pages => {
    searchParams.set(SEARCH, debouncedSearch);
    searchParams.set(PAGE, debouncedSearch === '' ? pages : 1);
    setSearchParams(searchParams);
  };

  return {
    handleSearch,
    searchValue: searchParams.get(SEARCH) || initialSearchValue || '',
    currentPage: searchParams.get(PAGE) || initialPage || 1,
  };
};

export default useSearchableTable;
