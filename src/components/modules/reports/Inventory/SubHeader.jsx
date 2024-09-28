import { Button, Image, Text } from '@mantine/core';
import React, { useState } from 'react';
import { ChevronDown } from 'react-feather';
import { useClickOutside } from '@mantine/hooks';
import Filter from '../../inventory/Filter';
import calendar from '../../../../assets/data-table.svg';
import DateRange from '../../../DateRange';

const SubHeader = ({ title = '' }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const ref = useClickOutside(() => setShowDatePicker(false));
  const toggleFilter = () => setShowFilter(!showFilter);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  return (
    <div className="h-[60px] flex justify-between items-center">
      <div className="pl-5">
        <Text size="lg" weight="bold">
          {title}
        </Text>
      </div>
      <div className="flex justify-around">
        <div ref={ref} className="relative mr-2">
          <Button onClick={toggleDatePicker} variant="default">
            <Image src={calendar} className="h-5" alt="calendar" />
          </Button>
          {showDatePicker && (
            <div className="absolute z-20 -translate-x-[450px] bg-white -top-0.3">
              <DateRange handleClose={toggleDatePicker} dateKeys={['from', 'to']} />
            </div>
          )}
        </div>

        <div className="mr-2">
          <Button onClick={toggleFilter} variant="default" className="font-medium">
            <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
          </Button>
          {showFilter && <Filter isOpened={showFilter} setShowFilter={setShowFilter} />}
        </div>
      </div>
    </div>
  );
};

export default SubHeader;
