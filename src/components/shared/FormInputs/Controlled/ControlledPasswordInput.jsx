import React from 'react';
import { useFormContext } from 'react-hook-form';
import PasswordInput from '../PasswordInput';

const ControlledPasswordInput = ({ name, ...props }) => {
  const form = useFormContext();

  return (
    <PasswordInput
      {...form.register(name)}
      error={form.formState?.errors?.[name]?.message}
      {...props}
    />
  );
};

export default ControlledPasswordInput;
