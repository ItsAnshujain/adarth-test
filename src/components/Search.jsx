import { TextInput } from '@mantine/core';
import icon from '../assets/icon.svg';

const Search = ({ search, setSearch = () => {}, ...props }) => (
  <TextInput
    value={search}
    onChange={e => setSearch(e.currentTarget.value)}
    placeholder="Search"
    icon={<img src={icon} alt="search-icon" className="h-4" />}
    className="md:min-w-[400px]"
    {...props}
  />
);

export default Search;
