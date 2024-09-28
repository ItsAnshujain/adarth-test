import { Select } from '@mantine/core';
import { ChevronDown } from 'react-feather';

const data = ['10', '20', '40', '80', '100'];

const RowsPerPage = ({ setCount, count }) => (
  <div className="flex items-center gap-3 text-sm text-gray-6">
    Rows Per Page :
    <Select
      variant="unstyled"
      defaultValue={count}
      data={data}
      onChange={setCount}
      styles={{
        rightSection: { pointerEvents: 'none' },
      }}
      classNames={{ wrapper: 'w-[50px] md:w-[63px] pl-1 md:pl-0' }}
      rightSection={<ChevronDown size={16} className="md:mt-[1px] mr-1" />}
    />
  </div>
);

export default RowsPerPage;
