import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button, createStyles } from '@mantine/core';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { DATE_FORMAT } from '../utils/constants';
import CustomDateRangePicker from './CustomDateRangePicker';

const styles = {
  monthPickerControlActive: { backgroundColor: '#4B0DAF !important' },
  yearPickerControlActive: { backgroundColor: '#4B0DAF !important' },
};

export const useStyles = createStyles({
  outside: { opacity: 0 },
  disabled: { color: '#ced4da !important' },
  weekend: { color: '#495057 !important' },
  selectedRange: { color: '#FFF !important' },
});

const DateRange = ({
  handleClose = () => {},
  dateKeys = ['startDate', 'endDate'],
  rangeCalendarMinDate,
  datePickerMinDate,
  dateRangeClassNames = {},
}) => {
  const { classes, cx } = useStyles();
  const [value, setValue] = useState([null, null]);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSetStartDate = startingDate => {
    searchParams.set(dateKeys[0], startingDate);
    setValue(prev => {
      if (prev[1] < startingDate) return [startingDate, null];
      return [startingDate, prev[1]];
    });
  };

  const handleSetEndDate = endingDate => {
    searchParams.set(dateKeys[1], endingDate);
    setValue(prev => {
      if (endingDate < prev[0]) return [null, endingDate];
      return [prev[0], endingDate];
    });
  };

  const handleRangeSetting = val => {
    if (val[1] < val[0]) {
      setValue([null, val[1]]);
      searchParams.set(dateKeys[1], val[1]);
      searchParams.delete(dateKeys[0]);

      return;
    }

    dateKeys.forEach((item, index) => {
      if (val[index]) searchParams.set(item, val[index]);
      else searchParams.delete(item);
    });
    setValue(val);
  };

  const handleClear = () => {
    setValue([null, null]);
    dateKeys.forEach(item => searchParams.delete(item));
    setSearchParams(searchParams);
  };

  useEffect(() => {
    setValue(p => {
      const newState = [...p];
      dateKeys.forEach((item, index) => {
        newState[index] = searchParams.get(item) !== null ? new Date(searchParams.get(item)) : null;
      });

      return newState;
    });
  }, []);

  return (
    <div
      className={classNames(
        'flex flex-col w-[605px] p-8 shadow-2xl overflow-auto',
        dateRangeClassNames.root,
      )}
    >
      <div className="flex justify-between pb-4 border-b">
        <div>
          <p className="text-2xl font-bold">Date Range</p>
        </div>
        <div className="flex gap-2">
          <Button className="hover:bg-white" onClick={handleClear} variant="outline" color="dark">
            Clear
          </Button>
          <Button className="bg-black text-white" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              dateKeys.forEach(item =>
                searchParams.set(item, dayjs(searchParams.get(item)).format(DATE_FORMAT)),
              );
              setSearchParams(searchParams);
              handleClose();
            }}
            className="bg-purple-450 flex align-center py-2 text-white rounded-md px-4"
          >
            Apply
          </Button>
        </div>
      </div>
      <CustomDateRangePicker
        classes={classes}
        value={value}
        minDate={rangeCalendarMinDate}
        handleSetStartDate={handleSetStartDate}
        datePickerMinDate={datePickerMinDate}
        handleRangeSetting={handleRangeSetting}
        styles={styles}
        handleSetEndDate={handleSetEndDate}
        cx={cx}
      />
    </div>
  );
};

export default DateRange;
