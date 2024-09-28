import React from 'react';
import { MultiSelect as MantineMultiSelect } from '@mantine/core';
import { useFormContext } from '../../context/formContext';

const AsyncMultiSelect = ({ options = [], name, styles, ...props }) => {
  const form = useFormContext();
  const { onChange, value, error } = form.getInputProps(name);

  const handleValueChanges = arrOfIds => {
    const arrOfObjs = options.filter(optionItem => arrOfIds.some(id => optionItem.value === id));
    onChange(arrOfObjs);
  };

  return (
    <MantineMultiSelect
      {...props}
      data={options}
      styles={styles}
      error={error}
      value={value?.map(item => item?.value)}
      onChange={handleValueChanges}
    />
  );
};

export default AsyncMultiSelect;
