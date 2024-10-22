import { useEffect } from 'react';
import { Text, Image } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import toIndianCurrency from '../../../utils/currencyFormat';
import { useFetchInventoryReportList } from '../../../apis/queries/inventory.queries';
import OngoingOrdersIcon from '../../../assets/ongoing-orders.svg';
import TotalRevenueIcon from '../../../assets/total-revenue.svg';
import InitiateDiscussionIcon from '../../../assets/message-share.svg';
import InProgressIcon from '../../../assets/git-branch.svg';
const PerformanceCard = () => {
  const fixedSearchParams = new URLSearchParams({
    limit: 10000,
    page: 1,
    sortOrder: 'desc',
    sortBy: 'revenue',
  });

  const { data: inventoryReportList, isLoading: inventoryReportListLoading } =
    useFetchInventoryReportList(fixedSearchParams.toString());

  const topSpaceByBookings = inventoryReportList?.docs.reduce((prev, curr) =>
    prev.totalBookings > curr.totalBookings ? prev : curr,
  );

  const leastSpaceByBookings = inventoryReportList?.docs.reduce((prev, curr) =>
    prev.totalBookings < curr.totalBookings ? prev : curr,
  );

  const topSpaceByRevenue = inventoryReportList?.docs.reduce((prev, curr) =>
    prev.revenue > curr.revenue ? prev : curr,
  );

  const leastSpaceByRevenue = inventoryReportList?.docs.reduce((prev, curr) =>
    prev.revenue < curr.revenue ? prev : curr,
  );

  const cardData = [
    {
      title: 'Top Performing Space by Bookings',
      data: {
        name: topSpaceByBookings?.basicInformation?.spaceName || 'N/A',
        value: topSpaceByBookings?.totalBookings || 0,
        label: 'Bookings ',
        icon: OngoingOrdersIcon,
         color:'#4C3BCF'
      },
    },
    {
      title: 'Least Performing Space by Bookings',
      data: {
        name: leastSpaceByBookings?.basicInformation?.spaceName || 'N/A',
        value: leastSpaceByBookings?.totalBookings || 0,
        label: 'Bookings ',
        icon: InitiateDiscussionIcon,
         color:'#FF7F3E'
      },
    },
    {
      title: 'Top Performing Space by Revenue',
      data: {
        name: topSpaceByRevenue?.basicInformation?.spaceName || 'N/A',
        value: toIndianCurrency((topSpaceByRevenue?.revenue || 0) / 100000), // Convert to lacs
        label: 'Revenue (lac)',
        icon: TotalRevenueIcon,
         color:'#059212'
      },
    },
    {
      title: 'Least Performing Space by Revenue',
      data: {
        name: leastSpaceByRevenue?.basicInformation?.spaceName || 'N/A',
        value: toIndianCurrency((leastSpaceByRevenue?.revenue || 0) / 100000), // Convert to lacs
        label: 'Revenue (lac)',
        icon: InProgressIcon,
        color:'#7A1CAC'
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
      {cardData.map(({ title, data }) => (
        <div className="border rounded p-8 flex-1" key={title}>
          <Image src={data.icon} alt="icon" height={24} width={24} fit="contain" />
          <Text className="my-2 text-sm font-semibold " >
            {title}
          </Text>
          <Text size="sm" weight="200">{data.name}
          </Text>
          <Text size="sm" weight="200">
  {data.label}: <span className="font-bold" style={{ color: data.color }}> {data.value}</span>
</Text>

        </div>
      ))}
    </div>
  );
};

export default PerformanceCard;
