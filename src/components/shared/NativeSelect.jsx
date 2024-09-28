import { NativeSelect as MantineNativeSelect } from '@mantine/core';
import React, { useState } from 'react';
import { ChevronDown } from 'react-feather';
import { useFormContext } from '../../context/formContext';

const NativeSelect = ({ options = [], name, errors, styles, ...props }) => {
  const [value, setValue] = useState();
  const form = useFormContext();

  return (
    <MantineNativeSelect
      value={value}
      onChange={e => setValue(e.target.value)}
      data={options}
      styles={styles}
      rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
      rightSectionWidth={40}
      error={errors}
      {...form.getInputProps(name)}
      {...props}
    />
  );
};

export default NativeSelect;
