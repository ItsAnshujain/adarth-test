import { Carousel } from '@mantine/carousel';
import { Divider, Drawer } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import shallow from 'zustand/shallow';
import {
  calculateTotalArea,
  calculateTotalCostOfBooking,
  calculateTotalDisplayCost,
  getUpdatedBookingData,
  getUpdatedProposalData,
} from '../../../../utils';
import useBookingStore from '../../../../store/booking.store';
import useProposalStore from '../../../../store/proposal.store';
import toIndianCurrency from '../../../../utils/currencyFormat';

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

const ViewPriceDrawer = ({
  isOpened,
  onClose,
  selectedInventories,
  styles = {},
  selectedInventoryId,
  type,
}) => {
  const formContext = useFormContext();
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const [activeSlide, setActiveSlide] = useState();

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
        discount: inventory.discount || 0,
        applyDiscountForAll: inventory.applyDiscountForAll || false,
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
              <div>
                <div className="flex justify-between">
                  <div>Display Cost (per month)</div>
                  <div className="font-semibold text-lg">
                    {toIndianCurrency(form.watch('totalDisplayCost'))}
                  </div>
                </div>
                <div className="text-lg">{toIndianCurrency(form.watch('displayCostPerMonth'))}</div>
              </div>
              <div>
                <div className="flex justify-between">
                  <div>Display Cost (per sq. ft.)</div>
                  <div className="font-semibold text-lg">
                    {toIndianCurrency(form.watch('totalDisplayCost'))}
                  </div>
                </div>
                <div className="text-lg">{toIndianCurrency(form.watch('displayCostPerSqFt'))}</div>
              </div>
              <div className="flex justify-between">
                <div>Discounted Display Cost</div>
                <div className="font-semibold text-lg">
                  {toIndianCurrency(form.watch('discountedDisplayCost'))}
                </div>
              </div>
            </div>
            <div className="border border-blue-200 bg-blue-100 m-6 p-4 rounded-lg flex flex-col gap-4">
              <div>
                <div className="flex justify-between">
                  <div>Printing Cost (per sq.ft.)</div>
                  <div className="font-semibold text-lg">
                    {toIndianCurrency(form.watch('totalPrintingCost'))}
                  </div>
                </div>
                <div className="text-lg">{toIndianCurrency(form.watch('printingCostPerSqft'))}</div>
              </div>
              <div>
                <div className="flex justify-between">
                  <div>Mounting Cost (per sq.ft.)</div>
                  <div className="font-semibold text-lg">
                    {toIndianCurrency(form.watch('totalMountingCost'))}
                  </div>
                </div>
                <div className="text-lg">{toIndianCurrency(form.watch('mountingCostPerSqft'))}</div>
              </div>
            </div>
            <div className="border border-purple-350 bg-purple-100 m-6 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex justify-between">
                <div>One-time Installation Cost</div>
                <div className="font-semibold text-lg">
                  {toIndianCurrency(form.watch('oneTimeInstallationCost'))}
                </div>
              </div>
              <div className="flex justify-between">
                <div>Monthly Additional Cost</div>
                <div className="font-semibold text-lg">
                  {toIndianCurrency(form.watch('monthlyAdditionalCost'))}
                </div>
              </div>
            </div>
            <div className="border border-green-350 bg-green-100 m-6 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex justify-between">
                <div>Subject to Extension</div>
                <div className="text-lg font-semibold">
                  {form.watch('subjectToExtension') ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Drawer>
  );
};

export default ViewPriceDrawer;
