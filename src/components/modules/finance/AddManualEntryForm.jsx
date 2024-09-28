import { ActionIcon, Button, Group, Image } from '@mantine/core';
import { yupResolver } from '@mantine/form';
import React, { useEffect, useMemo } from 'react';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { showNotification } from '@mantine/notifications';
import NumberInput from '../../shared/NumberInput';
import TextInput from '../../shared/TextInput';
import { FormProvider, useForm, useFormContext } from '../../../context/formContext';
import TrashIcon from '../../../assets/trash.svg';
import { useFetchMasters } from '../../../apis/queries/masters.queries';
import { calculateTotalMonths, serialize } from '../../../utils';
import Select from '../../shared/Select';
import { FACING_VALUE_LIST } from '../../../utils/constants';
import TextareaInput from '../../shared/TextareaInput';
import DatePickerInput from '../../shared/DatePickerInput';

const query = {
  parentId: null,
  limit: 100,
  page: 1,
  sortBy: 'name',
  sortOrder: 'asc',
};

const initialPurchaseValues = {
  name: '',
  location: '',
  startDate: null,
  endDate: null,
  quantity: '',
  city: '',
  state: '',
  unit: 0,
  displayCostPerMonth: 0,
  size: [
    {
      height: '',
      width: '',
      key: uuidv4(),
    },
  ],
  width: '',
  facing: {
    value: '',
    label: '',
  },
  category: {
    value: '',
    label: '',
  },
};

const purchaseSchema = yup.object({
  name: yup.string().trim().required('Description is required'),
  location: yup.string().trim().required('Location is required'),
  startDate: yup
    .string()
    .trim()
    .typeError('Start Date is required')
    .required('Start Date is required'),
  endDate: yup.string().trim().typeError('End Date is required').required('End Date is required'),
  city: yup.string().trim().required('City is required'),
  state: yup.string().trim().required('State is required'),
  unit: yup
    .number()
    .positive('Must be a positive number')
    .typeError('Must be a number')
    .nullable()
    .required('Unit is required'),
  category: yup
    .object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    })
    .test('category', 'Category is required', obj => obj.value !== ''),
  facing: yup
    .object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    })
    .test('facing', 'Facing is required', obj => obj.value !== ''),
  size: yup.array().of(
    yup.object({
      height: yup
        .number()
        .positive('Must be a positive number')
        .typeError('Must be a number')
        .nullable()
        .required('Height is required'),
      width: yup
        .number()
        .positive('Must be a positive number')
        .typeError('Must be a number')
        .nullable()
        .required('Width is required'),
    }),
  ),
  displayCostPerMonth: yup.number().typeError('Must be a number').nullable(),
  printingCost: yup
    .number()
    .min(0, 'Must be greater than or equal to 0')
    .typeError('Must be a number'),
  mountingCost: yup
    .number()
    .min(0, 'Must be greater than or equal to 0')
    .typeError('Must be a number'),
  hsn: yup.number(),
});

const initialReleaseValues = {
  name: '',
  location: '',
  startDate: null,
  endDate: null,
  quantity: '',
  city: '',
  state: '',
  unit: 0,
  displayCostPerMonth: 0,
  size: [
    {
      height: '',
      width: '',
      key: uuidv4(),
    },
  ],
  width: '',
  facing: {
    value: '',
    label: '',
  },
  category: {
    value: '',
    label: '',
  },
};

const releaseSchema = yup.object({
  name: yup.string().trim().required('Description is required'),
  location: yup.string().trim().required('Location is required'),

  startDate: yup
    .string()
    .trim()
    .typeError('Start Date is required')
    .required('Start Date is required'),
  endDate: yup.string().trim().typeError('End Date is required').required('End Date is required'),
  city: yup.string().trim().required('City is required'),
  state: yup.string().trim().required('State is required'),
  unit: yup
    .number()
    .positive('Must be a positive number')
    .typeError('Must be a number')
    .nullable()
    .required('Unit is required'),
  category: yup
    .object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    })
    .test('category', 'Category is required', obj => obj.value !== ''),
  facing: yup
    .object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    })
    .test('facing', 'Facing is required', obj => obj.value !== ''),
  size: yup.array().of(
    yup.object({
      height: yup
        .number()
        .positive('Must be a positive number')
        .typeError('Must be a number')
        .nullable()
        .required('Height is required'),
      width: yup
        .number()
        .positive('Must be a positive number')
        .typeError('Must be a number')
        .nullable()
        .required('Width is required'),
    }),
  ),
  displayCostPerMonth: yup.number().typeError('Must be a number').nullable(),
  printingCost: yup
    .number()
    .min(0, 'Must be greater than or equal to 0')
    .typeError('Must be a number'),
  mountingCost: yup
    .number()
    .min(0, 'Must be greater than or equal to 0')
    .typeError('Must be a number'),
  hsn: yup.number(),
});

const initialInvoiceValues = {
  name: '',
  location: '',
  startDate: null,
  endDate: null,
  quantity: '',
  city: '',
  state: '',
  unit: 0,
  displayCostPerMonth: 0,
  size: [
    {
      height: '',
      width: '',
      key: uuidv4(),
    },
  ],
  width: '',
  facing: {
    value: '',
    label: '',
  },
  category: {
    value: '',
    label: '',
  },
};

const invoiceSchema = yup.object({
  name: yup.string().trim().required('Description is required'),
  location: yup.string().trim().required('Location is required'),
  startDate: yup
    .string()
    .trim()
    .typeError('Start Date is required')
    .required('Start Date is required'),
  endDate: yup.string().trim().typeError('End Date is required').required('End Date is required'),
  city: yup.string().trim().required('City is required'),
  state: yup.string().trim().required('State is required'),
  unit: yup
    .number()
    .positive('Must be a positive number')
    .typeError('Must be a number')
    .nullable()
    .required('Unit is required'),
  category: yup
    .object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    })
    .test('category', 'Category is required', obj => obj.value !== ''),
  facing: yup
    .object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    })
    .test('facing', 'Facing is required', obj => obj.value !== ''),
  size: yup.array().of(
    yup.object({
      height: yup
        .number()
        .positive('Must be a positive number')
        .typeError('Must be a number')
        .nullable()
        .required('Height is required'),
      width: yup
        .number()
        .positive('Must be a positive number')
        .typeError('Must be a number')
        .nullable()
        .required('Width is required'),
    }),
  ),
  hsn: yup.number(),
});

const initialValues = {
  purchase: initialPurchaseValues,
  release: initialReleaseValues,
  invoice: initialInvoiceValues,
};

const schema = {
  purchase: purchaseSchema,
  release: releaseSchema,
  invoice: invoiceSchema,
};

const PurchaseAndInvoiceContent = ({
  type,
  mountingSqftCost,
  printingSqftCost,
  mountingCostGst,
  printingCostGst,
}) => {
  const { values, errors, setValues, setFieldValue, insertListItem, removeListItem } =
    useFormContext();

  const {
    data: facingData,
    isLoading: isFacingLoading,
    isSuccess: isFacingLoaded,
  } = useFetchMasters(serialize({ type: 'facing', ...query }));

  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isSuccess: isCategoryLoaded,
  } = useFetchMasters(serialize({ type: 'category', ...query }));

  const getFacingValue = (facing = 'single') => {
    const facingIndex = FACING_VALUE_LIST.findIndex(item => facing.toLowerCase().includes(item));

    return facingIndex + 1;
  };

  const memoizedFacingData = useMemo(() => {
    if (isFacingLoaded) {
      return facingData.docs.map(category => ({
        label: category.name,
        value: getFacingValue(category.name),
      }));
    }
    return [];
  }, [facingData, isFacingLoaded]);

  const memoizedCategoryData = useMemo(() => {
    if (isCategoryLoaded) {
      return categoryData.docs.map(category => ({
        label: category.name,
        value: category._id,
      }));
    }
    return [];
  }, [categoryData, isCategoryLoaded]);

  const totalMonths = useMemo(
    () => calculateTotalMonths(values.startDate, values.endDate),
    [values.startDate, values.endDate],
  );

  useEffect(() => {
    const totalPrintingCost = printingSqftCost * values.area;
    const totalMountingCost = mountingSqftCost * values.area;
    const totalPrintingCostWithGst =
      totalPrintingCost + totalPrintingCost * (printingCostGst / 100);
    const totalMountingCostWithGst =
      totalMountingCost + totalMountingCost * (mountingCostGst / 100);

    setValues({
      ...values,
      printingCost: totalPrintingCost,
      mountingCost: totalMountingCost,
      totalPrintingCost: totalPrintingCostWithGst,
      totalMountingCost: totalMountingCostWithGst,
      totalDisplayCost: values.displayCostPerMonth * totalMonths,
    });
  }, [values.area, mountingSqftCost, printingSqftCost, values.displayCostPerMonth, totalMonths]);

  const calculateHeightWidth = useMemo(() => {
    const total = values.size?.reduce((acc, item) => {
      if (item?.width && item?.height) {
        return acc + item.width * item.height;
      }
      return acc;
    }, 0);

    return total || 0;
  }, [values.size]);

  useEffect(() => {
    setFieldValue('area', calculateHeightWidth * (values.unit || 1) * (values.facing?.value || 1));
  }, [calculateHeightWidth, values.unit, values.facing?.value]);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4">
        <TextInput
          label="City"
          name="city"
          withAsterisk
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
        />
        <TextInput
          label="State"
          name="state"
          withAsterisk
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
        />
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <TextInput
          label="Location"
          name="location"
          withAsterisk
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
        />
        <NumberInput
          label="Unit"
          name="unit"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          min={0}
          hideControls
          precision={2}
          withAsterisk
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <DatePickerInput
          hideOutsideDates
          label="Start Date"
          name="startDate"
          withAsterisk
          placeholder="DD/MM/YYYY"
          minDate={new Date()}
          error={errors.startDate}
          size="md"
          className="mb-4"
        />
        <DatePickerInput
          hideOutsideDates
          label="End Date"
          name="endDate"
          withAsterisk
          placeholder="DD/MM/YYYY"
          minDate={new Date()}
          error={errors.endDate}
          size="md"
          className="mb-4"
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <Select
          label="Category"
          name="category"
          withAsterisk
          errors={errors}
          placeholder="Select..."
          size="md"
          disabled={isCategoryLoading}
          classNames={{ label: 'font-medium mb-0' }}
          options={memoizedCategoryData}
          className="mb-4"
        />
        <Select
          label="Facing"
          name="facing"
          withAsterisk
          errors={errors}
          placeholder="Select..."
          size="md"
          disabled={isFacingLoading}
          classNames={{ label: 'font-medium mb-0' }}
          options={memoizedFacingData}
          className="mb-4"
        />
      </div>

      {type === 'invoice' ? (
        <NumberInput
          label="HSN"
          name="hsn"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          min={0}
          hideControls
          precision={2}
        />
      ) : null}

      <div className="max-h-[240px] overflow-y-scroll mb-2">
        <div className="flex gap-4">
          <div className="flex flex-col">
            {values.size?.map((item, index) => (
              <div key={item?.key} className="grid grid-cols-2 gap-4 relative">
                {index !== 0 ? (
                  <ActionIcon
                    className="absolute right-0"
                    onClick={() => removeListItem('size', index)}
                  >
                    <Image src={TrashIcon} height={15} width={15} />
                  </ActionIcon>
                ) : null}
                <div>
                  <p className="mt-[2px] font-medium text-[15px]">
                    Width (in ft) <span className="text-red-450">*</span>{' '}
                  </p>
                  <NumberInput
                    name={`size.${index}.width`}
                    withAsterisk
                    errors={errors}
                    placeholder="Write..."
                    size="md"
                    className="mb-4"
                    precision={2}
                  />
                </div>
                <div>
                  <p className="mt-[2px] font-medium text-[15px]">
                    Height (in ft) <span className="text-red-450">*</span>{' '}
                  </p>
                  <NumberInput
                    name={`size.${index}.height`}
                    withAsterisk
                    errors={errors}
                    placeholder="Write..."
                    size="md"
                    className="mb-4"
                    precision={2}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full">
            <p className="mt-[2px] font-medium text-[15px]">
              Area (in sq.ft.) <span className="text-red-450">*</span>{' '}
            </p>
            <NumberInput
              name="area"
              errors={errors}
              placeholder="Write..."
              size="md"
              className="mb-4"
              hideControls
              readOnly
              disabled
              precision={2}
            />
          </div>
        </div>

        <Button
          className="secondary-button mb-2"
          onClick={() => insertListItem('size', { height: '', width: '', key: uuidv4() })}
        >
          Add More
        </Button>
      </div>

      <div className="grid grid-cols-2  gap-4">
        <NumberInput
          label="Total Printing Cost"
          name="printingCost"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          hideControls
          readOnly
          disabled
          precision={2}
        />
        <NumberInput
          label="Total Mounting Cost"
          name="mountingCost"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          hideControls
          readOnly
          disabled
          precision={2}
        />
      </div>

      <NumberInput
        label="Total Display Cost/Month"
        name="displayCostPerMonth"
        errors={errors}
        placeholder="Write..."
        size="md"
        className="mb-4"
        hideControls
        precision={2}
      />

      <TextareaInput
        label="Description of Goods and Services"
        name="name"
        withAsterisk
        errors={errors}
        placeholder="Write..."
        size="md"
        className="mb-4"
      />
    </>
  );
};

const ReleaseContent = ({
  mountingSqftCost,
  printingSqftCost,
  mountingCostGst,
  printingCostGst,
}) => {
  const { errors, values, setFieldValue, setValues, insertListItem, removeListItem } =
    useFormContext();
  const {
    data: facingData,
    isLoading: isFacingLoading,
    isSuccess: isFacingLoaded,
  } = useFetchMasters(serialize({ type: 'facing', ...query }));

  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isSuccess: isCategoryLoaded,
  } = useFetchMasters(serialize({ type: 'category', ...query }));

  const getFacingValue = (facing = 'single') => {
    const facingIndex = FACING_VALUE_LIST.findIndex(item => facing.toLowerCase().includes(item));

    return facingIndex + 1;
  };

  const memoizedFacingData = useMemo(() => {
    if (isFacingLoaded) {
      return facingData.docs.map(category => ({
        label: category.name,
        value: getFacingValue(category.name),
      }));
    }
    return [];
  }, [facingData, isFacingLoaded]);

  const memoizedCategoryData = useMemo(() => {
    if (isCategoryLoaded) {
      return categoryData.docs.map(category => ({
        label: category.name,
        value: category._id,
      }));
    }
    return [];
  }, [categoryData, isCategoryLoaded]);

  const totalMonths = useMemo(
    () => calculateTotalMonths(values.startDate, values.endDate),
    [values.startDate, values.endDate],
  );

  useEffect(() => {
    const totalPrintingCost = printingSqftCost * values.area;
    const totalMountingCost = mountingSqftCost * values.area;
    const totalPrintingCostWithGst =
      totalPrintingCost + totalPrintingCost * (printingCostGst / 100);
    const totalMountingCostWithGst =
      totalMountingCost + totalMountingCost * (mountingCostGst / 100);

    setValues({
      ...values,
      printingCost: totalPrintingCost,
      mountingCost: totalMountingCost,
      totalPrintingCost: totalPrintingCostWithGst,
      totalMountingCost: totalMountingCostWithGst,
      totalDisplayCost: values.displayCostPerMonth * totalMonths,
    });
  }, [values.area, mountingSqftCost, printingSqftCost, values.displayCostPerMonth]);

  const calculateHeightWidth = useMemo(() => {
    const total = values.size?.reduce((acc, item) => {
      if (item?.width && item?.height) {
        return acc + item.width * item.height;
      }
      return acc;
    }, 0);

    return total || 0;
  }, [values.size]);

  useEffect(() => {
    setFieldValue('area', calculateHeightWidth * (values.unit || 1) * (values.facing?.value || 1));
  }, [calculateHeightWidth, values.unit, values.facing?.value]);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4">
        <TextInput
          label="City"
          name="city"
          withAsterisk
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
        />
        <TextInput
          label="State"
          name="state"
          withAsterisk
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
        />
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <TextInput
          label="Location"
          name="location"
          withAsterisk
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
        />
        <NumberInput
          label="Unit"
          name="unit"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          min={0}
          hideControls
          precision={2}
          withAsterisk
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <DatePickerInput
          hideOutsideDates
          label="Start Date"
          name="startDate"
          withAsterisk
          placeholder="DD/MM/YYYY"
          minDate={new Date()}
          error={errors.startDate}
          size="md"
          className="mb-4"
        />
        <DatePickerInput
          hideOutsideDates
          label="End Date"
          name="endDate"
          withAsterisk
          placeholder="DD/MM/YYYY"
          minDate={new Date()}
          error={errors.endDate}
          size="md"
          className="mb-4"
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4">
        <Select
          label="Category"
          name="category"
          withAsterisk
          errors={errors}
          placeholder="Select..."
          size="md"
          disabled={isCategoryLoading}
          classNames={{ label: 'font-medium mb-0' }}
          options={memoizedCategoryData}
          className="mb-4"
        />
        <Select
          label="Facing"
          name="facing"
          withAsterisk
          errors={errors}
          placeholder="Select..."
          size="md"
          disabled={isFacingLoading}
          classNames={{ label: 'font-medium mb-0' }}
          options={memoizedFacingData}
          className="mb-4"
        />
      </div>

      <div className="max-h-[240px] overflow-y-scroll mb-2">
        <div className="flex gap-4">
          <div className="flex flex-col">
            {values.size?.map((item, index) => (
              <div key={item?.key} className="grid grid-cols-2 gap-4 relative">
                {index !== 0 ? (
                  <ActionIcon
                    className="absolute right-0"
                    onClick={() => removeListItem('size', index)}
                  >
                    <Image src={TrashIcon} height={15} width={15} />
                  </ActionIcon>
                ) : null}
                <div>
                  <p className="mt-[2px] font-medium text-[15px]">
                    Width (in ft) <span className="text-red-450">*</span>{' '}
                  </p>
                  <NumberInput
                    name={`size.${index}.width`}
                    withAsterisk
                    errors={errors}
                    placeholder="Write..."
                    size="md"
                    className="mb-4"
                    precision={2}
                  />
                </div>
                <div>
                  <p className="mt-[2px] font-medium text-[15px]">
                    Height (in ft) <span className="text-red-450">*</span>{' '}
                  </p>
                  <NumberInput
                    name={`size.${index}.height`}
                    withAsterisk
                    errors={errors}
                    placeholder="Write..."
                    size="md"
                    className="mb-4"
                    precision={2}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full">
            <p className="mt-[2px] font-medium text-[15px]">
              Area (in sq.ft.) <span className="text-red-450">*</span>{' '}
            </p>
            <NumberInput
              name="area"
              errors={errors}
              placeholder="Write..."
              size="md"
              className="mb-4"
              hideControls
              readOnly
              disabled
              precision={2}
            />
          </div>
        </div>

        <Button
          className="secondary-button mb-2"
          onClick={() => insertListItem('size', { height: '', width: '', key: uuidv4() })}
        >
          Add More
        </Button>
      </div>

      <div className="grid grid-cols-2  gap-4">
        <NumberInput
          label="Total Printing Cost"
          name="printingCost"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          hideControls
          readOnly
          disabled
          precision={2}
        />
        <NumberInput
          label="Total Mounting Cost"
          name="mountingCost"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          hideControls
          readOnly
          disabled
          precision={2}
        />
      </div>

      <div className="grid grid-cols-2  gap-4">
        <NumberInput
          label="Total Display Cost/Month"
          name="displayCostPerMonth"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          hideControls
          precision={2}
        />
        <NumberInput
          label="Total Display Cost Discount"
          name="displayCostDiscount"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          hideControls
          precision={2}
        />
      </div>
      <div className="grid grid-cols-2  gap-4">
        <NumberInput
          label="Printing Cost Discount"
          name="printingCostDiscount"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          hideControls
          precision={2}
        />
        <NumberInput
          label="Mounting Cost Discount"
          name="mountingCostDiscount"
          errors={errors}
          placeholder="Write..."
          size="md"
          className="mb-4"
          hideControls
          precision={2}
        />
      </div>

      <TextareaInput
        label="Description of Goods and Services"
        name="name"
        withAsterisk
        errors={errors}
        placeholder="Write..."
        size="md"
        className="mb-4"
      />
    </>
  );
};

const contents = {
  purchase: PurchaseAndInvoiceContent,
  release: ReleaseContent,
  invoice: PurchaseAndInvoiceContent,
};

const ManualEntryContent = ({
  onClose = () => {},
  setAddSpaceItem = () => {},
  addSpaceItem,
  item,
  type,
  mountingSqftCost,
  printingSqftCost,
  mountingGstPercentage,
  printingGstPercentage,
}) => {
  const form = useForm({ validate: yupResolver(schema[type]), initialValues: initialValues[type] });
  const ManualEntries = contents[type] ?? <div />;
  const onSubmit = async formData => {
    if (item) {
      const tempArr = [...addSpaceItem];
      const res = tempArr.map(ele => {
        if (ele.itemId === item.itemId) {
          return {
            ...formData,
            itemId: item.itemId,
            displayCostDiscount: item?.displayCostDiscount || 0,
            mountingCostDiscount: item?.mountingCostDiscount || 0,
            printingCostDiscount: item?.printingCostDiscount || 0,
          };
        }
        return ele;
      });
      setAddSpaceItem(res);
      onClose();
      showNotification({
        title: 'Item updated successfully',
        color: 'green',
      });
      return;
    }
    setAddSpaceItem(prevState => [
      ...prevState,
      {
        ...formData,
        itemId: uuidv4(),
        displayCostDiscount: item?.displayCostDiscount || 0,
        mountingCostDiscount: item?.mountingCostDiscount || 0,
        printingCostDiscount: item?.printingCostDiscount || 0,
      },
    ]);
    onClose();
  };

  useEffect(() => {
    if (item) {
      form.setValues({
        name: item?.name,
        location: item?.location,
        startDate: item?.startDate,
        endDate: item?.endDate,
        quantity: item?.quantity,
        rate: item?.rate,
        price: item?.price,
        area: item?.area,
        city: item?.city,
        displayCostPerMonth: item?.displayCostPerMonth,
        height: item?.height,
        itemId: item?.itemId,
        media: item?.media,
        mountingCost: item?.mountingCost,
        printingCost: item?.printingCost,
        totalMountingCost: item?.totalMountingCost,
        totalPrintingCost: item?.totalPrintingCost,
        width: item?.width,
        hsn: item?.hsn || 0,
        state: item?.state,
        category: item.category,
        size: item?.size?.map(ele => ({
          height: ele?.height,
          width: ele?.width,
        })),
        unit: item?.unit,
        facing: { label: item?.facing?.label, value: item?.facing?.value },
        displayCostDiscount: item?.displayCostDiscount,
        mountingCostDiscount: item?.mountingCostDiscount,
        printingCostDiscount: item?.printingCostDiscount,
      });
    }
  }, [item]);

  return (
    <FormProvider form={form}>
      <form className="px-5" onSubmit={form.onSubmit(onSubmit)}>
        <ManualEntries
          mountingSqftCost={mountingSqftCost}
          printingSqftCost={printingSqftCost}
          mountingCostGst={mountingGstPercentage}
          printingCostGst={printingGstPercentage}
          type={type}
        />
        <Group position="right">
          <Button type="submit" className="primary-button">
            {item ? 'Edit' : 'Add'}
          </Button>
        </Group>
      </form>
    </FormProvider>
  );
};

export default ManualEntryContent;
