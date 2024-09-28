import React, { useState } from 'react';
import dayjs from 'dayjs';
import { DatePickerInput } from '@mantine/dates';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { createStyles } from '@mantine/core';
import { DATE_FORMAT } from '../utils/constants';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const useStyles = createStyles({
  outside: { opacity: 0 },
  disabled: { color: '#ced4da !important' },
  weekend: { color: '#495057 !important' },
  selectedRange: { color: '#FFF !important' },
});

const DateRangeSelector = ({ dateValue, onChange, everyDayUnitsData = {}, ...props }) => {
  const { classes, cx } = useStyles();
  const [, setValue] = useState([null, null]);

  /**
   *
   * @param {Date} date
   */
  const excludeBookedDates = date => {
    const formattedDate = dayjs(date).format(DATE_FORMAT);
    const selectedDate = everyDayUnitsData[formattedDate];
    if (!selectedDate) return false;
    return selectedDate.remUnit === 0;
  };

  const handleChange = val => {
    setValue(val);
    if (val[0] === null && val[1] === null) onChange(val);
    if (onChange && val[0] && val[1]) onChange(val);
  };

  return (
    <DatePickerInput
      type="range"
      placeholder="Pick dates range"
      onChange={handleChange}
      excludeDate={excludeBookedDates}
      disableOutsideEvents
      allowSingleDateInRange
      hideOutsideDates
      defaultValue={dateValue}
      dayClassName={(_, modifiers) =>
        cx({
          [classes.outside]: modifiers.outside,
          [classes.weekend]: modifiers.weekend,
          [classes.selectedRange]: modifiers.selectedInRange,
          [classes.disabled]: modifiers.disabled,
        })
      }
      {...props}
      clearable
      classNames={{ calendar: 'h-[290px]' }}
    />
  );
};

export default DateRangeSelector;
