import React, { useCallback } from 'react';
import Select from 'react-select/async';
import { ChevronDown } from 'react-feather';
import { useFormContext } from '../../context/formContext';
import { useMasters } from '../../apis/queries/masters.queries';
import { debounce, serialize } from '../../utils';

const DropdownIndicator = () => <ChevronDown size={16} className="mt-[1px] mr-1" />;

const AsyncSelect = ({ label, name, errors, masterKey, searchKey = 'name', ...props }) => {
  const form = useFormContext();
  const { mutateAsync, isLoading } = useMasters();

  const loadOptions = async (inputVal, callback) => {
    const data = await mutateAsync(
      serialize({
        type: masterKey,
        [searchKey]: inputVal,
      }),
    );

    callback(data?.docs?.map(item => ({ label: item.name, value: item._id })) || []);
  };

  const debouncedLoadOptions = useCallback(debounce(loadOptions, 1500), []);
  return (
    <>
      <Select
        name={name}
        isMulti
        styles={{
          menu: provided => ({
            ...provided,
            zIndex: 10,
          }),
          multiValue: provided => ({
            ...provided,
            height: 22,
            paddingLeft: 12,
            borderRadius: 4,
            backgroundColor: '#000',
          }),
          multiValueLabel: provided => ({
            ...provided,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'DM Sans,sans-serif',
            color: '#fff',
          }),
          option: provided => ({
            ...provided,
          }),
          control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#4B0DAF' : provided.borderColor,
            outline: 0,
            paddingRight: 8,
            boxShadow: 'none',
            '&:hover': {
              borderColor: state.isFocused ? '#4B0DAF' : '#ced4da',
            },
          }),
        }}
        components={{
          DropdownIndicator,
          IndicatorSeparator: null,
        }}
        loadOptions={debouncedLoadOptions}
        isLoading={isLoading}
        openMenuOnClick={false}
        {...form.getInputProps(name)}
        {...props}
      />
      {errors ? <p className="text-red-450 text-xs mt-1">{label} is required</p> : null}
    </>
  );
};

export default AsyncSelect;
