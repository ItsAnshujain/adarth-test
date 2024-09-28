import { Image } from '@mantine/core';
import React from 'react';
import InventoryIcon from '../../../../assets/inventory-active.svg';
import OperationalCostIcon from '../../../../assets/operational-cost.svg';
import VacantIcon from '../../../../assets/vacant.svg';
import OccupiedIcon from '../../../../assets/occupied.svg';
import UnderMaintenanceIcon from '../../../../assets/under-maintenance.svg';
import toIndianCurrency from '../../../../utils/currencyFormat';

const InventoryStatsContent = ({ inventoryReports, inventoryStats }) => (
  <div className="flex justify-between gap-4 flex-wrap mb-5">
    <div className="border rounded p-8  flex-1">
      <Image src={InventoryIcon} alt="folder" fit="contain" height={24} width={24} />
      <p className="my-2 text-sm font-light text-slate-400">Total Inventory</p>
      <p className="font-bold">{inventoryReports?.totalInventories ?? 0}</p>
    </div>
    <div className="border rounded p-8 flex-1">
      <Image src={VacantIcon} alt="folder" fit="contain" height={24} width={24} />
      <p className="my-2 text-sm font-light text-slate-400">Vacant</p>
      <p className="font-bold">{inventoryStats?.vacant ?? 0}</p>
    </div>
    <div className="border rounded p-8  flex-1">
      <Image src={OccupiedIcon} alt="folder" fit="contain" height={24} width={24} />
      <p className="my-2 text-sm font-light text-slate-400">Occupied</p>
      <p className="font-bold">{inventoryStats?.occupied ?? 0}</p>
    </div>
    <div className="border rounded p-8 flex-1">
      <Image src={UnderMaintenanceIcon} alt="folder" fit="contain" height={24} width={24} />
      <p className="my-2 text-sm font-light text-slate-400">Under Maintenance</p>
      <p className="font-bold">{inventoryReports?.underMaintenance ?? 0}</p>
    </div>
    <div className="border rounded p-8 flex-1">
      <Image src={OperationalCostIcon} alt="folder" fit="contain" height={24} width={24} />
      <p className="my-2 text-sm font-light text-slate-400">Total Operational Cost</p>
      <p className="font-bold">{toIndianCurrency(inventoryReports?.totalOperationalCost ?? 0)}</p>
    </div>
  </div>
);

export default InventoryStatsContent;
