import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Loader } from '@mantine/core';
import CampaignInformationCard from './CampaignInformationCard';
import OrderInformationCard from './OrderInformationCard';
import StatisticsCard from './StatisticsCard';
import PaymentInformationList from './PaymentInformationList';

ChartJS.register(ArcElement, Tooltip, Legend);

const OrderInformation = ({ isLoading = true }) =>
  isLoading ? (
    <div className="flex justify-center items-center h-[400px]">
      <Loader />
    </div>
  ) : (
    <div className="flex flex-col gap-6">
      <StatisticsCard />
      <OrderInformationCard />
      <CampaignInformationCard />
      <PaymentInformationList />
    </div>
  );

export default OrderInformation;
