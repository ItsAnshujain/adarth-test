import { useEffect, useMemo } from 'react';
import { Text, Image, Loader } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import {useBookingsNew } from '../../../apis/queries/booking.queries';
import { Doughnut } from 'react-chartjs-2';

const RevenueBreakup = () => {

  const [searchParams] = useSearchParams({
    page: 1,
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const {
    data: bookingData2,
    isLoading: isLoadingBookingData,
    error,
  } = useBookingsNew(searchParams.toString());

  // revenue breakup according to client type
  const aggregatedData2 = useMemo(() => {
    if (!bookingData2) return {};

    const validClientTypes = ['government', 'nationalagency', 'localagency', 'directclient']; // Define valid client types

    const result = {
      government: 0,
      nationalagency: 0,
      localagency: 0,
      directclient: 0,
    };

    bookingData2.forEach(booking => {
      const totalAmount = booking?.totalAmount || 0;

      if (Array.isArray(booking.details) && booking.details.length > 0) {
        booking.details.forEach(detail => {
          const clientType = detail?.client?.clientType;

          if (clientType) {
            const normalizedClientType = clientType.toLowerCase().replace(/\s/g, '');
            if (validClientTypes.includes(normalizedClientType)) {
              result[normalizedClientType] += totalAmount / 100000;
            }
          }
        });
      }
    });

    return result;
  }, [bookingData2]);

  const revenueBreakupData = useMemo(
    () => ({
      datasets: [
        {
          data: [
            aggregatedData2.directclient ?? 0,
            aggregatedData2.localagency ?? 0,
            aggregatedData2.nationalagency ?? 0,
            aggregatedData2.government ?? 0,
          ],
          backgroundColor: ['#FF900E', '#914EFB', '#4BC0C0', '#2938F7'],
          borderColor: ['#FF900E', '#914EFB', '#4BC0C0', '#2938F7'],
          borderWidth: 1,
        },
      ],
    }),
    [aggregatedData2],
  );
  // revenue breakup according to client type

  return (
    <div  className={`${!isLoadingBookingData?"loading_completed":""} p-5`}>
        <div className="flex justify-between gap-4 flex-wrap">
          <div className="flex gap-4 p-4 border rounded-md items-center" id="Revenue_breakup">
            <div className="w-32">
              {isLoadingBookingData ? (
                <Loader className="mx-auto" />
              ) : (
                <Doughnut options={{ responsive: true }} data={revenueBreakupData} />
              )}
            </div>
            <div>
              <p className="font-medium">Revenue Breakup</p>
              <div className="flex gap-8 mt-6">
                <div className="flex gap-2 items-center">
                  <div className=" p-2 rounded-full bg-orange-350" />
                  <div>
                    <Text size="sm" weight="200">
                      Direct Client
                    </Text>
                    <Text weight="bolder" size="md">
                      {aggregatedData2.directclient?.toFixed(2) || 0} L
                    </Text>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 bg-purple-350 rounded-full" />
                  <div>
                    <Text size="sm" weight="200">
                      Local Agency
                    </Text>
                    <Text weight="bolder" size="md">
                      {aggregatedData2.localagency?.toFixed(2) || 0} L
                    </Text>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 bg-green-350 rounded-full" />
                  <div>
                    <Text size="sm" weight="200">
                      National Agency
                    </Text>
                    <Text weight="bolder" size="md">
                      {aggregatedData2.nationalagency?.toFixed(2) || 0} L
                    </Text>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 bg-blue-350 rounded-full" />
                  <div>
                    <Text size="sm" weight="200">
                      Government
                    </Text>
                    <Text weight="bolder" size="md">
                      {aggregatedData2.government?.toFixed(2) || 0} L
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RevenueBreakup;
