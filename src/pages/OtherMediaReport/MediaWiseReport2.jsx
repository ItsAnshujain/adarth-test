import { useState, useMemo } from 'react';
import { useBookingsNew } from '../../apis/queries/booking.queries';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button } from '@mantine/core';
import DateRangeSelector from '../../components/DateRangeSelector';
import Table from '../../components/Table/Table';
import classNames from 'classnames';

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

const MediaWiseReport2 = () => {
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

          if (!quarterlySummaries[quarter]) {
            quarterlySummaries[quarter] = {
              ownedSiteRevenue: 0,
              tradedSiteRevenue: 0,
              totalRevenue: 0,
              tradedMargin: 0,
              clientType: '',
              operationalCosts: { electricity: 0, licenseFee: 0, rental: 0, misc: 0 },
              tradedPurchaseCost: 0,
              grossRevenueOwned: 0,
              grossRevenueTraded: 0,
            };
          }
          break;

        case 'halfYearly': {
          if (createdAt < currentFinYearStart || createdAt > currentFinYearEnd) return;

          const firstHalfStart = new Date(today.getFullYear(), 3, 1);
          const firstHalfEnd = new Date(today.getFullYear(), 8, 30);
          const secondHalfStart = new Date(today.getFullYear(), 9, 1);
          const secondHalfEnd = new Date(today.getFullYear() + 1, 2, 31);

          const isFirstHalf = currentMonth >= 3 && currentMonth <= 8;
          const isSecondHalf = currentMonth >= 9 || currentMonth <= 2;

          let halfYear = '';
          if (isFirstHalf && createdAt >= firstHalfStart && createdAt <= firstHalfEnd) {
            halfYear = 'First Half';
          } else if (isSecondHalf && createdAt >= secondHalfStart && createdAt <= secondHalfEnd) {
            halfYear = 'Second Half';
          } else {
            return;
          }

          periodKey = `${monthName} ${year}`;
          groupingKey = `${month}-${year}`;

          const quarter = getQuarter(month);
          if (!quarterlySummaries[quarter]) {
            quarterlySummaries[quarter] = {
              ownedSiteRevenue: 0,
              tradedSiteRevenue: 0,
              totalRevenue: 0,
              tradedMargin: 0,
              operationalCosts: { electricity: 0, licenseFee: 0, rental: 0, misc: 0 },
              tradedPurchaseCost: 0,
              grossRevenueOwned: 0,
              grossRevenueTraded: 0,
            };
          }
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

      const monthIndex = parseInt(groupingKey.split('-')[0]);
      if (filter === 'yearly' && (monthIndex === 5 || monthIndex === 8 || monthIndex === 11)) {
        const quarter = getQuarter(monthIndex);
        finalData.push({
          period: `${quarter} Sales`,
          clientType: '',
          ownedSiteRevenue: quarterlySummaries[quarter].ownedSiteRevenue.toFixed(2),
          tradedSiteRevenue: quarterlySummaries[quarter].tradedSiteRevenue.toFixed(2),
          totalRevenue: quarterlySummaries[quarter].totalRevenue.toFixed(2),
          tradedMargin: quarterlySummaries[quarter].tradedMargin.toFixed(2),
          operationalCosts: {
            electricity: quarterlySummaries[quarter].operationalCosts.electricity.toFixed(2),
            licenseFee: quarterlySummaries[quarter].operationalCosts.licenseFee.toFixed(2),
            rental: quarterlySummaries[quarter].operationalCosts.rental.toFixed(2),
            misc: quarterlySummaries[quarter].operationalCosts.misc.toFixed(2),
          },
          tradedPurchaseCost: quarterlySummaries[quarter].tradedPurchaseCost.toFixed(2),
          grossRevenueOwned: quarterlySummaries[quarter].grossRevenueOwned.toFixed(2),
          grossRevenueTraded: quarterlySummaries[quarter].grossRevenueTraded.toFixed(2),
        });
      }

      if (
        filter === 'halfYearly' &&
        (monthIndex === 5 || monthIndex === 8 || monthIndex === 11 || monthIndex === 2)
      ) {
        const quarter = getQuarter(monthIndex);
        finalData.push({
          period: `${quarter} Sales`,
          clientType: '',
          ...quarterlySummaries[quarter],
        });
      }
    });

    return finalData.map((data, index, array) => {
      const previousData = array[index - 1];
      const formatValue = value => (Number.isFinite(value) ? value.toFixed(2) : '-');

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

  const tableSalesData = yearlyData;
  const tableSalesColumns = useMemo(
    () => [
      {
        Header: 'Period',
        accessor: 'period',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Client Type',
        accessor: 'clientType',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value || '-'}</p>,
      },
      {
        Header: 'Owned Site Revenue',
        accessor: 'ownedSiteRevenue',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Traded Site Revenue',
        accessor: 'tradedSiteRevenue',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Operational Costs (Electricity)',
        accessor: 'operationalCosts.electricity',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Operational Costs (License Fee)',
        accessor: 'operationalCosts.licenseFee',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Operational Costs (Rental)',
        accessor: 'operationalCosts.rental',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Operational Costs (Misc)',
        accessor: 'operationalCosts.misc',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Traded Purchase Cost',
        accessor: 'tradedPurchaseCost',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Traded Margin',
        accessor: 'tradedMargin',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Gross Revenue (Owned)',
        accessor: 'grossRevenueOwned',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Gross Revenue (Traded)',
        accessor: 'grossRevenueTraded',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
      {
        Header: 'Total Revenue',
        accessor: 'totalRevenue',
        disableSortBy: true,
        Cell: ({ value }) => <p>{value}</p>,
      },
    ],
    [],
  );

  return (
    <div className="col-span-12 lg:col-span-10 border-gray-450 overflow-auto">
      <div className="p-5 w-[50rem] ">
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
      <div className=" h-[400px] overflow-auto px-5 ">
        <Table
          data={tableSalesData}
          COLUMNS={tableSalesColumns}
          showPagination={false}
          loading={isLoadingBookingData}
        />
      </div>
    </div>
  );
};

export default MediaWiseReport2;
