import { Button, Stepper } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import LeadHistoryCard from './LeadHistoryCard';
import AddFollowUpContent from './AddFollowUpContent';
import modalConfig from '../../../utils/modalConfig';
import { DATE_SECOND_FORMAT } from '../../../utils/constants';

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'font-dmSans text-xl px-4',
    header: 'p-4 border-b border-gray-450',
    body: 'px-8',
    close: 'mr-4',
  },
  size: 800,
};

const LeadFollowUps = ({ leadId, followUpsQuery }) => {
  const modals = useModals();

  const followUps = useMemo(
    () => followUpsQuery.data?.pages?.reduce((acc, { docs }) => [...acc, ...docs], []) || [],
    [followUpsQuery?.data],
  );

  const toggleAddFollowUp = id =>
    modals.openModal({
      title: 'Add Follow Up',
      modalId: 'addFollowUpModal',
      children: (
        <AddFollowUpContent onCancel={() => modals.closeModal('addFollowUpModal')} leadId={id} />
      ),
      ...updatedModalConfig,
    });

  const loadMore = () => followUpsQuery.fetchNextPage();

  return (
    <div>
      <div className="flex justify-between py-6">
        <div className="text-xl">Follow Ups History</div>
        <Button className="bg-purple-450" onClick={() => toggleAddFollowUp(leadId)}>
          Add Follow Up
        </Button>
      </div>
      {!followUps?.length ? (
        <div className="flex justify-center">No Follow Ups</div>
      ) : (
        <>
          <Stepper
            orientation="vertical"
            classNames={{ stepIcon: 'bg-transparent p-1', step: 'w-full', stepBody: 'w-full' }}
            iconSize={64}
          >
            {followUps?.map(doc => (
              <Stepper.Step
                label={<LeadHistoryCard followUpData={doc} />}
                icon={
                  <div className="text-purple-450 text-sm text-center">
                    {dayjs(doc?.followUpDate).format(DATE_SECOND_FORMAT)}
                  </div>
                }
              />
            ))}
          </Stepper>
          {followUpsQuery.hasNextPage ? (
            <div className="flex justify-center">
              <Button
                variant="default"
                onClick={loadMore}
                className="bg-purple-450 text-white font-normal w-fit my-6 text-sm px-4"
                size="xs"
                loading={followUpsQuery?.isFetching}
              >
                Load More
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default LeadFollowUps;
