import { useEffect } from 'react';
import { Text, Image } from '@mantine/core';
import OngoingOrdersIcon from '../../../assets/ongoing-orders.svg';
import UpcomingOrdersIcon from '../../../assets/upcoming-orders.svg';
import CompletedOrdersIcon from '../../../assets/completed-orders.svg';
import { useSearchParams } from 'react-router-dom';
import {useBookingsNew } from '../../../apis/queries/booking.queries';

const OrderDetails = () => {

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

  // ongoing orders
  const calculateTotalRevenue = status => {
    if (!bookingData2) return 0;
    return bookingData2.reduce((total, booking) => {
      if (booking.currentStatus?.campaignStatus === status) {
        return total + (booking.totalAmount || 0); // Replace `totalAmount` with the correct field if needed
      }
      return total;
    }, 0);
  };

  // Calculate total revenue for each order status (only if data is available)
  const ongoingRevenue = bookingData2 ? calculateTotalRevenue('Ongoing') : null;
  const upcomingRevenue = bookingData2 ? calculateTotalRevenue('Upcoming') : null;
  const completedRevenue = bookingData2 ? calculateTotalRevenue('Completed') : null;

  // ongoing orders


  return (
    <div className="flex gap-4 px-5 flex-wrap">
    <div className="border rounded p-8 pr-20">
      <Image src={OngoingOrdersIcon} alt="ongoing" height={24} width={24} fit="contain" />
      <Text className="my-2" size="sm" weight="200">
        Ongoing Orders
      </Text>
      <Text weight="bold">
        {ongoingRevenue !== null && !isNaN(ongoingRevenue)
          ? `${(ongoingRevenue / 100000).toFixed(2)} L`
          : ''}
      </Text>
    </div>

    <div className="border rounded p-8 pr-20">
      <Image src={UpcomingOrdersIcon} alt="upcoming" height={24} width={24} fit="contain" />
      <Text className="my-2" size="sm" weight="200">
        Upcoming Orders
      </Text>
      <Text weight="bold">
        {upcomingRevenue !== null && !isNaN(upcomingRevenue)
          ? `${(upcomingRevenue / 100000).toFixed(2)} L`
          : ''}
      </Text>
    </div>

    <div className="border rounded p-8 pr-20">
      <Image src={CompletedOrdersIcon} alt="completed" height={24} width={24} fit="contain" />
      <Text className="my-2" size="sm" weight="200">
        Completed Orders
      </Text>
      <Text weight="bold">
        {completedRevenue !== null && !isNaN(completedRevenue)
          ? `${(completedRevenue / 100000).toFixed(2)} L`
          : ''}
      </Text>
    </div>
  </div>
  );
};

export default OrderDetails;
