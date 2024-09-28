import { Button, Menu } from '@mantine/core';
import { useModals } from '@mantine/modals';
import classNames from 'classnames';
import React from 'react';
import { Bookmark, Edit2, Eye, Trash } from 'react-feather';
import { Link } from 'react-router-dom';
import { ROLES } from '../../utils';
import modalConfig from '../../utils/modalConfig';
import DeleteCampaignContent from '../DeleteCampaignContent';
import MenuIcon from '../Menu';
import RoleBased from '../RoleBased';

const CampaignsMenuPopover = ({ isFeatured, itemId, onClickSetAsFeature }) => {
  const modals = useModals();

  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      title: '',
      innerProps: {
        modalBody: (
          <DeleteCampaignContent onClickCancel={id => modals.closeModal(id)} campaignId={itemId} />
        ),
      },
      ...modalConfig,
    });

  return (
    <Menu shadow="md" width={180}>
      <Menu.Target>
        <Button>
          <MenuIcon />
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Link to={`/campaigns/view-details/${itemId}`}>
          <Menu.Item
            className="cursor-pointer flex items-center gap-1"
            icon={<Eye className="h-4" />}
          >
            <span className="ml-1">View Details</span>
          </Menu.Item>
        </Link>
        <RoleBased acceptedRoles={[ROLES.ADMIN]}>
          <Link to={`edit-details/${itemId}`}>
            <Menu.Item
              icon={<Edit2 className="h-4" />}
              className="cursor-pointer flex items-center gap-1"
            >
              <span className="ml-1">Edit</span>
            </Menu.Item>
          </Link>
          <Menu.Item
            className={classNames(
              'bg-white cursor-pointer flex items-center text',
              isFeatured ? 'text-purple-450' : '',
            )}
            icon={<Bookmark className="h-4 mr-2" />}
            onClick={onClickSetAsFeature}
          >
            <span>Set as Featured</span>
          </Menu.Item>
          <Menu.Item
            className="cursor-pointer flex items-center gap-1"
            icon={<Trash className="h-4" />}
            onClick={toggleDeleteModal}
          >
            <span className="ml-1">Delete</span>
          </Menu.Item>
        </RoleBased>
      </Menu.Dropdown>
    </Menu>
  );
};

export default CampaignsMenuPopover;
