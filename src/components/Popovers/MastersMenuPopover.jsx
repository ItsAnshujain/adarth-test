import { Button, Menu } from '@mantine/core';
import React, { useState } from 'react';
import { Edit2, Trash } from 'react-feather';
import { useModals } from '@mantine/modals';
import InputModal from '../modules/masters/InputModal';
import MenuIcon from '../Menu';
import modalConfig from '../../utils/modalConfig';
import DeleteMasterContent from '../DeleteMasterContent';

const MastersMenuPopover = ({ itemId, name }) => {
  const [opened, setOpened] = useState(false);
  const modals = useModals();

  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      title: '',
      innerProps: {
        modalBody: (
          <DeleteMasterContent onClickCancel={id => modals.closeModal(id)} masterId={itemId} />
        ),
      },
      ...modalConfig,
    });

  return (
    <>
      <Menu shadow="md" width={150}>
        <Menu.Target>
          <Button>
            <MenuIcon />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={() => setOpened(true)} icon={<Edit2 className="h-4" />}>
            <span className="text-base">Edit</span>
          </Menu.Item>
          <Menu.Item icon={<Trash className="h-4" />} onClick={() => toggleDeleteModal()}>
            <span className="text-base">Delete</span>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <InputModal opened={opened} setOpened={setOpened} isEdit itemId={itemId} name={name} />
    </>
  );
};

export default MastersMenuPopover;
