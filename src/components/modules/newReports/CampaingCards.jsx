import { useEffect, useMemo } from 'react';
import { Text, Image, Loader } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import {useBookingsNew } from '../../../apis/queries/booking.queries';
import { useFetchProposals } from '../../../apis/queries/proposal.queries';

import ProposalSentIcon from '../../../assets/proposal-sent.svg';
import { useCampaignStats } from '../../../apis/queries/campaigns.queries';
import { Doughnut } from 'react-chartjs-2';
const CampaignCards = () => {

  
const config = {
  type: 'line',
  options: { responsive: true },
};
  
  const { data: stats, isLoading: isStatsLoading } = useCampaignStats();
  const printStatusData = useMemo(
    () => ({
      datasets: [
        {
          data: [stats?.printCompleted ?? 0, stats?.printOngoing ?? 0],
          backgroundColor: ['#914EFB', '#FF900E'],
          borderColor: ['#914EFB', '#FF900E'],
          borderWidth: 1,
        },
      ],
    }),
    [stats],
  );

  const mountStatusData = useMemo(
    () => ({
      datasets: [
        {
          data: [stats?.mountCompleted ?? 0, stats?.mountOngoing ?? 0],
          backgroundColor: ['#914EFB', '#FF900E'],
          borderColor: ['#914EFB', '#FF900E'],
          borderWidth: 1,
        },
      ],
    }),
    [stats],
  );
 

  return (
     <div className="px-5">
        <p className="font-bold py-4">Campaigns stats report</p>
        <div className="flex w-1/3 gap-4 h-[250px] ">
          <div className="flex gap-4 p-4 border rounded-md items-center min-h-[200px]">
            <div className="w-32">
              {isStatsLoading ? (
                <Loader className="mx-auto" />
              ) : stats?.printOngoing === 0 && stats?.printCompleted === 0 ? (
                <p className="text-center">NA</p>
              ) : (
                <Doughnut options={config.options} data={printStatusData} />
              )}
            </div>
            <div>
              <p className="font-medium">Printing Status</p>
              <div className="flex gap-8 mt-6 flex-wrap">
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 bg-orange-350 rounded-full" />
                  <div>
                    <p className="my-2 text-xs font-light text-slate-400">Ongoing</p>
                    <p className="font-bold text-lg">{stats?.printOngoing ?? 0}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 rounded-full bg-purple-350" />
                  <div>
                    <p className="my-2 text-xs font-light text-slate-400">Completed</p>
                    <p className="font-bold text-lg">{stats?.printCompleted ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4 p-4 border rounded-md items-center min-h-[200px]">
            <div className="w-32">
              {isStatsLoading ? (
                <Loader className="mx-auto" />
              ) : stats?.mountOngoing === 0 && stats?.mountCompleted === 0 ? (
                <p className="text-center">NA</p>
              ) : (
                <Doughnut options={config.options} data={mountStatusData} />
              )}
            </div>
            <div>
              <p className="font-medium">Mounting Status</p>
              <div className="flex gap-8 mt-6 flex-wrap">
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 bg-orange-350 rounded-full" />
                  <div>
                    <p className="my-2 text-xs font-light text-slate-400">Ongoing</p>
                    <p className="font-bold text-lg">{stats?.mountOngoing ?? 0}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 rounded-full bg-purple-350" />
                  <div>
                    <p className="my-2 text-xs font-light text-slate-400">Completed</p>
                    <p className="font-bold text-lg">{stats?.mountCompleted ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
  );
};

export default CampaignCards;
