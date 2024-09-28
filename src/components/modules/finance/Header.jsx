import { Group } from '@mantine/core';
import { months } from '../../../utils';
import Menu from './Menu';

const purchaseOrderList = [
  {
    label: 'Manual Entry',
    path: '/finance/create-order/purchase',
  },
  {
    label: 'Upload',
    path: '/finance/create-order/purchase/upload',
  },
];
const releaseOrderList = [
  {
    label: 'Manual Entry',
    path: '/finance/create-order/release',
  },
  {
    label: 'Upload',
    path: '/finance/create-order/release/upload',
  },
];
const invoiceList = [
  {
    label: 'Manual Entry',
    path: '/finance/create-order/invoice',
  },
  {
    label: 'Upload',
    path: '/finance/create-order/invoice/upload',
  },
];

const Header = ({ year, month }) => (
  <header className="flex justify-between gap-2 h-[60px] border-b items-center flex-wrap w-full relative">
    {year ? (
      <p className="font-bold text-lg">
        {!month ? `Year ${Number(year)}` : ` ${months[Number(month) - 1 || 0]} ${year}`}
      </p>
    ) : null}

    <Group className="absolute right-0">
      <Menu btnLabel="Generate Purchase Order" options={purchaseOrderList} />
      <Menu btnLabel="Generate Release Order" options={releaseOrderList} />
      <Menu btnLabel=" Generate Invoice" options={invoiceList} />
    </Group>
  </header>
);

export default Header;
