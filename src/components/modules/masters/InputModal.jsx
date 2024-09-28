import { Button, Modal } from '@mantine/core';
import { useLocation, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import { useState, useMemo, useEffect } from 'react';
import { yupResolver } from '@mantine/form';
import {
  useCreateMaster,
  useFetchMasters,
  useUpdateMaster,
} from '../../../apis/queries/masters.queries';
import { masterTypes, serialize } from '../../../utils';
import NativeSelect from '../../shared/NativeSelect';
import { FormProvider, useForm } from '../../../context/formContext';
import TextInput from '../../shared/TextInput';

const modalStyles = {
  title: {
    fontWeight: 700,
    fontSize: '20px',
  },
};
const styles = {
  label: {
    marginBottom: '4px',
    fontSize: '16px',
    letterSpacing: '0.5px',
  },
};
const initialValues = {
  name: '',
  parentId: '',
};

const InputModal = ({ opened, setOpened, isEdit = false, itemId, name }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState({
    type: 'category',
    parentId: null,
    limit: 100,
    page: 1,
  });

  const type = searchParams.get('type');
  const parentId = searchParams.get('parentId');
  const masterType = useMemo(() => masterTypes[type], [type]);

  const {
    data: parentData,
    isLoading: isParentDataLoading,
    isSuccess: isParentDateLoaded,
  } = useFetchMasters(serialize(query), parentId !== 'null');

  const { mutate: create, isLoading } = useCreateMaster();
  const { mutate: edit, isLoading: isUpdateMasterLoading } = useUpdateMaster();

  const schema = yup.object({
    name: yup
      .string()
      .trim()
      .required(
        parentId !== 'null'
          ? `Sub ${masterType} name is required`
          : `${masterType} name is required`,
      ),
    parentId: yup.string().trim(),
  });

  const form = useForm({ validate: yupResolver(schema), initialValues });

  const onHandleCloseAndClear = () => {
    form.setFieldValue('name', '');
    setOpened(false);
    form.clearErrors();
  };

  const onSubmit = formData => {
    let data = {};
    data = { ...formData, type };
    // check for empty string
    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        delete data[key];
      }
    });

    if (isEdit) {
      edit(
        { masterId: itemId, data },
        {
          onSuccess: () => onHandleCloseAndClear(),
        },
      );
    } else {
      create(data, {
        onSuccess: () => onHandleCloseAndClear(),
      });
    }
  };

  useEffect(() => {
    if (parentId !== 'null') {
      form.setFieldValue('parentId', parentId);
    } else {
      form.reset();
    }
  }, [parentId]);

  useEffect(() => {
    if (isEdit) {
      form.setFieldValue('name', name);
    }
  }, [isEdit]);

  useEffect(() => {
    setQuery({ ...query, type });
  }, [location.search]);

  return (
    <Modal
      styles={modalStyles}
      size="lg"
      title={`${isEdit ? 'Edit' : 'Add'} ${parentId !== 'null' ? `Sub ${masterType}` : masterType}`}
      opened={opened}
      withCloseButton={false}
      centered
      onClose={onHandleCloseAndClear}
    >
      <FormProvider form={form}>
        <form className="border-t" onSubmit={form.onSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 relative py-3 ">
            <TextInput
              label={parentId !== 'null' ? `Sub ${masterType} Name` : `${masterType} Name`}
              name="name"
              withAsterisk
              styles={styles}
              errors={form.errors}
              placeholder={parentId !== 'null' ? `Sub ${masterType} Name` : `${masterType} Name`}
              size="lg"
            />
            {parentId !== 'null' ? (
              <NativeSelect
                label="Parent List"
                name="parentId"
                styles={styles}
                errors={form.errors}
                disabled={!isEdit || isParentDataLoading}
                placeholder="Select..."
                size="lg"
                options={
                  isParentDateLoaded
                    ? parentData?.docs?.map(category => ({
                        label: category.name,
                        value: category._id,
                      }))
                    : []
                }
                className="mb-7"
              />
            ) : null}
            <div className="flex gap-2  justify-end">
              <Button
                onClick={onHandleCloseAndClear}
                className="bg-black text-white  rounded-md text-sm p-2 font-normal"
                disabled={isLoading || isUpdateMasterLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-450 text-white rounded-md text-sm p-2 font-normal"
                disabled={isLoading || isUpdateMasterLoading}
                loading={isLoading || isUpdateMasterLoading}
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default InputModal;
