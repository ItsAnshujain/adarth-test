import { Select } from '@mantine/core';
import { ChevronDown } from 'react-feather';

const data = ['10', '20', '40', '80', '100'];

const ImagesPerPage = ({ setCount, count = '10' }) => (
  <div className="flex items-center gap-1">
    View images :
    <Select
      variant="unstyled"
      defaultValue={count}
      data={data}
      onChange={setCount}
      classNames={{
        input: 'text-gray-500',
        wrapper: 'w-[65px]',
        rightSection: 'pointer-events-none',
      }}
      rightSection={<ChevronDown size={16} />}
    />
  </div>
);

export default ImagesPerPage;
