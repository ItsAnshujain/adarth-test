import { useCallback, useState } from 'react';
import { Accordion, Button, Drawer, Radio } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';

const styles = { title: { fontWeight: 'bold' } };

const inititalFilterData = {
  'by': {
    'state': 'State',
    'city': 'City',
  },
};

const RevenueFilter = ({
  isOpened,
  setShowFilter,
  handleQueryByLocation = () => {},
  queryByLocation,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOptions, setFilterOptions] = useState({ by: queryByLocation?.by || '' });

  const handleCheckedValues = (filterValues, filterKey) =>
    setFilterOptions(prevState => ({ ...prevState, [filterKey]: filterValues }));

  const renderStaticOptions = useCallback(
    (filterDataObj, filterKey) =>
      Object.keys(filterDataObj).map(item => (
        <div className="flex gap-2 mb-2" key={item}>
          <Radio
            onChange={event => handleCheckedValues(event.target.value, filterKey)}
            label={filterDataObj[item]}
            defaultValue={item}
            checked={filterOptions[filterKey] === item}
          />
        </div>
      )),
    [filterOptions.by],
  );

  const handleApply = () => {
    handleQueryByLocation(prevState => ({ ...prevState, ...filterOptions }));
    searchParams.set('by', filterOptions.by);
    setSearchParams(searchParams);
    setShowFilter(false);
  };

  return (
    <Drawer
      className="overflow-auto"
      overlayOpacity={0.1}
      overlayBlur={0}
      size="lg"
      transition="slide-down"
      transitionDuration={1350}
      transitionTimingFunction="ease-in-out"
      padding="xl"
      position="right"
      opened={isOpened}
      styles={styles}
      title="Filters"
      onClose={() => setShowFilter(false)}
    >
      <div className="w-full flex justify-end">
        <div className="w-full flex justify-end">
          <Button variant="default" className="mb-3 bg-purple-450 text-white" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </div>
      <div className="flex text-gray-400 flex-col gap-4">
        <Accordion>
          <Accordion.Item value="by" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">State Or City</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderStaticOptions(inititalFilterData.by, 'by')}</div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </Drawer>
  );
};

export default RevenueFilter;
