import { Image } from '@mantine/core';
import React, { useMemo } from 'react';
import { IconGlobe, IconMan } from '@tabler/icons';
import toIndianCurrency from '../../../../utils/currencyFormat';
import TotalRevenueIcon from '../../../../assets/total-revenue.svg';
import OnlineRevenueIcon from '../../../../assets/online-revenue.svg';
import ProposalSentIcon from '../../../../assets/proposal-sent.svg';
import OperationalCostIcon from '../../../../assets/operational-cost.svg';

const RevenueStatsContent = ({ revenueData, leadStatsData }) => {
  const directClientCount = useMemo(
    () => leadStatsData?.agency?.filter(stat => stat._id === 'directClient')?.[0]?.count || 0,
    [leadStatsData?.agency],
  );

  const localAgencyCount = useMemo(
    () => leadStatsData?.agency?.filter(stat => stat._id === 'localAgency')?.[0]?.count || 0,
    [leadStatsData?.agency],
  );

  const nationalAgencyCount = useMemo(
    () => leadStatsData?.agency?.filter(stat => stat._id === 'nationalAgency')?.[0]?.count || 0,
    [leadStatsData?.agency],
  );
  return (
    <div className="flex flex-1 justify-between gap-4 flex-wrap mb-5">
      <div className="border rounded p-8 flex-1">
        <Image src={TotalRevenueIcon} alt="folder" fit="contain" height={24} width={24} />
        <p className="my-2 text-sm font-light text-slate-400">Total Revenue</p>
        <p className="font-bold">{toIndianCurrency(revenueData?.revenue ?? 0)}</p>
      </div>
      <div className="border rounded p-8  flex-1">
        <IconMan color="blue" />
        <p className="my-2 text-sm font-light text-slate-400">Direct Client</p>
        <p className="font-bold">{directClientCount ?? 0}</p>
      </div>
      <div className="border rounded p-8 flex-1">
        <Image src={OnlineRevenueIcon} alt="folder" fit="contain" height={24} width={24} />
        <p className="my-2 text-sm font-light text-slate-400">Local Agency</p>
        <p className="font-bold">{localAgencyCount ?? 0}</p>
      </div>
      <div className="border rounded p-8 flex-1">
        <IconGlobe color="green" />
        <p className="my-2 text-sm font-light text-slate-400">National Agency</p>
        <p className="font-bold">{nationalAgencyCount ?? 0}</p>
      </div>
      <div className="border rounded p-8 flex-1">
        <Image src={ProposalSentIcon} alt="folder" fit="contain" height={24} width={24} />
        <p className="my-2 text-sm font-light text-slate-400">Total Proposals Sent</p>
        <p className="font-bold">{revenueData?.totalProposalSent}</p>
      </div>
      <div className="border rounded p-8 flex-1">
        <Image src={OperationalCostIcon} alt="folder" fit="contain" height={24} width={24} />
        <p className="my-2 text-sm font-light text-slate-400">Total Operational Cost</p>
        <p className="font-bold">{toIndianCurrency(revenueData?.operationalCost ?? 0)}</p>
      </div>
    </div>
  );
};

export default RevenueStatsContent;
