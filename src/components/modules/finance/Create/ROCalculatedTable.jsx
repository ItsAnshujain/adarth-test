import { ActionIcon, Group } from '@mantine/core';
import React, { useState } from 'react';
import { Edit } from 'react-feather';
import { useFormContext } from '../../../../context/formContext';
import toIndianCurrency from '../../../../utils/currencyFormat';
import NumberInput from '../../../shared/NumberInput';

const ROCalculatedTable = ({ calculatedData, isEditable = true }) => {
  const [isMonth, setIsMonth] = useState(false);
  const { values } = useFormContext();
  return (
    <Group position="right" className="mt-2">
      <article className="w-[700px]">
        <section className="grid grid-cols-4 mb-2">
          <p />
          <p className="bg-gray-100 text-center font-medium border border-gray-200 py-1">
            Total Display Cost
          </p>
          <p className="bg-gray-100 text-center font-medium border border-gray-200 py-1">
            Printing Cost
          </p>
          <p className="bg-gray-100 text-center font-medium border border-gray-200 py-1">
            Mounting Cost
          </p>
        </section>
        <section className="bg-gray-100 grid grid-cols-4 mb-2 border border-gray-200 py-1">
          <p className="text-center font-medium">Total Price: </p>
          <p className="bg-gray-100 text-center border-x-2 border-gray-200">
            {calculatedData?.initTotal?.display
              ? toIndianCurrency(calculatedData.initTotal.display)
              : 0}
          </p>
          <p className="bg-gray-100 text-center border-r-2 border-gray-200">
            {calculatedData?.initTotal?.printing
              ? toIndianCurrency(calculatedData.initTotal.printing)
              : 0}
          </p>
          <p className="bg-gray-100 text-center">
            {calculatedData?.initTotal?.mounting
              ? toIndianCurrency(calculatedData.initTotal.mounting)
              : 0}
          </p>
        </section>
        <section className="bg-gray-100 grid grid-cols-4 mb-2 border border-gray-200 py-1">
          <p className="text-center font-medium">Discount: </p>
          <p className="bg-gray-100 text-center border-x-2 border-gray-200">
            {calculatedData?.discount?.display
              ? toIndianCurrency(calculatedData.discount.display)
              : 0}
          </p>
          <p className="bg-gray-100 text-center border-r-2 border-gray-200">
            {calculatedData?.discount?.printing
              ? toIndianCurrency(calculatedData.discount.printing)
              : 0}
          </p>
          <p className="bg-gray-100 text-center">
            {calculatedData?.discount?.mounting
              ? toIndianCurrency(calculatedData.discount.mounting)
              : 0}
          </p>
        </section>
        <section className="bg-gray-100 grid grid-cols-4 mb-2 border border-gray-200 py-1">
          <p className="text-center font-medium">Sub Total: </p>
          <p className="bg-gray-100 text-center border-x-2 border-gray-200">
            {calculatedData?.subTotal?.display
              ? toIndianCurrency(calculatedData.subTotal.display)
              : 0}
          </p>
          <p className="bg-gray-100 text-center border-r-2 border-gray-200">
            {calculatedData?.subTotal?.printing
              ? toIndianCurrency(calculatedData.subTotal.printing)
              : 0}
          </p>
          <p className="bg-gray-100 text-center">
            {calculatedData?.subTotal?.mounting
              ? toIndianCurrency(calculatedData.subTotal.mounting)
              : 0}
          </p>
        </section>
        <section className="bg-gray-100 grid grid-cols-4 mb-2 border border-gray-200 py-1">
          <p className="text-center font-medium">GST 18%: </p>
          <p className="bg-gray-100 text-center border-x-2 border-gray-200">
            {calculatedData?.gst?.display ? toIndianCurrency(calculatedData.gst.display) : 0}
          </p>
          <p className="bg-gray-100 text-center border-r-2 border-gray-200">
            {calculatedData?.gst?.printing ? toIndianCurrency(calculatedData.gst.printing) : 0}
          </p>
          <p className="bg-gray-100 text-center">
            {!calculatedData?.mountingGstPercentage ||
            (calculatedData?.mountingGstPercentage === 18 && calculatedData?.gst?.mounting)
              ? toIndianCurrency(calculatedData?.gst?.mounting)
              : '-'}
          </p>
        </section>

        {calculatedData?.mountingGstPercentage && calculatedData.mountingGstPercentage !== 18 ? (
          <section className="bg-gray-100 grid grid-cols-4 mb-2 border border-gray-200 py-1">
            <p className="text-center font-medium">
              Mounting GST {calculatedData.mountingGstPercentage}%:{' '}
            </p>
            <p className="bg-gray-100 text-center border-x-2 border-gray-200">-</p>
            <p className="bg-gray-100 text-center border-r-2 border-gray-200">-</p>
            <p className="bg-gray-100 text-center">
              {toIndianCurrency(calculatedData.gst?.mounting ?? 0)}
            </p>
          </section>
        ) : null}

        <section className="bg-gray-100 grid grid-cols-4 mb-2 border border-gray-200 py-1">
          <p className="text-center font-medium">Total: </p>
          <p className="bg-gray-100 text-center border-x-2 border-gray-200">
            {calculatedData?.total?.display ? toIndianCurrency(calculatedData.total.display) : 0}
          </p>
          <p className="bg-gray-100 text-center border-r-2 border-gray-200">
            {calculatedData?.total?.printing ? toIndianCurrency(calculatedData.total.printing) : 0}
          </p>
          <p className="bg-gray-100 text-center">
            {calculatedData?.total?.mounting ? toIndianCurrency(calculatedData.total.mounting) : 0}
          </p>
        </section>
        <section className="bg-gray-100 grid grid-cols-4 mb-2 border border-gray-200 py-2">
          <div className="flex justify-center items-center">
            {isEditable && isMonth ? (
              <NumberInput
                name="forMonths"
                placeholder="Write..."
                min={1}
                max={36}
                className="max-w-[80%]"
                size="xs"
              />
            ) : (
              <p className="text-center font-medium">For {values.forMonths} month(s): </p>
            )}
            {isEditable ? (
              <ActionIcon onClick={() => setIsMonth(!isMonth)}>
                <Edit className="text-purple-450" size={20} />
              </ActionIcon>
            ) : null}
          </div>
          <p className="bg-gray-100 text-center border-x-2 border-gray-200">
            {calculatedData?.threeMonthTotal?.display
              ? toIndianCurrency(calculatedData.threeMonthTotal.display)
              : 0}
          </p>

          <p className="bg-gray-100 text-center border-r-2 border-gray-200">
            {calculatedData?.threeMonthTotal?.printing
              ? toIndianCurrency(calculatedData.threeMonthTotal.printing)
              : 0}
          </p>
          <p className="bg-gray-100 text-center">
            {calculatedData?.threeMonthTotal?.mounting
              ? toIndianCurrency(calculatedData.threeMonthTotal.mounting)
              : 0}
          </p>
        </section>
        <section className="bg-gray-100 grid grid-cols-4 mb-2 border border-gray-300 py-1">
          <p className="text-center font-medium">Grand Total: </p>
          <p className="bg-gray-100 text-right col-span-3 pr-10">
            {calculatedData?.grandTotal ? toIndianCurrency(calculatedData.grandTotal) : 0}
          </p>
        </section>
      </article>
    </Group>
  );
};

export default ROCalculatedTable;
