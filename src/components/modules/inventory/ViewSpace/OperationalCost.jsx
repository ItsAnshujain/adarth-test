import { Button, Group, Loader } from '@mantine/core';
import { useModals } from '@mantine/modals';
import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useFetchOperationalCost } from '../../../../apis/queries/operationalCost.queries';
import toIndianCurrency from '../../../../utils/currencyFormat';
import modalConfig from '../../../../utils/modalConfig';
import AddOperationalCostModal from './AddOperationalCostModal';
import DeleteOperationalCostContent from '../operationalCost/DeleteOperationalCostContent';
import OperationalCostCard from '../operationalCost/OperationalCostCard';
// import OperationalCostMenuPopover from '../../../Popovers/OperationalCostMenuPopover';

const OperationalCost = ({ inventoryDetails, isPeer }) => {
  const modals = useModals();
  const [searchParams] = useSearchParams();
  const { id: inventoryId } = useParams();
  const { data: operationaCostData, isLoading } = useFetchOperationalCost(inventoryId);
  const bookingIdFromUrl = searchParams.get('bookingId');

  const handleOperationalCost = (
    _,
    costId,
    type,
    amount,
    description,
    year,
    month,
    day,
    bookingId,
  ) =>
    modals.openContextModal('basic', {
      title: `${costId ? 'Edit' : 'Add'} Operational Cost`,
      modalId: 'addOperationalCost',
      innerProps: {
        modalBody: (
          <AddOperationalCostModal
            inventoryId={inventoryId}
            onClose={() => modals.closeModal('addOperationalCost')}
            costId={costId}
            type={type}
            amount={amount}
            description={description}
            bookingId={bookingId}
            bookingIdFromUrl={bookingIdFromUrl}
            year={year}
            month={month}
            day={day}
          />
        ),
      },
      ...modalConfig,
    });

  const totalAmount = useMemo(() => {
    const result = operationaCostData?.reduce((acc, item) => acc + +item.amount || 0, 0);
    return result;
  }, [operationaCostData]);

  const toggleDeleteModal = itemId =>
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
    <div>
      <p className="font-medium text-lg">View Operational Cost</p>

      {isLoading ? (
        <Loader className="mx-auto mt-20" />
      ) : (
        <div className="border border-gray-300 mt-4 rounded-md">
          <Group className="p-3 border-b border-black  bg-slate-200">
            <p className="font-medium">
              Space Name: {inventoryDetails?.basicInformation?.spaceName}
            </p>
          </Group>
          <div>
            <div className="min-h-[400px] max-h-[400px] overflow-y-auto px-3">
              {operationaCostData?.length ? (
                operationaCostData.map(item => (
                  <OperationalCostCard
                    key={item?._id}
                    isPeer={isPeer}
                    item={item}
                    onEdit={e =>
                      handleOperationalCost(
                        e,
                        item?._id,
                        item?.type,
                        item?.amount,
                        item?.description,
                        item?.year,
                        item?.month,
                        item?.day,
                        item?.bookingId,
                      )
                    }
                    onDelete={() => toggleDeleteModal(item?._id)}
                  />
                ))
              ) : (
                <p className="text-center text-lg py-5">No records found</p>
              )}
            </div>
            <p className="p-3 font-medium text-end">Total: {toIndianCurrency(totalAmount ?? 0)}</p>
            {!isPeer ? (
              <Group position="right" className="px-3 pb-3">
                <Button className="primary-button" onClick={handleOperationalCost}>
                  Add Operational Cost
                </Button>
              </Group>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationalCost;
