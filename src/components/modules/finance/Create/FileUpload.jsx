import { Button, Select } from '@mantine/core';
import * as yup from 'yup';
import { yupResolver } from '@mantine/form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FilePlus } from 'react-feather';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { FormProvider, useForm } from '../../../../context/formContext';
import {
  useBookingById,
  useBookings,
  useUpdateBooking,
} from '../../../../apis/queries/booking.queries';
import { useUploadFile } from '../../../../apis/queries/upload.queries';
import { onlyNumbersMatch, serialize } from '../../../../utils';
import PurchaseOrder from './FinanceUpload/PurchaseOrder';
import ReleaseOrder from './FinanceUpload/ReleaseOrder';
import Invoice from './FinanceUpload/Invoice';

const orderView = {
  purchase: PurchaseOrder,
  release: ReleaseOrder,
  invoice: Invoice,
};

const initialPurchaseValues = {
  supplierName: '',
  invoiceNo: '',
  buyerName: '',
  total: 0,
};

const purchaseSchema = yup.object({
  supplierName: yup.string().trim().required('Company Name is required'),
  invoiceNo: yup
    .number()
    .positive('Must be a positive number')
    .typeError('Must be a number')
    .nullable()
    .required('Voucher No is required'),
  buyerName: yup.string().trim().required('Supplier Name is required'),
});

const initialReleaseValues = {
  releaseOrderNo: '',
  companyName: '',
  contactPerson: '',
  supplierName: '',
  total: 0,
};

const releaseSchema = yup.object({
  companyName: yup.string().trim().required('Company Name is required'),
  contactPerson: yup.string().trim().required('Contact Person is required'),
  supplierName: yup.string().trim().required('Supplier Name is required'),
  releaseOrderNo: yup
    .string()
    .trim()
    .matches(onlyNumbersMatch, 'Must be a number')
    .required('Release Order No is required'),
});

const initialInvoiceValues = {
  invoiceNo: '',
  supplierName: '',
  supplierRefNo: '',
  buyerName: '',
  buyerOrderNumber: '',
  total: 0,
};

const invoiceSchema = yup.object({
  invoiceNo: yup
    .number()
    .positive('Must be a positive number')
    .typeError('Must be a number')
    .nullable()
    .required('Invoice No is required'),
  supplierName: yup.string().trim().required('Supplier Name is required'),
  supplierRefNo: yup
    .string()
    .trim()
    .matches(onlyNumbersMatch, 'Must be a number')
    .required('Supplier Ref is required'),
  buyerName: yup.string().trim().required('Buyer Name is required'),
  buyerOrderNumber: yup
    .string()
    .trim()
    .matches(onlyNumbersMatch, 'Must be a number')
    .required('Buyers Order No. is required'),
});

const schema = {
  purchase: purchaseSchema,
  release: releaseSchema,
  invoice: invoiceSchema,
};

const initialValues = {
  purchase: initialPurchaseValues,
  release: initialReleaseValues,
  invoice: initialInvoiceValues,
};

const bookingStyles = {
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
    letterSpacing: '0.5px',
  },
};

const orderTypeKey = {
  purchase: 'purchaseOrder',
  release: 'releaseOrder',
  invoice: 'invoice',
};

const bookingQueries = {
  page: 1,
  limit: 100,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};
const FileUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [searchParam] = useSearchParams();
  const { type } = useParams();
  const bookingId = searchParam.get('id');
  const form = useForm({ validate: yupResolver(schema[type]), initialValues: initialValues[type] });

  const [bookingIdFromFinance, setBookingIdFromFinance] = useState();

  const {
    data: bookingDatas,
    isLoading: isBookingDatasLoading,
    isSuccess: isBookingDatasLoaded,
  } = useBookings(serialize(bookingQueries));

  const { data: bookingData } = useBookingById(
    bookingId || bookingIdFromFinance,
    !!bookingId || !!bookingIdFromFinance,
  );

  const { mutateAsync: uploadPdf, isLoading } = useUploadFile();
  const { mutate: update, isLoading: isUpdateBookingLoading } = useUpdateBooking();
  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      'application/file': ['.pdf'],
    },
    disabled: isLoading,
    multiple: false,
    onDrop: useCallback(acceptedFiles => {
      setFile(acceptedFiles[0]);
    }, []),
  });

  const ManualEntryView = orderView[type] ?? <div />;

  const handleUpload = async () => {
    const fd = new FormData();
    fd.append('files', file);
    const uploadedFile = await uploadPdf(fd);

    if (uploadedFile?.[0].Location) {
      return uploadedFile;
    }

    return null;
  };

  const handleSubmit = async formData => {
    let data = { ...formData };

    if (!file) {
      showNotification({
        title: 'Kindly upload the PDF file',
        color: 'blue',
      });
      return;
    }
    const pdfLink = await handleUpload();

    const currentOrderType = orderTypeKey[type];

    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        delete data[key];
      }
    });

    data = { ...data, [currentOrderType]: pdfLink?.[0].Location };

    update(
      { id: bookingId || bookingIdFromFinance, data },
      {
        onSuccess: () => {
          setTimeout(() => navigate(-1), 2000);
          form.reset();
          setFile(null);
        },
      },
    );
  };
  const calcutateTotalPrice = useMemo(() => {
    const initialPrice = 0;
    if (bookingData?.campaign?.totalPrice) {
      return bookingData?.campaign?.totalPrice;
    }

    return bookingData?.campaign?.spaces
      .map(item =>
        item?.basicInformation?.price ? Number.parseInt(item.basicInformation.price, 10) : 0,
      )
      .reduce((previousValue, currentValue) => previousValue + currentValue, initialPrice);
  }, [bookingData?.campaign?.spaces]);

  useEffect(() => {
    if (bookingId) setBookingIdFromFinance(bookingId);
  }, [bookingId]);

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto">
      <header className="h-[60px] border-b border-gray-450 flex justify-between items-center pl-5 pr-7">
        <p className="text-xl font-bold">Upload PDF</p>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="flex gap-1 border rounded-md p-2"
        >
          Close
        </Button>
      </header>
      <FormProvider form={form}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <div className="px-5 pt-4 pb-5 border-b">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Booking List (Please select a Booking before uploading)"
                withAsterisk={!bookingIdFromFinance}
                className="w-full"
                styles={bookingStyles}
                value={bookingId || bookingIdFromFinance}
                disabled={bookingId || isBookingDatasLoading}
                placeholder="Select..."
                onChange={setBookingIdFromFinance}
                data={
                  isBookingDatasLoaded
                    ? bookingDatas.docs.map(bookingItem => ({
                        label: bookingItem?.campaign?.name,
                        value: bookingItem?._id,
                      }))
                    : []
                }
              />
            </div>
          </div>
          <ManualEntryView totalPrice={calcutateTotalPrice || 0} />
          <div
            {...getRootProps()}
            disabled
            className="h-[40%] border-2 border-dashed border-slate-300 bg-[#F9FAFD] flex flex-col items-center justify-center m-5 min-h-[300px]"
          >
            <FilePlus
              onClick={open}
              size={34}
              className={file ? 'text-green-500' : 'text-slate-400'}
            />
            <input type="hidden" {...getInputProps()} accept=".xlsx, .xls, .csv" />

            {file ? (
              <p className="mt-2 mb-3">{file.name}</p>
            ) : (
              <>
                <p className="mt-2 mb-3">
                  Drag and drop your files here, or{' '}
                  <span className="text-purple-450 cursor-pointer">browse</span>
                </p>
                <p className="text-slate-400 text-sm">Support PDF format only</p>
              </>
            )}
          </div>
          <Button
            disabled={isLoading || isUpdateBookingLoading || !bookingIdFromFinance}
            loading={isLoading || isUpdateBookingLoading}
            variant="filled"
            type="submit"
            className="p-2 rounded mx-auto block my-3 primary-button"
          >
            Upload File
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default FileUpload;
