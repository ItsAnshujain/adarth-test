import { Button, Image } from '@mantine/core';
import { IconPlus } from '@tabler/icons';
import { ChevronDown } from 'react-feather';
import { useState } from 'react';
import { useClickOutside } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import DateRange from '../../DateRange';
import calendar from '../../../assets/data-table.svg';
import Filter from './Filter';

const LeadsListHeader = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const ref = useClickOutside(() => setShowDatePicker(false));
  const toggleFilter = () => setShowFilter(!showFilter);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  return (
    <div className="flex items-center justify-between">
      <div className="font-bold text-lg">Lead List</div>
      <div className="flex">
        <div ref={ref} className="relative mr-2">
          <Button onClick={toggleDatePicker} variant="default">
            <Image src={calendar} className="h-5" alt="calendar" />
          </Button>
          {showDatePicker && (
            <div className="absolute z-20 -translate-x-[450px] bg-white -top-0.3">
              <DateRange
                handleClose={toggleDatePicker}
                dateKeys={['from', 'to']}
                dateRangeClassNames={{ root: 'h-[50vh]' }}
              />
            </div>
          )}
        </div>
        <div className="mr-2">
          <Button onClick={toggleFilter} variant="default" className="font-medium">
            <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
          </Button>
          {showFilter && <Filter isOpened={showFilter} setShowFilter={setShowFilter} />}
        </div>
        <Button
          component={Link}
          to="/leads/add-lead"
          leftIcon={<IconPlus />}
          className="bg-purple-450"
        >
          Add Lead
        </Button>
      </div>
    </div>
  );
};

export default LeadsListHeader;
