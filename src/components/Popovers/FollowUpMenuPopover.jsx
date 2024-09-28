import { Button, Card, Menu } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import modalConfig from '../../utils/modalConfig';
import MenuIcon from '../Menu';
import ConfirmContent from '../shared/ConfirmContent';
import { useDeleteFollowUp } from '../../apis/queries/followup.queries';

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'font-dmSans text-xl px-4',
    header: 'pt-4',
    body: 'p-4',
  },
  size: 'md',
};

const FollowUpMenuPopover = ({ itemId, toggleEditFollowUp }) => {
  const modals = useModals();
  const deleteFollowUpHandler = useDeleteFollowUp();

  const deleteFollowUp = () => {
    modals.closeModal('deleteFollowUpModal');
    deleteFollowUpHandler.mutate(itemId, {
      onSuccess: () =>
        showNotification({
          message: 'Follow Up deleted successfully',
        }),
    });
  };

  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      title: 'Delete Follow Up',
      modalId: 'deleteFollowUpModal',
      innerProps: {
        modalBody: (
          <ConfirmContent
            onConfirm={deleteFollowUp}
            onCancel={() => modals.closeModal('deleteFollowUpModal')}
            loading={deleteFollowUpHandler.isLoading}
          />
        ),
      },
      ...updatedModalConfig,
    });

  return (
    <Menu shadow="md" width={140}>
      <Menu.Target>
        <Button>
          <MenuIcon />
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Card onClick={toggleEditFollowUp} className="p-0">
          <Menu.Item>Edit</Menu.Item>
        </Card>

        <Card onClick={toggleDeleteModal} className="p-0">
          <Menu.Item>Delete</Menu.Item>
        </Card>
      </Menu.Dropdown>
    </Menu>
  );
};

export default FollowUpMenuPopover;
