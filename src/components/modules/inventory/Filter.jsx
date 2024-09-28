import { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  Button,
  Checkbox,
  Drawer,
  NumberInput,
  Radio,
  RangeSlider,
} from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { serialize } from '../../../utils';
import { useFetchMasters } from '../../../apis/queries/masters.queries';
import {
  useDistinctAdditionalTags,
  useDistinctCities,
} from '../../../apis/queries/inventory.queries';

const inititalFilterData = {
  'owner': {
    'all': 'All',
    'own': 'Own',
    'peer': 'Peers',
  },
  'tier': [
    {
      name: 'Tier 1',
      _id: 'tier_1',
    },
    {
      name: 'Tier 2',
      _id: 'tier_2',
    },
    {
      name: 'Tier 3',
      _id: 'tier_3',
    },
  ],
};
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
  owner: '',
  category: [],
  subCategory: [],
  mediaType: [],
  tier: [],
  zone: [],
  facing: [],
  tags: [],
  demographic: [],
  audience: [],
  additionalTags: [],
  cities: [],
};

const Filter = ({ isOpened, setShowFilter }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOptions, setFilterOptions] = useState(defaultValue);
  const [_, setDynamicNumInput] = useState({
    min: 0,
    max: 10000,
  });
  const widthMin = searchParams.get('widthMin');
  const widthMax = searchParams.get('widthMax');

  const heightMin = searchParams.get('heightMin');
  const heightMax = searchParams.get('heightMax');

  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const minFootFall = searchParams.get('minFootFall');
  const maxFootfall = searchParams.get('maxFootfall');

  const owner = searchParams.get('owner');
  const category = searchParams.get('category');
  const subCategory = searchParams.get('subCategory');
  const mediaType = searchParams.get('mediaType');
  const tier = searchParams.get('tier');
  const zone = searchParams.get('zone');
  const facing = searchParams.get('facing');
  const tags = searchParams.get('tags');
  const demographic = searchParams.get('demographic');
  const audience = searchParams.get('audience');
  const additionalTags = searchParams.get('additionalTags');
  const cities = searchParams.get('cities');

  const categoryQuery = useFetchMasters(
    serialize({ type: 'category', parentId: null, limit: 100, page: 1 }),
  );
  const subCategoryQuery = useFetchMasters(
    serialize({ parentId: filterOptions.category?.join(','), limit: 100, page: 1 }),
    !!filterOptions.category.length > 0,
  );
  const mediaTypeQuery = useFetchMasters(
    serialize({ type: 'media_type', parentId: null, limit: 100, page: 1 }),
  );
  const zoneQuery = useFetchMasters(
    serialize({ type: 'zone', parentId: null, limit: 100, page: 1 }),
  );
  const tagQuery = useFetchMasters(serialize({ type: 'tag', parentId: null, limit: 100, page: 1 }));
  const facingQuery = useFetchMasters(
    serialize({ type: 'facing', parentId: null, limit: 100, page: 1 }),
  );
  const demographicsQuery = useFetchMasters(
    serialize({ type: 'demographic', parentId: null, limit: 100, page: 1 }),
  );
  const audienceQuery = useFetchMasters(
    serialize({ type: 'audience', parentId: null, limit: 100, page: 1 }),
  );
  const additionalTagsQuery = useDistinctAdditionalTags();
  const distinctCityQuery = useDistinctCities();

  const handleCheckedValues = (filterValues, filterKey) => {
    setFilterOptions(prevState => ({ ...prevState, [filterKey]: filterValues }));
    searchParams.set(filterKey, filterValues);
  };

  const handleStatusArr = (stat, key) => {
    let tempArr = [...filterOptions[key]]; // TODO: use immmer
    if (tempArr.some(item => item === stat)) {
      tempArr = tempArr.filter(item => item !== stat);
    } else {
      tempArr.push(stat);
    }

    setFilterOptions({ ...filterOptions, [key]: [...tempArr] });
  };

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
    [filterOptions.owner],
  );

  const renderDynamicOptionsArr = useCallback(
    (data, filterKey) =>
      data?.map(item => (
        <div className="flex gap-2 mb-2" key={item?._id}>
          <Checkbox
            onChange={event => handleStatusArr(event.target.value, filterKey)}
            label={item?.name}
            defaultValue={item?._id}
            checked={filterOptions[filterKey].includes(item._id)}
          />
        </div>
      )),
    [
      filterOptions.owner,
      filterOptions.category,
      filterOptions.subCategory,
      filterOptions.mediaType,
      filterOptions.tier,
      filterOptions.zone,
      filterOptions.facing,
      filterOptions.tags,
      filterOptions.demographic,
      filterOptions.audience,
      filterOptions.additionalTags,
      filterOptions.cities,
    ],
  );

  const renderAdditionalTagsAndCities = useCallback(
    (data, filterKey) =>
      data?.map(item => (
        <div className="flex gap-2 mb-2" key={item}>
          <Checkbox
            onChange={event => handleStatusArr(event.target.value, filterKey)}
            label={item}
            defaultValue={item}
            checked={filterOptions[filterKey].includes(item)}
          />
        </div>
      )),
    [
      filterOptions.owner,
      filterOptions.category,
      filterOptions.subCategory,
      filterOptions.mediaType,
      filterOptions.tier,
      filterOptions.zone,
      filterOptions.facing,
      filterOptions.tags,
      filterOptions.demographic,
      filterOptions.audience,
      filterOptions.additionalTags,
      filterOptions.cities,
    ],
  );

  const handleNavigationByFilter = () => {
    Object.keys(filterOptions).forEach(item => {
      searchParams.delete(item);
    });

    searchParams.set('page', 1);
    if (filterOptions.owner !== '') searchParams.set('owner', filterOptions.owner);
    Object.keys(filterOptions).forEach(key => {
      if (filterOptions[key].length && Array.isArray(filterOptions[key])) {
        searchParams.append(key, filterOptions[key].join(','));
      }
    });
    setSearchParams(searchParams);
    setShowFilter(false);
  };

  const handleResetParams = () => {
    Object.keys(defaultValue).forEach(item => {
      searchParams.delete(item);
    });
    searchParams.delete('maxPrice');
    searchParams.delete('minPrice');
    searchParams.delete('minFootFall');
    searchParams.delete('maxFootfall');
    searchParams.delete('widthMax');
    searchParams.delete('widthMin');
    searchParams.delete('heightMin');
    searchParams.delete('heightMax');
    setSearchParams(searchParams);
    setFilterOptions(defaultValue);
  };

  const handleMinWidth = e => {
    setDynamicNumInput(prevState => ({ ...prevState, min: e }));
    searchParams.set('widthMin', e);
    searchParams.set('widthMax', searchParams.get('widthMax') || 3000000);
  };
  const handleMaxWidth = e => {
    setDynamicNumInput(prevState => ({ ...prevState, max: e }));
    searchParams.set('widthMax', e);
    searchParams.set('widthMin', searchParams.get('widthMin') || 0);
  };
  const handleWidthSlider = val => {
    setDynamicNumInput(prevState => ({ ...prevState, min: val[0] }));
    setDynamicNumInput(prevState => ({ ...prevState, max: val[1] }));
    searchParams.set('widthMin', val[0]);
    searchParams.set('widthMax', val[1]);
  };

  const handleMinHeight = e => {
    setDynamicNumInput(prevState => ({ ...prevState, min: e }));
    searchParams.set('heightMin', e);
    searchParams.set('heightMax', searchParams.get('heightMax') || 3000000);
  };
  const handleMaxHeight = e => {
    setDynamicNumInput(prevState => ({ ...prevState, max: e }));
    searchParams.set('heightMax', e);
    searchParams.set('heightMin', searchParams.get('heightMin') || 0);
  };
  const handleHeightSlider = val => {
    setDynamicNumInput(prevState => ({ ...prevState, min: val[0] }));
    setDynamicNumInput(prevState => ({ ...prevState, max: val[1] }));
    searchParams.set('heightMin', val[0]);
    searchParams.set('heightMax', val[1]);
  };

  const handleMinPrice = e => {
    setDynamicNumInput(prevState => ({ ...prevState, min: e }));
    searchParams.set('minPrice', e);
    searchParams.set('maxPrice', searchParams.get('maxPrice') || 3000000);
  };
  const handleMaxPrice = e => {
    setDynamicNumInput(prevState => ({ ...prevState, max: e }));
    searchParams.set('maxPrice', e);
    searchParams.set('minPrice', searchParams.get('minPrice') || 0);
  };
  const handleSliderChange = val => {
    setDynamicNumInput(prevState => ({ ...prevState, min: val[0] }));
    setDynamicNumInput(prevState => ({ ...prevState, max: val[1] }));
    searchParams.set('minPrice', val[0]);
    searchParams.set('maxPrice', val[1]);
  };

  const handleMinFootFall = e => {
    setDynamicNumInput(prevState => ({ ...prevState, minFootFall: e }));
    searchParams.set('minFootFall', e);
    searchParams.set('maxFootfall', searchParams.get('maxFootfall') || 10000);
  };
  const handleMaxFootFall = e => {
    setDynamicNumInput(prevState => ({ ...prevState, maxFootfall: e }));
    searchParams.set('maxFootfall', e);
    searchParams.set('minFootFall', searchParams.get('minFootFall') || 0);
  };
  const handleFootFallSliderChange = val => {
    setDynamicNumInput(prevState => ({ ...prevState, minFootFall: val[0] }));
    setDynamicNumInput(prevState => ({ ...prevState, maxFootfall: val[1] }));
    searchParams.set('minFootFall', val[0]);
    searchParams.set('maxFootfall', val[1]);
  };

  useEffect(() => {
    setFilterOptions(prevState => ({
      ...prevState,
      owner: owner || '',
      category: category?.split(',') || [],
      subCategory: subCategory?.split(',') || [],
      mediaType: mediaType?.split(',') || [],
      tier: tier?.split(',') || [],
      zone: zone?.split(',') || [],
      facing: facing?.split(',') || [],
      tags: tags?.split(',') || [],
      demographic: demographic?.split(',') || [],
      audience: audience?.split(',') || [],
      additionalTags: additionalTags?.split(',') || [],
      cities: cities?.split(',') || [],
    }));
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
          <Accordion.Item value="owner" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Inventory Owner</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderStaticOptions(inititalFilterData.owner, 'owner')}</div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="category" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={categoryQuery.isLoading}>
              <p className="text-lg">Category</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                {renderDynamicOptionsArr(categoryQuery.data?.docs, 'category')}
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="subCategory" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={subCategoryQuery.isLoading}>
              <p className="text-lg">Sub Category</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                {renderDynamicOptionsArr(subCategoryQuery.data?.docs, 'subCategory')}
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="mediaType" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={mediaTypeQuery.isLoading}>
              <p className="text-lg">Media Type</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                {renderDynamicOptionsArr(mediaTypeQuery.data?.docs, 'mediaType')}
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="city" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Tier</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderDynamicOptionsArr(inititalFilterData.tier, 'tier')}</div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="cities" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={distinctCityQuery.isLoading}>
              <p className="text-lg">Cities</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2 h-[300px] overflow-y-auto">
                {renderAdditionalTagsAndCities(distinctCityQuery.data, 'cities')}
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="width" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Width</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex justify-between gap-8">
                    <div>
                      <NumberInput
                        value={
                          widthMin && !Number.isNaN(parseInt(widthMin, 10))
                            ? parseInt(widthMin, 10)
                            : 0
                        }
                        onChange={handleMinWidth}
                        label="Min"
                      />
                    </div>
                    <div>
                      <NumberInput
                        value={
                          widthMax && !Number.isNaN(parseInt(widthMax, 10))
                            ? parseInt(widthMax, 10)
                            : 10000
                        }
                        onChange={handleMaxWidth}
                        label="Max"
                      />
                    </div>
                  </div>
                  <div>
                    <RangeSlider
                      onChange={handleWidthSlider}
                      min={0}
                      max={10000}
                      styles={sliderStyle}
                      step={1000}
                      value={[
                        widthMin && !Number.isNaN(parseInt(widthMin, 10))
                          ? parseInt(widthMin, 10)
                          : 0,
                        widthMax && !Number.isNaN(parseInt(widthMax, 10))
                          ? parseInt(widthMax, 10)
                          : 10000,
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="height" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Height</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex justify-between gap-8">
                    <div>
                      <NumberInput
                        value={
                          heightMin && !Number.isNaN(parseInt(heightMin, 10))
                            ? parseInt(heightMin, 10)
                            : 0
                        }
                        onChange={handleMinHeight}
                        label="Min"
                      />
                    </div>
                    <div>
                      <NumberInput
                        value={
                          heightMax && !Number.isNaN(parseInt(heightMax, 10))
                            ? parseInt(heightMax, 10)
                            : 10000
                        }
                        onChange={handleMaxHeight}
                        label="Max"
                      />
                    </div>
                  </div>
                  <div>
                    <RangeSlider
                      onChange={handleHeightSlider}
                      min={0}
                      max={10000}
                      styles={sliderStyle}
                      step={1000}
                      value={[
                        heightMin && !Number.isNaN(parseInt(heightMin, 10))
                          ? parseInt(heightMin, 10)
                          : 0,
                        heightMax && !Number.isNaN(parseInt(heightMax, 10))
                          ? parseInt(heightMax, 10)
                          : 10000,
                      ]}
                    />
                  </div>
                </div>
              </div>
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
                          minPrice && !Number.isNaN(parseInt(minPrice, 10))
                            ? parseInt(minPrice, 10)
                            : 0
                        }
                        onChange={handleMinPrice}
                        label="Min"
                      />
                    </div>
                    <div>
                      <NumberInput
                        value={
                          maxPrice && !Number.isNaN(parseInt(maxPrice, 10))
                            ? parseInt(maxPrice, 10)
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
                      styles={sliderStyle}
                      step={1000}
                      value={[
                        minPrice && !Number.isNaN(parseInt(minPrice, 10))
                          ? parseInt(minPrice, 10)
                          : 0,
                        maxPrice && !Number.isNaN(parseInt(maxPrice, 10))
                          ? parseInt(maxPrice, 10)
                          : 3000000,
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="zone" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={zoneQuery.isLoading}>
              <p className="text-lg">Zone</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderDynamicOptionsArr(zoneQuery.data?.docs, 'zone')}</div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="footFall" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Footfall</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex justify-between gap-8">
                    <div>
                      <NumberInput
                        value={
                          minFootFall && !Number.isNaN(parseInt(minFootFall, 10))
                            ? parseInt(minFootFall, 10)
                            : 0
                        }
                        onChange={handleMinFootFall}
                        label="Min"
                      />
                    </div>
                    <div>
                      <NumberInput
                        value={
                          maxFootfall && !Number.isNaN(parseInt(maxFootfall, 10))
                            ? parseInt(maxFootfall, 10)
                            : 10000
                        }
                        onChange={handleMaxFootFall}
                        label="Max"
                      />
                    </div>
                  </div>
                  <div>
                    <RangeSlider
                      onChange={handleFootFallSliderChange}
                      min={0}
                      max={10000}
                      styles={sliderStyle}
                      value={[
                        minFootFall && !Number.isNaN(parseInt(minFootFall, 10))
                          ? parseInt(minFootFall, 10)
                          : 0,
                        maxFootfall && !Number.isNaN(parseInt(maxFootfall, 10))
                          ? parseInt(maxFootfall, 10)
                          : 10000,
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="facing" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={facingQuery.isLoading}>
              <p className="text-lg">Facing</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                {renderDynamicOptionsArr(facingQuery.data?.docs, 'facing')}
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="tags" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={tagQuery.isLoading}>
              <p className="text-lg">Tags</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderDynamicOptionsArr(tagQuery.data?.docs, 'tags')}</div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="demographics" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={demographicsQuery.isLoading}>
              <p className="text-lg">Demographics</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                {renderDynamicOptionsArr(demographicsQuery.data?.docs, 'demographic')}
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="audience" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={audienceQuery.isLoading}>
              <p className="text-lg">Audience</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                {renderDynamicOptionsArr(audienceQuery.data?.docs, 'audience')}
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="additionalTags" className="mb-4 rounded-xl border">
            <Accordion.Control disabled={additionalTagsQuery.isLoading}>
              <p className="text-lg">Additional Tags</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                {renderAdditionalTagsAndCities(additionalTagsQuery.data, 'additionalTags')}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </Drawer>
  );
};

export default Filter;
