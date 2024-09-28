import React, { forwardRef } from 'react';
import { NumberInput as MantineNumberInput } from '@mantine/core';

const NumberInput = forwardRef(({ ...props }, ref) => (
  <MantineNumberInput
    ref={ref}
    classNames={{ label: 'font-medium text-primary text-base mb-2', input: 'border-gray-450' }}
    hideControls
    {...props}
  />
));

NumberInput.displayName = 'NumberInput';
export default NumberInput;
