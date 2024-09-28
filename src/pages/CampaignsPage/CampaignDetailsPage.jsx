import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../../components/modules/campaigns/ViewCampaigns/Header';
import SpacesList from '../../components/modules/campaigns/ViewCampaigns/SpacesList';
import TotalBookings from '../../components/modules/campaigns/ViewCampaigns/TotalBookings';
import Overview from '../../components/modules/campaigns/ViewCampaigns/Overview';
import { useCampaign } from '../../apis/queries/campaigns.queries';

const campaignView = {
  overview: Overview,
  spaces: SpacesList,
  bookings: TotalBookings,
};

const CampaignDetailsPage = () => {
  const [tabs, setTabs] = useState('overview');
  const { id } = useParams();

  const campaignQuery = {
    page: 1,
    limit: 10,
    sortBy: 'basicInformation.spaceName',
    sortOrder: 'desc',
  };

  const bookingQuery = {
    page: 1,
    limit: 10,
    sortBy: 'campaign.name',
    sortOrder: 'desc',
    campaignId: id,
  };

  const [searchParams] = useSearchParams(tabs === 'bookings' ? bookingQuery : campaignQuery);

  const { data, isLoading } = useCampaign(
    { id, query: searchParams.toString() },
    tabs === 'overview' || tabs === 'spaces',
  );

  const TabView = campaignView[tabs];

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-5">
      <Header tabs={tabs} setTabs={setTabs} />
      <div className="relative">
        <TabView
          campaignData={data?.campaign}
          spacesData={data?.inventory}
          campaignId={id}
          isCampaignDataLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CampaignDetailsPage;
