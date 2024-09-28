import { useCallback, useEffect, useState } from 'react';
import { Accordion, Checkbox, Button, Drawer, RangeSlider, NumberInput } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { serialize } from '../../../utils';
import { useFetchMasters } from '../../../apis/queries/masters.queries';

const styles = {
  title: { fontWeight: 'bold' },
};
const sliderStyle = {
  label: {
    backgroundColor: '#4B0DAF',
  },
  markLabel: {
    display: 'none',
  },
};

const Filter = ({ isOpened, setShowFilter }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusArr, setStatusArr] = useState([]);
  const [_, setDynamicNumInput] = useState({
    minPrice: 0,
    maxPrice: 3000000,
    minPlace: 0,
    maxPlace: 10000,
  });
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const totalPlacesMin = searchParams.get('totalPlacesMin');
  const totalPlacesMax = searchParams.get('totalPlacesMax');

  const proposalQuery = useFetchMasters(
    serialize({ type: 'proposal_status', parentId: null, limit: 100, page: 1 }),
  );

  const handleStatusArr = stat => {
    let tempArr = [...statusArr]; // TODO: use immmer
    if (tempArr.some(item => item === stat)) {
      tempArr = tempArr.filter(item => item !== stat);
    } else {
      tempArr.push(stat);
    }

    setStatusArr(tempArr);
  };

  const renderDynamicOptionsArr = useCallback(
    data =>
      data?.map(item => (
        <div className="flex gap-2 mb-2" key={item?._id}>
          <Checkbox
            onChange={event => handleStatusArr(event.target.value)}
            label={item?.name}
            defaultValue={item?._id}
            checked={statusArr.includes(item._id)}
          />
        </div>
      )),
    [statusArr],
  );

  const handleNavigationByFilter = () => {
    searchParams.delete('status');
    statusArr.forEach(item => searchParams.append('status', item));
    searchParams.set('page', 1);
    setSearchParams(searchParams);
    setShowFilter(false);
  };

  const handleResetParams = () => {
    searchParams.delete('status');
    searchParams.delete('priceMin');
    searchParams.delete('priceMax');
    searchParams.delete('totalPlacesMin');
    searchParams.delete('totalPlacesMax');
    setSearchParams(searchParams);
    setStatusArr([]);
  };

  const handleMinPrice = e => {
    setDynamicNumInput(prevState => ({ ...prevState, minPrice: e }));
    searchParams.set('priceMin', e);
    searchParams.set('priceMax', searchParams.get('priceMax') || 3000000);
  };
  const handleMaxPrice = e => {
    setDynamicNumInput(prevState => ({ ...prevState, maxPrice: e }));
    searchParams.set('priceMax', e);
    searchParams.set('priceMin', searchParams.get('priceMin') || 0);
  };
  const handleSliderChange = val => {
    setDynamicNumInput(prevState => ({ ...prevState, minPrice: val[0] }));
    setDynamicNumInput(prevState => ({ ...prevState, maxPrice: val[1] }));
    searchParams.set('priceMin', val[0]);
    searchParams.set('priceMax', val[1]);
  };

  const handleMinPlace = e => {
    setDynamicNumInput(prevState => ({ ...prevState, minPlace: e }));
    searchParams.set('totalPlacesMin', e);
    searchParams.set('totalPlacesMax', searchParams.get('totalPlacesMax') || 10000);
  };
  const handleMaxPlace = e => {
    setDynamicNumInput(prevState => ({ ...prevState, maxPlace: e }));
    searchParams.set('totalPlacesMax', e);
    searchParams.set('totalPlacesMin', searchParams.get('totalPlacesMin') || 0);
  };
  const handlePlacesSliderChange = val => {
    setDynamicNumInput(prevState => ({ ...prevState, minPlace: val[0] }));
    setDynamicNumInput(prevState => ({ ...prevState, maxPlace: val[1] }));
    searchParams.set('totalPlacesMin', val[0]);
    searchParams.set('totalPlacesMax', val[1]);
  };

  useEffect(() => {
    setStatusArr(searchParams.getAll('status'));
  }, [searchParams]);

  return (
    <Drawer
      className="overflow-auto"
      overlayOpacity={0.1}
      overlayBlur={0}
      size="sm"
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
        <Button onClick={handleResetParams} className="border-black text-black radius-md mr-3">
          Reset
        </Button>
        <Button
          variant="default"
          className="mb-3 bg-purple-450 text-white"
          onClick={handleNavigationByFilter}
        >
          Apply Filters
        </Button>
      </div>
      <div className="flex text-gray-400 flex-col gap-4">
        <Accordion>
          <Accordion.Item value="status" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={proposalQuery.isLoading}>
              <p className="text-lg">Status</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderDynamicOptionsArr(proposalQuery.data?.docs)}</div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="price" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Price</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex justify-between gap-8">
                    <div>
                      <NumberInput
                        value={
                          priceMin && !Number.isNaN(parseInt(priceMin, 10))
                            ? parseInt(priceMin, 10)
                            : 0
                        }
                        onChange={handleMinPrice}
                        label="Min"
                      />
                    </div>
                    <div>
                      <NumberInput
                        value={
                          priceMax && !Number.isNaN(parseInt(priceMax, 10))
                            ? parseInt(priceMax, 10)
                            : 3000000
                        }
                        onChange={handleMaxPrice}
                        label="Max"
                      />
                    </div>
                  </div>
                  <div>
                    <RangeSlider
                      onChange={handleSliderChange}
                      min={0}
                      max={3000000}
                      step={1000}
                      styles={sliderStyle}
                      value={[
                        priceMin && !Number.isNaN(parseInt(priceMin, 10))
                          ? parseInt(priceMin, 10)
                          : 0,
                        priceMax && !Number.isNaN(parseInt(priceMax, 10))
                          ? parseInt(priceMax, 10)
                          : 3000000,
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="total-places" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Total Places</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex justify-between gap-8">
                    <div>
                      <NumberInput
                        value={
                          totalPlacesMin && !Number.isNaN(parseInt(totalPlacesMin, 10))
                            ? parseInt(totalPlacesMin, 10)
                            : 0
                        }
                        onChange={handleMinPlace}
                        label="Min"
                      />
                    </div>
                    <div>
                      <NumberInput
                        value={
                          totalPlacesMax && !Number.isNaN(parseInt(totalPlacesMax, 10))
                            ? parseInt(totalPlacesMax, 10)
                            : 10000
                        }
                        onChange={handleMaxPlace}
                        label="Max"
                      />
                    </div>
                  </div>
                  <div>
                    <RangeSlider
                      onChange={handlePlacesSliderChange}
                      min={0}
                      max={10000}
                      styles={sliderStyle}
                      value={[
                        totalPlacesMin && !Number.isNaN(parseInt(totalPlacesMin, 10))
                          ? parseInt(totalPlacesMin, 10)
                          : 0,
                        totalPlacesMax && !Number.isNaN(parseInt(totalPlacesMax, 10))
                          ? parseInt(totalPlacesMax, 10)
                          : 10000,
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </Drawer>
  );
};

export default Filter;
