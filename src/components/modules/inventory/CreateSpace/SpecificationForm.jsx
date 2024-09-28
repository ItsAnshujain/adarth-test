import { ActionIcon, Button, Image } from '@mantine/core';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useFormContext } from '../../../../context/formContext';
import { useFetchMasters } from '../../../../apis/queries/masters.queries';
import { serialize } from '../../../../utils';
// import AsyncSelect from '../../../shared/AsyncSelect';
import TextInput from '../../../shared/TextInput';
import Select from '../../../shared/Select';
import NumberInput from '../../../shared/NumberInput';
import AsyncMultiSelect from '../../../shared/AsyncMultiSelect';
import MultiSelect from '../../../shared/MultiSelect';
import TrashIcon from '../../../../assets/trash.svg';

const styles = {
  label: {
    marginBottom: '4px',
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
};

const multiSelectStyles = {
  label: {
    marginBottom: '4px',
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
  value: {
    backgroundColor: 'black',
    color: 'white',
    '& button svg': {
      backgroundColor: 'white',
      borderRadius: '50%',
    },
  },
  icon: {
    color: 'white',
  },
};

const query = {
  parentId: null,
  limit: 100,
  page: 1,
  sortBy: 'name',
  sortOrder: 'asc',
};

const SpecificationForm = () => {
  const { values, errors, setFieldValue, insertListItem, removeListItem } = useFormContext();

  const {
    data: illuminationData,
    isLoading: isIlluminationLoading,
    isSuccess: isIlluminationLoaded,
  } = useFetchMasters(serialize({ type: 'illumination', ...query }));
  const {
    data: brandData,
    isLoading: isBrandLoading,
    isSuccess: isBrandLoaded,
  } = useFetchMasters(serialize({ type: 'brand', ...query }));
  const {
    data: tagData,
    isLoading: isTagLoading,
    isSuccess: isTagLoaded,
  } = useFetchMasters(serialize({ type: 'tag', ...query }));

  const createAdditionalTag = useCallback(val => {
    setFieldValue('specifications.additionalTags', current => [...current, val]);
    return { value: val, label: val };
  }, []);

  return (
    <div className="flex flex-col pl-5 pr-7 pt-4 mb-44">
      <p className="font-bold text-lg">Space Specifications</p>
      <p className="text-sm font-light text-gray-500">
        Please fill the relevant details regarding the ad Space
      </p>
      <div className="grid grid-cols-2 gap-y-4 gap-x-8 mt-4">
        <div>
          <Select
            label="Illumination"
            name="specifications.illuminations"
            withAsterisk
            styles={styles}
            errors={errors}
            disabled={isIlluminationLoading}
            placeholder="Select..."
            options={
              isIlluminationLoaded
                ? illuminationData.docs.map(category => ({
                    label: category.name,
                    value: category._id,
                  }))
                : []
            }
            className="mb-7"
          />
          <TextInput
            label="Resolutions"
            name="specifications.resolutions"
            styles={styles}
            errors={errors}
            placeholder="Write..."
            className="mb-7"
          />
        </div>
        <div>
          <NumberInput
            label="Unit"
            name="specifications.unit"
            withAsterisk
            styles={styles}
            errors={errors}
            placeholder="Write..."
            className="mb-7"
          />
          <div className="max-h-[240px] overflow-y-scroll mb-5">
            {values.specifications?.size?.map((item, index) => (
              <div key={item} className="grid grid-cols-2 gap-4 relative">
                {index !== 0 ? (
                  <ActionIcon
                    className="absolute right-0"
                    onClick={() => removeListItem('specifications.size', index)}
                  >
                    <Image src={TrashIcon} height={15} width={15} />
                  </ActionIcon>
                ) : null}
                <div>
                  <p className="mt-[9px] font-bold text-[15px]">
                    Width <span className="font-medium text-xs text-gray-500">(in ft)</span>
                  </p>
                  <NumberInput
                    name={`specifications.size.${index}.width`}
                    withAsterisk
                    styles={styles}
                    errors={errors}
                    placeholder="Write..."
                    className="mb-7"
                  />
                </div>
                <div>
                  <p className="mt-[9px] font-bold text-[15px]">
                    Height <span className="font-medium text-xs text-gray-500">(in ft)</span>
                  </p>
                  <NumberInput
                    name={`specifications.size.${index}.height`}
                    withAsterisk
                    styles={styles}
                    errors={errors}
                    placeholder="Write..."
                    className="mb-7"
                  />
                </div>
              </div>
            ))}

            <Button
              className="secondary-button mb-2"
              onClick={() =>
                insertListItem('specifications.size', { height: '', width: '', key: uuidv4() })
              }
            >
              Add More
            </Button>
          </div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <MultiSelect
            label="Additional Tags"
            name="specifications.additionalTags"
            placeholder="Add Tags here..."
            data={values.specifications.additionalTags || []}
            searchable
            creatable
            getCreateLabel={tag => `+ Create ${tag}`}
            onCreate={createAdditionalTag}
            styles={multiSelectStyles}
            className="mb-7"
          />
        </div>

        <AsyncMultiSelect
          label="Previous brands"
          name="specifications.previousBrands"
          styles={multiSelectStyles}
          errors={errors}
          disabled={isBrandLoading}
          options={
            isBrandLoaded
              ? brandData.docs.map(brand => ({
                  label: brand.name,
                  value: brand._id,
                }))
              : []
          }
          placeholder={brandData?.docs?.length ? 'Select all that you like' : 'None'}
          className="mb-5 mt-4"
          searchable
          clearable
          maxDropdownHeight={160}
        />
        <AsyncMultiSelect
          label="Tags"
          name="specifications.tags"
          styles={multiSelectStyles}
          errors={errors}
          disabled={isTagLoading}
          options={
            isTagLoaded
              ? tagData.docs.map(brand => ({
                  label: brand.name,
                  value: brand._id,
                }))
              : []
          }
          placeholder={tagData?.docs?.length ? 'Select all that you like' : 'None'}
          searchable
          clearable
          maxDropdownHeight={160}
        />

        {/* TODO: update select component  */}
        {/* <AsyncSelect
          name="specifications.previousBrands"
          label="Previous Brands"
          masterKey="brand"
          errors={errors}
        /> */}
        {/* <AsyncSelect name="specifications.tags" label="Tags" masterKey="tag" /> */}
      </div>
    </div>
  );
};

export default SpecificationForm;
