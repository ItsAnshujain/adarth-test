import { Carousel } from '@mantine/carousel';
import { Button, Checkbox, Divider, Drawer, Switch } from '@mantine/core';
import { useEffect, useMemo, useState, useCallback } from 'react';
import * as yup from 'yup';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import shallow from 'zustand/shallow';
import ControlledNumberInput from '../../../shared/FormInputs/Controlled/ControlledNumberInput';
import {
  calculateDiscountOnDisplayCost,
  calculateTotalAmountWithPercentage,
  calculateTotalArea,
  calculateTotalCostOfBooking,
  calculateTotalDisplayCost,
  calculateTotalMonths,
  getUpdatedBookingData,
  getUpdatedProposalData,
  indianCurrencyInDecimals,
} from '../../../../utils';
import useBookingStore from '../../../../store/booking.store';
import useProposalStore from '../../../../store/proposal.store';

const schema = yup.object({
  displayCostPerMonth: yup
    .number()
    .typeError('Must be a number')
    .nullable()
    .required('Display cost per month is required'),
  displayCostGstPercentage: yup
    .number()
    .typeError('Must be a number')
    .nullable()
    .required('Gst is required'),
  totalDisplayCost: yup
    .number()
    .typeError('Must be a number')
    .nullable()
    .required('Total display cost is required'),
  displayCostPerSqFt: yup
    .number()
    .typeError('Must be a number')
    .nullable()
    .required('Display cost per sq. ft. is required'),
  tradedAmount: yup.number().typeError('Must be a number').nullable(),
  oneTimeInstallationCost: yup
    .number()
    .typeError('Must be a number')
    .nullable()
    .required('One-time installation cost is required'),
  monthlyAdditionalCost: yup
    .number()
    .typeError('Must be a number')
    .nullable()
    .required('Monthly additional cost is required'),
  otherCharges: yup
    .number()
    .typeError('Must be a number')
    .nullable()
    .required('Other Charges is required'),
});

const defaultValues = {
  displayCostPerMonth: 0,
  displayCostGstPercentage: 0,
  totalDisplayCost: 0,
  displayCostPerSqFt: 0,
  tradedAmount: 0,
  printingCostPerSqft: 0,
  printingGstPercentage: 0,
  mountingGstPercentage: 0,
  totalPrintingCost: 0,
  mountingCostPerSqft: 0,
  totalMountingCost: 0,
  oneTimeInstallationCost: 0,
  monthlyAdditionalCost: 0,
  otherCharges: 0,
  applyPrintingMountingCostForAll: false,
  subjectToExtension: false,
  discountOn: 'displayCost',
  applyDiscountForAll: false,
};

const AddEditPriceDrawer = ({
  isOpened,
  onClose,
  selectedInventories,
  styles = {},
  selectedInventoryId,
  type,
  mode = '',
}) => {
  const formContext = useFormContext();
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const [activeSlide, setActiveSlide] = useState();

  const watchDisplayCostGstPercentage = form.watch('displayCostGstPercentage');
  const watchDisplayCostPerMonth = form.watch('displayCostPerMonth');
  const watchPrintingCostPerSqft = form.watch('printingCostPerSqft');
  const watchMountingCostPerSqft = form.watch('mountingCostPerSqft');
  const watchPrintingGstPercentage = form.watch('printingGstPercentage');
  const watchMountingGstPercentage = form.watch('mountingGstPercentage');
  const watchTotalMountingCost = form.watch('totalMountingCost');

  const watchApplyPrintingMountingCostForAll = form.watch('applyPrintingMountingCostForAll');
  const watchApplyDiscountForAll = form.watch('applyDiscountForAll');

  const watchDiscountOn = form.watch('discountOn');
  const watchSubjectToExtension = form.watch('subjectToExtension');

  useEffect(() => {
    const currentIndex = selectedInventories?.findIndex(inv => inv?._id === selectedInventoryId);
    if (currentIndex >= 0) {
      const itemToMove = selectedInventories.splice(currentIndex, 1)[0];
      selectedInventories.unshift(itemToMove);
    }
  }, [selectedInventoryId]);

  const selectedInventory = useMemo(
    () =>
      !activeSlide
        ? selectedInventories?.filter(inv => inv._id === selectedInventoryId)?.[0]
        : selectedInventories[activeSlide || 0],
    [selectedInventories, selectedInventoryId, activeSlide],
  );

  const totalMonths = useMemo(
    () => calculateTotalMonths(selectedInventory?.startDate, selectedInventory?.endDate),
    [selectedInventory],
  );

  const totalArea = useMemo(
    () => calculateTotalArea(selectedInventory, selectedInventory?.unit),
    [selectedInventory],
  );

  const totalPrice = useMemo(
    () =>
      calculateTotalCostOfBooking(
        { ...selectedInventory, ...form.watch() },
        selectedInventory?.unit,
        selectedInventory?.startDate,
        selectedInventory?.endDate,
      ),
    [selectedInventory, form.formState],
  );

  const onChangeDisplayCostPerMonth = useCallback(
    val => {
      const displayCostPerMonth = val * totalMonths;
      const displayCostPerSqFt = Number((val / totalArea).toFixed(2));
      form.setValue('displayCostPerSqFt', totalArea > 0 ? displayCostPerSqFt : 0);

      if (totalArea && totalArea > 0) {
        form.setValue(
          'totalDisplayCost',
          calculateTotalAmountWithPercentage(displayCostPerMonth, watchDisplayCostGstPercentage),
        );
      }
    },
    [watchDisplayCostGstPercentage, totalMonths, totalArea],
  );

  const onChangeDisplayCostPerSqFt = useCallback(
    val => {
      const displayCostPerSqFt = val * totalArea;

      form.setValue('displayCostPerMonth', Number(displayCostPerSqFt?.toFixed(2)) || 0);

      if (totalArea && totalArea > 0) {
        form.setValue(
          'totalDisplayCost',
          calculateTotalAmountWithPercentage(
            displayCostPerSqFt * totalMonths,
            watchDisplayCostGstPercentage,
          ),
        );
      }
    },
    [watchDisplayCostGstPercentage, totalMonths, totalArea],
  );

  const onChangeDisplayCostPercentage = useCallback(
    val => {
      const displayCostPerMonth = watchDisplayCostPerMonth * Number(totalMonths) || 0;

      form.setValue(
        'totalDisplayCost',
        calculateTotalAmountWithPercentage(displayCostPerMonth, val),
      );
    },
    [watchDisplayCostGstPercentage, totalArea],
  );

  const onChangePrintingCost = useCallback(
    val => {
      const printingCost = val * totalArea;
      form.setValue(
        'totalPrintingCost',
        calculateTotalAmountWithPercentage(printingCost, watchPrintingGstPercentage),
      );
    },
    [watchPrintingGstPercentage, totalArea],
  );

  const onChangePrintingCostGst = useCallback(
    val => {
      const printingCost = watchPrintingCostPerSqft * totalArea;
      form.setValue('totalPrintingCost', calculateTotalAmountWithPercentage(printingCost, val));
    },
    [watchPrintingCostPerSqft, totalArea],
  );

  const onChangeMountingCost = useCallback(
    val => {
      const mountingCost = val * totalArea;
      form.setValue(
        'totalMountingCost',
        calculateTotalAmountWithPercentage(mountingCost, watchMountingGstPercentage),
      );
    },
    [watchMountingGstPercentage, totalArea],
  );

  const onChangeMountingCostGst = useCallback(
    val => {
      const mountingCost = watchMountingCostPerSqft * totalArea;
      form.setValue('totalMountingCost', calculateTotalAmountWithPercentage(mountingCost, val));
    },
    [watchTotalMountingCost],
  );

  const watchPlace = formContext?.watch('place');

  const { setBookingData, data } = useBookingStore(
    state => ({
      setBookingData: state.setBookingData,
      data: state.bookingData,
    }),
    shallow,
  );
  const bookingData = useMemo(() => {
    const formData = form.watch();
    return getUpdatedBookingData(
      formData,
      activeSlide ? selectedInventory?._id : selectedInventoryId,
      data,
      totalPrice,
      totalArea,
    );
  }, [JSON.stringify(form.watch()), watchPlace]);

  useEffect(() => {
    setBookingData(bookingData);
  }, [bookingData]);

  useEffect(() => {
    setBookingData(watchPlace);
  }, [watchPlace]);

  const { setProposalData, proposalData } = useProposalStore(
    state => ({
      setProposalData: state.setProposalData,
      proposalData: state.proposalData,
    }),
    shallow,
  );

  const memoizedProposalData = useMemo(() => {
    const formData = form.watch();

    return getUpdatedProposalData(
      formData,
      activeSlide ? selectedInventory?._id : selectedInventoryId,
      proposalData,
      totalPrice,
      totalArea,
    );
  }, [JSON.stringify(form.watch())]);

  useEffect(() => {
    setProposalData(memoizedProposalData);
  }, [memoizedProposalData]);

  useEffect(() => {
    setProposalData(selectedInventories);
  }, [selectedInventories]);

  const onSubmit = async () => {
    if (type === 'bookings') {
      formContext?.setValue('place', data);
    } else {
      formContext?.setValue('spaces', proposalData);
    }

    onClose();
    form.reset();
  };

  useEffect(() => {
    const filteredBookingData = data?.filter(doc => doc?._id === selectedInventory?._id);
    const filteredProposalData = proposalData?.filter(doc => doc?._id === selectedInventory?._id);
    if (filteredBookingData?.length > 0 && type === 'bookings') {
      const inventory = filteredBookingData[0];
      form.reset({
        displayCostPerMonth: inventory.displayCostPerMonth || 0,
        totalDisplayCost:
          calculateTotalDisplayCost(
            inventory,
            inventory.startDate,
            inventory.endDate,
            inventory.displayCostGstPercentage,
          ) || 0,
        displayCostPerSqFt: inventory.displayCostPerSqFt || 0,
        displayCostGstPercentage: inventory.displayCostGstPercentage || 0,
        displayCostGst: inventory.displayCostGst || 0,
        printingCostPerSqft: inventory.printingCostPerSqft || 0,
        printingGstPercentage: inventory.printingGstPercentage || 0,
        printingGst: inventory.printingGst || 0,
        totalPrintingCost: inventory.totalPrintingCost || 0,
        mountingCostPerSqft: inventory.mountingCostPerSqft || 0,
        mountingGstPercentage: inventory.mountingGstPercentage || 0,
        mountingGst: inventory.mountingGst || 0,
        totalMountingCost: inventory.totalMountingCost || 0,
        oneTimeInstallationCost: inventory.oneTimeInstallationCost || 0,
        monthlyAdditionalCost: inventory.monthlyAdditionalCost || 0,
        otherCharges: inventory.otherCharges || 0,
        tradedAmount: inventory.tradedAmount || 0,
        applyPrintingMountingCostForAll: inventory.applyPrintingMountingCostForAll || false,
        subjectToExtension: inventory.subjectToExtension || false,
        discountOn: inventory.discountOn || 'displayCost',
        discount:
          mode === 'view' && type === 'bookings' && inventory.discountOn === 'totalPrice'
            ? 0
            : inventory.discount || 0,
        applyDiscountForAll: inventory.applyDiscountForAll || false,
        discountedPriceOverDisplayCost: calculateDiscountOnDisplayCost({
          discountOn: inventory.discountOn,
          value:
            inventory.displayCostPerMonth *
            calculateTotalMonths(inventory?.startDate, inventory?.endDate),
          discountPercentage: inventory.discount,
          gstPercentage: 0,
        }),
      });
    } else if (filteredProposalData?.length > 0 && type === 'proposal') {
      const inventory = filteredProposalData[0];
      form.reset({
        displayCostPerMonth: inventory.displayCostPerMonth || 0,
        totalDisplayCost:
          calculateTotalDisplayCost(inventory, inventory.startDate, inventory.endDate, 0) || 0,
        displayCostPerSqFt: inventory.displayCostPerSqFt || 0,
        displayCostGstPercentage: inventory.displayCostGstPercentage || 0,
        displayCostGst: inventory.displayCostGst || 0,
        printingCostPerSqft: inventory.printingCostPerSqft || 0,
        printingGstPercentage: inventory.printingGstPercentage || 0,
        printingGst: inventory.printingGst || 0,
        totalPrintingCost: inventory.totalPrintingCost || 0,
        mountingCostPerSqft: inventory.mountingCostPerSqft || 0,
        mountingGstPercentage: inventory.mountingGstPercentage || 0,
        mountingGst: inventory.mountingGst || 0,
        totalMountingCost: inventory.totalMountingCost || 0,
        oneTimeInstallationCost: inventory.oneTimeInstallationCost || 0,
        monthlyAdditionalCost: inventory.monthlyAdditionalCost || 0,
        otherCharges: inventory.otherCharges || 0,
        subjectToExtension: inventory.subjectToExtension || false,
        discountedDisplayCost: inventory.discountedDisplayCost || 0,
        applyPrintingMountingCostForAll: inventory.applyPrintingMountingCostForAll || false,
      });
    } else if (
      selectedInventory?.priceChanged ||
      selectedInventory?.displayCostPerMonth ||
      selectedInventory?.totalPrintingCost ||
      selectedInventory?.totalMountingCost ||
      selectedInventory?.oneTimeInstallationCost ||
      selectedInventory?.monthlyAdditionalCost ||
      selectedInventory?.otherCharges ||
      selectedInventory?.discountPercentage ||
      selectedInventory?.printingCostPerSqft ||
      selectedInventory?.mountingCostPerSqft ||
      selectedInventory?.tradedAmount ||
      selectedInventory?.discount
    ) {
      form.reset({
        displayCostPerMonth: selectedInventory.displayCostPerMonth || 0,
        totalDisplayCost: selectedInventory.totalDisplayCost || 0,
        displayCostPerSqFt: selectedInventory.displayCostPerSqFt || 0,
        displayCostGstPercentage: selectedInventory.displayCostGstPercentage || 0,
        displayCostGst: selectedInventory.displayCostGst || 0,
        printingCostPerSqft: selectedInventory.printingCostPerSqft || 0,
        printingGstPercentage: selectedInventory.printingGstPercentage || 0,
        printingGst: selectedInventory.printingGst || 0,
        totalPrintingCost: selectedInventory.totalPrintingCost || 0,
        mountingCostPerSqft: selectedInventory.mountingCostPerSqft || '',
        mountingGstPercentage: selectedInventory.mountingGstPercentage || 0,
        mountingGst: selectedInventory.mountingGst || 0,
        totalMountingCost: selectedInventory.totalMountingCost || 0,
        oneTimeInstallationCost: selectedInventory.oneTimeInstallationCost || 0,
        monthlyAdditionalCost: selectedInventory.monthlyAdditionalCost || 0,
        otherCharges: selectedInventory.otherCharges || 0,
        tradedAmount: selectedInventory.tradedAmount || 0,
        applyPrintingMountingCostForAll: selectedInventory.applyPrintingMountingCostForAll || false,
        subjectToExtension: selectedInventory.subjectToExtension || false,
        discountOn: selectedInventory.discountOn || 'displayCost',
        discount: selectedInventory.discount || 0,
        applyDiscountForAll: selectedInventory.applyDiscountForAll || false,
        discountedDisplayCost: selectedInventory.discountedDisplayCost || 0,
        discountedPriceOverDisplayCost: calculateDiscountOnDisplayCost({
          discountOn: selectedInventory.discountOn,
          value:
            selectedInventory.displayCostPerMonth *
            calculateTotalMonths(selectedInventory?.startDate, selectedInventory?.endDate),
          discountPercentage: selectedInventory.discount,
          gstPercentage: 0,
        }),
      });
    } else {
      form.reset(defaultValues);
    }
  }, [selectedInventory, activeSlide, isOpened]);

  return (
    <Drawer
      className="overflow-auto"
      overlayOpacity={0.1}
      overlayBlur={0}
      size="510px"
      position="right"
      opened={isOpened}
      styles={styles}
      title="Price Breakdown"
      onClose={onClose}
      classNames={{
        title: 'text-xl font-semibold',
        header: 'px-6 mb-0 z-20 h-16 sticky top-0 bg-white',
        closeButton: 'text-black',
        body: 'p-0',
      }}
    >
      <div className="sticky top-16 bg-white z-10">
        <Divider className="pt-4" />
        <Carousel
          align="center"
          controlsOffset="lg"
          initialSlide={0}
          nextControlIcon={<ChevronRight size={25} className="rounded-full" />}
          previousControlIcon={<ChevronLeft size={25} className="rounded-full" />}
          classNames={{
            controls: 'bg-none',
            control: 'border-none',
          }}
          onSlideChange={setActiveSlide}
        >
          {selectedInventories?.map(inventory => (
            <Carousel.Slide>
              <div className="bg-gray-200 h-full rounded-lg p-4 w-3/4 m-auto flex flex-col justify-between">
                <div
                  className="text-xl truncate w-80"
                  title={inventory.spaceName || inventory?.basicInformation?.spaceName}
                >
                  {inventory.spaceName || inventory?.basicInformation?.spaceName}
                </div>
                <div className="text-lg text-gray-400">
                  City{' '}
                  <span className="text-black">{inventory.location?.city || inventory?.city}</span>
                </div>
                <div className="text-lg text-gray-400 flex">
                  <div>
                    Dimension
                    <div className="text-lg text-gray-400 p-0 m-0">(WxH)</div>
                  </div>
                  <span className="text-black">
                    {inventory?.dimension
                      ?.map(item => `${item?.width || 0}ft x ${item?.height || 0}ft`)
                      .filter(item => item !== null)
                      .join(', ')}
                  </span>
                </div>
                <div className="text-lg text-gray-400">
                  Area <span className="text-black">{totalArea} sq.ft.</span>
                </div>
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>
        <Divider className="mt-4" />
      </div>
      <FormProvider {...form}>
        <form
          onSubmit={e => {
            e.stopPropagation();

            return form.handleSubmit(onSubmit)(e);
          }}
        >
          <div className="h-fit overflow-auto">
            <div className="border border-yellow-350 bg-yellow-250 m-6 p-4 rounded-lg flex flex-col gap-4">
              {mode !== 'view' ? (
                <div>
                  <div className="text-lg font-bold">Apply Display Cost</div>
                  <div className="text-gray-500 text-base">
                    Please select either Display Cost (per month) or Display Cost (per sq. ft.)
                  </div>
                </div>
              ) : null}
              <div className="text-base font-bold">Display Cost (per month)</div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <ControlledNumberInput
                    disabled={mode === 'view'}
                    precision={2}
                    label="Cost"
                    name="displayCostPerMonth"
                    hideControls
                    classNames={{ label: 'text-base font-bold' }}
                    className={classNames(type === 'bookings' ? 'w-3/4' : 'w-full')}
                    thousandSeparator=","
                    onKeyUp={e => onChangeDisplayCostPerMonth(Number(e.target.value).toFixed(2))}
                  />
                  {type === 'bookings' ? (
                    <ControlledNumberInput
                      disabled={mode === 'view'}
                      precision={2}
                      label="GST"
                      name="displayCostGstPercentage"
                      min={0}
                      hideControls
                      classNames={{ label: 'text-base font-bold' }}
                      className="w-1/4"
                      rightSection="%"
                      onKeyUp={e =>
                        onChangeDisplayCostPercentage(Number(e.target.value).toFixed(2))
                      }
                      max={100}
                    />
                  ) : null}
                </div>
                <ControlledNumberInput
                  precision={2}
                  label="Total"
                  name="totalDisplayCost"
                  disabled
                  hideControls
                  classNames={{ label: 'text-base font-bold' }}
                  thousandSeparator=","
                />
              </div>
              <div className="text-base font-bold">Display Cost (per sq. ft.)</div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <ControlledNumberInput
                    disabled={mode === 'view'}
                    precision={2}
                    label="Cost"
                    name="displayCostPerSqFt"
                    hideControls
                    classNames={{ label: 'text-base font-bold' }}
                    className={classNames(type === 'bookings' ? 'w-3/4' : 'w-full')}
                    thousandSeparator=","
                    onKeyUp={e => onChangeDisplayCostPerSqFt(Number(e.target.value).toFixed(2))}
                  />
                  {type === 'bookings' ? (
                    <ControlledNumberInput
                      disabled={mode === 'view'}
                      precision={2}
                      label="GST"
                      name="displayCostGstPercentage"
                      min={0}
                      hideControls
                      classNames={{ label: 'text-base font-bold' }}
                      className="w-1/4"
                      rightSection="%"
                      onKeyUp={e =>
                        onChangeDisplayCostPercentage(Number(e.target.value).toFixed(2))
                      }
                      max={100}
                    />
                  ) : null}
                </div>
                <ControlledNumberInput
                  precision={2}
                  label="Total"
                  name="totalDisplayCost"
                  disabled
                  hideControls
                  classNames={{ label: 'text-base font-bold' }}
                  thousandSeparator=","
                />
              </div>

              {type === 'bookings' ? (
                <ControlledNumberInput
                  disabled={mode === 'view'}
                  precision={2}
                  label="Traded Amount"
                  name="tradedAmount"
                  hideControls
                  classNames={{ label: 'text-base font-bold' }}
                />
              ) : (
                <ControlledNumberInput
                  disabled={mode === 'view'}
                  precision={2}
                  label="Discounted Display Cost (per month)"
                  name="discountedDisplayCost"
                  hideControls
                  classNames={{ label: 'text-base font-bold' }}
                />
              )}
            </div>
            <div className="border border-blue-200 bg-blue-100 m-6 p-4 rounded-lg flex flex-col gap-4">
              {mode !== 'view' ? (
                <Checkbox
                  name="applyPrintingMountingCostForAll"
                  label="Apply for all selected inventories"
                  classNames={{ label: 'text-lg font-bold', body: 'items-center' }}
                  checked={form.getValues('applyPrintingMountingCostForAll')}
                  onChange={() =>
                    form.setValue(
                      'applyPrintingMountingCostForAll',
                      !watchApplyPrintingMountingCostForAll,
                    )
                  }
                />
              ) : null}
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <ControlledNumberInput
                    disabled={mode === 'view'}
                    precision={2}
                    label="Printing Cost (per sq. ft.)"
                    name="printingCostPerSqft"
                    hideControls
                    classNames={{ label: 'text-base font-bold' }}
                    className={classNames(type === 'bookings' ? 'w-3/4' : 'w-full')}
                    onKeyUp={e => onChangePrintingCost(Number(e.target.value).toFixed(2))}
                  />
                  {type === 'bookings' ? (
                    <ControlledNumberInput
                      disabled={mode === 'view'}
                      precision={2}
                      label="GST"
                      name="printingGstPercentage"
                      hideControls
                      classNames={{ label: 'text-base font-bold' }}
                      className="w-1/4"
                      rightSection="%"
                      max={100}
                      onKeyUp={e => onChangePrintingCostGst(Number(e.target.value).toFixed(2))}
                    />
                  ) : null}
                </div>
                <ControlledNumberInput
                  precision={2}
                  label="Total Printing Cost"
                  name="totalPrintingCost"
                  disabled
                  hideControls
                  classNames={{ label: 'text-base font-bold' }}
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <ControlledNumberInput
                    disabled={mode === 'view'}
                    precision={2}
                    label="Mounting Cost (per sq. ft.)"
                    name="mountingCostPerSqft"
                    hideControls
                    classNames={{ label: 'text-base font-bold' }}
                    className={classNames(type === 'bookings' ? 'w-3/4' : 'w-full')}
                    onKeyUp={e => onChangeMountingCost(Number(e.target.value).toFixed(2))}
                  />
                  {type === 'bookings' ? (
                    <ControlledNumberInput
                      disabled={mode === 'view'}
                      precision={2}
                      label="GST"
                      name="mountingGstPercentage"
                      hideControls
                      classNames={{ label: 'text-base font-bold' }}
                      className="w-1/4"
                      rightSection="%"
                      max={100}
                      onKeyUp={e => onChangeMountingCostGst(Number(e.target.value).toFixed(2))}
                    />
                  ) : null}
                </div>
                <ControlledNumberInput
                  precision={2}
                  label="Total Mounting Cost"
                  name="totalMountingCost"
                  disabled
                  hideControls
                  classNames={{ label: 'text-base font-bold' }}
                />
              </div>
            </div>
            <div className="border border-purple-350 bg-purple-100 m-6 p-4 rounded-lg flex flex-col gap-4">
              <div className="text-lg font-bold">
                Miscellaneous{' '}
                <span className="text-xs font-normal italic">
                  ** {type === 'bookings' ? 'inclusive' : 'exclusive'} of GST
                </span>
              </div>
              <ControlledNumberInput
                disabled={mode === 'view'}
                precision={2}
                label="One-time Installation Cost"
                name="oneTimeInstallationCost"
                hideControls
                classNames={{ label: 'text-base font-bold' }}
              />
              <ControlledNumberInput
                disabled={mode === 'view'}
                precision={2}
                label="Monthly Additional Cost"
                name="monthlyAdditionalCost"
                hideControls
                classNames={{ label: 'text-base font-bold' }}
              />
              {type === 'bookings' ? (
                <ControlledNumberInput
                  disabled={mode === 'view'}
                  precision={2}
                  label={
                    <div>
                      Other Charges (<span className="text-red-600">-</span>)
                    </div>
                  }
                  name="otherCharges"
                  hideControls
                  classNames={{ label: 'text-base font-bold' }}
                />
              ) : null}
            </div>
            {type === 'bookings' ? (
              <div className="border border-green-350 bg-green-100 m-6 p-4 rounded-lg flex flex-col gap-4">
                {mode !== 'view' ? (
                  <>
                    <Checkbox
                      name="applyDiscountForAll"
                      label="Apply for all selected inventories"
                      classNames={{ label: 'text-lg font-bold', body: 'items-center' }}
                      checked={form.getValues('applyDiscountForAll')}
                      onChange={() =>
                        form.setValue('applyDiscountForAll', !watchApplyDiscountForAll)
                      }
                    />
                    <div className="text-lg">
                      Please select how you would like to apply the discount
                    </div>
                  </>
                ) : null}

                {mode !== 'view' ? (
                  <div className="flex items-center gap-4">
                    <div className="text-base font-medium">Display Cost</div>
                    <Switch
                      size="lg"
                      classNames={{ track: 'border-2 border-slate' }}
                      checked={watchDiscountOn === 'totalPrice'}
                      onChange={() => {
                        if (mode === 'view') return;
                        form.setValue(
                          'discountOn',
                          watchDiscountOn === 'displayCost' ? 'totalPrice' : 'displayCost',
                        );
                      }}
                    />
                    <div className="text-base font-medium">Total Price</div>
                  </div>
                ) : null}

                <ControlledNumberInput
                  disabled={mode === 'view'}
                  precision={2}
                  label="Discount (%)"
                  name="discount"
                  hideControls
                  classNames={{ label: 'text-base font-bold' }}
                />

                {mode === 'view' ? (
                  <ControlledNumberInput
                    disabled
                    precision={2}
                    label="Discounted Price Over Display Cost"
                    name="discountedPriceOverDisplayCost"
                    hideControls
                    classNames={{ label: 'text-base font-bold' }}
                  />
                ) : null}
              </div>
            ) : (
              <div className="border border-green-350 bg-green-100 m-6 p-4 rounded-lg flex flex-col gap-4">
                <div className="text-lg font-bold">Subject to Extension</div>
                <div className="flex items-center gap-4">
                  <div className="text-base font-medium">No</div>
                  <Switch
                    name="subjectToExtension"
                    size="lg"
                    classNames={{ track: 'border-2 border-slate' }}
                    checked={watchSubjectToExtension}
                    onChange={() => {
                      if (mode === 'view') return;
                      form.setValue('subjectToExtension', !watchSubjectToExtension);
                    }}
                  />
                  <div className="text-base font-medium">Yes</div>
                </div>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 z-10 bg-white p-6 pt-2 flex flex-col gap-6">
            <div className="flex justify-between">
              <div className="text-lg font-semibold">Total Price</div>
              <div className="text-xl text-purple-450 font-semibold">
                {indianCurrencyInDecimals(totalPrice)}
              </div>
            </div>
            {mode !== 'view' ? (
              <div className="flex justify-between">
                <Button className="bg-black order-3 px-20 font-medium" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="bg-purple-450 order-3 px-20 font-medium" type="submit">
                  Confirm
                </Button>
              </div>
            ) : null}
          </div>
        </form>
      </FormProvider>
    </Drawer>
  );
};

export default AddEditPriceDrawer;
