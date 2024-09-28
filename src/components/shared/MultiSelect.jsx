import React, { useState } from 'react';
import { MultiSelect as MantineMultiSelect } from '@mantine/core';
import { useFormContext } from '../../context/formContext';

const MultiSelect = ({ options = [], name, errors, styles, ...props }) => {
  const [value, setValue] = useState([]);
  const form = useFormContext();

  return (
    <MantineMultiSelect
      value={value}
      onChange={setValue}
      name={name}
      styles={styles}
      data={options}
      error={errors}
      {...form.getInputProps(name)}
      {...props}
    />
  );
};

export default MultiSelect;
