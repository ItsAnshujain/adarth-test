import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Select } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import NoData from '../../../shared/NoData';
import { DATE_SECOND_FORMAT } from '../../../../utils/constants';
import { useUpdateCampaign } from '../../../../apis/queries/campaigns.queries';
import { serialize } from '../../../../utils';
import { useFetchMasters } from '../../../../apis/queries/masters.queries';
import { useFetchUsers, useFetchUsersById } from '../../../../apis/queries/users.queries';
import useTokenIdStore from '../../../../store/user.store';
import { useUpdateBooking } from '../../../../apis/queries/booking.queries';

const styles = {
  label: {
    marginBottom: '4px',
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
};

const query = {
  parentId: null,
  limit: 100,
  page: 1,
  sortBy: 'name',
  sortOrder: 'asc',
};

const CampaignInformationCard = () => {
  const queryClient = useQueryClient();
  const [activeOrganization, setActiveOrganization] = useState('');
  const [activeIncharge, setActiveIncharge] = useState('');
  const { id: bookingId } = useParams();
  const userId = useTokenIdStore(state => state.id);
  const { data: userDetails } = useFetchUsersById(userId);
  const updateCampaign = useUpdateCampaign();
  const updateBooking = useUpdateBooking();
  const bookingData = queryClient.getQueryData(['booking-by-id', bookingId]);

  const {
    data: organizationData,
    isSuccess: isOrganizationDataLoaded,
    isLoading: isOrganizationDataLoading,
  } = useFetchMasters(serialize({ type: 'organization', ...query }), userDetails?.role === 'admin');

  const {
    data: userData,
    isSuccess: isUserDataLoaded,
    isLoading: isLoadingUserData,
  } = useFetchUsers(
    serialize({
      page: 1,
      limit: 100,
      sortOrder: 'asc',
      sortBy: 'createdAt',
      filter: userDetails?.role === 'admin' ? 'all' : 'team',
      company: activeOrganization !== '' ? activeOrganization : undefined,
    }),
    userDetails?.role !== 'associate',
  );

  const handleActiveSalesPerson = useCallback(
    salesPersonId => {
      if (salesPersonId === '') return;
      if (bookingData?.campaign) {
        updateBooking.mutate(
          {
            id: bookingId,
            data: { salesPerson: salesPersonId },
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries(['booking-by-id', bookingId]);
            },
          },
        );
      }
    },
    [bookingData?.campaign],
  );

  const handleActiveIncharge = useCallback(
    inchargeId => {
      if (inchargeId === '') return;

      if (bookingData?.campaign) {
        updateCampaign.mutate(
          {
            id: bookingData.campaign?._id,
            data: { incharge: inchargeId },
          },
          { onSuccess: () => queryClient.invalidateQueries(['booking-by-id', bookingId]) },
        );
      }
    },
    [bookingData?.campaign],
  );

  const handleActiveOrganization = e => {
    setActiveOrganization(e);
    setActiveIncharge('');
  };

  const inchargeList = useMemo(() => {
    let arr = [];
    if (userData?.docs && bookingData?.campaign?.incharge?.[0]?._id === userDetails?._id) {
      arr = [
        { label: userDetails?.name, value: userDetails?._id },
        ...userData.docs.map(item => ({ label: item?.name, value: item?._id })),
      ];
      return arr;
    }
    if (userData?.docs) {
      arr = [...arr, ...userData.docs.map(item => ({ label: item?.name, value: item?._id }))];
    }
    return arr;
  }, [userData?.docs, bookingData?.campaign]);

  const getDefaultIncharge = useMemo(
    () =>
      inchargeList?.filter(item =>
        item?.value?.includes(bookingData?.campaign?.incharge?.[0]?._id),
      )[0]?.value,
    [bookingData?.campaign, inchargeList],
  );

  const organizationList = useMemo(() => {
    let arr = [];
    if (organizationData?.docs?.length) {
      arr = [...organizationData.docs.map(item => ({ label: item?.name, value: item?.name }))];

      return arr;
    }

    return [];
  }, [organizationData?.docs?.length]);

  const getDefaultOrganization = useMemo(
    () =>
      organizationList?.filter(item =>
        item?.value
          ?.toLowerCase()
          ?.includes(bookingData?.campaign?.incharge?.[0]?.company?.toLowerCase()),
      )[0]?.label,
    [bookingData?.campaign, organizationList],
  );

  useEffect(() => {
    setActiveIncharge(getDefaultIncharge);
  }, [bookingData?.campaign, inchargeList]);

  useEffect(() => {
    setActiveOrganization(getDefaultOrganization);
  }, [bookingData?.campaign, organizationList]);

  return (
    <div>
      <p className="font-bold text-lg mb-2">Campaign Info</p>
      <div className="grid grid-cols-5 gap-x-5 p-4 border flex-wrap">
        <div>
          <p className="text-slate-400">Campaign Id</p>
          <p className="font-bold">{bookingData.campaign?.campaignId || '--'}</p>
        </div>
        <div>
          <p className="text-slate-400">Campaign Name</p>
          <p className="font-bold">{bookingData.campaign?.name}</p>
        </div>
        <div>
          <p className="text-slate-400">Booking Status</p>
          <p className="font-bold">
            {bookingData?.currentStatus?.campaignStatus || <NoData type="na" />}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Campaign Incharge</p>
          {userDetails?.role === 'associate' ? (
            <p className="font-bold">{userDetails?.name}</p>
          ) : (
            <Select
              styles={styles}
              disabled={
                isLoadingUserData ||
                (userDetails?.role === 'associate' &&
                  bookingData?.campaign?.incharge?.[0]?._id !== userDetails?._id)
              }
              placeholder="Select..."
              data={isUserDataLoaded ? inchargeList : []}
              onChange={e => handleActiveIncharge(e)}
              value={activeIncharge}
            />
          )}
        </div>

        <section>
          <p className="text-slate-400">Sales Person</p>
          {userDetails?.role === 'associate' ? (
            <p className="font-bold">{userDetails?.name}</p>
          ) : (
            <Select
              styles={styles}
              disabled={
                isLoadingUserData ||
                (userDetails?.role === 'associate' &&
                  bookingData?.campaign?.incharge?.[0]?._id !== userDetails?._id)
              }
              placeholder="Select..."
              data={isUserDataLoaded ? inchargeList : []}
              onChange={e => handleActiveSalesPerson(e)}
              value={bookingData?.salesPerson?._id}
            />
          )}
        </section>

        {userDetails && userDetails?.role === 'admin' ? (
          <div>
            <p className="text-slate-400">Organization</p>
            <Select
              styles={styles}
              placeholder="Select..."
              data={isOrganizationDataLoaded ? organizationList : []}
              disabled={isOrganizationDataLoading}
              onChange={e => handleActiveOrganization(e)}
              value={activeOrganization}
            />
          </div>
        ) : null}

        <div>
          <p className="text-slate-400">Start Date</p>
          <p className="font-bold">
            {bookingData?.campaign?.startDate ? (
              dayjs(bookingData.campaign.startDate).format(DATE_SECOND_FORMAT)
            ) : (
              <NoData type="na" />
            )}
          </p>
        </div>
        <div>
          <p className="text-slate-400">End Date</p>
          <p className="font-bold">
            {bookingData?.campaign?.startDate ? (
              dayjs(bookingData.campaign.endDate).format(DATE_SECOND_FORMAT)
            ) : (
              <NoData type="na" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignInformationCard;
