import { Button, Divider, Group, Text } from '@mantine/core';
import { useModals } from '@mantine/modals';
import React, { forwardRef } from 'react';
import modalConfig from '../../../utils/modalConfig';
import AddCompanyContent from '../company/AddCompanyContent';

const updatedModalConfig = {
  ...modalConfig,
  size: '1000px',
  classNames: {
    title: 'font-dmSans text-2xl font-bold px-4',
    header: 'p-4 border-b border-gray-450',
    body: 'h-[600px] overflow-auto',
    close: 'mr-4',
  },
};

const SelectLeadCompanyItem = forwardRef(({ label, addMore, ...others }, ref) => {
  const modals = useModals();

  const handleAddCompany = () =>
    modals.openModal({
      title: 'Add Company',
      modalId: 'addCompanyModal',
      children: (
        <AddCompanyContent
          type="company"
          mode="add"
          tab="companies"
          onCancel={() => modals.closeModal('addCompanyModal')}
        />
      ),
      ...updatedModalConfig,
    });

  return addMore ? (
    <>
      <Divider />
      <Button
        className="mt-3 font-medium text-black border-gray-450"
        variant="outline"
        onClick={handleAddCompany}
      >
        Add New Company
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

export default SelectLeadCompanyItem;
