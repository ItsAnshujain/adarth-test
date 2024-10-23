import React, { useState, useMemo } from 'react';
import { useBookingsNew } from '../../apis/queries/booking.queries';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button, Loader } from '@mantine/core';
import DateRangeSelector from '../../components/DateRangeSelector';
import Table from '../../components/Table/Table';
import classNames from 'classnames';
import { useTable } from 'react-table';
const viewBy = {
  yearly: 'Yearly',
  halfYearly: 'Half Yearly',
  quarterly: 'Quarterly',
  monthly: 'Monthly',
  weekly: 'Weekly',
  customDate: 'Custom Date Range',
};
const viewOptions = [
  { label: 'Yearly', value: 'yearly' },
  { label: 'Half Yearly', value: 'halfYearly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Custom Date Range', value: 'customDate' },
];

const MediaWiseReport = () => {
  const [searchParams] = useSearchParams({
    page: 1,
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: bookingData, isLoading: isLoadingBookingData } = useBookingsNew(
    searchParams.toString(),
  );

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filter, setFilter] = useState('yearly');
  const [activeView, setActiveView] = useState('yearly');

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const filteredData = useMemo(() => {
    if (!bookingData) return [];

    const getDate = dateString => new Date(dateString);
    const today = new Date();

    const currentFinancialYearStart = new Date(today.getFullYear(), 3, 1);
    const currentFinancialYearEnd = new Date(today.getFullYear() + 1, 2, 31);
    const currentMonth = today.getMonth();

    return bookingData.filter(booking => {
      const createdAt = getDate(booking.createdAt);

      switch (filter) {
        case 'yearly':
          return createdAt >= currentFinancialYearStart && createdAt <= currentFinancialYearEnd;

        case 'halfYearly': {
          const bookingMonth = createdAt.getMonth();
          const bookingYear = createdAt.getFullYear();

          if (
            bookingYear === currentFinancialYearStart.getFullYear() ||
            bookingYear === currentFinancialYearEnd.getFullYear()
          ) {
            if (currentMonth >= 9) {
              return bookingMonth >= 6 && bookingMonth <= 11;
            } else {
              return bookingMonth >= 3 && bookingMonth <= 8;
            }
          }
          return false;
        }

        case 'quarterly': {
          const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
          const quarterStart = new Date(today.getFullYear(), quarterStartMonth, 1);
          const quarterEnd = new Date(today.getFullYear(), quarterStartMonth + 3, 0);
          return createdAt >= quarterStart && createdAt <= quarterEnd;
        }

        case 'monthly':
          return (
            createdAt.getMonth() === currentMonth && createdAt.getFullYear() === today.getFullYear()
          );

        case 'weekly': {
          const getWeekOfMonth = date => {
            const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const dayOfMonth = date.getDate();
            const firstDayOfWeek = firstDayOfMonth.getDay();
            return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
          };

          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

          return createdAt >= startOfMonth && createdAt <= endOfMonth;
        }

        case 'customDate':
          return (
            startDate &&
            endDate &&
            createdAt >= new Date(startDate) &&
            createdAt <= new Date(endDate)
          );

        default:
          return true;
      }
    });
  }, [filter, startDate, endDate, bookingData]);

  const prepareYearlyData = bookings => {
    const groupedData = {};
  
    const clientTypes = ['Direct Client', 'Local Agency', 'National Agency', 'Government'];
  
    const getFinancialYear = date => {
      const month = date.getMonth();
      const year = date.getFullYear();
      return month >= 3 ? year : year - 1;
    };
  
    const getQuarter = monthIndex => {
      if (monthIndex >= 3 && monthIndex <= 5) {
        return 'First Quarter';
      } else if (monthIndex >= 6 && monthIndex <= 8) {
        return 'Second Quarter';
      } else if (monthIndex >= 9 && monthIndex <= 11) {
        return 'Third Quarter';
      } else {
        return 'Fourth Quarter';
      }
    };
  
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentFinYearStart = new Date(today.getFullYear(), 3, 1);
    const currentFinYearEnd = new Date(today.getFullYear() + 1, 2, 31);
  
    const quarterlySummaries = {};
  
    bookings.forEach(booking => {
      const createdAt = new Date(booking.createdAt);
  
      if (createdAt > today) return;
  
      const month = createdAt.getMonth();
      const year = getFinancialYear(createdAt);
      const clientType = booking?.client?.clientType || '-';
  
      let periodKey = '';
      let groupingKey = '';
      const monthName = createdAt.toLocaleString('default', { month: 'long' });
  
      switch (filter) {
        case 'yearly':
          if (createdAt < currentFinYearStart || createdAt > currentFinYearEnd) return;
  
          const quarter = getQuarter(month);
          periodKey = `${monthName} ${year}`;
          groupingKey = `${month}-${year}`;
          break;
  
        case 'halfYearly': {
          if (createdAt < currentFinYearStart || createdAt > currentFinYearEnd) return;
  
          // Define the first and second half of the financial year
          const firstHalfStart = new Date(today.getFullYear(), 3, 1); // April 1
          const firstHalfEnd = new Date(today.getFullYear(), 8, 30); // September 30
          const secondHalfStart = new Date(today.getFullYear(), 9, 1); // October 1
          const secondHalfEnd = new Date(today.getFullYear() + 1, 2, 31); // March 31 of next year
  
          // Check which half the current month falls into
          const isFirstHalf = currentMonth >= 3 && currentMonth <= 8;
          const isSecondHalf = currentMonth >= 9 || currentMonth <= 2;
  
          // Show only the current half where the current month lies
          if (isFirstHalf) {
            if (createdAt < firstHalfStart || createdAt > firstHalfEnd) return; // Ensure it's within first half dates
          } else if (isSecondHalf) {
            if (createdAt < secondHalfStart || createdAt > secondHalfEnd) return; // Ensure it's within second half dates
          } else {
            return; // If it's not within either half, return early
          }
  
          // Set periodKey and groupingKey
          periodKey = `${monthName} ${year}`;
          groupingKey = `${month}-${year}`;
  
          break;
        }
  
        case 'quarterly':
          periodKey = `${createdAt.toLocaleString('default', { month: 'long' })} ${year}`;
          groupingKey = `${getQuarter(month)}-${year}-${month}`;
          break;
  
        case 'monthly':
          periodKey = `${createdAt.toLocaleString('default', { month: 'long' })} ${year}`;
          groupingKey = `${month}-${year}`;
          break;
  
        case 'weekly': {
          const getWeekOfMonth = date => {
            const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const dayOfMonth = date.getDate();
            const firstDayOfWeek = firstDayOfMonth.getDay();
            return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
          };
  
          const weekOfMonth = getWeekOfMonth(createdAt);
          periodKey = `Week ${weekOfMonth}, ${monthName} ${year}`;
          groupingKey = `week-${weekOfMonth}-${today.getMonth()}-${year}`;
          break;
        }
  
        case 'customDate':
          periodKey = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
          groupingKey = `custom-${startDate}-${endDate}`;
          break;
  
        default:
          periodKey = '-';
      }
  
      if (!groupedData[groupingKey]) {
        groupedData[groupingKey] = {};
      }
      if (!groupedData[groupingKey][clientType]) {
        groupedData[groupingKey][clientType] = {
          period: periodKey,
          clientType: clientType,
          ownedSiteRevenue: 0,
          tradedSiteRevenue: 0,
          operationalCosts: {
            electricity: 0,
            licenseFee: 0,
            rental: 0,
            misc: 0,
          },
          tradedPurchaseCost: 0,
          tradedMargin: 0,
          grossRevenueOwned: 0,
          grossRevenueTraded: 0,
          totalRevenue: 0,
        };
      }
  
      let totalPrice = 0;
      let totalTradedAmount = 0;
      const totalAmount = booking.totalAmount || 0;
  
      groupedData[groupingKey][clientType].totalRevenue += totalAmount / 100000;
  
      const spaces = booking.details[0]?.campaign?.spaces || [];
  
      if (Array.isArray(spaces)) {
        spaces.forEach(space => {
          totalTradedAmount += (space.tradedAmount || 0) / 100000;
          totalPrice += (space.basicInformation?.price || 0) / 100000;
  
          if (totalTradedAmount === 0) {
            groupedData[groupingKey][clientType].ownedSiteRevenue += totalPrice;
            groupedData[groupingKey][clientType].grossRevenueOwned += totalPrice;
          } else {
            groupedData[groupingKey][clientType].tradedSiteRevenue += totalPrice;
            groupedData[groupingKey][clientType].grossRevenueTraded += totalPrice;
          }
          groupedData[groupingKey][clientType].tradedPurchaseCost += totalTradedAmount || 0;
          groupedData[groupingKey][clientType].tradedMargin +=
            totalPrice - (totalTradedAmount || 0);
        });
      }
      if (Array.isArray(booking.operationalCosts)) {
        booking.operationalCosts.forEach(cost => {
          const amount = (cost.amount || 0) / 100000;
          const typeName = cost.type?.name;
  
          if (typeName) {
            switch (typeName) {
              case 'Electricity':
                groupedData[groupingKey][clientType].operationalCosts.electricity += amount;
                break;
              case 'License Fees Deposit NF Railway':
              case 'License Fees Deposit ASTC':
                groupedData[groupingKey][clientType].operationalCosts.licenseFee += amount;
                break;
              case 'Site Rental':
              case 'Hoarding Hire & Rental':
                groupedData[groupingKey][clientType].operationalCosts.rental += amount;
                break;
              default:
                groupedData[groupingKey][clientType].operationalCosts.misc += amount;
                break;
            }
          }
        });
      }
    });
  
    const finalData = [];
    const orderedGroupingKeys = Object.keys(groupedData).sort((a, b) => {
      const aParts = a.split('-');
      const bParts = b.split('-');
      return parseInt(aParts[0]) - parseInt(bParts[0]) || aParts[1].localeCompare(bParts[1]);
    });
  
    orderedGroupingKeys.forEach(groupingKey => {
      clientTypes.forEach(clientType => {
        if (!groupedData[groupingKey][clientType]) {
          groupedData[groupingKey][clientType] = {
            period: groupedData[groupingKey][Object.keys(groupedData[groupingKey])[0]].period,
            clientType: clientType,
            ownedSiteRevenue: '-',
            tradedSiteRevenue: '-',
            operationalCosts: {
              electricity: '-',
              licenseFee: '-',
              rental: '-',
              misc: '-',
            },
            tradedPurchaseCost: '-',
            tradedMargin: '-',
            grossRevenueOwned: '-',
            grossRevenueTraded: '-',
            totalRevenue: '-',
          };
        }
        finalData.push(groupedData[groupingKey][clientType]);
      });
    });
  
    return finalData.map((data, index, array) => {
      const previousData = array[index - 1];
  
      const formatValue = value => {
        if (!Number.isFinite(value) || value === 0) {
          return '-';
        }
        return value.toFixed(2);
      };
  
      if (!previousData || previousData.period !== data.period) {
        return {
          ...data,
          ownedSiteRevenue: formatValue(data.ownedSiteRevenue),
          tradedSiteRevenue: formatValue(data.tradedSiteRevenue),
          operationalCosts: {
            electricity: formatValue(data.operationalCosts.electricity),
            licenseFee: formatValue(data.operationalCosts.licenseFee),
            rental: formatValue(data.operationalCosts.rental),
            misc: formatValue(data.operationalCosts.misc),
          },
          tradedPurchaseCost: formatValue(data.tradedPurchaseCost),
          tradedMargin: formatValue(data.tradedMargin),
          grossRevenueOwned: formatValue(data.grossRevenueOwned),
          grossRevenueTraded: formatValue(data.grossRevenueTraded),
          totalRevenue: formatValue(data.totalRevenue),
        };
      } else {
        return {
          ...data,
          period: '',
          ownedSiteRevenue: formatValue(data.ownedSiteRevenue),
          tradedSiteRevenue: formatValue(data.tradedSiteRevenue),
          operationalCosts: {
            electricity: formatValue(data.operationalCosts.electricity),
            licenseFee: formatValue(data.operationalCosts.licenseFee),
            rental: formatValue(data.operationalCosts.rental),
            misc: formatValue(data.operationalCosts.misc),
          },
          tradedPurchaseCost: formatValue(data.tradedPurchaseCost),
          tradedMargin: formatValue(data.tradedMargin),
          grossRevenueOwned: formatValue(data.grossRevenueOwned),
          grossRevenueTraded: formatValue(data.grossRevenueTraded),
          totalRevenue: formatValue(data.totalRevenue),
        };
      }
    });
  };
  
  const yearlyData = useMemo(() => {
    return prepareYearlyData(filteredData);
  }, [filteredData]);

  const onDateChange = val => {
    setStartDate(val[0]);
    setEndDate(val[1]);
  };

  const handleReset = () => {
    setFilter('yearly');
    setActiveView('yearly');
    setStartDate(null);
    setEndDate(null);
  };

  const handleMenuItemClick = value => {
    setFilter(value);
    setActiveView(value);
  };

  const tableSalesData = yearlyData; // Your sales data
  const tableSalesColumns = useMemo(
    () => [
      {
        Header: 'PERIOD',
        accessor: 'period',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'CLIENT TYPE',
        accessor: 'clientType',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value || '-'}</p>,
      },
      {
        Header: 'OWNED SITE REVENUE',
        accessor: 'ownedSiteRevenue',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'TRADED SITE REVENUE',
        accessor: 'tradedSiteRevenue',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'OPERATIONAL COSTS (ELECTRICITY)',
        accessor: 'operationalCosts.electricity',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'OPERATIONAL COSTS (LICENSE FEE)',
        accessor: 'operationalCosts.licenseFee',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'OPERATIONAL COSTS (RENTAL)',
        accessor: 'operationalCosts.rental',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'OPERATIONAL COSTS (MISC)',
        accessor: 'operationalCosts.misc',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'TRADED PURCHASE COST',
        accessor: 'tradedPurchaseCost',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'TRADED MARGIN',
        accessor: 'tradedMargin',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'GROSS REVENUE (OWNED)',
        accessor: 'grossRevenueOwned',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'GROSS REVENUE (TRADED)',
        accessor: 'grossRevenueTraded',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'TOTAL REVENUE',
        accessor: 'totalRevenue',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
    ],
    [],
  );

  // Hook for table state
  const tableInstance = useTable({
    columns: tableSalesColumns,
    data: tableSalesData,
  });

  // Destructure properties from tableInstance
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <div className="col-span-12 lg:col-span-10 border-gray-450 overflow-y-auto">
      <div className="p-5 w-[50rem]">
        <p className="font-bold pb-4">Sales Overview</p>
        <p className="text-sm text-gray-600 italic pb-4">
          This report summarizes sales performance across various metrics and timeframes
        </p>
        <div className="flex">
          <div>
            <Menu shadow="md" width={130}>
              <Menu.Target>
                <Button className="secondary-button">
                  View By: {viewBy[activeView] || 'Select'}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {viewOptions.map(({ label, value }) => (
                  <Menu.Item
                    key={value}
                    onClick={() => handleMenuItemClick(value)}
                    className={classNames(activeView === value && 'text-purple-450 font-medium')}
                  >
                    {label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </div>
          {filter !== 'yearly' && (
            <div>
              <Button onClick={handleReset} className="mx-2 secondary-button">
                Reset
              </Button>
            </div>
          )}
        </div>

        {filter === 'customDate' && (
          <div className="flex flex-col items-start space-y-4 py-2">
            <DateRangeSelector
              dateValue={[startDate, endDate]}
              onChange={onDateChange}
              minDate={threeMonthsAgo}
              maxDate={today}
            />
          </div>
        )}
      </div>

      {/* <div className="h-[400px] overflow-auto "> */}
      <div className="min-h-[450px] flex flex-col justify-between px-5">
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0 z-10">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(header => (
                    <th
                      className={classNames(
                        'text-sm sticky top-0 z-10 bg-gray-100 text-center',
                        'w-28',
                      )}
                      {...header.getHeaderProps()}
                    >
                      <div className="w-max flex align-center text-left pl-2 text-gray-400 hover:text-black py-2 text-xs font-medium">
                        <div className="w-fit tracking-wide">{header.render('Header')}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row, index) => {
                prepareRow(row);

                const isEndOfMonthGroup = (index + 1) % 4 === 0;
                const rowBackgroundClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-200';

                return (
                  <React.Fragment key={index}>
                    <tr
                      className={classNames(
                        'text-left border-l-0 hover:bg-gray-50',
                        rowBackgroundClass,
                        row.original?.peerId && row.original.peerId !== userId && 'has-peer',
                        row.original.isActive === false ? 'opacity-50' : '',
                        'table-row',
                      )}
                      {...row.getRowProps()}
                    >
                      {row.cells.map(cell => (
                        <td className="p-2" {...cell.getCellProps()}>
                          <div className="w-max">{cell.render('Cell')}</div>
                        </td>
                      ))}
                    </tr>

                    {isEndOfMonthGroup && (
                      <tr>
                        <td
                          colSpan={headerGroups[0].headers.length}
                          className="border-t-2 border-gray-500"
                        ></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length <= 0 ? <div className="mx-auto">No data available</div> : null}
      </div>
    </div>

    // </div>
  );
};

export default MediaWiseReport;
