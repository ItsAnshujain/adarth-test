import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Loader } from '@mantine/core';
import completed from '../../../../assets/completed.svg';
import toIndianCurrency from '../../../../utils/currencyFormat';
import { useLeadAgencyStats } from '../../../../apis/queries/leads.queries';
import { financialEndDate, financialStartDate, serialize } from '../../../../utils';

export const data = {
  datasets: [
    {
      data: [3425, 3425],
      backgroundColor: ['#FF900E', '#914EFB'],
      borderColor: ['#FF900E', '#914EFB'],
      borderWidth: 1,
    },
  ],
};

const config = {
  type: 'line',
  data,
  options: { responsive: true },
};

const StatisticsCard = () => {
  const queryClient = useQueryClient();
  const { id: bookingId } = useParams();
  const bookingData = queryClient.getQueryData(['booking-by-id', bookingId]);
  const { data: LeadStats, isLoading: isLeadStatsLoading } = useLeadAgencyStats(
    serialize({
      from: financialStartDate,
      to: financialEndDate,
    }),
  );
  const bookingStatsById = queryClient.getQueryData(['booking-stats-by-id', bookingId]);
  const directClientCount = useMemo(
    () => LeadStats?.agency?.filter(stat => stat._id === 'directClient')?.[0]?.count || 0,
    [LeadStats?.agency],
  );

  const localAgencyCount = useMemo(
    () => LeadStats?.agency?.filter(stat => stat._id === 'localAgency')?.[0]?.count || 0,
    [LeadStats?.agency],
  );

  const nationalAgencyCount = useMemo(
    () => LeadStats?.agency?.filter(stat => stat._id === 'nationalAgency')?.[0]?.count || 0,
    [LeadStats?.agency],
  );

  const healthStatusData = useMemo(
    () => ({
      datasets: [
        {
          data: [directClientCount ?? 0, localAgencyCount ?? 0, nationalAgencyCount ?? 0],
          backgroundColor: ['#FF900E', '#914EFB', '#4BC0C0'],
          borderColor: ['#FF900E', '#914EFB', '#4BC0C0'],
          borderWidth: 1,
        },
      ],
    }),
    [LeadStats],
  );

  const outstandingBalanceData = useMemo(
    () => ({
      datasets: [
        {
          data: [
            bookingStatsById?.[0]?.unpaidAmount ?? 0,
            bookingStatsById?.[0]?.totalPayment ?? 0,
          ],
          backgroundColor: ['#FF900E', '#914EFB'],
          borderColor: ['#FF900E', '#914EFB'],
          borderWidth: 1,
        },
      ],
    }),
    [bookingStatsById],
  );

  return (
    <div>
      <p className="pt-5 font-bold text-lg mb-2">Statistics</p>
      <div className="flex flex-wrap gap-x-8">
        <div className="flex gap-x-4 p-4 border rounded-md items-center">
          <div className="w-32">
            {isLeadStatsLoading ? (
              <Loader className="mx-auto" />
            ) : !LeadStats?.agency?.length ? (
              <p className="text-center">NA</p>
            ) : (
              <Doughnut options={config.options} data={healthStatusData} />
            )}
          </div>
          <div>
            <p className="font-medium">Booking Type</p>
            <div className="flex gap-8 mt-6">
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 rounded-full bg-orange-350" />
                <div>
                  <p className="text-xs font-lighter mb-1">Direct Client</p>
                  <p className="font-bold text-md">{directClientCount ?? 0}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 bg-purple-350 rounded-full" />
                <div>
                  <p className="font-lighter text-xs mb-1">Local Agency</p>
                  <p className="font-bold text-md">{localAgencyCount ?? 0}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 bg-green-350 rounded-full" />
                <div>
                  <p className="font-lighter text-xs mb-1">National Agency</p>
                  <p className="font-bold text-md">{nationalAgencyCount ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border rounded p-8">
          <img src={completed} alt="ongoing" />
          <p className="my-2 text-xs font-lighter mt-3 text-muted">Total Places</p>
          <p className="font-bold">{bookingData?.campaign?.spaces.length ?? 0}</p>
        </div>
        <div className="flex gap-x-4 p-4 border rounded-md items-center">
          <div className="w-32">
            {!bookingStatsById ? (
              <Loader className="mx-auto" />
            ) : !bookingStatsById?.length ? (
              <p className="text-center">NA</p>
            ) : (
              <Doughnut options={config.options} data={outstandingBalanceData} />
            )}
          </div>
          <div>
            <p className="font-medium">Outstanding Balance</p>
            <div className="flex gap-8 mt-6">
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 rounded-full bg-purple-350" />
                <div>
                  <p className="text-xs font-lighter mb-1">Total Payment</p>
                  <p className="font-bold text-md">
                    {bookingStatsById?.[0]?.totalPayment
                      ? toIndianCurrency(bookingStatsById[0].totalPayment)
                      : 0}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 bg-orange-350 rounded-full" />
                <div>
                  <p className="font-lighter text-xs mb-1">Outstanding Payment</p>
                  <p className="font-bold text-md">
                    {bookingStatsById?.[0]?.unpaidAmount
                      ? toIndianCurrency(bookingStatsById[0].unpaidAmount)
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
