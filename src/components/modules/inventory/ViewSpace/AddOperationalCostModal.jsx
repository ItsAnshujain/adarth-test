import { Box, Button, Group } from '@mantine/core';
import { yupResolver } from '@mantine/form';
import React, { useEffect } from 'react';
import * as yup from 'yup';
import { FormProvider, useForm } from '../../../../context/formContext';
import { useFetchMasters } from '../../../../apis/queries/masters.queries';
import {
  useAddOperationalCost,
  useUpdateOperationalCost,
} from '../../../../apis/queries/operationalCost.queries';
import { calculateDaysListByMonth, serialize } from '../../../../utils';
import NumberInput from '../../../shared/NumberInput';
import Select from '../../../shared/Select';
import TextareaInput from '../../../shared/TextareaInput';
import { useBookings } from '../../../../apis/queries/booking.queries';
import { MONTH_LIST, YEAR_LIST } from '../../../../utils/constants';

const bookingQueries = {
  page: 1,
  limit: 100,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const styles = {
  label: {
    marginBottom: 8,
    fontWeight: 700,
    fontSize: 16,
  },
  input: {
    borderRadius: 0,
    padding: 8,
  },
};

const initialValues = {
  type: { label: '', value: '' },
  amount: '',
  description: '',
  inventoryId: '',
  bookingId: '',
  year: { label: '', value: -1 },
};

const schema = yup.object({
  type: yup
    .object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    })
    .test('operationalCostType', 'Type is required', obj => obj.value !== ''),
  amount: yup
    .number()
    .positive('Must be a positive number')
    .typeError('Must be a number')
    .nullable()
    .required('Amount is required'),
  year: yup
    .object({
      label: yup.string().trim(),
      value: yup.number(),
    })
    .test('year', 'Year is required', obj => obj.value !== -1),
});

const AddOperationalCostModal = ({
  inventoryId,
  onClose,
  costId,
  type,
  amount,
  description,
  bookingId,
  bookingIdFromUrl,
  year,
  month,
  day,
}) => {
  const form = useForm({ validate: yupResolver(schema), initialValues });
  const {
    data: operationalCostData,
    isLoading: isOperationalCostLoading,
    isSuccess: isOperationalCostLoaded,
  } = useFetchMasters(
    serialize({
      type: 'operational_cost_type',
      limit: 100,
      page: 1,
      sortBy: 'name',
      sortOrder: 'asc',
    }),
  );
 
  console.log("op data", operationalCostData);

  const {
    data: bookingDatas,
    isLoading: isBookingDatasLoading,
    isSuccess: isBookingDatasLoaded,
  } = useBookings(serialize(bookingQueries));

  const { mutate: addCost, isLoading: isAddLoading } = useAddOperationalCost();
  const { mutate: editCost, isLoading: isEditLoading } = useUpdateOperationalCost();

  const onSubmit = async formData => {
    const data = { ...formData };
    data.type = data.type.value;
    data.inventoryId = inventoryId;

    if (data.bookingId?.value) {
      data.bookingId = data.bookingId.value;
    } else {
      delete data.bookingId;
    }

    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        delete data[key];
      }
    });

    data.year = data.year.value;
    data.month = data.month?.value;
    data.day = data.day?.value;

    if (costId) {
      editCost({ id: costId, data }, { onSuccess: () => onClose() });
    } else {
      addCost(data, { onSuccess: () => onClose() });
    }
  };

  useEffect(() => {
    if (costId) {
      form.setValues({
        amount,
        type: {
          label: type?.name,
          value: type?._id,
        },
        year: { value: year },
        month: { value: month },
        day: { value: day },
        description,
        bookingId: { value: bookingId },
      });
    } else {
      form.setFieldValue('bookingId', { value: bookingIdFromUrl });
    }
  }, [costId]);

  return (
    <Box className="border-t">
      <FormProvider form={form}>
        <form className="px-5 pt-3" onSubmit={form.onSubmit(onSubmit)}>
          <Select
            label="Type"
            name="type"
            withAsterisk
            errors={form.errors}
            disabled={isOperationalCostLoading || isAddLoading || isEditLoading}
            placeholder="Select..."
            size="md"
            options={
              isOperationalCostLoaded
                ? operationalCostData?.docs?.map(category => ({
                    label: category.name,
                    value: category._id,
                  }))
                : []
            }
            className="mb-4"
          />
          <section className="grid grid-cols-3 gap-x-4">
            <Select
              label="Year"
              name="year"
              withAsterisk
              errors={form.errors}
              disabled={isOperationalCostLoading || isAddLoading || isEditLoading}
              placeholder="Select..."
              size="md"
              options={YEAR_LIST}
              className="mb-4"
            />
            <Select
              label="Month"
              name="month"
              errors={form.errors}
              disabled={isOperationalCostLoading || isAddLoading || isEditLoading}
              placeholder="Select..."
              size="md"
              options={MONTH_LIST}
              className="mb-4"
            />
            <Select
              label="Day"
              name="day"
              errors={form.errors}
              disabled={isOperationalCostLoading || isAddLoading || isEditLoading}
              placeholder="Select..."
              size="md"
              options={
                calculateDaysListByMonth(form.values.month?.value, form.values.year?.value).map(
                  item => ({ label: item, value: item }),
                ) || []
              }
              className="mb-4"
            />
          </section>
          <NumberInput
            label="Amount ₹"
            name="amount"
            withAsterisk
            errors={form.errors}
            disabled={isOperationalCostLoading || isAddLoading || isEditLoading}
            placeholder="Write..."
            size="md"
            className="mb-4"
            styles={styles}
            hideControls
          />
          <TextareaInput
            styles={styles}
            label="Description"
            name="description"
            disabled={isOperationalCostLoading || isAddLoading || isEditLoading}
            placeholder="Maximun 200 characters"
            maxLength={200}
            className="mb-4"
          />
          <Select
            label="Bookings"
            name="bookingId"
            errors={form.errors}
            disabled={
              isOperationalCostLoading ||
              isAddLoading ||
              isEditLoading ||
              isBookingDatasLoading ||
              !bookingDatas?.docs?.length
            }
            placeholder={!bookingDatas?.docs?.length ? 'No Bookings available' : 'Select...'}
            size="md"
            options={
              isBookingDatasLoaded
                ? bookingDatas?.docs?.map(booking => ({
                    label: booking?.campaign?.name,
                    value: booking?._id,
                  }))
                : []
            }
            className="mb-4"
          />
          <Group position="right">
            <Button
              type="submit"
              className="primary-button"
              disabled={isAddLoading || isEditLoading}
              loading={isAddLoading || isEditLoading}
            >
              {costId ? 'Edit' : 'Add'}
            </Button>
          </Group>
        </form>
      </FormProvider>
    </Box>
  );
};

export default AddOperationalCostModal;
