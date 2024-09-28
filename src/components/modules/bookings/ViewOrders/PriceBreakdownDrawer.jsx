import { useMemo } from 'react';
import { Divider, Drawer } from '@mantine/core';
import toIndianCurrency from '../../../../utils/currencyFormat';
import { calculateGst, calculateTotalMonths } from '../../../../utils';

const PriceBreakdownDrawer = ({ isOpened, styles, onClose, type, spaces }) => {
  const data = useMemo(() => {
    const calculatedData = {
      totalDisplayCost: 0,
      discountedDisplayCost: 0,
      displayCostGst: 0,
      totalPrintingCost: 0,
      printingCostGst: 0,
      totalMountingCost: 0,
      mountingCostGst: 0,
      oneTimeInstallationCost: 0,
      monthlyAdditionalCost: 0,
      otherCharges: 0,
      totalPrice: 0,
      discount: 0,
    };

    spaces?.forEach(space => {
      const totalDisplayCost =
        Number(Number(space.totalDisplayCost).toFixed(2)) /
          (1 + (space.displayCostGstPercentage || 0) / 100) || 0;

      const discountOnDisplayCost =
        space.discountOn === 'displayCost'
          ? calculateGst(totalDisplayCost, Number(space.discountPercentage)) || 0
          : 0;

      const displayCostGst =
        calculateGst(totalDisplayCost, space.displayCostGstPercentage) -
          calculateGst(discountOnDisplayCost, space.displayCostGstPercentage) || 0;

      const totalPrintingCost =
        Number(
          (
            Number(space.totalPrintingCost) /
            (1 + (space.printingGstPercentage || null) / 100)
          ).toFixed(2),
        ) || 0;

      const printingCostGst = calculateGst(totalPrintingCost, space.printingGstPercentage) || 0;

      const totalMountingCost =
        Number(
          (
            Number(space.totalMountingCost) /
            (1 + (space.mountingGstPercentage || null) / 100)
          ).toFixed(2),
        ) || 0;
      const mountingCostGst = calculateGst(totalMountingCost, space.mountingGstPercentage) || 0;

      const discountedDisplayCost =
        space.discountedDisplayCost > 0
          ? Number(space.discountedDisplayCost) *
            calculateTotalMonths(space.startDate, space.endDate)
          : totalDisplayCost;

      const totalMonthlyAdditionalCost =
        Number(space.monthlyAdditionalCost) *
          calculateTotalMonths(space.startDate, space.endDate) || 0;

      calculatedData.totalDisplayCost += totalDisplayCost;
      calculatedData.discountedDisplayCost += discountedDisplayCost;
      calculatedData.displayCostGst += displayCostGst;
      calculatedData.totalPrintingCost += totalPrintingCost;
      calculatedData.printingCostGst += printingCostGst;
      calculatedData.totalMountingCost += totalMountingCost;
      calculatedData.mountingCostGst += mountingCostGst;
      calculatedData.oneTimeInstallationCost += Number(space.oneTimeInstallationCost) || 0;
      calculatedData.monthlyAdditionalCost += totalMonthlyAdditionalCost;
      calculatedData.otherCharges += Number(space.otherCharges) || 0;
      calculatedData.totalPrice += Number(space.campaignPrice) || Number(space.price) || 0;

      calculatedData.discount += discountOnDisplayCost;
    });
    return calculatedData;
  }, [spaces]);

  return (
    <Drawer
      className="overflow-auto"
      overlayOpacity={0.1}
      overlayBlur={0}
      size="510px"
      position="right"
      opened={isOpened}
      styles={styles}
      title="Price Breakdown Total Booking"
      onClose={onClose}
      classNames={{
        title: 'text-xl font-semibold',
        header: 'px-6 mb-0 z-20 h-16 sticky top-0 bg-white',
        closeButton: 'text-black',
        body: 'p-0',
      }}
    >
      <Divider />
      <div className="border border-yellow-350 bg-yellow-250 m-6 p-4 rounded-lg flex flex-col gap-1">
        <div className="flex justify-between">
          <div>Total Display Cost</div>
          <div className="font-bold text-lg">{toIndianCurrency(data.totalDisplayCost)}</div>
        </div>
        {type === 'booking' ? (
          <div className="flex justify-between">
            <div>GST</div>
            <div className="font-bold text-lg">{toIndianCurrency(data.displayCostGst)}</div>
          </div>
        ) : (
          <div className="flex justify-between">
            <div>Total Discounted Display Cost</div>
            <div className="font-bold text-lg">{toIndianCurrency(data.discountedDisplayCost)}</div>
          </div>
        )}
      </div>
      <div className="border border-blue-200 bg-blue-100 m-6 p-4 rounded-lg flex flex-col gap-4">
        <div>
          <div className="flex justify-between">
            <div>Total Printing Cost</div>
            <div className="font-bold text-lg">{toIndianCurrency(data.totalPrintingCost)}</div>
          </div>
          {type === 'booking' ? (
            <div className="flex justify-between">
              <div>GST</div>
              <div className="font-bold text-lg">{toIndianCurrency(data.printingCostGst)}</div>
            </div>
          ) : null}
        </div>
        <div>
          <div className="flex justify-between">
            <div>Total Mounting Cost</div>
            <div className="font-bold text-lg">{toIndianCurrency(data.totalMountingCost)}</div>
          </div>
          {type === 'booking' ? (
            <div className="flex justify-between">
              <div>GST</div>
              <div className="font-bold text-lg">{toIndianCurrency(data.mountingCostGst)}</div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="border border-purple-350 bg-purple-100 m-6 p-4 rounded-lg flex flex-col gap-4">
        {type === 'booking' ? (
          <div className="italic font-normal text-xs">** inclusive of GST</div>
        ) : null}
        <div className="flex justify-between">
          <div>One-time Installation Cost</div>
          <div className="font-bold text-lg">{toIndianCurrency(data.oneTimeInstallationCost)}</div>
        </div>

        <div className="flex justify-between">
          <div>Monthly Additional Cost</div>
          <div className="font-bold text-lg">{toIndianCurrency(data.monthlyAdditionalCost)}</div>
        </div>

        {type === 'booking' ? (
          <div className="flex justify-between">
            <div>
              Other Charges (<span className="text-red-450">-</span>)
            </div>
            <div className="font-bold text-lg">{toIndianCurrency(data.otherCharges)}</div>
          </div>
        ) : null}
      </div>
      {type === 'booking' ? (
        <div className="border border-green-350 bg-green-100 m-6 p-4 rounded-lg flex flex-col">
          <div className="flex justify-between">
            <div>Discount</div>
            <div className="font-bold text-lg">{toIndianCurrency(data.discount)}</div>
          </div>
          <div className="text-gray-550">(Discount over display cost)</div>
        </div>
      ) : null}
      <div className="absolute bottom-0 z-10 bg-white pt-2 gap-6 w-full">
        <Divider />
        <div className="flex justify-between p-6">
          <div className="text-lg font-semibold">Total Price</div>
          <div className="text-xl text-purple-450 font-semibold">
            {toIndianCurrency(data.totalPrice)}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default PriceBreakdownDrawer;
