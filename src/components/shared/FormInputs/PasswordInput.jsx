import React, { forwardRef } from 'react';
import { PasswordInput as MantinePasswordInput } from '@mantine/core';

const PasswordInput = forwardRef(({ ...props }, ref) => (
  <MantinePasswordInput
    ref={ref}
    classNames={{ label: 'font-medium text-primary text-base mb-2', input: 'border-gray-450' }}
    {...props}
  />
));

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
