import React from 'react';
import { useFormContext } from 'react-hook-form';
import TextInput from '../TextInput';

const ControlledTextInput = ({ name, ...props }) => {
  const form = useFormContext();

  const getError = () => {
    if (name.includes('.')) {
      const errorPart = name.split('.');
      let error = form.formState.errors;
      errorPart.forEach(item => {
        if (item) error = error?.[item];
      });

      return error?.message;
    }
    return form.formState?.errors?.[name]?.message;
  };

  return <TextInput {...form.register(name)} error={getError()} {...props} />;
};

export default ControlledTextInput;
