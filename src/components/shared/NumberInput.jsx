import React, { forwardRef } from 'react';
import { NumberInput as MantineNumberInput } from '@mantine/core';
import { useFormContext } from '../../context/formContext';

const NumberInput = forwardRef(({ name, errors, styles, ...props }, ref) => {
  const form = useFormContext();

  return (
    <MantineNumberInput
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

export default NumberInput;
