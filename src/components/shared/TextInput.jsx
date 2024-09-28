import React, { forwardRef } from 'react';
import { TextInput as MantineTextInput } from '@mantine/core';
import { useFormContext } from '../../context/formContext';

const TextInput = forwardRef(({ name, errors, styles, ...props }, ref) => {
  const form = useFormContext();

  return (
    <MantineTextInput
      ref={ref}
      name={name}
      styles={styles}
      error={errors}
      {...form.getInputProps(name)}
      {...props}
    />
  );
});

export default TextInput;
