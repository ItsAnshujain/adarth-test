import { Button, Loader } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import {
  useFetchSingleRecordById,
  useUpdateFinanceById,
} from '../../../apis/queries/finance.queries';
import { downloadPdf } from '../../../utils';

const DATE_FORMAT = 'DD MMM, YYYY';

const PurchseSection = ({ financeData }) => (
  <>
    <div className="flex justify-end">
      <Button className="secondary-button mr-3" onClick={() => downloadPdf(financeData?.file)}>
        Download File
      </Button>
    </div>
    <p className="font-medium">
      Order Id: <span className="text-gray-600">{financeData?.bookingId}</span>
    </p>
    <p className="font-medium">
      Voucher No: <span className="text-gray-600">{financeData?.invoiceNo}</span>
    </p>
    <p className="font-medium">
      Invoice To: <span className="text-gray-600">{financeData?.buyerName}</span>
    </p>
    <p className="font-medium">
      Supplier: <span className="text-gray-600">{financeData?.supplierName}</span>
    </p>
    <p className="font-medium">
      Date:{' '}
      <span className="text-gray-600">
        {financeData?.createdAt ? dayjs(financeData.createdAt).format(DATE_FORMAT) : '-'}
      </span>
    </p>
    <p className="font-medium">
      Total Amount: <span className="text-gray-600">{financeData?.total}</span>
    </p>
    <p className="font-medium">
      Payment Method: <span className="text-gray-600 uppercase">{financeData?.paymentType}</span>
    </p>
  </>
);

const ReleaseSection = ({ financeData }) => (
  <>
    <div className="flex justify-end">
      <Button className="secondary-button mr-3" onClick={() => downloadPdf(financeData?.file)}>
        Download File
      </Button>
    </div>
    <p className="font-medium">
      Order Id: <span className="text-gray-600">{financeData?.bookingId}</span>
    </p>
    <p className="font-medium">
      RO Id: <span className="text-gray-600">{financeData?.releaseOrderNo}</span>
    </p>
    <p className="font-medium">
      RO Date:{' '}
      <span className="text-gray-600">
        {financeData?.createdAt ? dayjs(financeData.createdAt).format(DATE_FORMAT) : '-'}
      </span>
    </p>
    <p className="font-medium">
      To: <span className="text-gray-600">{financeData?.companyName}</span>
    </p>
    <p className="font-medium">
      Contact Person: <span className="text-gray-600">{financeData?.contactPerson}</span>
    </p>
    <p className="font-medium">
      Supplier: <span className="text-gray-600">{financeData?.supplierName}</span>
    </p>
    <p className="font-medium">
      Total Amount: <span className="text-gray-600">{financeData?.total}</span>
    </p>
    <p className="font-medium">
      Payment Method: <span className="text-gray-600 uppercase">{financeData?.paymentType}</span>
    </p>
  </>
);

const InvoiceSection = ({ financeData }) => (
  <>
    <div className="flex justify-end">
      <Button className="secondary-button mr-3" onClick={() => downloadPdf(financeData?.file)}>
        Download File
      </Button>
    </div>
    <p className="font-medium">
      Order Id: <span className="text-gray-600">{financeData?.bookingId}</span>
    </p>
    <p className="font-medium">
      Inovice Id: <span className="text-gray-600">{financeData?.invoiceNo}</span>
    </p>
    <p className="font-medium">
      Buyer Order No: <span className="text-gray-600">{financeData?.buyerOrderNumber}</span>
    </p>
    <p className="font-medium">
      To: <span className="text-gray-600">{financeData?.supplierName}</span>
    </p>
    <p className="font-medium">
      Buyer: <span className="text-gray-600">{financeData?.buyerName}</span>
    </p>
    <p className="font-medium">
      Invoice Date:{' '}
      <span className="text-gray-600">
        {financeData?.createdAt ? dayjs(financeData.createdAt).format(DATE_FORMAT) : '-'}
      </span>
    </p>
    <p className="font-medium">
      Supplier Ref: <span className="text-gray-600">{financeData?.supplierRefNo}</span>
    </p>
    <p className="font-medium">
      Total Amount: <span className="text-gray-600">{financeData?.total}</span>
    </p>
    <p className="font-medium">
      Payment Method: <span className="text-gray-600 uppercase">{financeData?.modeOfPayment}</span>
    </p>
  </>
);

const recordContent = {
  purchase: PurchseSection,
  release: ReleaseSection,
  invoice: InvoiceSection,
};

const PreviewContent = ({ financeRecordId, recordType, onClose = () => {} }) => {
  const modals = useModals();
  const queryClient = useQueryClient();
  const [financeData, setFinanceData] = useState();
  const [activeStatus, setActiveStatus] = useState();

  const Section = recordContent[recordType] ?? <div />;

  const { data: singleRecord, isLoading } = useFetchSingleRecordById(
    financeRecordId,
    !!financeRecordId,
  );

  const { mutate, isLoading: isUpdateFinaceLoading } = useUpdateFinanceById();

  const handleApprovalStatus = (financeId, value) => {
    setActiveStatus(value);
    mutate(
      { id: financeId, data: { approvalStatus: value } },
      {
        onSuccess: () => {
          showNotification({
            title: `${
              value ? value[0].toUpperCase() + value.substr(1) : ''
            } status updated successfully`,
            color: 'green',
          });
          modals.closeModal();
          queryClient.invalidateQueries(['finance-by-month']);
          onClose();
        },
      },
    );
  };

  useEffect(() => {
    if (financeRecordId) {
      setFinanceData(singleRecord);
    }
  }, [singleRecord, financeRecordId]);

  return (
    <div className="px-5">
      {isLoading ? (
        <Loader className="mx-auto my-10" />
      ) : (
        <section>
          <Section financeData={financeData} />
          <footer className="flex justify-end">
            <Button
              className="primary-button mr-3"
              onClick={() => handleApprovalStatus(financeRecordId, 'approved')}
              disabled={isUpdateFinaceLoading || financeData?.approvalStatus === 'approved'}
              loading={activeStatus === 'approved' && isUpdateFinaceLoading}
            >
              {financeData?.approvalStatus === 'approved' ? 'Approved' : 'Approve'}
            </Button>
            <Button
              className="danger-button"
              onClick={() => handleApprovalStatus(financeRecordId, 'rejected')}
              disabled={isUpdateFinaceLoading || financeData?.approvalStatus === 'rejected'}
              loading={activeStatus === 'rejected' && isUpdateFinaceLoading}
            >
              {financeData?.approvalStatus === 'rejected' ? 'Rejected' : 'Reject'}
            </Button>
          </footer>
        </section>
      )}
    </div>
  );
};

export default PreviewContent;
