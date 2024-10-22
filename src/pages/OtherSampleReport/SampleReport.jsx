import { useMemo, useState } from 'react';
import { useBookings } from '../../apis/queries/booking.queries';
import { generateSlNo } from '../../utils';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button } from '@mantine/core';
import DateRangeSelector from '../../components/DateRangeSelector';
import Table from '../../components/Table/Table';
import toIndianCurrency from '../../utils/currencyFormat';
import GaugeChart from '../../components/modules/newReports/GaugeChart';
import InvoiceReportChart from '../../components/modules/newReports/InvoiceReportChart';
import classNames from 'classnames';
import { useFetchInventory } from '../../apis/queries/inventory.queries';

const viewBy1 = {
  reset: '',
  past10Years: 'Past 10 Years',
  past5Years: 'Past 5 Years',
  previousYear: 'Previous Year',
  currentYear: 'Current Year',
  customDate: 'Custom Date Range',
};

const list1 = [
  { label: 'Past 10 Years', value: 'past10Years' },
  { label: 'Past 5 Years', value: 'past5Years' },
  { label: 'Previous Year', value: 'previousYear' },
  { label: 'Current Year', value: 'currentYear' },
  { label: 'Custom Date Range', value: 'customDate' },
];

const SampleReport = () => {
  const [searchParams] = useSearchParams({
    page: 1,
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: bookingData, isLoading: isLoadingBookingData, error } = useBookings(searchParams.toString());
  const [searchParams3, setSearchParams3] = useSearchParams({
    page: 1,
    limit: 500,
    sortBy: 'basicInformation.spaceName',
    sortOrder: 'desc',
    isActive: true,
  });

  const [activeView1, setActiveView1] = useState('currentYear');
  const [startDate2, setStartDate2] = useState(null);
  const [endDate2, setEndDate2] = useState(null);
 
  const getFilteredData1 = (data, view, startDate2, endDate2) => {
    if (!data || !Array.isArray(data.docs)) return []; // Ensure we're working with an array

    const bookingData = data.docs; // Extract the array of bookings
    const currentYear = new Date().getFullYear();

    let startDate, endDate;

    // Determine the date range based on the selected view
    switch (view) {
        case 'past10Years':
            startDate = new Date(currentYear - 10, 3, 1); // April 1st, 10 years ago
            endDate = new Date(currentYear + 1, 2, 31); // March 31st of the next year
            break;
        case 'past5Years':
            startDate = new Date(currentYear - 5, 3, 1); // April 1st, 5 years ago
            endDate = new Date(currentYear + 1, 2, 31); // March 31st of the next year
            break;
        case 'previousYear':
            startDate = new Date(currentYear - 1, 3, 1); // April 1st of last year
            endDate = new Date(currentYear, 2, 31); // March 31st of the current year
            break;
        case 'currentYear':
            startDate = new Date(currentYear, 3, 1); // From April 1st of the current year
            endDate = new Date(currentYear + 1, 2, 31); // To March 31st of the next year
            break;
        case 'customDate':
            startDate = new Date(startDate2);
            endDate = new Date(endDate2);
            break;
        default:
            return [];
    }

    // Filter and group data by month and financial year
    const monthlyData = {};

    bookingData.forEach((booking) => {
        const bookingDate = new Date(booking.createdAt);
        // Check if bookingDate falls within the calculated range
        if (bookingDate >= startDate && bookingDate <= endDate) {
            const month = bookingDate.toLocaleString('default', { month: 'short' });
            const year = bookingDate.getFullYear();
            const financialYear = bookingDate.getMonth() + 1 >= 4 ? year : year - 1; // Determine financial year

            const key = `${month} ${financialYear}`;

            // Initialize the entry if it doesn't exist
            if (!monthlyData[key]) {
                monthlyData[key] = {
                    month: key,
                    outStandingInvoice: 0,
                    totalPayment: 0,
                };
            }

            // Accumulate the outstanding invoice and total payment
            monthlyData[key].outStandingInvoice += booking.outStandingInvoice;
            monthlyData[key].totalPayment += booking.totalPayment;
        }
    });

    // Convert monthlyData to an array and return it
    return Object.values(monthlyData);
};


const groupedData1 = useMemo(() => {
  return getFilteredData1(bookingData, activeView1, startDate2, endDate2);
}, [bookingData, activeView1, startDate2, endDate2]);

  const column1 = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: (info) => useMemo(() => <p>{generateSlNo(info.row.index, 1, 1000)}</p>, []),
      },
      {
        Header: 'Month',
        accessor: 'month',
        disableSortBy: true,
        Cell: (info) => <p>{info.row.original.month}</p>,
      },
      {
        Header: 'Invoice Raised ',
        accessor: 'outStandingInvoice',
        disableSortBy: true,
        Cell: (info) => <p>{toIndianCurrency(info.row.original.outStandingInvoice)}</p>,
      },
      {
        Header: 'Amount Collected ',
        accessor: 'totalPayment',
        disableSortBy: true,
        Cell: (info) => <p>{toIndianCurrency(info.row.original.totalPayment)}</p>,
      },
      {
        Header: 'Outstanding',
        accessor: 'outstandingAmount',
        disableSortBy: true,
        Cell: (info) => <p>{toIndianCurrency(info.row.original.outStandingInvoice - info.row.original.totalPayment)}</p>,
    },
    ],
    [groupedData1],
  );

  const handleMenuItemClick1 = (value) => {
    setActiveView1(value);
  };

  const handleReset1 = () => {
    setActiveView1('currentYear');
    setStartDate2(null);
    setEndDate2(null);
  };

  const onDateChange5 = (val) => {
    setStartDate2(val[0]);
    setEndDate2(val[1]);
  };

  const invoiceRaised = groupedData1?.reduce((acc, item) => acc + item.outStandingInvoice, 0);

  const amountCollected = groupedData1?.reduce((acc, item) => acc + item.totalPayment, 0);

  const isFilterApplied = activeView1 !== '';

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 p-5 overflow-y-auto">
      <p className="font-bold ">Invoice and amount collected Report</p>
      <p className="text-sm text-gray-600 italic py-4">
        This report provides insights into the invoice raised, amount collected, and outstanding by
        table, graph, and chart.
      </p>
      <div className="flex py-4">
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button className="secondary-button">
                View By: {viewBy1[activeView1] || 'Select'}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {list1.map(({ label, value }) => (
                <Menu.Item
                  key={value}
                  onClick={() => handleMenuItemClick1(value)}
                  className={classNames(activeView1 === value && 'text-purple-450 font-medium')}
                >
                  {label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>

        {activeView1 && (
          <Button onClick={handleReset1} className="mx-2 secondary-button">
            Reset
          </Button>
        )}
        <div>
          {' '}
          <p className="text-sm text-gray-600 italic ml-[450px]"> (Amounts in Lacs)</p>
        </div>
      </div>
      {activeView1 === 'customDate' && (
        <div className="flex flex-col items-start space-y-4 py-2 ">
          <DateRangeSelector
            dateValue={[startDate2, endDate2]}
            onChange={onDateChange5}
            minDate={threeMonthsAgo}
            maxDate={today}
          />
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-10  overflow-x-auto">
        <div className="overflow-y-auto w-[600px] h-[400px]">
          <Table
            data={groupedData1 || []}
            COLUMNS={column1}
            loading={isLoadingInventoryData}
            showPagination={false}
          />
        </div>

        <div className="flex flex-col">
          <p className="pb-6 font-bold text-center">Invoice Raised Vs Amount Collected</p>
          <GaugeChart
            invoiceRaised={isFilterApplied ? invoiceRaised : 0}
            amountCollected={isFilterApplied ? amountCollected : 0}
          />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <p className="py-10 font-bold">Invoice Raised Vs Amount Collected Vs Outstanding</p>
        <InvoiceReportChart data={activeView1 ? groupedData1 : []} />{' '}
      </div>
    </div>
  );
};

export default SampleReport;
