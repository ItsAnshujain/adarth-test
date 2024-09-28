import React, { useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { ToWords } from 'to-words';
import { ActionIcon, Button, Group, Menu, Text } from '@mantine/core';
import { ChevronDown, Edit2, Trash2 } from 'react-feather';
import Table from '../../../Table/Table';
import TextareaInput from '../../../shared/TextareaInput';
import TextInput from '../../../shared/TextInput';
import toIndianCurrency from '../../../../utils/currencyFormat';
import NumberInput from '../../../shared/NumberInput';
import NoData from '../../../shared/NoData';
import MenuIcon from '../../../Menu';
import NativeSelect from '../../../shared/NativeSelect';
import { MODE_OF_PAYMENT } from '../../../../utils/constants';
import { useFormContext } from '../../../../context/formContext';

const DATE_FORMAT = 'DD MMM YYYY';

const styles = {
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
    letterSpacing: '0.5px',
  },
};

const Invoice = ({
  totalPrice,
  onClickAddItems = () => {},
  bookingIdFromFinance,
  addSpaceItem = [],
  setAddSpaceItem = () => {},
}) => {
  const toWords = new ToWords();
  const { setFieldValue, values } = useFormContext();

  const updateData = (key, val, id) => {
    setAddSpaceItem(prev => prev.map(item => (item._id === id ? { ...item, [key]: val } : item)));

    setFieldValue(
      'spaces',
      values.spaces.map(item => (item._id === id ? { ...item, [key]: val } : item)),
    );
  };

  const handleDeleteSpaceItem = spaceId => {
    setAddSpaceItem(addSpaceItem?.filter(item => item.itemId !== spaceId));
  };

  const memoizedTotalPrice = useMemo(
    () => Number((totalPrice + totalPrice * 0.18).toFixed(2)),
    [totalPrice],
  );

  const COLUMNS = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: ({ row: { index } }) => index + 1,
      },
      {
        Header: 'DESCRIPTION OF GOODS AND SERVICES',
        accessor: 'basicInformation.spaceName',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { basicInformation, location, startDate, endDate },
          },
        }) =>
          useMemo(
            () => (
              <div className="flex flex-col items-start gap-1">
                <Text
                  className="overflow-hidden text-ellipsis max-w-[280px]"
                  lineClamp={1}
                  title={basicInformation?.spaceName}
                >
                  {basicInformation?.spaceName}
                </Text>
                <Text
                  className="overflow-hidden text-ellipsis max-w-[280px]"
                  lineClamp={1}
                  title={location?.address}
                >
                  {location?.address}
                </Text>
                <div className="text-black font-light pr-2 text-xs">
                  <span className="overflow-hidden text-ellipsis">
                    {startDate ? dayjs(startDate).format(DATE_FORMAT) : <NoData type="na" />}
                    {' to '}
                  </span>
                  <span className="overflow-hidden text-ellipsis">
                    {endDate ? dayjs(endDate).format(DATE_FORMAT) : <NoData type="na" />}
                  </span>
                </div>
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'DATE',
        accessor: 'date',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { startDate },
          },
        }) =>
          useMemo(
            () => (
              <div className="w-fit">
                {startDate ? dayjs(startDate).format(DATE_FORMAT) : <NoData type="na" />}
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'HSN',
        accessor: 'hsn',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { hsn, _id },
          },
        }) =>
          useMemo(
            () => (
              <NumberInput
                hideControls
                defaultValue={hsn ? +hsn : null}
                onBlur={e => updateData('hsn', e.target.value, _id)}
                min={0}
              />
            ),
            [hsn],
          ),
      },
      {
        Header: 'UNIT',
        accessor: 'unit',
        disableSortBy: true,
        Cell: info => useMemo(() => <p className="w-[14%]">{info.row.original.unit || '-'}</p>, []),
      },
      {
        Header: 'RATE',
        accessor: 'rate',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { campaignPrice },
          },
        }) => useMemo(() => <p>{campaignPrice ? toIndianCurrency(+campaignPrice) : 0}</p>, []),
      },
      {
        Header: 'TOTAL AMOUNT',
        accessor: 'basicInformation.price',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { campaignPrice },
          },
        }) => useMemo(() => <p>{campaignPrice ? toIndianCurrency(+campaignPrice) : 0}</p>, []),
      },
    ],
    [addSpaceItem],
  );

  const manualEntryColumn = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: ({ row: { index } }) => index + 1,
      },
      {
        Header: 'CITY',
        accessor: 'city',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { city },
          },
        }) => useMemo(() => <p>{city || '-'}</p>, []),
      },
      {
        Header: 'LOCATION',
        accessor: 'location',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { location },
          },
        }) => useMemo(() => <p>{location || '-'}</p>, []),
      },
      {
        Header: 'HSN',
        accessor: 'hsn',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { hsn },
          },
        }) => useMemo(() => <p>{hsn || '-'}</p>, []),
      },
      {
        Header: 'DIMENSION (WXH)',
        accessor: 'dimension',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { size },
          },
        }) => useMemo(() => size && <p>{`${size[0]?.height}x${size[0]?.width}` || '-'}</p>, []),
      },
      {
        Header: 'AREA',
        accessor: 'area',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { area },
          },
        }) => useMemo(() => <p>{area?.toFixed(2) || '-'} sq. ft.</p>, []),
      },
      {
        Header: 'TOTAL DISPLAY COST/MONTH',
        accessor: 'totalDisplayCost',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { displayCostPerMonth },
          },
        }) => useMemo(() => <p>{toIndianCurrency(displayCostPerMonth)}</p>, []),
      },
      {
        Header: 'PRINTING COST',
        accessor: 'printingCost',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { printingCost },
          },
        }) => useMemo(() => <p>{toIndianCurrency(printingCost)}</p>, []),
      },
      {
        Header: 'MOUNTING COST',
        accessor: 'mountingCost',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { mountingCost },
          },
        }) => useMemo(() => <p>{toIndianCurrency(mountingCost)}</p>, []),
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({
          row: {
            original: {
              itemId,
              name,
              location,
              startDate,
              endDate,
              quantity,
              rate,
              per,
              price,
              hsn,
              city,
              state,
              size,
              unit,
              category,
              facing,
              area,
              printingCost,
              mountingCost,
              totalDisplayCost,
              displayCostPerMonth,
            },
          },
        }) =>
          useMemo(
            () => (
              <Menu shadow="md" width={140} withinPortal>
                <Menu.Target>
                  <ActionIcon className="py-0" onClick={e => e.preventDefault()}>
                    <MenuIcon />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    className="cursor-pointer flex items-center gap-1"
                    icon={<Edit2 className="h-4" />}
                    onClick={() =>
                      onClickAddItems({
                        name,
                        location,
                        startDate,
                        endDate,
                        quantity,
                        rate,
                        per,
                        price,
                        itemId,
                        hsn,
                        city,
                        state,
                        size,
                        unit,
                        category,
                        facing,
                        area,
                        printingCost,
                        mountingCost,
                        totalDisplayCost,
                        displayCostPerMonth,
                      })
                    }
                  >
                    <span className="ml-1">Edit</span>
                  </Menu.Item>

                  <Menu.Item
                    className="cursor-pointer flex items-center gap-1"
                    icon={<Trash2 className="h-4" />}
                    onClick={() => handleDeleteSpaceItem(itemId)}
                  >
                    <span className="ml-1">Delete</span>
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ),
            [],
          ),
      },
    ],
    [addSpaceItem],
  );

  useEffect(() => {
    setAddSpaceItem(prev =>
      prev.map(item => ({
        ...item,
        printingCost: item.area * values.printingSqftCost || 0,
        mountingCost: item.area * values.mountingSqftCost || 0,
        totalPrintingCost:
          item.area * values.printingSqftCost +
            item.area * values.printingSqftCost * ((values.printingGstPercentage || 0) / 100) || 0,
        totalMountingCost:
          item.area * values.mountingSqftCost +
            item.area * values.mountingSqftCost * ((values.mountingGstPercentage || 0) / 100) || 0,
      })),
    );
  }, [
    values.printingSqftCost,
    values.mountingSqftCost,
    values.printingGstPercentage,
    values.mountingGstPercentage,
  ]);

  return (
    <div>
      <div className="py-4 border-b">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            styles={styles}
            label="Invoice No"
            name="invoiceNo"
            withAsterisk
            placeholder="Write..."
            id="invoiceNo"
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <p className="font-bold text-2xl pt-4">Supplier</p>
      </div>
      <div className="py-4 border-b">
        <div className="grid grid-cols-2 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Supplier Name"
            name="supplierName"
            withAsterisk
            placeholder="Write..."
            id="supplierName"
          />
          <TextInput
            styles={styles}
            label="GSTIN/UIN"
            name="supplierGst"
            withAsterisk
            placeholder="Write..."
            id="supplierGst"
          />
        </div>
        <div className="grid grid-cols-4 gap-4 pb-4">
          <TextInput
            className="col-span-2"
            styles={styles}
            label="Street Address"
            withAsterisk
            name="supplierStreetAddress"
            placeholder="Write..."
          />
          <TextInput
            className="col-span-1"
            styles={styles}
            label="City"
            name="supplierCity"
            withAsterisk
            placeholder="Write..."
          />
          <NumberInput
            className="col-span-1"
            styles={styles}
            label="Pin"
            name="supplierZip"
            withAsterisk
            placeholder="Write..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Contact"
            name="supplierPhone"
            withAsterisk
            placeholder="Write..."
            id="supplierPhone"
          />
          <TextInput
            styles={styles}
            label="Email"
            name="supplierEmail"
            withAsterisk
            placeholder="Write..."
            id="supplierEmail"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Supplier Ref"
            name="supplierRefNo"
            withAsterisk
            placeholder="Write..."
            id="supplierRefNo"
          />
          <TextInput
            styles={styles}
            label="Other Reference(s)"
            name="supplierOtherReference"
            placeholder="Write..."
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <TextInput
            styles={styles}
            label="Website"
            name="supplierWebsite"
            placeholder="Write..."
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <p className="font-bold text-2xl pt-4">Buyer Details</p>
      </div>
      <div className="py-4 border-b">
        <div className="grid grid-cols-2 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Buyer Name"
            name="buyerName"
            withAsterisk
            placeholder="Write..."
            id="buyerName"
          />
          <TextInput
            styles={styles}
            label="Contact Person"
            name="buyerContactPerson"
            withAsterisk
            placeholder="Write..."
            id="buyerContactPerson"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Contact"
            name="buyerPhone"
            withAsterisk
            placeholder="Write..."
            id="buyerPhone"
          />
          <TextInput
            styles={styles}
            label="GSTIN/UIN"
            name="buyerGst"
            withAsterisk
            placeholder="Write..."
            id="buyerGst"
          />
        </div>
        <div className="grid grid-cols-4 gap-4 pb-4">
          <TextInput
            className="col-span-2"
            styles={styles}
            label="Street Address"
            name="buyerStreetAddress"
            withAsterisk
            placeholder="Write..."
            id="buyerStreetAddress"
          />
          <TextInput
            className="col-span-1"
            styles={styles}
            label="City"
            name="buyerCity"
            withAsterisk
            placeholder="Write..."
            id="buyerCity"
          />
          <NumberInput
            className="col-span-1"
            styles={styles}
            label="Pin"
            name="buyerZip"
            withAsterisk
            placeholder="Write..."
            id="buyerZip"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Buyer's Order No."
            name="buyerOrderNumber"
            withAsterisk
            placeholder="Write..."
            id="buyerOrderNumber"
          />
        </div>
        <div className="grid grid-cols-3 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Dispatched Document No."
            name="dispatchDocumentNumber"
            placeholder="Write..."
          />
          <TextInput
            styles={styles}
            label="Dispatched through"
            name="dispatchThrough"
            placeholder="Write..."
          />
          <TextInput
            styles={styles}
            label="Destination"
            name="destination"
            placeholder="Write..."
          />
        </div>
        <div className="grid grid-cols-1 gap-4 pb-4">
          <TextareaInput
            label="Delivery Note"
            name="deliveryNote"
            styles={styles}
            maxLength={200}
            placeholder="Maximum 200 characters"
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <TextareaInput
            label="Terms of Delivery"
            name="termOfDelivery"
            withAsterisk
            styles={styles}
            maxLength={200}
            placeholder="Maximum 200 characters"
            id="termOfDelivery"
          />
        </div>
      </div>
      <div className="py-4">
        <Group position="apart" align="center" className="mb-4">
          <p className="font-bold text-2xl">Order Item Details</p>
          {!bookingIdFromFinance ? (
            <Button className="secondary-button" onClick={() => onClickAddItems()}>
              Add Items
            </Button>
          ) : null}
        </Group>

        {!bookingIdFromFinance ? (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <NumberInput
              styles={styles}
              label="Printing/ ft&sup2; Cost"
              name="printingSqftCost"
              withAsterisk
              placeholder="Write..."
              min={0}
              precision={2}
            />
            <NumberInput
              styles={styles}
              label="Printing GST %"
              name="printingGstPercentage"
              placeholder="Write..."
              min={0}
              precision={2}
              max={100}
              withAsterisk
            />
            <NumberInput
              styles={styles}
              label="Mounting/ ft&sup2; Cost"
              name="mountingSqftCost"
              withAsterisk
              placeholder="Write..."
              min={0}
              precision={2}
            />
            <NumberInput
              styles={styles}
              label="Mounting GST %"
              name="mountingGstPercentage"
              placeholder="Write..."
              min={0}
              precision={2}
              max={100}
              withAsterisk
            />
          </div>
        ) : null}

        {addSpaceItem?.length ? (
          <>
            <div className="border-dashed border-0 border-black border-b-2 pb-4">
              <Table
                COLUMNS={bookingIdFromFinance ? COLUMNS : manualEntryColumn}
                data={bookingIdFromFinance ? addSpaceItem : addSpaceItem}
                showPagination={false}
                classNameWrapper="min-h-[150px]"
              />
            </div>
            <div className="max-w-screen mt-3 flex flex-col justify-end mr-7 text-lg">
              <div className="flex justify-end">
                <p className="text-lg font-bold">Amount:</p>
                <p className="text-lg ml-2">{toIndianCurrency(totalPrice) || 0}</p>
              </div>
              <div className="flex justify-end">
                <p className="text-lg font-bold">GST 18%:</p>
                <p className="text-lg ml-2">{toIndianCurrency(totalPrice * 0.18) || 0}</p>
              </div>
              <div className="flex justify-end">
                <p className="text-lg font-bold">Total:</p>
                <p className="text-lg ml-2">{toIndianCurrency(memoizedTotalPrice) || 0}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full min-h-[100px] flex justify-center items-center">
            <p className="text-xl">No records found</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 pb-4 border-b">
        <TextInput
          styles={styles}
          label="Amount Chargeable (in words)"
          name="amountChargeable"
          placeholder="Write..."
          value={toWords.convert(memoizedTotalPrice)}
          readOnly
          disabled
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="font-bold text-2xl pt-4">Company&apos;s Bank Details</p>
      </div>
      <div className="pt-4 pb-4 border-b">
        <div className="grid grid-cols-2 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Bank Name"
            name="bankName"
            withAsterisk
            placeholder="Write..."
            id="bankName"
          />
          <TextInput
            styles={styles}
            label="A/c No."
            name="accountNo"
            withAsterisk
            placeholder="Write..."
            id="accountNo"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            styles={styles}
            label="Branch &amp; IFSC Code"
            name="ifscCode"
            withAsterisk
            placeholder="Write..."
            id="ifscCode"
          />
          <NativeSelect
            styles={styles}
            label="Payment Type"
            name="modeOfPayment"
            className="mr-2"
            data={MODE_OF_PAYMENT}
            rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
            rightSectionWidth={40}
            id="modeOfPayment"
          />
        </div>
      </div>
      <div className="pt-4 pb-5 border-b">
        <div className="grid grid-cols-1 gap-4">
          <TextareaInput
            label="Declaration"
            name="declaration"
            withAsterisk
            styles={styles}
            maxLength={200}
            placeholder="Maximum 200 characters"
            id="declaration"
          />
        </div>
      </div>
    </div>
  );
};

export default Invoice;
