import { useModals } from '@mantine/modals';
import { ActionIcon, Menu } from '@mantine/core';
import { Edit2, Eye, Trash } from 'react-feather';
import { Link } from 'react-router-dom';
import modalConfig from '../../utils/modalConfig';
import DeleteSpaceContent from '../DeleteSpaceContent';
import MenuIcon from '../Menu';
import { handleStopPropagation } from '../../utils';

const SpacesMenuPopover = ({
  itemId,
  enableView = true,
  enableEdit = true,
  enableDelete = true,
  openInNewWindow = false,
}) => {
  const modals = useModals();

  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      title: '',
      innerProps: {
        modalBody: (
          <DeleteSpaceContent onClickCancel={id => modals.closeModal(id)} inventoryId={itemId} />
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
        {enableView ? (
          <Link
            to={`/inventory/view-details/${itemId}`}
            target={openInNewWindow ? '_blank' : '_self'}
          >
            <Menu.Item
              className="cursor-pointer flex items-center gap-1"
              icon={<Eye className="h-4" />}
            >
              View Details
            </Menu.Item>
          </Link>
        ) : null}
        {enableEdit ? (
          <Link to={`/inventory/edit-details/${itemId}`}>
            <Menu.Item
              className="cursor-pointer flex items-center gap-1"
              icon={<Edit2 className="h-4" />}
            >
              Edit
            </Menu.Item>
          </Link>
        ) : null}
        {enableDelete ? (
          <Menu.Item
            className="cursor-pointer flex items-center gap-1"
            icon={<Trash className="h-4" />}
            onClick={e => handleStopPropagation(e, toggleDeleteModal)}
          >
            Delete
          </Menu.Item>
        ) : null}
      </Menu.Dropdown>
    </Menu>
  );
};

export default SpacesMenuPopover;
