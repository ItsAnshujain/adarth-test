import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Group } from '@mantine/core';
import toIndianCurrency from '../../../../utils/currencyFormat';
import { DATE_SECOND_FORMAT } from '../../../../utils/constants';
import NoData from '../../../shared/NoData';

const OrderInformationCard = () => {
  const queryClient = useQueryClient();
  const { id: bookingId } = useParams();
  const bookingData = queryClient.getQueryData(['booking-by-id', bookingId]);

  return (
    <div>
      <p className="font-bold text-lg mb-2">Order Info</p>
      <div className="flex p-4 gap-12 border flex-wrap">
        <div>
          <p className="text-slate-400">Order Id</p>
          <p className="font-bold">{bookingData?.bookingId || ''}</p>
        </div>
        <div>
          <p className="text-slate-400">Client type</p>
          <p className="font-bold">{bookingData?.client.clientType || ''}</p>
        </div>
        <div>
          <p className="text-slate-400">Order Date</p>
          <p className="font-bold">
            {bookingData?.createdAt ? dayjs(bookingData?.createdAt).format('D MMMM  YYYY') : ''}
          </p>
        </div>
        <div>
          <p className="text-slate-400">Price</p>
          <Group className="gap-1">
            <p className="font-bold">{toIndianCurrency(bookingData?.campaign?.totalPrice)}</p>
            <p className="text-xs italic">**inclusive of gst</p>
          </Group>
        </div>
        <div>
          <p className="text-slate-400">Traded Amount</p>
          <Group className="gap-1">
            <p className="font-bold">{toIndianCurrency(bookingData?.campaign?.tradedAmount)}</p>
          </Group>
        </div>
        <div>
          <p className="text-slate-400">Start Date</p>
          <p className="font-bold">
            {bookingData?.campaign?.startDate ? (
              dayjs(bookingData.campaign.startDate).format(DATE_SECOND_FORMAT)
            ) : (
              <NoData type="na" />
            )}
          </p>
        </div>
        <div>
          <p className="text-slate-400">End Date</p>
          <p className="font-bold">
            {bookingData?.campaign?.endDate ? (
              dayjs(bookingData.campaign.endDate).format(DATE_SECOND_FORMAT)
            ) : (
              <NoData type="na" />
            )}
          </p>
        </div>
        <div>
          <p className="text-slate-400">Printing Status</p>
          <p className="font-bold">
            {bookingData?.currentStatus?.printingStatus?.toLowerCase()?.includes('upcoming')
              ? 'Upcoming'
              : bookingData?.currentStatus?.printingStatus?.toLowerCase()?.includes('in progress')
              ? 'In progress'
              : bookingData?.currentStatus?.printingStatus?.toLowerCase()?.includes('completed')
              ? 'Completed'
              : 'Upcoming'}
          </p>
        </div>
        <div>
          <p className="text-slate-400">Booking Type</p>
          <p className="font-bold capitalize">{bookingData?.type}</p>
        </div>
        <div>
          <p className="text-slate-400">Mounting Status</p>
          <p className="font-bold">
            {bookingData?.currentStatus?.mountingStatus?.toLowerCase()?.includes('upcoming')
              ? 'Upcoming'
              : bookingData?.currentStatus?.mountingStatus?.toLowerCase()?.includes('in progress')
              ? 'In progress'
              : bookingData?.currentStatus?.mountingStatus?.toLowerCase()?.includes('completed')
              ? 'Completed'
              : 'Upcoming'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderInformationCard;
