import React from 'react';
import { useFormContext } from 'react-hook-form';
import TextareaInput from '../Textarea';

const ControlledTextarea = ({ name, ...props }) => {
  const form = useFormContext();

  const getError = () => {
    if (name?.includes('.')) {
      const errorPart = name?.split('.');
      let error = form.formState.errors;
      errorPart.forEach(item => {
        if (item) error = error?.[item];
      });
      return error?.message;
    }
    return form.formState?.errors?.[name]?.message;
  };

  return <TextareaInput {...props} {...form.register(name)} error={getError()} />;
};

export default ControlledTextarea;
