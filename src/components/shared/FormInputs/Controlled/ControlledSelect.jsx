import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import Select from '../Select';

const ControlledSelect = ({ name, ...props }) => {
  const form = useFormContext();
  const { field, fieldState } = useController({
    name,
    control: form.control,
  });

  return <Select {...props} {...field} error={fieldState.error?.message} />;
};

export default ControlledSelect;
