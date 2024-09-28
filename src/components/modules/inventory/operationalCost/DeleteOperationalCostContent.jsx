import { Button, Divider, Image } from '@mantine/core';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import CheckIcon from '../../../../assets/check.svg';
import TrashIcon from '../../../../assets/trash.svg';
import { useDeleteOperationalCost } from '../../../../apis/queries/operationalCost.queries';

const DeleteOperationalCostContent = ({ onClose = () => {}, itemId }) => {
  const queryClient = useQueryClient();
  const [accept, setAccept] = useState(false);
  const deleteOperationalCost = useDeleteOperationalCost();

  const handleConfirm = () =>
    deleteOperationalCost.mutate(itemId, {
      onSuccess: () => {
        showNotification({
          title: 'Operational cost deleted successfully',
          color: 'green',
        });
        queryClient.invalidateQueries(['operational-cost']);
        setAccept(true);
        setTimeout(() => onClose(), 2000);
      },
    });

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
              onClick={onClose}
              className="bg-black text-white rounded-md text-sm px-8 py-3"
              disabled={deleteOperationalCost.isLoading}
            >
              No
            </Button>
            <Button
              className="primary-button"
              onClick={handleConfirm}
              loading={deleteOperationalCost.isLoading}
              disabled={deleteOperationalCost.isLoading}
            >
              Yes
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default DeleteOperationalCostContent;
