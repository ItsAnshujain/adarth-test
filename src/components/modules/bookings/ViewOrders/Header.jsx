import { ActionIcon, Button, Menu as MantineMenu } from '@mantine/core';
import classNames from 'classnames';
import { ArrowLeft } from 'react-feather';
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { IconChevronDown } from '@tabler/icons';
import Menu from '../../finance/Menu';
import { useExportBooking } from '../../../../apis/queries/booking.queries';
import { downloadPdf } from '../../../../utils';

const Header = ({ bookingId, bookingData }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams({ tab: 'order-information' });
  const tab = searchParams.get('tab');

  const exportBookingHandler = useExportBooking();

  const purchaseOrderList = useMemo(
    () => [
      {
        label: 'Manual Entry',
        path: `/finance/create-order/purchase?id=${bookingId}`,
      },
      {
        label: 'Upload',
        path: `/finance/create-order/purchase/upload?id=${bookingId}`,
      },
    ],
    [bookingId],
  );
  const releaseOrderList = useMemo(
    () => [
      {
        label: 'Manual Entry',
        path: `/finance/create-order/release?id=${bookingId}`,
      },
      {
        label: 'Upload',
        path: `/finance/create-order/release/upload?id=${bookingId}`,
      },
    ],
    [bookingId],
  );
  const invoiceList = useMemo(
    () => [
      {
        label: 'Manual Entry',
        path: `/finance/create-order/invoice?id=${bookingId}`,
      },
      {
        label: 'Upload',
        path: `/finance/create-order/invoice/upload?id=${bookingId}`,
      },
    ],
    [bookingId],
  );

  const handleTabs = type => {
    searchParams.set('tab', type);
    setSearchParams(searchParams);
  };

  const exportBooking = async () => {
    const res = await exportBookingHandler.mutateAsync({
      bookingId,
    });
    downloadPdf(res.xlsxLink);
    showNotification({
      title: 'Download successful',
      color: 'green',
    });
  };
  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center flex-wrap">
      <div className="flex gap-3 items-center font-medium">
        <ActionIcon onClick={() => navigate(-1)} className="mr-2 text-black">
          <ArrowLeft />
        </ActionIcon>
        <Button
          onClick={() => handleTabs('order-information')}
          className={classNames(
            tab === 'order-information'
              ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3 after:bg-purple-450'
              : 'text-black',
            'px-0',
          )}
        >
          Order Information
        </Button>
        <Button
          onClick={() => handleTabs('process-pipeline')}
          className={classNames(
            tab === 'process-pipeline'
              ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3 after:bg-purple-450'
              : 'text-black',
          )}
        >
          Process Pipeline
        </Button>
        <Button
          onClick={() => handleTabs('overview')}
          className={classNames(
            tab === 'overview'
              ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3 after:bg-purple-450'
              : 'text-black',
            'px-0',
          )}
        >
          Overview
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <Button
          variant="default"
          className="cursor-pointer text-sm font-semibold py-2 px-3 rounded-md text-black"
          onClick={exportBooking}
          loading={exportBookingHandler.isLoading}
        >
          Export Booking
        </Button>
        {tab === 'order-information' ? (
          <MantineMenu>
            <MantineMenu.Target>
              <Button
                className="text-white cursor-pointer bg-purple-450 text-sm font-semibold py-2 px-3 rounded-md"
                rightIcon={<IconChevronDown />}
              >
                All-in-One Billing
              </Button>
            </MantineMenu.Target>
            <MantineMenu.Dropdown>
              <div className="flex flex-col gap-2 flex-wrap">
                <Menu
                  btnLabel="Purchase Order"
                  options={purchaseOrderList}
                  className="bg-purple-450"
                />
                <Menu
                  btnLabel="Release Order"
                  options={releaseOrderList}
                  className="bg-purple-450"
                />
                <Menu btnLabel="Invoice" options={invoiceList} className="bg-purple-450" />
              </div>
            </MantineMenu.Dropdown>
          </MantineMenu>
        ) : (
          <MantineMenu>
            <MantineMenu.Target>
              <Button
                className={classNames(
                  'cursor-pointer  text-sm font-semibold py-2 px-3 rounded-md',
                  !bookingData?.invoice && !bookingData?.releaseOrder && !bookingData?.purchaseOrder
                    ? 'pointer-events-none text-black bg-gray-450'
                    : 'bg-purple-450 text-white',
                )}
                rightIcon={<IconChevronDown />}
                disabled={
                  !bookingData?.invoice && !bookingData?.releaseOrder && !bookingData?.purchaseOrder
                }
              >
                Download Finances
              </Button>
            </MantineMenu.Target>
            <MantineMenu.Dropdown className="w-48">
              <div className="flex flex-col gap-1">
                <a
                  href={bookingData?.purchaseOrder}
                  className={classNames(
                    bookingData?.purchaseOrder
                      ? 'text-white cursor-pointer bg-purple-450'
                      : 'pointer-events-none text-black bg-gray-450',
                    'font-medium py-2 px-3 rounded-md w-full',
                  )}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                >
                  Purchase Order
                </a>
                <a
                  href={bookingData?.releaseOrder}
                  className={classNames(
                    bookingData?.releaseOrder
                      ? 'text-white cursor-pointer bg-purple-450'
                      : 'pointer-events-none text-black bg-gray-450',
                    'font-medium py-2 px-3 rounded-md w-full',
                  )}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                >
                  Release Order
                </a>
                <a
                  href={bookingData?.invoice}
                  className={classNames(
                    bookingData?.invoice
                      ? 'text-white cursor-pointer bg-purple-450'
                      : 'pointer-events-none text-black bg-gray-450',
                    'font-medium py-2 px-3 rounded-md w-full pb-1',
                  )}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                >
                  Invoice
                </a>
              </div>
            </MantineMenu.Dropdown>
          </MantineMenu>
        )}
      </div>
    </div>
  );
};

export default Header;
