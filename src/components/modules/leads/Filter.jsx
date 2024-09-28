import { useCallback, useEffect, useMemo, useState } from 'react';
import { Accordion, Button, Checkbox, Drawer, Pagination } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  CompanyTypeOptions,
  leadPriorityOptions,
  leadSourceOptions,
  leadStageOptions,
} from '../../../utils/constants';
import { useFetchUsers } from '../../../apis/queries/users.queries';
import { serialize } from '../../../utils';
import useUserStore from '../../../store/user.store';
import useCompanies from '../../../apis/queries/companies.queries';

const styles = { title: { fontWeight: 'bold' } };

const defaultValue = {
  leadSource: [],
  priority: [],
  companyRepresentingIds: [],
  stage: [],
  createdByIds: [],
  companyType: [],
};

const Filter = ({ isOpened, setShowFilter }) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOptions, setFilterOptions] = useState(defaultValue);
  const [usersActivePage, setUsersActivePage] = useState(1);
  const [companiesActivePage, setCompaniesActivePage] = useState(1);
  const meId = useUserStore(state => state.id);
  const myDetails = queryClient.getQueryData(['users-by-id', meId]);

  const leadSource = searchParams.get('leadSource');
  const priority = searchParams.get('priority');
  const companyRepresentingIds = searchParams.get('companyRepresentingIds');
  const stage = searchParams.get('stage');
  const createdByIds = searchParams.get('createdByIds');
  const companyType = searchParams.get('companyType');

  const usersQuery = useFetchUsers(
    serialize({
      page: usersActivePage,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      filter: 'all',
    }),
  );

  const companyRepresentingQuery = useCompanies({
    page: companiesActivePage,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    type: 'co-company',
  });

  const memoizedRepresentingCompany = useMemo(
    () =>
      companyRepresentingQuery?.data?.docs?.map(doc => ({
        ...doc,
        label: doc.companyName,
        value: doc._id,
      })) || [],
    [companyRepresentingQuery?.data],
  );

  const memoizedUsers = useMemo(
    () =>
      usersQuery?.data?.docs?.map(doc => ({
        ...doc,
        label: doc.name,
        value: doc._id,
      })) || [],
    [usersQuery?.data],
  );

  const handleStatusArr = (stat, key) => {
    let tempArr = [...filterOptions[`${key}`]]; // TODO: use immmer
    if (tempArr.some(item => item === stat)) {
      tempArr = tempArr.filter(item => item !== stat);
    } else {
      tempArr.push(stat);
    }
    setFilterOptions({ ...filterOptions, [`${key}`]: [...tempArr] });
  };

  const renderOptions = useCallback(
    (data, filterKey) =>
      data?.map(item => (
        <div className="flex gap-2 mb-2" key={item.value}>
          <Checkbox
            onChange={event => handleStatusArr(event.target.value, filterKey)}
            label={item.label}
            defaultValue={item.value}
            checked={filterOptions[filterKey]?.includes(item.value)}
          />
        </div>
      )),
    [
      filterOptions.priority,
      filterOptions.stage,
      filterOptions.leadSource,
      filterOptions.companyRepresentingIds,
      filterOptions.companyType,
      filterOptions.createdByIds,
    ],
  );

  const renderAddedByOptions = useCallback(
    (data, filterKey) => (
      <div>
        {data?.map(item => (
          <div className="flex gap-2 mb-2" key={item.value}>
            <Checkbox
              onChange={event => handleStatusArr(event.target.value, filterKey)}
              label={item.label}
              defaultValue={item.value}
              checked={filterOptions[filterKey]?.includes(item.value)}
            />
          </div>
        ))}
        <Pagination
          styles={theme => ({
            item: {
              color: theme.colors.gray[5],
              fontWeight: 700,
            },
          })}
          page={usersActivePage}
          onChange={setUsersActivePage}
          total={usersQuery?.data?.totalPages || 1}
          size="xs"
          className="ml-auto w-fit"
        />
      </div>
    ),
    [
      filterOptions.priority,
      filterOptions.stage,
      filterOptions.leadSource,
      filterOptions.companyRepresentingIds,
      filterOptions.companyType,
      filterOptions.createdByIds,
    ],
  );

  const renderCompanyRepresentingOptions = useCallback(
    (data, filterKey) => (
      <div>
        {data?.map(item => (
          <div className="flex gap-2 mb-2" key={item.value}>
            <Checkbox
              onChange={event => handleStatusArr(event.target.value, filterKey)}
              label={item.label}
              defaultValue={item.value}
              checked={filterOptions[filterKey]?.includes(item.value)}
            />
          </div>
        ))}
        <Pagination
          styles={theme => ({
            item: {
              color: theme.colors.gray[5],
              fontWeight: 700,
            },
          })}
          page={companiesActivePage}
          onChange={setCompaniesActivePage}
          total={companyRepresentingQuery?.data?.totalPages || 1}
          size="xs"
          className="ml-auto w-fit"
        />
      </div>
    ),
    [
      filterOptions.priority,
      filterOptions.stage,
      filterOptions.leadSource,
      filterOptions.companyRepresentingIds,
      filterOptions.companyType,
      filterOptions.createdByIds,
    ],
  );

  const handleNavigationByFilter = () => {
    Object.keys(filterOptions).forEach(item => {
      searchParams.delete(item);
    });

    searchParams.set('page', 1);
    Object.keys(filterOptions).forEach(key => {
      if (filterOptions[`${key}`].length && Array.isArray(filterOptions[`${key}`])) {
        searchParams.append(key, filterOptions[`${key}`].join(','));
      }
    });
    setSearchParams(searchParams);
    setShowFilter(false);
  };

  const handleResetParams = () => {
    Object.keys(defaultValue).forEach(item => {
      searchParams.delete(item);
    });
    setSearchParams(searchParams);
    setFilterOptions(defaultValue);
  };

  useEffect(() => {
    setFilterOptions(prevState => ({
      ...prevState,
      leadSource: leadSource?.split(',') || [],
      priority: priority?.split(',') || [],
      companyRepresentingIds: companyRepresentingIds?.split(',') || [],
      stage: stage?.split(',') || [],
      createdByIds: createdByIds?.split(',') || [],
      companyType: companyType?.split(',') || [],
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
          <Accordion.Item value="leadSource" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Lead Source</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderOptions(leadSourceOptions, 'leadSource')}</div>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="priority" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Priority</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderOptions(leadPriorityOptions, 'priority')}</div>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="companyRepresentingIds" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Company Representing</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">
                {renderCompanyRepresentingOptions(
                  memoizedRepresentingCompany,
                  'companyRepresentingIds',
                )}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="stage" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Lead Stage</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderOptions(leadStageOptions, 'stage')}</div>
            </Accordion.Panel>
          </Accordion.Item>
          {myDetails?.role === 'admin' ? (
            <Accordion.Item value="createdByIds" className="mb-4 rounded-xl border">
              <Accordion.Control>
                <p className="text-lg">Added By</p>
              </Accordion.Control>
              <Accordion.Panel>
                <div className="mt-2">{renderAddedByOptions(memoizedUsers, 'createdByIds')}</div>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}
          <Accordion.Item value="companyType" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Client Company Type</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderOptions(CompanyTypeOptions, 'companyType')}</div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </Drawer>
  );
};

export default Filter;
