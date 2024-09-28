import { Select as MantineSelect } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'react-feather';
import { useDebouncedState } from '@mantine/hooks';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useFormContext } from '../../../../context/formContext';
import Select from '../../../shared/Select';
import TextInput from '../../../shared/TextInput';
import { useFetchUsers } from '../../../../apis/queries/users.queries';
import { useFetchMasters } from '../../../../apis/queries/masters.queries';
import { serialize } from '../../../../utils';
import useTokenIdStore from '../../../../store/user.store';

const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const roleList = [
  { label: 'Management', value: 'management' },
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'Associate', value: 'associate' },
];

const styles = {
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderRadius: 0,
    padding: 8,
  },
};

const query = {
  parentId: null,
  limit: 100,
  page: 1,
  sortBy: 'name',
  sortOrder: 'asc',
};

const Credentials = ({ setType, setPeerId }) => {
  const queryClient = useQueryClient();
  const userId = useTokenIdStore(state => state.id);
  const userCachedData = queryClient.getQueryData(['users-by-id', userId]);
  const { errors, setFieldError } = useFormContext();
  const [filter, setFilter] = useState('Team');
  const [searchInput, setSearchInput] = useDebouncedState('', 1000);
  const handleFilter = val => {
    setFilter(val);
    setType(val);
  };

  const {
    data: organizationData,
    isSuccess: isOrganizationDataLoaded,
    isLoading: isOrganizationDataLoading,
  } = useFetchMasters(serialize({ type: 'organization', ...query }));

  const [searchParams, setSearchParams] = useSearchParams({
    'page': 1,
    'limit': 100,
    'sortOrder': 'asc',
    'sortBy': 'createdAt',
    'filter': 'peer',
  });

  const { data: userData, isError } = useFetchUsers(
    searchParams.toString(),
    searchInput !== '',
    false,
  );

  const emailValidation = email => {
    if (!email || regex.test(email) === false) {
      return false;
    }
    return true;
  };

  const handleSearch = () => {
    if (emailValidation(searchInput)) {
      searchParams.set('email', searchInput);
      setSearchParams(searchParams);
    }
  };

  useEffect(() => {
    handleSearch();
    if (searchInput === '') {
      searchParams.delete('email');
      setSearchParams(searchParams);
      setPeerId('');
    }
    if (userData?._id) {
      setPeerId(userData?._id);
    }
  }, [searchInput, userData]);

  useEffect(() => {
    setFieldError('searchEmail', isError ? 'User does not exist' : '');
  }, [isError]);

  return (
    <div className="pl-5 pr-7 mt-4">
      <p className="text-xl font-bold">Create new user account</p>
      <div className="grid grid-cols-2 gap-8 mt-4">
        <div className="flex flex-col gap-4">
          <MantineSelect
            label="Type"
            withAsterisk
            value={filter}
            onChange={handleFilter}
            data={['Team', 'Peer']}
            styles={styles}
            rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
          />

          {filter?.toLowerCase() === 'team' && userCachedData?.role === 'admin' ? (
            <Select
              label="Organization"
              name="companyName"
              withAsterisk
              styles={styles}
              errors={errors}
              disabled={isOrganizationDataLoading}
              placeholder="Select..."
              options={
                isOrganizationDataLoaded
                  ? organizationData.docs.map(type => ({
                      label: type.name,
                      value: type._id,
                    }))
                  : []
              }
            />
          ) : null}
          {filter?.toLowerCase() === 'team' ? (
            <Select
              label="Role"
              name="role"
              options={roleList}
              styles={styles}
              withAsterisk
              errors={errors}
              placeholder="Select"
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-4">
          {filter?.toLowerCase() === 'team' ? (
            <>
              <TextInput
                label="Email ID"
                name="email"
                styles={styles}
                withAsterisk
                errors={errors}
                placeholder="Email ID"
              />
              <TextInput
                label="Name"
                name="name"
                styles={styles}
                withAsterisk
                errors={errors}
                placeholder="Name"
              />
            </>
          ) : (
            <TextInput
              label="Search Email ID"
              styles={styles}
              name="searchEmail"
              withAsterisk
              errors={errors}
              placeholder="Search Email ID"
              onChange={event => setSearchInput(event.target.value)}
              defaultValue={searchInput}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Credentials;
