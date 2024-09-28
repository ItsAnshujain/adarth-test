import { NativeSelect } from '@mantine/core';
import React, { useState } from 'react';
import { ChevronDown } from 'react-feather';

const NativeDropdownSelect = () => {
  const [value, setValue] = useState();

  return (
    <NativeSelect
      value={value}
      onChange={e => setValue(e.target.value)}
      data={['1000', '2000', '5000', '10000']}
      styles={{ rightSection: { pointerEvents: 'none' } }}
      rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
      rightSectionWidth={40}
    />
  );
};

export default NativeDropdownSelect;
