import { useState, useEffect } from 'react';
import { Button, MultiSelect } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useDistinctCities } from '../../../apis/queries/inventory.queries';
import CustomDateRangePicker from '../../CustomDateRangePicker';

const VacantInventoryFilter = ({ onSubmit, onClose, searchParamQueries }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [city, setCity] = useState('');
  const distinctCityQuery = useDistinctCities();

  const handleSetStartDate = startingDate => {
    setDateRange([startingDate, dateRange[1]]);
  };
  const handleSetEndDate = endDate => {
    setDateRange([dateRange[0], endDate]);
  };

  const handleRangeSetting = val => {
    if (val[1] < val[0]) {
      setDateRange([null, val[1]]);

      return;
    }

    setDateRange(val);
  };

  const handleSubmit = () => {
    if (!dateRange[0] && !dateRange[1]) {
      showNotification({
        message: 'Please select date range',
      });
      return;
    }

    onSubmit(city, dateRange[0], dateRange[1]);
  };

  useEffect(() => {
    setDateRange(p => {
      const newState = [...p];
      ['from', 'to'].forEach((item, index) => {
        newState[index] =
          searchParamQueries.get(item) !== null ? new Date(searchParamQueries.get(item)) : null;
      });

      return newState;
    });
    setCity(searchParamQueries.get('cities')?.split(','));
  }, []);

  return (
    <div className=" h-[520px] relative">
      <div className="px-6 pb-6 flex flex-col">
        <CustomDateRangePicker
          value={dateRange}
          handleSetStartDate={handleSetStartDate}
          handleSetEndDate={handleSetEndDate}
          handleRangeSetting={handleRangeSetting}
        />
        <MultiSelect
          label="City"
          name="city"
          placeholder="Select..."
          size="md"
          classNames={{ label: 'font-medium mb-0' }}
          data={distinctCityQuery?.data || []}
          className="mt-4"
          onChange={setCity}
          value={city}
          clearable
          searchable
        />

        <div className="flex gap-4 bottom-0 absolute w-[93%]">
          <Button className="secondary-button font-medium text-base mt-2 w-full" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="primary-button font-medium text-base mt-2 w-full"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VacantInventoryFilter;
