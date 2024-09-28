import { ActionIcon, Loader, Switch, Tabs } from '@mantine/core';
import { ArrowLeft } from 'react-feather';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useToggle } from '@mantine/hooks';
import { useEffect } from 'react';
import Booking from '../../components/modules/inventory/ViewSpace/Booking';
import BasicInfo from '../../components/modules/inventory/ViewSpace/BasicInformation';
import OperationalCost from '../../components/modules/inventory/ViewSpace/OperationalCost';
import { useFetchInventoryById, useUpdateInventory } from '../../apis/queries/inventory.queries';

const InventoryDetailsPage = () => {
  const navigate = useNavigate();
  const { id: inventoryId } = useParams();
  const [isUnderMaintenance, toggle] = useToggle();
  const [searchParams, setSearchParams] = useSearchParams({
    'tabType': 'basic-info',
  });

  const tabType = searchParams.get('tabType');

  const handleTabs = type => {
    searchParams.set('tabType', type);
    setSearchParams(searchParams);
  };

  const { data: inventoryDetails, isLoading: isInventoryDetailsLoading } = useFetchInventoryById(
    inventoryId,
    !!inventoryId,
  );
  const { mutate: update, isLoading: isUpdateInventoryLoading } = useUpdateInventory();

  const handleBack = () => navigate(-1);

  const onUpdateMaintenance = toggleValue => {
    toggle(toggleValue);
    if (inventoryId) {
      const data = { isUnderMaintenance: toggleValue };
      update({ inventoryId, data });
    }
  };

  useEffect(() => {
    // current maintenance state
    if (inventoryDetails?.inventory?.isUnderMaintenance) {
      toggle(inventoryDetails?.inventory.isUnderMaintenance);
    }
  }, [inventoryDetails?.inventory]);

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-5">
      {isInventoryDetailsLoading ? (
        <Loader className="mx-auto mt-72" />
      ) : (
        <Tabs value={tabType} onTabChange={handleTabs}>
          <Tabs.List className="flex items-center justify-between">
            <div className="flex items-center">
              <ActionIcon onClick={handleBack} className="mr-2">
                <ArrowLeft color="#000" />
              </ActionIcon>
              <Tabs.Tab value="basic-info" className="px-3 text-lg h-[60px]">
                Basic Information
              </Tabs.Tab>
              {!inventoryDetails?.isPeer ? (
                <Tabs.Tab value="booking" className="px-3 text-lg h-[60px]">
                  Booking
                </Tabs.Tab>
              ) : null}
              <Tabs.Tab value="operational-cost" className="px-3 text-lg h-[60px]">
                Operational Cost
              </Tabs.Tab>
            </div>
            {tabType === 'basic-info' && !inventoryDetails?.isPeer ? (
              <div className="flex">
                <div className="flex items-center pr-7">
                  <p className="text-lg mr-3">Under maintenance</p>
                  <Switch
                    checked={isUnderMaintenance}
                    onChange={e => onUpdateMaintenance(e.currentTarget.checked)}
                    size="xl"
                    disabled={isUpdateInventoryLoading}
                  />
                </div>
                <div>
                  <Link
                    to={`/inventory/edit-details/${inventoryId}`}
                    className="bg-purple-450 flex items-center text-white rounded-md px-4 h-full font-bold text-sm"
                  >
                    Edit Space
                  </Link>
                </div>
              </div>
            ) : null}
          </Tabs.List>

          <Tabs.Panel value="basic-info">
            <BasicInfo
              inventoryDetails={inventoryDetails?.inventory}
              isInventoryDetailsLoading={isInventoryDetailsLoading}
              operationalCost={inventoryDetails?.operationalCost}
              totalCompletedBooking={inventoryDetails?.totalCompletedBooking}
              totalOccupancy={inventoryDetails?.totalOccupancy}
              totalRevenue={inventoryDetails?.totalRevenue}
              bookingRange={inventoryDetails?.bookingRange}
            />
          </Tabs.Panel>
          <Tabs.Panel value="booking" pt="xs">
            <Booking inventoryId={inventoryId} />
          </Tabs.Panel>
          <Tabs.Panel value="operational-cost" pt="xs">
            <OperationalCost
              inventoryDetails={inventoryDetails?.inventory}
              isPeer={inventoryDetails?.isPeer}
            />
          </Tabs.Panel>
        </Tabs>
      )}
    </div>
  );
};

export default InventoryDetailsPage;
