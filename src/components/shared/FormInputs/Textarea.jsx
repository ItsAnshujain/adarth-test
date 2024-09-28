import { Textarea as MantineTextarea } from '@mantine/core';
import React from 'react';

const Textarea = React.forwardRef(({ ...props }, ref) => (
  <MantineTextarea
    ref={ref}
    classNames={{
      label: 'font-medium text-gray-700 text-base mb-2',
      input: 'border-[1px] border-gray-400',
    }}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
export default Textarea;
