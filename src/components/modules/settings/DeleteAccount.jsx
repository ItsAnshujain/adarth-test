import { Button } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { useNavigate } from 'react-router-dom';
import modalConfig from '../../../utils/modalConfig';
import TwoStepDeleteAccountContent from './TwoStepDeleteAccountContent';

const DeleteAccount = () => {
  const modals = useModals();
  const navigate = useNavigate();

  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      title: 'Delete your account',
      modalId: 'deleteAccount',
      innerProps: {
        modalBody: (
          <TwoStepDeleteAccountContent
            onClickCancel={() => modals.closeModal('deleteAccount')}
            navigate={navigate}
          />
        ),
      },
      ...modalConfig,
    });

  return (
    <div className="pl-5 pr-7 mt-4">
      <p className="font-bold text-xl">Are you sure you want to delete your account?</p>
      <Button
        className="py-2 px-3 rounded bg-purple-450 text-white mt-3"
        onClick={toggleDeleteModal}
      >
        Yes
      </Button>
    </div>
  );
};

export default DeleteAccount;
