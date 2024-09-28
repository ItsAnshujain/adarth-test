import { useModals } from '@mantine/modals';
import { ActionIcon, Menu } from '@mantine/core';
import { Edit, Trash } from 'react-feather';
import modalConfig from '../../utils/modalConfig';
import MenuIcon from '../Menu';
import { handleStopPropagation } from '../../utils';
import DeleteOperationalCostContent from '../modules/inventory/operationalCost/DeleteOperationalCostContent';

const OperationalCostMenuPopover = ({ itemId, onEdit = () => {} }) => {
  const modals = useModals();

  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      title: '',
      modalId: 'deleteOperationalCost',
      innerProps: {
        modalBody: (
          <DeleteOperationalCostContent
            onClose={() => modals.closeModal('deleteOperationalCost')}
            itemId={itemId}
          />
        ),
      },
      ...modalConfig,
    });

  return (
    <Menu shadow="md" withinPortal position="left">
      <Menu.Target>
        <ActionIcon className="py-0" onClick={e => e.preventDefault()}>
          <MenuIcon />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          className="cursor-pointer flex items-center gap-1"
          icon={<Edit className="h-4" />}
          onClick={onEdit}
        >
          Edit
        </Menu.Item>

        <Menu.Item
          className="cursor-pointer flex items-center gap-1"
          icon={<Trash className="h-4" />}
          onClick={e => handleStopPropagation(e, toggleDeleteModal)}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default OperationalCostMenuPopover;
