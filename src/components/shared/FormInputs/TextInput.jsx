import React, { forwardRef } from 'react';
import { TextInput as MantineTextInput } from '@mantine/core';

const TextInput = forwardRef(({ ...props }, ref) => (
  <MantineTextInput
    ref={ref}
    classNames={{ label: 'font-medium text-primary text-base mb-2', input: 'border-gray-450' }}
    {...props}
  />
));

TextInput.displayName = 'TextInput';
export default TextInput;
