import { Image, Loader, Text } from '@mantine/core';
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import OngoingOrdersIcon from '../../../assets/ongoing-orders.svg';
import CompletedOrdersIcon from '../../../assets/completed-orders.svg';
import UpcomingOrdersIcon from '../../../assets/upcoming-orders.svg';

ChartJS.register(ArcElement, Tooltip, Legend);

const BookingStatisticsView = ({ LeadStats, isLoading }) => {
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

  const governmentAgencyCount = useMemo(
    () => LeadStats?.agency?.filter(stat => stat._id === 'government')?.[0]?.count || 0,
    [LeadStats?.agency],
  );

  const revenueBreakupData = useMemo(
    () => ({
      datasets: [
        {
          data: [
            directClientCount ?? 0,
            localAgencyCount ?? 0,
            nationalAgencyCount ?? 0,
            governmentAgencyCount ?? 0,
          ],
          backgroundColor: ['#FF900E', '#914EFB', '#4BC0C0', '#2938F7'],
          borderColor: ['#FF900E', '#914EFB', '#4BC0C0', '#2938F7'],
          borderWidth: 1,
        },
      ],
    }),
    [LeadStats],
  );

  return (
    <div className="mt-5">
      <div className="flex justify-between gap-4 flex-wrap">
        <div className="flex gap-4 p-4 border rounded-md items-center">
          <div className="w-32">
            {isLoading ? (
              <Loader className="mx-auto" />
            ) : !LeadStats?.agency?.length ? (
              <p className="text-center">NA</p>
            ) : (
              <Doughnut options={{ responsive: true }} data={revenueBreakupData} />
            )}
          </div>
          <div>
            <p className="font-medium">Revenue Breakup</p>
            <div className="flex gap-8 mt-6">
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 rounded-full bg-orange-350" />
                <div>
                  <Text size="xs" weight="200">
                    Direct Client
                  </Text>
                  <Text weight="bolder" size="xl">
                    {directClientCount ?? 0}
                  </Text>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 bg-purple-350 rounded-full" />
                <div>
                  <Text size="xs" weight="200">
                    Local Agency
                  </Text>
                  <Text weight="bolder" size="xl">
                    {localAgencyCount ?? 0}
                  </Text>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 bg-green-350 rounded-full" />
                <div>
                  <Text size="xs" weight="200">
                    National Agency
                  </Text>
                  <Text weight="bolder" size="xl">
                    {nationalAgencyCount ?? 0}
                  </Text>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 bg-blue-350 rounded-full" />
                <div>
                  <Text size="xs" weight="200">
                    Government
                  </Text>
                  <Text weight="bolder" size="xl">
                    {governmentAgencyCount ?? 0}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-between flex-wrap">
          <div className="border rounded p-8  pr-20">
            <Image src={OngoingOrdersIcon} alt="ongoing" height={24} width={24} fit="contain" />
            <Text className="my-2" size="sm" weight="200">
              Ongoing Orders
            </Text>
            <Text weight="bold">{LeadStats?.Ongoing ?? 0}</Text>
          </div>
          <div className="border rounded p-8 pr-20">
            <Image src={UpcomingOrdersIcon} alt="upcoming" height={24} width={24} fit="contain" />
            <Text className="my-2" size="sm" weight="200">
              Upcoming Orders
            </Text>
            <Text weight="bold">{LeadStats?.Upcoming ?? 0}</Text>
          </div>
          <div className="border rounded p-8 pr-20">
            <Image src={CompletedOrdersIcon} alt="completed" height={24} width={24} fit="contain" />
            <Text className="my-2" size="sm" weight="200">
              Completed Orders
            </Text>
            <Text weight="bold">{LeadStats?.Completed ?? 0}</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStatisticsView;
