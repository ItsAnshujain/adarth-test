import { Accordion, Button, Drawer, NumberInput, Radio, RangeSlider } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { serialize } from '../../../utils';
import { useFetchMasters } from '../../../apis/queries/masters.queries';

const styles = { title: { fontWeight: 'bold' } };
const sliderStyle = {
  label: {
    backgroundColor: '#4B0DAF',
  },
  markLabel: {
    display: 'none',
  },
};

const defaultValue = {
  status: '',
  type: '',
  priceMin: 0,
  priceMax: 3000000,
  healthMin: 0,
  healthMax: 100,
  totalSpacesMin: 0,
  totalSpacesMax: 10000,
};

const MinMaxField = ({ minKey, maxKey, setQuery, state, label }) => {
  const min = state[minKey];
  const max = state[maxKey];

  const handleMin = val => {
    setQuery(minKey, val);
    setQuery(maxKey, max || maxKey === 'healthMax' ? 100 : maxKey === 'priceMax' ? 3000000 : 10000);
  };

  const handleMax = val => {
    setQuery(maxKey, val);
    setQuery(minKey, min || 0);
  };

  return (
    <Accordion.Item value={label} className="mb-4 rounded-xl border">
      <Accordion.Control>
        <p className="text-lg">{label}</p>
      </Accordion.Control>
      <Accordion.Panel>
        <div className="mt-2">
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex justify-between gap-8">
              <div>
                <NumberInput value={min} onChange={handleMin} label="Min" />
              </div>
              <div>
                <NumberInput value={max} onChange={handleMax} label="Max" />
              </div>
            </div>
            <div>
              <RangeSlider
                onChange={val => {
                  setQuery(minKey, val[0]);
                  setQuery(maxKey, val[1]);
                }}
                min={0}
                step={1000}
                max={label === 'Health Status' ? 100 : label === 'Price' ? 3000000 : 10000}
                styles={sliderStyle}
                value={[min, max]}
                defaultValue={[
                  0,
                  label === 'Health Status' ? 100 : label === 'Price' ? 3000000 : 10000,
                ]}
              />
            </div>
          </div>
        </div>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

const CampaignFilter = ({ isOpened, onClose = () => {} }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState(defaultValue);

  const { data: campaignStatus } = useFetchMasters(
    serialize({ type: 'campaign_status', limit: 100, page: 1 }),
  );

  const handleApply = () => {
    searchParams.set('page', 1);
    setSearchParams(searchParams);
    onClose();
  };

  const handleReset = () => {
    Object.keys(defaultValue).forEach(item => {
      searchParams.delete(item);
    });
    setSearchParams(searchParams);
    setState(defaultValue);
  };

  const setQuery = (key, val) => {
    setState(p => ({ ...p, [key]: val }));
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);
  };

  useEffect(() => {
    const obj = {};

    Object.keys(defaultValue).forEach(item => {
      const val = searchParams.get(item);

      if (val !== undefined) {
        if (typeof defaultValue[item] === 'number') {
          obj[item] =
            Number(val) || item.toLowerCase().includes('max')
              ? item === 'healthMax'
                ? 100
                : item === 'priceMax'
                ? 3000000
                : 10000
              : 0;
        } else {
          obj[item] = val || '';
        }
      }
    });

    setState(p => ({ ...p, ...obj }));
  }, []);

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
      onClose={onClose}
    >
      <div className="w-full flex justify-end">
        <Button onClick={handleReset} className="border-black text-black radius-md mr-3">
          Reset
        </Button>
        <Button variant="default" className="mb-3 bg-purple-450 text-white" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
      <div className="flex text-gray-400 flex-col gap-4">
        <Accordion>
          <Accordion.Item value="Status" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Status</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                {campaignStatus?.docs?.map(item => (
                  <div className="flex gap-2 mb-2" key={item._id}>
                    <Radio
                      onChange={() => setQuery('status', item._id)}
                      label={item.name}
                      checked={state.status === item._id}
                    />
                  </div>
                ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Type" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Type</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                {[
                  { label: 'Predefined', value: 'predefined' },
                  { label: 'Customized', value: 'customized' },
                ].map(item => (
                  <div className="flex gap-2 mb-2" key={item.value}>
                    <Radio
                      onChange={() => setQuery('type', item.value)}
                      label={item.label}
                      defaultValue={item}
                      checked={state.type === item.value}
                    />
                  </div>
                ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
          <MinMaxField
            label="Price"
            minKey="priceMin"
            maxKey="priceMax"
            setQuery={setQuery}
            state={state}
          />
          {/* <MinMaxField
            label="Health Status"
            minKey="healthMin"
            maxKey="healthMax"
            setQuery={setQuery}
            state={state}
          /> */}
          <MinMaxField
            label="Total Spaces"
            minKey="totalSpacesMin"
            maxKey="totalSpacesMax"
            setQuery={setQuery}
            state={state}
          />
        </Accordion>
      </div>
    </Drawer>
  );
};

export default CampaignFilter;
