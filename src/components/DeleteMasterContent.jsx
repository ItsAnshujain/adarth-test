import { Button, Divider, Image } from '@mantine/core';
import { useModals } from '@mantine/modals';
import React, { useState } from 'react';
import CheckIcon from '../assets/check.svg';
import TrashIcon from '../assets/trash.svg';
import { useDeleteMaster } from '../apis/queries/masters.queries';

const DeleteMasterContent = ({ onClickCancel = () => {}, masterId }) => {
  const modals = useModals();
  const [accept, setAccept] = useState(false);
  const { mutate: deleteMaster, isLoading } = useDeleteMaster();

  const handleConfirm = () => {
    deleteMaster(
      { masterId },
      {
        onSuccess: () => {
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

export default DeleteMasterContent;
