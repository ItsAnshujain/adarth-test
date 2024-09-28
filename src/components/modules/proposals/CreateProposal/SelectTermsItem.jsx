import { Button, Divider, Group, Text } from '@mantine/core';
import { useModals } from '@mantine/modals';
import React, { forwardRef } from 'react';
import modalConfig from '../../../../utils/modalConfig';
import AddTermsAndConditionsForm from './AddTermsAndConditionsForm';

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'text-xl font-bold w-full',
    header: 'hidden',
    body: 'pb-4',
  },
};

const SelectTermsItem = forwardRef(({ label, addMore, ...others }, ref) => {
  const modals = useModals();

  const handleAddPayment = () =>
    modals.openModal({
      modalId: 'addTerms',
      title: 'Add Terms & Conditions',
      children: <AddTermsAndConditionsForm onClose={() => modals.closeModal('addTerms')} />,
      ...updatedModalConfig,
    });

  return addMore ? (
    <>
      <Divider />
      <Button
        className="mt-3 font-medium text-black border-gray-450"
        variant="outline"
        onClick={handleAddPayment}
      >
        Add New Terms
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

export default SelectTermsItem;
