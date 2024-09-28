import { Button, Divider, Image } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import CheckIcon from '../assets/check.svg';
import TrashIcon from '../assets/trash.svg';
import { useUpdateProposal } from '../apis/queries/proposal.queries';

const DeleteProposalSpacesContent = ({
  onClickCancel = () => {},
  spacesData = [],
  inventoryId,
  proposalId,
}) => {
  const modals = useModals();
  const queryClient = useQueryClient();
  const [accept, setAccept] = useState(false);
  const { mutate: deleteItem, isLoading } = useUpdateProposal();

  const handleConfirm = () => {
    const data = {};
    data.spaces = spacesData
      ?.filter(item => item._id !== inventoryId)
      .map(item => ({
        id: item._id,
        price: +item.price,
        startDate: item.startDate,
        endDate: item.endDate,
      }));

    deleteItem(
      { proposalId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['proposals-by-id']);
          setAccept(true);
          setTimeout(() => modals.closeModal(), 2000);
        },
      },
    );
  };

  return (
    <>
      <Divider />
      <div className="flex flex-col justify-evenly items-center min-h-[230px]">
        <Image src={!accept ? TrashIcon : CheckIcon} height={65} width={65} />
        <p className="font-bold text-2xl">
          {!accept ? 'Are you sure you want to delete?' : 'Deleted successfully'}
        </p>
        {!accept ? (
          <div className="flex gap-2  justify-end">
            <Button
              onClick={onClickCancel}
              className="bg-black text-white rounded-md text-sm px-8 py-3"
              disabled={isLoading}
            >
              No
            </Button>
            <Button
              className="primary-button"
              onClick={handleConfirm}
              loading={isLoading}
              disabled={isLoading}
            >
              Yes
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default DeleteProposalSpacesContent;
