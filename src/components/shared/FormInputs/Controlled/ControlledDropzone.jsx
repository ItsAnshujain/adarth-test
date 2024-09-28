import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import Dropzone from '../Dropzone';

const ControlledDropzone = ({ name, children, ...props }) => {
  const form = useFormContext();
  const { field, fieldState } = useController({
    name,
    control: form.control,
  });

  return (
    <Dropzone
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
      {...props}
    >
      {children}
    </Dropzone>
  );
};

export default ControlledDropzone;
