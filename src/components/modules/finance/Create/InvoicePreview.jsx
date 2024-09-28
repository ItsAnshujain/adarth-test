import { Group, Text } from '@mantine/core';
import React, { useMemo } from 'react';
import { ToWords } from 'to-words';
import { v4 as uuidv4 } from 'uuid';
import toIndianCurrency from '../../../../utils/currencyFormat';

const InvoicePreview = ({ previewData, previewSpaces = [], totalPrice, hasBookingId }) => {
  const toWords = new ToWords();

  const memoizedTotalPrice = useMemo(
    () => Number((totalPrice + totalPrice * 0.18).toFixed(2)),
    [totalPrice],
  );

  return (
    <div className="px-5">
      <div className="max-h-[500px] overflow-y-auto">
        <section className="my-3 p-5 bg-gray-100 grid grid-cols-2 gap-x-5">
          <p className="text-lg mb-1">
            <span className="font-bold">Invoice No:</span> {previewData?.invoiceNo}
          </p>
        </section>

        <article className="my-3">
          <h2 className="font-medium capitalize text-xl mb-2">Supplier:</h2>
          <section className="p-5 bg-gray-100">
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Supplier Name:</span> {previewData?.supplierName}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">GSTIN/UIN:</span> {previewData?.supplierGst}
              </p>
            </div>
            <p className="text-lg mb-1">
              <span className="font-bold">Street Address:</span>{' '}
              {previewData?.supplierStreetAddress}
            </p>
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">City:</span> {previewData?.supplierCity}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">Pin:</span> {previewData?.supplierZip}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Contact:</span> {previewData?.supplierPhone}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">Email:</span> {previewData?.supplierEmail}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Supplier Ref:</span> {previewData?.supplierRefNo}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">Other Reference(s):</span>{' '}
                {previewData?.supplierOtherReference}
              </p>
            </div>
            <p className="text-lg mb-1">
              <span className="font-bold">Website:</span> {previewData?.supplierWebsite}
            </p>
          </section>
        </article>

        <article className="my-3">
          <h2 className="font-medium capitalize text-xl mb-2">Buyer Details:</h2>
          <section className="p-5 bg-gray-100">
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Buyer Name:</span> {previewData?.buyerName}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">Contact Person:</span> {previewData?.buyerContactPerson}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Contact:</span> {previewData?.buyerPhone}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">GSTIN/UIN:</span> {previewData?.buyerGst}
              </p>
            </div>
            <p className="text-lg mb-1">
              <span className="font-bold">Street Address:</span> {previewData?.buyerStreetAddress}
            </p>
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">City:</span> {previewData?.buyerCity}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">Pin:</span> {previewData?.buyerZip}
              </p>
            </div>
            <p className="text-lg mb-1">
              <span className="font-bold">Buyer&apos;s Order No.:</span>{' '}
              {previewData?.buyerOrderNumber}
            </p>
            <p className="text-lg mb-1">
              <span className="font-bold">Dispatched Document No.:</span>{' '}
              {previewData?.dispatchDocumentNumber}
            </p>
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Dispatched through:</span>{' '}
                {previewData?.dispatchThrough}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">Destination:</span> {previewData?.destination}
              </p>
            </div>
            <p className="text-lg mb-1">
              <span className="font-bold">Delivery Note:</span> {previewData?.deliveryNote}
            </p>
            <p className="text-lg mb-1">
              <span className="font-bold">Terms of Delivery:</span> {previewData?.termOfDelivery}
            </p>
          </section>
        </article>

        <article className="my-3">
          <h2 className="font-medium capitalize text-xl mb-2">Description of Services:</h2>
          <section className="p-5 bg-gray-100">
            {hasBookingId
              ? previewSpaces.map((item, index) => (
                  <div className="grid grid-cols-2" key={item?._id}>
                    <Group>
                      <p className="text-lg">{index + 1}</p>
                      <Text
                        className="overflow-hidden text-ellipsis max-w-[280px]"
                        lineClamp={1}
                        title={item?.basicInformation?.spaceName}
                      >
                        {item?.basicInformation?.spaceName}
                      </Text>
                    </Group>
                    <Group className="grid grid-cols-4">
                      <div>
                        <p>HSN:</p>
                        <p>{item?.hsn || '-'}</p>
                      </div>
                      <div>
                        <p>Unit:</p>
                        <p>{item?.unit ?? 1}</p>
                      </div>
                      <div>
                        <p>Rate:</p>
                        <p>{item?.campaignPrice}</p>
                      </div>
                      <div>
                        <p>Total Amount:</p>
                        <p>{item?.campaignPrice}</p>
                      </div>
                    </Group>
                  </div>
                ))
              : previewData?.spaces?.map((item, index) => (
                  <Group className="grid grid-cols-8" key={uuidv4()}>
                    <div className="flex items-center gap-4">
                      <p className="text-lg">{index + 1}</p>
                      <div>
                        <p>City:</p>
                        <p>{item?.city || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <p>Location:</p>
                      <p>{item?.location || '-'}</p>
                    </div>
                    <div>
                      <p>Hsn:</p>
                      <p>{item?.hsn || '-'}</p>
                    </div>
                    <div>
                      <p>Dimension:</p>
                      <p>{`${item?.dimensions?.[0]?.height}x${item?.dimensions?.[0]?.width}`}</p>
                    </div>
                    <div>
                      <p>Area:</p>
                      <p>{item?.areaInSqFt}</p>
                    </div>
                    <div>
                      <p>Total Display Cost/Month:</p>
                      <p>{toIndianCurrency(item?.displayCostPerMonth)}</p>
                    </div>
                    <div>
                      <p>Printing Cost:</p>
                      <p>{toIndianCurrency(item?.totalPrintingCost)}</p>
                    </div>
                    <div>
                      <p>Mounting Cost:</p>
                      <p>{toIndianCurrency(item?.totalMountingCost)}</p>
                    </div>
                  </Group>
                ))}
            <div className="flex justify-end mt-4">
              <p className="text-lg font-bold">Amount:</p>
              <p className="text-lg ml-2">{toIndianCurrency(totalPrice) || 0}</p>
            </div>
            <div className="flex justify-end">
              <p className="text-lg font-bold">GST 18%:</p>
              <p className="text-lg ml-2">{toIndianCurrency(totalPrice * 0.18) || 0}</p>
            </div>
            <div className="flex justify-end">
              <p className="text-lg font-bold">Total:</p>
              <p className="text-lg ml-2">{toIndianCurrency(memoizedTotalPrice) || 0}</p>
            </div>
          </section>
        </article>

        <article className="my-3 p-5 bg-gray-100 flex mb-1">
          <p className="text-lg font-bold">Amount Chargeable (in words):</p>
          <p className="text-lg ml-2">{(totalPrice && toWords.convert(memoizedTotalPrice)) || 0}</p>
        </article>

        <article className="my-3">
          <h2 className="font-medium capitalize text-xl mb-2">Company&apos;s Bank Details:</h2>
          <section className="p-5 bg-gray-100">
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Bank Name:</span> {previewData?.bankName}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">A/c No.:</span> {previewData?.accountNo}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Branch & IFSC Code:</span> {previewData?.ifscCode}
              </p>
              <p className="text-lg mb-1 uppercase">
                <span className="font-bold">Payment Type:</span>{' '}
                {previewData?.modeOfPayment && previewData.modeOfPayment.includes('_')
                  ? previewData.modeOfPayment.split('_').join(' ')
                  : previewData?.modeOfPayment}
              </p>
            </div>
            <p className="text-lg mb-1">
              <span className="font-bold">Declaration:</span> {previewData?.declaration}
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default InvoicePreview;
