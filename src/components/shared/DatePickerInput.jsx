import React, { forwardRef } from 'react';
import { DatePickerInput as MantineDatePickerInput } from '@mantine/dates';
import { useFormContext } from '../../context/formContext';

const DatePickerInput = forwardRef(({ name, errors, styles, ...props }, ref) => {
  const form = useFormContext();

  return (
    <MantineDatePickerInput
      ref={ref}
      name={name}
      styles={styles}
      error={errors}
      hideControls
      {...form.getInputProps(name)}
      {...props}
    />
  );
});

export default DatePickerInput;
