import React, { useEffect } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import Select from '../Select';

const ControlledSelect = ({ name, userData, ...props }) => {
  const form = useFormContext();
  const { field, fieldState } = useController({
    name,
    control: form.control,
  });

  // Filter options based on the presence of a special user
  const filteredOptions = props.data.filter(option => {
    if (userData?.company==='Sri Garima Publicity' || userData?.role==='admin') {
      return true;
    }
    return option.value !== 'fill;custom'; 
  });


  return (
    <Select
      {...props}
      {...field}
      data={filteredOptions}
      error={fieldState.error?.message}
    />
  );
};

export default ControlledSelect;
