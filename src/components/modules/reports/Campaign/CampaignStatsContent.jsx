import { Image } from '@mantine/core';
import React from 'react';
import TotalCampaignIcon from '../../../../assets/total-campaign.svg';
import OngoingCampaignIcon from '../../../../assets/ongoing-campaign.svg';
import UpcomingCampaignIcon from '../../../../assets/upcoming-campaign.svg';
import CompletedCampaignIcon from '../../../../assets/completed-campaign.svg';

const CampaignStatsContent = ({ stats }) => (
  <div className="my-5">
    <div className="grid grid-cols-4 gap-4">
      <div className="border rounded p-8 flex-1">
        <Image src={TotalCampaignIcon} alt="folder" fit="contain" height={24} width={24} />
        <p className="my-2 text-sm font-light text-slate-400">Total Campaign(Overall)</p>
        <p className="font-bold">{stats?.total ?? 0}</p>
      </div>
      <div className="border rounded p-8  flex-1">
        <Image src={OngoingCampaignIcon} alt="folder" fit="contain" height={24} width={24} />
        <p className="my-2 text-sm font-light text-slate-400">Total Ongoing Campaign</p>
        <p className="font-bold">{stats?.ongoing ?? 0}</p>
      </div>
      <div className="border rounded p-8  flex-1">
        <Image src={UpcomingCampaignIcon} alt="folder" fit="contain" height={24} width={24} />
        <p className="my-2 text-sm font-light text-slate-400">Upcoming Campaign</p>
        <p className="font-bold">{stats?.upcoming ?? 0}</p>
      </div>
      <div className="border rounded p-8 flex-1">
        <Image src={CompletedCampaignIcon} alt="folder" fit="contain" height={24} width={24} />
        <p className="my-2 text-sm font-light text-slate-400">Completed Campaign</p>
        <p className="font-bold">{stats?.completed ?? 0}</p>
      </div>
    </div>
  </div>
);

export default CampaignStatsContent;
