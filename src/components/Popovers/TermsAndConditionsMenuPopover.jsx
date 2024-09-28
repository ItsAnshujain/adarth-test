import { Button, Menu } from '@mantine/core';
import { useModals } from '@mantine/modals';
import modalConfig from '../../utils/modalConfig';
import MenuIcon from '../Menu';
import ConfirmContent from '../shared/ConfirmContent';

const TermsAndConditionsMenuPopover = ({ toggleEditModal, deleteTerm, loading }) => {
  const modals = useModals();

  const toggleDeleteModal = () =>
    modals.openModal({
      modalId: 'deleteTermsModal',
      title: 'Delete Terms and Conditions',
      children: (
        <ConfirmContent
          onCancel={() => modals.closeModal('deleteTermsModal')}
          classNames="px-8 mt-4"
          onConfirm={() => {
            deleteTerm();
            modals.closeModal('deleteTermsModal');
          }}
        />
      ),
      ...modalConfig,
      size: 'md',
      classNames: {
        title: 'font-dmSans text-xl px-4',
        header: 'px-4 pt-4',
        body: 'pb-4 overflow-auto',
        close: 'mr-4',
      },
    });

  return (
    <Menu shadow="md" width={120}>
      <Menu.Target>
        <Button>
          <MenuIcon />
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={toggleEditModal} disabled={loading}>
          Edit
        </Menu.Item>
        <Menu.Item onClick={toggleDeleteModal} loading={loading}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default TermsAndConditionsMenuPopover;
