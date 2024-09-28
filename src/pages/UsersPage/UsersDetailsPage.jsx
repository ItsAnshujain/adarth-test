import { useState, useEffect } from 'react';
import { Tabs } from '@mantine/core';
import { useParams, useSearchParams } from 'react-router-dom';
import classNames from 'classnames';
import { useFetchUsersById } from '../../apis/queries/users.queries';
import ManagingCampaignSubHeader from '../../components/modules/users/View/ManagingSubHeader';
import OverviewUserDetails from '../../components/modules/users/View/OverviewUserDetails';
import BookingTableView from '../../components/modules/users/View/BookingTableView';
import ProposalTableView from '../../components/modules/users/View/ProposalTableView';
import { useBookings } from '../../apis/queries/booking.queries';
import { useFetchProposals } from '../../apis/queries/proposal.queries';
import SalesViewTable from '../../components/modules/users/View/SalesViewTable';
import LeadsTableView from '../../components/modules/users/View/LeadsTableView';

const tableBookingQueries = userId => ({
  'page': 1,
  'limit': 10,
  'sortBy': 'createdAt',
  'sortOrder': 'desc',
  'incharge': userId,
});

const tableProposalQueries = userId => ({
  'page': 1,
  'limit': 10,
  'sortBy': 'createdAt',
  'sortOrder': 'desc',
  'userId': userId,
});

const tableSalesQueries = userId => ({
  'page': 1,
  'limit': 10,
  'sortBy': 'createdAt',
  'sortOrder': 'desc',
  'salesPerson': userId,
});

const UsersDetailsPage = () => {
  const [activeParentTab, setActiveParentTab] = useState('overview');
  const [activeChildTab, setActiveChildTab] = useState('booking');
  const { id: userId } = useParams();
  const userById = useFetchUsersById(userId);
  const initialBookingValue = tableBookingQueries(userId);
  const initalProposalValue = tableProposalQueries(userId);
  const initalSalesValue = tableSalesQueries(userId);
  const [bookingSearchParams, setBookingSearchParams] = useSearchParams(initialBookingValue);
  const [proposalSearchParams, setProposalSearchParams] = useSearchParams(initalProposalValue);
  const [salesSearchParams, setSalesSearchParams] = useSearchParams(initalSalesValue);

  const { data: bookingData = {}, isLoading: isLoadingBookingData } = useBookings(
    activeParentTab === 'managing' && activeChildTab === 'booking'
      ? bookingSearchParams.toString()
      : activeParentTab === 'managing' && activeChildTab === 'sales'
      ? salesSearchParams.toString()
      : false,
    activeParentTab === 'managing' && (activeChildTab === 'booking' || activeChildTab === 'sales'),
  );

  const { data: proposalsData = {}, isLoading: isLoadingProposalsData } = useFetchProposals(
    proposalSearchParams.toString(),
    activeParentTab === 'managing' && activeChildTab === 'proposal',
  );

  const handleChildTab = val => {
    setActiveChildTab(val);

    const defaultBookingValue = new URLSearchParams(initialBookingValue);
    const defaultProposalValue = new URLSearchParams(initalProposalValue);
    const defaultSalesValue = new URLSearchParams(tableSalesQueries);
    if (val === 'booking') {
      bookingSearchParams.delete('userId');
      setBookingSearchParams(defaultBookingValue);
    } else if (val === 'proposal') {
      proposalSearchParams.delete('incharge');
      setProposalSearchParams(defaultProposalValue);
    } else if (val === 'sales') {
      bookingSearchParams.delete('userId');
      proposalSearchParams.delete('incharge');
      setSalesSearchParams(defaultSalesValue);
    }
  };

  useEffect(() => {
    // TODO: fix this to reduce one extra api call
    if (activeChildTab === 'booking' || activeChildTab === 'sales') {
      bookingSearchParams.delete('userId');
      setBookingSearchParams(bookingSearchParams);
    }
  }, []);

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto">
      <Tabs value={activeParentTab} onTabChange={setActiveParentTab}>
        <Tabs.List className="h-[60px] relative">
          <Tabs.Tab
            className={classNames(
              'text-base hover:bg-transparent',
              activeParentTab === 'overview' ? 'text-purple-450 font-medium' : '',
            )}
            value="overview"
          >
            Overview
          </Tabs.Tab>
          <Tabs.Tab
            className={classNames(
              'text-base hover:bg-transparent',
              activeParentTab === 'managing' ? 'text-purple-450 font-medium' : '',
            )}
            value="managing"
          >
            Analytics
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview">
          <OverviewUserDetails
            userDetails={userById.data}
            isUserDetailsLoading={userById.isLoading}
            userId={userId}
          />
        </Tabs.Panel>
        <Tabs.Panel value="managing">
          <ManagingCampaignSubHeader userId={userId} />
          <div>
            <Tabs value={activeChildTab} onTabChange={handleChildTab}>
              <Tabs.List className="h-16">
                <Tabs.Tab className="hover:bg-transparent text-base" value="booking">
                  Bookings
                </Tabs.Tab>
                <Tabs.Tab className="hover:bg-transparent text-base" value="proposal">
                  Proposals
                </Tabs.Tab>
                <Tabs.Tab className="hover:bg-transparent text-base" value="sales">
                  Sales
                </Tabs.Tab>
                <Tabs.Tab className="hover:bg-transparent text-base" value="leads">
                  Leads
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="booking">
                <BookingTableView
                  data={bookingData}
                  isLoading={isLoadingBookingData}
                  activeChildTab={activeChildTab}
                />
              </Tabs.Panel>
              <Tabs.Panel value="proposal" className="mr-5">
                <ProposalTableView
                  viewType={setActiveChildTab === 'proposal'}
                  userId={userId}
                  data={proposalsData}
                  isLoading={isLoadingProposalsData}
                  activeChildTab={activeChildTab}
                />
              </Tabs.Panel>
              <Tabs.Panel value="sales">
                <SalesViewTable
                  data={bookingData}
                  isLoading={isLoadingBookingData}
                  activeChildTab={activeChildTab}
                />
              </Tabs.Panel>
              <Tabs.Panel value="leads">
                <LeadsTableView userId={userId} />
              </Tabs.Panel>
            </Tabs>
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default UsersDetailsPage;
