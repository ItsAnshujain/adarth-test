import React, { useCallback, useMemo, useState } from 'react';
import { ActionIcon, Button, Group, Menu, Modal } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { useParams, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useQueryClient } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import Table from '../../../Table/Table';
import modalConfig from '../../../../utils/modalConfig';
import AddPaymentInformationForm from './AddPaymentInformationForm';
import toIndianCurrency from '../../../../utils/currencyFormat';
import { usePayment, useDeletePayment } from '../../../../apis/queries/payment.queries';
import { DATE_FORMAT } from '../../../../utils/constants';
import MenuIcon from '../../../Menu';
import ConfirmContent from '../../../shared/ConfirmContent';
import { downloadPdf, generateSlNo } from '../../../../utils';

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    header: 'px-4 pt-4',
    body: 'p-4',
  },
};

const PaymentInformationList = () => {
  const queryClient = useQueryClient();
  const modals = useModals();
  const { id: bookingId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDeletePayment, setOpenDeletePayment] = useState('');

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const paymentQuery = usePayment(
    { bookingId, limit: 10, page, sortBy: 'name', sortOrder: 'asc' },
    !!bookingId,
  );
  const deletePayment = useDeletePayment();

  const handleAddPayment = id =>
    modals.openModal({
      modalId: 'addPaymentInformation',
      title: `${id ? 'Edit' : 'Add'} Payment Information`,
      children: (
        <AddPaymentInformationForm
          bookingId={bookingId}
          onClose={() => modals.closeModal('addPaymentInformation')}
          id={id}
        />
      ),
      ...modalConfig,
    });

  const handleDeletePayment = useCallback(() => {
    if (typeof openDeletePayment === 'string') {
      deletePayment.mutate(openDeletePayment, {
        onSuccess: () => {
          queryClient.invalidateQueries(['payment']);
          queryClient.invalidateQueries(['booking-stats-by-id', bookingId]);
          showNotification({
            message: 'Payment deleted successfully',
            color: 'green',
          });
          setOpenDeletePayment('');
        },
      });
    }
  }, [openDeletePayment, deletePayment]);

  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);
    setSearchParams(searchParams);
  };

  const COLUMNS = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, page, limit)}</p>, []),
      },
      {
        Header: 'PAYMENT TYPE',
        accessor: 'type',
        disableSortBy: true,
        Cell: info =>
          useMemo(
            () => (
              <p className="uppercase">
                {info.row.original?.type && info.row.original.type.includes('_')
                  ? info.row.original.type.split('_').join(' ')
                  : '-'}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'REFERENCE NUMBER',
        accessor: 'referenceNumber',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{info.row.original.referenceNumber || '-'}</p>, []),
      },
      {
        Header: 'AMOUNT',
        accessor: 'amount',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{toIndianCurrency(info.row.original.amount || 0)}</p>, []),
      },
      {
        Header: 'BILL DATE',
        accessor: 'paymentDate',
        disableSortBy: true,
        Cell: info =>
          useMemo(
            () => (
              <p>
                {info.row.original.paymentDate
                  ? dayjs(info.row.original.paymentDate).format(DATE_FORMAT)
                  : '-'}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'BILL NUMBER',
        accessor: 'billNumber',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{info.row.original.billNumber || '-'}</p>, []),
      },
      {
        Header: 'PAYMENT EXPENSE',
        accessor: 'paymentFor',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{info.row.original.paymentFor || '-'}</p>, []),
      },
      {
        Header: 'DESCRIPTION',
        accessor: 'remarks',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{info.row.original.remarks || '-'}</p>, []),
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: info =>
          useMemo(
            () => (
              <Menu shadow="md" classNames={{ item: 'cursor-pointer' }}>
                <Menu.Target>
                  <ActionIcon>
                    <MenuIcon />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    onClick={() =>
                      info.row.original?.invoice ? downloadPdf(info.row.original.invoice) : null
                    }
                    disabled={!info.row.original?.invoice}
                  >
                    Download
                  </Menu.Item>
                  <Menu.Item onClick={() => handleAddPayment(info.row.original._id)}>
                    Edit
                  </Menu.Item>
                  <Menu.Item onClick={() => setOpenDeletePayment(info.row.original._id)}>
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ),
            [],
          ),
      },
    ],
    [paymentQuery.data?.docs],
  );

  return (
    <div className="mb-5">
      <Group position="apart" className="pb-3">
        <p className="font-bold text-lg">Payment Info</p>
        <Button className="primary-button" onClick={() => handleAddPayment()}>
          Add Payment Information
        </Button>
      </Group>

      <Table
        COLUMNS={COLUMNS}
        data={paymentQuery.data?.docs || []}
        classNameWrapper="min-h-[150px]"
        activePage={paymentQuery.data?.page || 1}
        totalPages={paymentQuery.data?.totalPages || 1}
        setActivePage={currentPage => handlePagination('page', currentPage)}
        loading={paymentQuery.isLoading}
      />

      <Modal
        title="Delete Payment Record?"
        opened={!!openDeletePayment}
        onClose={() => setOpenDeletePayment('')}
        closeOnClickOutside={!deletePayment.isLoading}
        closeOnEscape={!deletePayment.isLoading}
        {...updatedModalConfig}
      >
        <ConfirmContent
          onConfirm={() => handleDeletePayment()}
          onCancel={() => setOpenDeletePayment('')}
          loading={deletePayment.isLoading}
        />
      </Modal>
    </div>
  );
};

export default PaymentInformationList;
