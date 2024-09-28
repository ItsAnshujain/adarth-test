import React, { forwardRef } from 'react';
import { Select as MantineSelect } from '@mantine/core';

const Select = forwardRef(({ ...props }, ref) => (
  <MantineSelect
    ref={ref}
    classNames={{
      label: 'font-medium text-gray-700 text-base mb-2',
      input: 'border-[1px] border-gray-450',
      item: ' data-[selected]:bg-primary hover:data-[selected]:bg-primary',
    }}
    {...props}
    styles={{ rightSection: { pointerEvents: 'none' } }}
  />
));

Select.displayName = 'Select';
export default Select;
