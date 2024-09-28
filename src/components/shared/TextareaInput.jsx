import { Textarea as MantineTextarea } from '@mantine/core';
import React, { forwardRef } from 'react';
import { useFormContext } from '../../context/formContext';

const TextareaInput = forwardRef(
  ({ wrapperClassName = '', name, errors, styles, ...props }, ref) => {
    const form = useFormContext();

    return (
      <div className={wrapperClassName}>
        <MantineTextarea
          ref={ref}
          name={name}
          size="sm"
          radius="sm"
          minRows={5}
          maxRows={5}
          styles={styles}
          error={errors}
          {...form.getInputProps(name)}
          {...props}
        />
      </div>
    );
  },
);

export default TextareaInput;
