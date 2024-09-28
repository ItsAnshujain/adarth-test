import React, { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { ToWords } from 'to-words';
import { ActionIcon, Button, Group, Menu, Text } from '@mantine/core';
import { Edit2, Trash2 } from 'react-feather';
import Table from '../../../Table/Table';
import TextareaInput from '../../../shared/TextareaInput';
import TextInput from '../../../shared/TextInput';
import toIndianCurrency from '../../../../utils/currencyFormat';
import NumberInput from '../../../shared/NumberInput';
import NoData from '../../../shared/NoData';
import MenuIcon from '../../../Menu';
import { useFormContext } from '../../../../context/formContext';
import ROCalculatedTable from './ROCalculatedTable';

const DATE_FORMAT = 'DD MMM YYYY';

const styles = {
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
    letterSpacing: '0.5px',
  },
  input: {
    borderRadius: 0,
    padding: 8,
  },
};

const ReleaseOrder = ({
  totalPrice,
  onClickAddItems = () => {},
  bookingIdFromFinance,
  addSpaceItem = [],
  setAddSpaceItem = () => {},
  setUpdatedForm = () => {},
}) => {
  const toWords = new ToWords();
  const { values } = useFormContext();
  const handleDeleteSpaceItem = spaceId => {
    setAddSpaceItem(addSpaceItem?.filter(item => item.itemId !== spaceId));
  };
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
        }) =>
          useMemo(
            () => (
              <Text
                className="overflow-hidden text-ellipsis max-w-[180px]"
                lineClamp={1}
                title={city}
              >
                {city}
              </Text>
            ),
            [],
          ),
      },
      {
        Header: 'LOCATION',
        accessor: 'location',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { location },
          },
        }) =>
          useMemo(
            () => (
              <Text
                className="overflow-hidden text-ellipsis max-w-[180px]"
                lineClamp={1}
                title={typeof location !== 'object' ? location : '-'}
              >
                {typeof location !== 'object' ? location : '-'}
              </Text>
            ),
            [],
          ),
      },
      {
        Header: 'DIMENSION (WxH)',
        accessor: 'dimensions',
        disableSortBy: true,
        Cell: info =>
          useMemo(
            () => (
              <div className="flex gap-x-2">
                {info.row.original.size.length ? (
                  <p className="max-w-[300px]">
                    {info.row.original.size
                      .map(item => `${item?.width || 0}ft x ${item?.height || 0}ft`)
                      .filter(item => item !== null)
                      .join(', ')}
                  </p>
                ) : (
                  '-'
                )}
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'AREA',
        accessor: 'area',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { area },
          },
        }) => useMemo(() => <p>{area?.toFixed(2)} sq.ft.</p>, []),
      },
      {
        Header: 'TOTAL DISPLAY COST/MONTH',
        accessor: 'displayCost',
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
              displayCostDiscount,
              mountingCostDiscount,
              printingCostDiscount,
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
                    onClick={() => {
                      onClickAddItems({
                        displayCostDiscount,
                        mountingCostDiscount,
                        printingCostDiscount,
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
                      });
                    }}
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

  const calculatedData = useMemo(() => {
    const tempInitialTotal = {
      initTotal: {
        display: 0,
        printing: 0,
        mounting: 0,
      },
      discount: {
        display: 0,
        printing: 0,
        mounting: 0,
      },
      subTotal: {
        display: 0,
        printing: 0,
        mounting: 0,
      },
      gst: {
        display: 0,
        printing: 0,
        mounting: 0,
      },
      total: {
        display: 0,
        printing: 0,
        mounting: 0,
      },
      threeMonthTotal: {
        display: 0,
        printing: 0,
        mounting: 0,
      },
      printingGstPercentage: 0,
      mountingGstPercentage: 0,
      grandTotal: 0,
      grandTotalInWords: '',
    };

    if (addSpaceItem?.length) {
      addSpaceItem.forEach(item => {
        if (item?.totalDisplayCost) {
          tempInitialTotal.initTotal.display +=
            item.totalDisplayCost - item.displayCostDiscount || 0;
        }
        if (item?.printingCost) {
          tempInitialTotal.initTotal.printing += item.printingCost - item.printingCostDiscount || 0;
        }
        if (item?.mountingCost) {
          tempInitialTotal.initTotal.mounting += item.mountingCost - item.mountingCostDiscount || 0;
        }
      });
    }
    tempInitialTotal.discount.display = values.discount.display ?? 0;
    tempInitialTotal.discount.printing = values.discount.printing ?? 0;
    tempInitialTotal.discount.mounting = values.discount.mounting ?? 0;

    tempInitialTotal.subTotal.display = Math.max(
      0,
      tempInitialTotal.initTotal.display - tempInitialTotal.discount.display,
    );
    tempInitialTotal.subTotal.printing = Math.max(
      0,
      tempInitialTotal.initTotal.printing - tempInitialTotal.discount.printing,
    );
    tempInitialTotal.subTotal.mounting = Math.max(
      0,
      tempInitialTotal.initTotal.mounting - tempInitialTotal.discount.mounting,
    );

    tempInitialTotal.mountingGstPercentage = values.mountingGstPercentage;
    tempInitialTotal.printingGstPercentage = values.printingGstPercentage;

    tempInitialTotal.gst.display = Math.round(tempInitialTotal.subTotal.display * 0.18);
    tempInitialTotal.gst.printing =
      values.printingGstPercentage > 0
        ? Math.round(
            tempInitialTotal.subTotal.printing * (tempInitialTotal.printingGstPercentage / 100),
          )
        : Math.round(tempInitialTotal.subTotal.printing * 0.18);

    tempInitialTotal.gst.mounting =
      values.mountingGstPercentage > 0
        ? Math.round(
            tempInitialTotal.subTotal.mounting * (tempInitialTotal.mountingGstPercentage / 100),
          )
        : Math.round(tempInitialTotal.subTotal.mounting * 0.18);

    tempInitialTotal.total.display =
      tempInitialTotal.subTotal.display + tempInitialTotal.gst.display;
    tempInitialTotal.total.printing =
      tempInitialTotal.subTotal.printing + tempInitialTotal.gst.printing;
    tempInitialTotal.total.mounting =
      tempInitialTotal.subTotal.mounting + tempInitialTotal.gst.mounting;

    tempInitialTotal.threeMonthTotal.display = tempInitialTotal.total.display * values.forMonths;
    tempInitialTotal.threeMonthTotal.printing = tempInitialTotal.total.printing * values.forMonths;
    tempInitialTotal.threeMonthTotal.mounting = tempInitialTotal.total.mounting * values.forMonths;

    tempInitialTotal.grandTotal =
      tempInitialTotal.threeMonthTotal.display +
      tempInitialTotal.threeMonthTotal.printing +
      tempInitialTotal.threeMonthTotal.mounting;
    tempInitialTotal.grandTotalInWords = toWords.convert(
      !Number.isNaN(tempInitialTotal.grandTotal)
        ? Number(tempInitialTotal.grandTotal.toFixed(2))
        : 0,
    );
    return tempInitialTotal;
  }, [addSpaceItem, values.discount, values.forMonths]);

  useEffect(() => {
    setUpdatedForm(calculatedData);
  }, [calculatedData]);

  useEffect(() => {
    setAddSpaceItem(prev =>
      prev.map(item => ({
        ...item,
        printingCost: item.area * values.printingSqftCost,
        mountingCost: item.area * values.mountingSqftCost,
      })),
    );
  }, [values.printingSqftCost, values.mountingSqftCost]);

  const memoizedTotalPrice = useMemo(
    () => Number((totalPrice + totalPrice * 0.18).toFixed(2)),
    [totalPrice],
  );

  return (
    <div>
      <div className="py-4 border-b">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            styles={styles}
            label="Release Order No"
            name="releaseOrderNo"
            withAsterisk
            placeholder="Write..."
            id="releaseOrderNo"
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <p className="font-bold text-2xl pt-4">To</p>
      </div>
      <div className="py-4 border-b">
        <div className="grid grid-cols-2 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Company Name"
            name="companyName"
            withAsterisk
            placeholder="Write..."
            id="companyName"
          />
          <NumberInput
            styles={styles}
            label="Quotation No"
            name="quotationNo"
            withAsterisk
            placeholder="Write..."
            id="quotationNo"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Contact Person"
            name="contactPerson"
            withAsterisk
            placeholder="Write..."
            id="contactPerson"
          />
          <TextInput styles={styles} label="Phone" name="phone" placeholder="Write..." />
        </div>
        <div className="grid grid-cols-2 gap-4 pb-4">
          <TextInput
            styles={styles}
            label="Mobile"
            name="mobile"
            withAsterisk
            placeholder="Write..."
            id="mobile"
          />
          <TextInput
            styles={styles}
            label="Email"
            name="email"
            withAsterisk
            placeholder="Write..."
            id="email"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <TextInput
            className="col-span-2"
            styles={styles}
            label="Street Address"
            name="streetAddress"
            withAsterisk
            placeholder="Write..."
            id="streetAddress"
          />
          <TextInput
            className="col-span-1"
            styles={styles}
            label="City"
            name="city"
            withAsterisk
            placeholder="Write..."
            id="city"
          />
          <NumberInput
            className="col-span-1"
            styles={styles}
            label="Pin"
            name="zip"
            withAsterisk
            placeholder="Write..."
            id="zip"
          />
        </div>
      </div>
      <div className="flex justify-between items-center ">
        <p className="font-bold text-2xl pt-4">Supplier</p>
      </div>
      <div className="py-4 border-b">
        <div className="grid grid-cols-2 gap-4 ">
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
            label="Designation"
            withAsterisk
            name="supplierDesignation"
            placeholder="Write..."
            id="supplierDesignation"
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
        {!bookingIdFromFinance ? (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <NumberInput
              styles={styles}
              label="Total Display Cost Discount"
              name="discount.display"
              placeholder="Write..."
              min={0}
              precision={2}
              max={calculatedData?.initTotal?.display}
              value={calculatedData.discount.display}
            />
            <NumberInput
              styles={styles}
              label="Printing Cost Discount"
              name="discount.printing"
              placeholder="Write..."
              min={0}
              precision={2}
              max={calculatedData?.initTotal?.printing}
              value={calculatedData.discount.printing}
            />
            <NumberInput
              styles={styles}
              label="Mounting Cost Discount"
              name="discount.mounting"
              placeholder="Write..."
              min={0}
              precision={2}
              max={calculatedData?.initTotal?.mounting}
              value={calculatedData.discount.mounting}
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
            {!bookingIdFromFinance ? (
              <ROCalculatedTable calculatedData={calculatedData} />
            ) : (
              <div className="max-w-screen mt-3 flex flex-col justify-end mr-7 pr-16 text-lg">
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
            )}
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
          value={
            bookingIdFromFinance
              ? toWords.convert(memoizedTotalPrice)
              : calculatedData?.grandTotalInWords
              ? calculatedData.grandTotalInWords
              : ''
          }
          readOnly
          disabled
        />
      </div>

      <div className="pt-4">
        <div className="grid grid-cols-1 gap-4">
          <TextareaInput
            label="Terms &amp; Conditions"
            name="termsAndCondition"
            styles={styles}
            maxLength={200}
            placeholder="Maximum 200 characters"
            className="pb-5"
          />
        </div>
      </div>
    </div>
  );
};

export default ReleaseOrder;
