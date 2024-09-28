import React from 'react';
import { PasswordInput as MantinePasswordInput } from '@mantine/core';
import { useFormContext } from '../../context/formContext';

const PasswordInput = ({ name, errors, styles, ...props }) => {
  const form = useFormContext();

  return (
    <MantinePasswordInput
      name={name}
      styles={styles}
      error={errors}
      {...form.getInputProps(name)}
      {...props}
    />
  );
};

export default PasswordInput;
