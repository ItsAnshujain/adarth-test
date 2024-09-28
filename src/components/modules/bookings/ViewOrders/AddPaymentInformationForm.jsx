import { Box, Button, Group, Text } from '@mantine/core';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect } from 'react';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { showNotification } from '@mantine/notifications';
import { FormProvider, useForm } from 'react-hook-form';
import { ChevronDown } from 'react-feather';
import { useQueryClient } from '@tanstack/react-query';
import { DATE_FORMAT, MODE_OF_PAYMENT } from '../../../../utils/constants';
import {
  useCreatePayment,
  usePaymentById,
  useUpdatePayment,
} from '../../../../apis/queries/payment.queries';
import { useUploadFile } from '../../../../apis/queries/upload.queries';
import ControlledDropzone from '../../../shared/FormInputs/Controlled/ControlledDropzone';
import ControlledTextInput from '../../../shared/FormInputs/Controlled/ControlledTextInput';
import ControlledNumberInput from '../../../shared/FormInputs/Controlled/ControlledNumberInput';
import ControlledSelect from '../../../shared/FormInputs/Controlled/ControlledSelect';
import ControlledDatePicker from '../../../shared/FormInputs/Controlled/ControlledDatePicker';

const schema = yup.object({
  type: yup.string().required('Payment Type is required'),
  amount: yup
    .number()
    .positive('Must be a positive number')
    .typeError('Must be a number')
    .nullable()
    .required('Amount is required'),
  paymentDate: yup.string().trim().required('Payment Date is required'),
});

const AddPaymentInformationForm = ({ bookingId, onClose, id }) => {
  const queryClient = useQueryClient();
  const form = useForm({ resolver: yupResolver(schema) });
  const createPayment = useCreatePayment();
  const paymentById = usePaymentById(id, !!id);
  const updatePayment = useUpdatePayment();
  const upload = useUploadFile();

  const handleInvoiceUpload = async params => {
    const formData = new FormData();
    formData.append('files', params);
    const res = await upload.mutateAsync(formData);
    return res?.[0]?.Location;
  };

  const onSubmit = form.handleSubmit(async formData => {
    const data = { ...formData, bookingId };
    let file;

    data.paymentDate = data.paymentDate && dayjs(data.paymentDate).format(DATE_FORMAT);

    if (typeof data.image === 'object') {
      file = await handleInvoiceUpload(data.image);
    }

    if (file) {
      data.invoice = file;
    }

    delete data.image;

    if (id) {
      updatePayment.mutate(
        { id, payload: data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(['payment']);
            queryClient.invalidateQueries(['payment-by-id', id]);
            queryClient.invalidateQueries(['booking-stats-by-id', bookingId]);
            showNotification({
              title: 'Payment updated successfully',
              color: 'green',
            });
            form.reset();
            onClose();
          },
        },
      );
    } else {
      createPayment.mutate(data, {
        onSuccess: () => {
          queryClient.invalidateQueries(['payment']);
          queryClient.invalidateQueries(['booking-stats-by-id', bookingId]);
          showNotification({
            title: 'Payment added successfully',
            color: 'green',
          });
          form.reset();
          onClose();
        },
      });
    }
  });

  useEffect(() => {
    if (paymentById.data) {
      form.reset({
        type: paymentById.data?.type,
        amount: paymentById.data?.amount,
        referenceNumber: paymentById.data?.referenceNumber,
        paymentDate: paymentById.data?.paymentDate
          ? new Date(paymentById.data?.paymentDate)
          : undefined,
        billNumber: paymentById.data?.billNumber,
        paymentFor: paymentById.data?.paymentFor || undefined,
        remarks: paymentById.data?.remarks || undefined,
        invoice: paymentById.data?.invoice || undefined,
        image: paymentById.data?.invoice || '',
      });
    }
  }, [paymentById.data]);

  return (
    <Box className="border-t">
      <FormProvider {...form}>
        <form className="px-3 pt-3" onSubmit={onSubmit}>
          <ControlledSelect
            label="Payment Type"
            name="type"
            data={MODE_OF_PAYMENT}
            placeholder="Select..."
            rightSection={<ChevronDown size={16} />}
            className="mb-4"
          />
          <ControlledTextInput
            label="Reference Number"
            name="referenceNumber"
            placeholder="Write..."
            maxLength={200}
            className="mb-4"
          />
          <ControlledDatePicker
            label="Bill Date"
            name="paymentDate"
            placeholder="Select date..."
            clearable={false}
            className="mb-4"
          />
          <ControlledNumberInput
            label="Amount ₹"
            name="amount"
            withAsterisk
            placeholder="Write..."
            className="mb-4"
          />
          <ControlledTextInput
            label="Bill Number"
            name="billNumber"
            placeholder="Write..."
            maxLength={200}
            className="mb-4"
          />
          <ControlledTextInput
            label="Payment Expense"
            name="paymentFor"
            placeholder="Write..."
            maxLength={200}
            className="mb-4"
          />
          <ControlledTextInput
            label="Description"
            name="remarks"
            placeholder="Write..."
            maxLength={200}
            className="mb-4"
          />
          <Group position="center">
            <ControlledDropzone name="image" />
            <Text>Upload Invoice</Text>
          </Group>
          <Group position="right">
            <Button
              type="submit"
              className="primary-button"
              loading={createPayment.isLoading || updatePayment.isLoading || upload.isLoading}
            >
              {id ? 'Edit' : 'Add'}
            </Button>
          </Group>
        </form>
      </FormProvider>
    </Box>
  );
};

export default AddPaymentInformationForm;
