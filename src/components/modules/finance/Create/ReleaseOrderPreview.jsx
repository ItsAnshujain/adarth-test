import { Group, Text } from '@mantine/core';
import React, { useMemo } from 'react';
import { ToWords } from 'to-words';
import { v4 as uuidv4 } from 'uuid';
import toIndianCurrency from '../../../../utils/currencyFormat';
import ROCalculatedTable from './ROCalculatedTable';

const ReleaseOrderPreview = ({ previewData, previewSpaces = [], totalPrice = 0, hasBookingId }) => {
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
            <span className="font-bold">Release Order No:</span> {previewData?.releaseOrderNo}
          </p>
        </section>

        <article className="my-3">
          <h2 className="font-medium capitalize text-xl mb-2">To:</h2>
          <section className="p-5 bg-gray-100">
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Company Name:</span> {previewData?.companyName}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">Quotation No:</span> {previewData?.quotationNo}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Contact Person:</span> {previewData?.contactPerson}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">Phone:</span> {previewData?.phone}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">Mobile:</span> {previewData?.mobile}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">Email:</span> {previewData?.email}
              </p>
            </div>
            <p className="text-lg mb-1">
              <span className="font-bold">Street Address:</span> {previewData?.streetAddress}
            </p>
            <div className="grid grid-cols-2 gap-x-5">
              <p className="text-lg mb-1">
                <span className="font-bold">City:</span> {previewData?.city}
              </p>
              <p className="text-lg mb-1">
                <span className="font-bold">Pin:</span> {previewData?.zip}
              </p>
            </div>
          </section>
        </article>

        <article className="my-3">
          <h2 className="font-medium capitalize text-xl mb-2">Supplier:</h2>
          <section className="p-5 bg-gray-100 grid grid-cols-2 gap-x-5">
            <p className="text-lg mb-1">
              <span className="font-bold">Supplier Name:</span> {previewData?.supplierName}
            </p>
            <p className="text-lg mb-1">
              <span className="font-bold">Designation:</span> {previewData?.supplierDesignation}
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
                    <Group className="grid grid-cols-3">
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
                        <p>{item?.campaignPrice.toFixed(2)}</p>
                      </div>
                    </Group>
                  </div>
                ))
              : previewData?.spaces?.map((item, index) => (
                  <div className="flex justify-between items-center" key={uuidv4()}>
                    <p className="text-lg mr-2">{index + 1}</p>
                    <Group className="grid grid-cols-7 gap-2">
                      <div>
                        <p>City:</p>
                        <Text
                          className="overflow-hidden text-ellipsis max-w-[180px]"
                          lineClamp={1}
                          title={item?.city}
                        >
                          {item?.city}
                        </Text>
                      </div>
                      <div>
                        <p>Location:</p>
                        <Text
                          className="overflow-hidden text-ellipsis max-w-[180px]"
                          lineClamp={1}
                          title={item?.location}
                        >
                          {item?.location}
                        </Text>
                      </div>

                      <div>
                        <p>
                          Dimensions <span className="text-sm">(WxH)</span>:
                        </p>
                        <div className="flex gap-x-2">
                          {item?.dimensions?.length ? (
                            <p className="max-w-[300px]">
                              {item.dimensions
                                .map(ele => `${ele?.width || 0}ft x ${ele?.height || 0}ft`)
                                .filter(ele => ele !== null)
                                .join(', ')}
                            </p>
                          ) : (
                            '-'
                          )}
                        </div>
                      </div>
                      <div>
                        <p>Area:</p>
                        <Text>{item?.areaInSqFt.toFixed(2)}</Text>
                      </div>
                      <div>
                        <p>Display Cost:</p>
                        <Text>{item?.totalDisplayCost.toFixed(2)}</Text>
                      </div>
                      <div>
                        <p>Printing Cost:</p>
                        <Text>{item?.totalPrintingCost.toFixed(2)}</Text>
                      </div>
                      <div>
                        <p>Mounting Cost:</p>
                        <Text>{item?.totalMountingCost.toFixed(2)}</Text>
                      </div>
                    </Group>
                  </div>
                ))}
            {hasBookingId ? (
              <>
                <div className="flex justify-end">
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
              </>
            ) : null}
          </section>
        </article>

        {!hasBookingId ? (
          <Group position="center">
            <ROCalculatedTable isEditable={false} calculatedData={previewData} />
          </Group>
        ) : null}

        <article className="my-3">
          <section className="p-5 bg-gray-100">
            <div className="flex mb-1">
              <p className="text-lg font-bold">Amount Chargeable (in words):</p>
              <p className="text-lg ml-2">
                {previewData?.grandTotalInWords
                  ? previewData?.grandTotalInWords
                  : totalPrice && toWords.convert(memoizedTotalPrice)}
              </p>
            </div>
            <p className="text-lg">
              <span className="font-bold">Terms & Conditions:</span>{' '}
              {previewData?.termsAndCondition}
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default ReleaseOrderPreview;
