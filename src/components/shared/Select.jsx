import React from 'react';
import { Select as MantineSelect } from '@mantine/core';
import { ChevronDown } from 'react-feather';
import { useFormContext } from '../../context/formContext';

const styles = {
  label: {
    marginBottom: 8,
    fontWeight: 700,
    fontSize: 16,
  },
  input: {
    borderRadius: 0,
    padding: 8,
  },
};

const Select = ({ options = [], name, ...props }) => {
  const form = useFormContext();
  const { onChange, value, error } = form.getInputProps(name);

  return (
    <MantineSelect
      {...props}
      data={options}
      styles={styles}
      error={error}
      value={value?.value}
      rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
      onChange={val => {
        onChange(options?.find(item => item?.value === val));
      }}
    />
  );
};

export default Select;
