import { Button, Divider, Group, Text } from '@mantine/core';
import { useModals } from '@mantine/modals';
import React, { forwardRef } from 'react';
import modalConfig from '../../../utils/modalConfig';
import AddContactContent from '../contact/AddContactContent';

const updatedModalConfig = {
  ...modalConfig,
  size: '1000px',
  classNames: {
    title: 'font-dmSans text-2xl font-bold px-4',
    header: 'p-4 border-b border-gray-450',
    body: '',
    close: 'mr-4',
  },
};

const SelectContactPersonItem = forwardRef(({ label, addMore, ...others }, ref) => {
  const modals = useModals();

  const handleAddContact = () =>
    modals.openModal({
      title: 'Add Contact',
      modalId: 'addContact',
      children: <AddContactContent mode="add" onCancel={() => modals.closeModal('addContact')} />,
      ...updatedModalConfig,
    });

  return addMore ? (
    <>
      <Divider />
      <Button
        className="mt-3 font-medium text-black border-gray-450"
        variant="outline"
        onClick={handleAddContact}
      >
        Add Contact
      </Button>
    </>
  ) : (
    <div ref={ref} {...others}>
      <Group noWrap>
        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  );
});

export default SelectContactPersonItem;
