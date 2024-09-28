import { Button, Menu } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { Link, useParams } from 'react-router-dom';
import { Eye, Edit2, Trash } from 'react-feather';
import MenuIcon from '../Menu';
import modalConfig from '../../utils/modalConfig';
import DeleteProposalSpacesContent from '../DeleteProposalSpacesContent';

const ProposalSpacesMenuPopover = ({
  inventoryId,
  spacesData,
  enableView = true,
  enableEdit = true,
  enableDelete = true,
  openInNewWindow = false,
}) => {
  const modals = useModals();
  const { id: proposalId } = useParams();

  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      title: '',
      innerProps: {
        modalBody: (
          <DeleteProposalSpacesContent
            onClickCancel={id => modals.closeModal(id)}
            spacesData={spacesData}
            inventoryId={inventoryId}
            proposalId={proposalId}
          />
        ),
      },
      ...modalConfig,
    });

  return (
    <Menu shadow="md" width={150}>
      <Menu.Target>
        <Button className="py-0" onClick={e => e.stopPropagation()}>
          <MenuIcon />
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {enableView ? (
          <Link
            to={`/inventory/view-details/${inventoryId}`}
            target={openInNewWindow ? '_blank' : '_self'}
          >
            <Menu.Item
              className="cursor-pointer flex items-center gap-1"
              icon={<Eye className="h-4" />}
            >
              <span className="ml-1">View</span>
            </Menu.Item>
          </Link>
        ) : null}
        {enableEdit ? (
          <Link to={`/inventory/edit-details/${inventoryId}`}>
            <Menu.Item
              className="cursor-pointer flex items-center gap-1"
              icon={<Edit2 className="h-4" />}
            >
              <span className="ml-1">Edit</span>
            </Menu.Item>
          </Link>
        ) : null}
        {enableDelete ? (
          <Menu.Item
            className="cursor-pointer flex items-center gap-1"
            icon={<Trash className="h-4" />}
            onClick={toggleDeleteModal}
          >
            <span className="ml-1">Delete</span>
          </Menu.Item>
        ) : null}
      </Menu.Dropdown>
    </Menu>
  );
};

export default ProposalSpacesMenuPopover;
