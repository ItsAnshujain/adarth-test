import React, { forwardRef } from 'react';
import { DatePickerInput as MantineDatePicker } from '@mantine/dates';
import { createStyles } from '@mantine/core';

export const useStyles = createStyles({
  outside: { opacity: 0 },
  disabled: { color: '#ced4da !important' },
  weekend: { color: '#495057 !important' },
  selected: { color: '#FFF !important' },
});

const DatePicker = forwardRef(({ ...props }, ref) => {
  const { classes, cx } = useStyles();

  return (
    <MantineDatePicker
      ref={ref}
      classNames={{
        label: 'font-medium text-gray-700 text-base mb-2',
        input: 'border-[1px] border-gray-450',
      }}
      dayClassName={(_, modifiers) =>
        cx({
          [classes.outside]: modifiers.outside,
          [classes.weekend]: modifiers.weekend,
          [classes.disabled]: modifiers.disabled,
          [classes.selected]: modifiers.selected,
        })
      }
      {...props}
    />
  );
});

DatePicker.displayName = 'DatePicker';
export default DatePicker;
