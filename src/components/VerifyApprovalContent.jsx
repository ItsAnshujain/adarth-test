import { Button, Divider, Image } from '@mantine/core';
import React, { useState } from 'react';
import { useModals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import CheckIcon from '../assets/check.svg';
import TrashIcon from '../assets/trash.svg';
import { useUpdateFinanceById } from '../apis/queries/finance.queries';

const label = {
  approved: 'Approve',
  rejected: 'Reject',
};

const VerifyApprovalContent = ({ onClickCancel = () => {}, financeId, value }) => {
  const modals = useModals();
  const queryClient = useQueryClient();
  const [accept, setAccept] = useState(false);

  const { mutate, isLoading } = useUpdateFinanceById();

  const invalidate = () => {
    queryClient.invalidateQueries(['finance-by-month']);
    setAccept(true);
    showNotification({
      title: `${value ? value[0].toUpperCase() + value.substr(1) : ''} status updated successfully`,
      color: 'green',
    });
    setTimeout(() => modals.closeModal(), 2000);
  };

  const handleConfirm = () => {
    mutate(
      { id: financeId, data: { approvalStatus: value } },
      {
        onSuccess: invalidate,
      },
    );
  };

  return (
    <>
      <Divider />
      <div className="flex flex-col justify-evenly items-center min-h-[230px]">
        <Image src={!accept ? TrashIcon : CheckIcon} height={65} width={65} />
        <p className="font-bold text-2xl">
          {!accept
            ? `Are you sure you want to ${label[value]} the status?`
            : `${value ? value[0].toUpperCase() + value.substr(1) : 'Processed'} successfully`}
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

export default VerifyApprovalContent;
