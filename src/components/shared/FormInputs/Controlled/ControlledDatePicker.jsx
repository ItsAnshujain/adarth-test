import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import DatePicker from '../DatePicker';

const ControlledDatePicker = ({ name, ...props }) => {
  const form = useFormContext();
  const { field, fieldState } = useController({
    name,
    control: form.control,
  });

  return <DatePicker {...props} {...field} error={fieldState.error?.message} />;
};

export default ControlledDatePicker;
