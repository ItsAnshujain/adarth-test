import React from 'react';
import { ActionIcon, Menu } from '@mantine/core';
import { Share2 } from 'react-feather';
import { useModals } from '@mantine/modals';
import MenuIcon from '../Menu';
import modalConfig from '../../utils/modalConfig';
import DeleteFinanceContent from '../DeleteFinanceContent';
import ShareContent from '../modules/finance/ShareContent';

const MenuPopover = ({ itemId, onClickDownloadPdf = () => {}, type }) => {
  const modals = useModals();

  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      title: '',
      innerProps: {
        modalBody: (
          <DeleteFinanceContent
            onClickCancel={id => modals.closeModal(id)}
            financeId={itemId}
            type={type}
          />
        ),
      },
      ...modalConfig,
    });

  const toggleShareOptions = () => {
    modals.openContextModal('basic', {
      title: 'Share via:',
      innerProps: {
        modalBody: <ShareContent id={itemId} />,
      },
      ...modalConfig,
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <ActionIcon onClick={toggleShareOptions}>
        <Share2 size="20" color="black" />
      </ActionIcon>

      <Menu shadow="md" width={150}>
        <Menu.Target>
          <ActionIcon>
            <MenuIcon />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            className="cursor-pointer flex items-center gap-1 w-full"
            onClick={onClickDownloadPdf}
          >
            <span className="ml-1">Download</span>
          </Menu.Item>
          <Menu.Item
            className="cursor-pointer flex items-center gap-1 w-full"
            onClick={toggleDeleteModal}
          >
            <span className="ml-1">Delete</span>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};

export default MenuPopover;
