import { useEffect } from 'react';
import { Text, Image } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { useBookingsNew } from '../../../apis/queries/booking.queries';
import { useFetchProposals } from '../../../apis/queries/proposal.queries';

import ProposalSentIcon from '../../../assets/proposal-sent.svg';
const ProposalDetails = () => {
  // proposals data
  const [searchParams4, setSearchParams4] = useSearchParams({
    page: 1,
    limit: 500,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: proposalsData, isLoading: isLoadingProposalsData } = useFetchProposals(
    searchParams4.toString(),
  );

  const proposalsArray = Array.isArray(proposalsData?.docs) ? proposalsData.docs : [];

  const totalProposalsCreated = proposalsArray.length;
  const totalPrice = proposalsArray.reduce((acc, proposal) => acc + (proposal.price || 0), 0);

  const totalPriceInLacs = (totalPrice / 100000).toFixed(2);

  // proposals data

  return (
    <div className="p-5">
      <div className="border rounded p-8 flex-1 w-72" id="Proposal_details">
        <Image src={ProposalSentIcon} alt="folder" fit="contain" height={24} width={24} />
        <p className="my-2 text-sm">
          Total Proposals Created :{' '}
          <span className="font-bold text-[17px]">{totalProposalsCreated}</span>
        </p>

        <p className="font-bold">{totalPriceInLacs} L</p>
      </div>
    </div>
  );
};

export default ProposalDetails;
