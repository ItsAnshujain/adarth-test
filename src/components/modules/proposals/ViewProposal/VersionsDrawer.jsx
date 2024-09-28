import { Button, Drawer, Loader, Radio } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { IconTrash, IconHistory, IconShare } from '@tabler/icons';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import modalConfig from '../../../../utils/modalConfig';
import ConfirmContent from '../../../shared/ConfirmContent';
import {
  useDeleteProposalVersion,
  useProposalVersions,
  useRestoreProposal,
} from '../../../../apis/queries/proposal.queries';
import { DATE_FORMAT } from '../../../../utils/constants';

const VersionsDrawer = ({
  isOpened,
  onClose,
  searchParams,
  toggleShareOptions,
  parentId,
  parentVersionTitle,
}) => {
  const modals = useModals();
  const navigate = useNavigate();
  const { id: proposalId } = useParams();

  const deleteVersion = useDeleteProposalVersion();
  const restoreProposalQuery = useRestoreProposal();
  const proposalVersionsQuery = useProposalVersions({
    id: parentId || proposalId,
    page: 1,
    limit: 15,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const Versions = useMemo(
    () => proposalVersionsQuery.data?.pages.reduce((acc, { docs }) => [...acc, ...docs], []) || [],
    [proposalVersionsQuery?.data],
  );

  const handleDeleteVersion = (id, versionTitle) => {
    modals.closeModal('deleteVersionModal');
    deleteVersion.mutate(id, {
      onSuccess: () => {
        if (parentVersionTitle === versionTitle) {
          navigate(`/proposals/view-details/${Versions?.[0]._id}?${searchParams.toString()}`);
        }

        onClose();
      },
    });
  };

  const onVersionClick = (id, index, parentProposalId) => {
    if (index !== 0) {
      navigate(`/proposals/view-details/${id}?${searchParams.toString()}`);
    } else {
      navigate(`/proposals/view-details/${parentProposalId}?${searchParams.toString()}`);
    }
    onClose();
  };

  const shareVersion = (id, version) => {
    toggleShareOptions(id, version);
  };

  const restoreProposal = (id, parentPropId) => {
    modals.closeModal('restoreProposalModal');
    restoreProposalQuery.mutate(
      { proposalId: parentPropId, versionId: id },
      {
        onSuccess: res => {
          navigate(`/proposals/view-details/${res.data._id}?${searchParams.toString()}`);
          onClose();
        },
      },
    );
  };

  const toggleDeleteVersion = (id, versionTitle) => {
    modals.openModal({
      modalId: 'deleteVersionModal',
      title: 'Delete version',
      children: (
        <ConfirmContent
          onConfirm={() => handleDeleteVersion(id, versionTitle)}
          onCancel={() => modals.closeModal('deleteVersionModal')}
          loading={deleteVersion.isLoading}
          classNames="px-6"
        />
      ),
      ...modalConfig,
      size: 'md',
    });
  };

  const toggleRestoreProposal = (id, parentPropId) => {
    modals.openModal({
      modalId: 'restoreProposalModal',
      title: 'Restore version',
      children: (
        <ConfirmContent
          description="Are you sure you want to restore?"
          onConfirm={() => restoreProposal(id, parentPropId)}
          onCancel={() => modals.closeModal('restoreProposalModal')}
          loading={restoreProposalQuery.isLoading}
          classNames="px-8"
        />
      ),
      ...modalConfig,
      size: 'md',
    });
  };

  const loadMoreVersions = async () => {
    await proposalVersionsQuery.fetchNextPage();
  };

  return (
    <Drawer
      className="overflow-auto"
      size="450px"
      padding="xl"
      position="right"
      opened={isOpened}
      title="Versions"
      onClose={onClose}
    >
      {proposalVersionsQuery?.isLoading ||
      deleteVersion?.isLoading ||
      restoreProposalQuery?.isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader />
        </div>
      ) : Versions?.length ? (
        Versions?.map(({ versionTitle, createdAt, _id, parentProposalId }, index) => (
          <div
            key={_id}
            className="border border-gray-400 p-2 rounded-md flex flex-col gap-2 my-2 h-fit"
          >
            <div className="flex w-full gap-4 justify-between">
              <Radio
                label={
                  <div>
                    <div className="text-xl truncate" title={`Version ${versionTitle}`}>
                      Version {versionTitle}
                    </div>
                    <div className="text-sm ">{dayjs(createdAt).format(DATE_FORMAT)}</div>
                  </div>
                }
                classNames={{ inner: 'mt-2', root: 'w-1/2', label: 'w-[240px]' }}
                onClick={() => onVersionClick(_id, index, parentProposalId)}
                checked={proposalId === _id || parentVersionTitle === versionTitle}
              />
              <div className="flex">
                {index !== 0 ? (
                  <Button
                    size="xs"
                    title="Restore"
                    className="text-black px-2"
                    onClick={() => toggleRestoreProposal(_id, parentProposalId)}
                  >
                    <IconHistory size={22} />
                  </Button>
                ) : null}
                <Button
                  size="xs"
                  title="Share"
                  className="text-black px-2"
                  onClick={() => shareVersion(_id, versionTitle)}
                >
                  <IconShare size={22} />
                </Button>
                {index !== 0 ? (
                  <Button
                    size="xs"
                    title="Delete"
                    className="text-red-350 px-2"
                    onClick={() => toggleDeleteVersion(_id, versionTitle)}
                  >
                    <IconTrash size={22} />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center">No versions available</div>
      )}
      {proposalVersionsQuery.hasNextPage ? (
        <Button
          variant="default"
          onClick={loadMoreVersions}
          className="w-full"
          loading={proposalVersionsQuery.isLoading || proposalVersionsQuery.isFetching}
        >
          Load more
        </Button>
      ) : null}
    </Drawer>
  );
};

export default VersionsDrawer;
