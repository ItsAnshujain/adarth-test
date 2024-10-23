import { useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button } from '@mantine/core';
import DateRangeSelector from '../../../components/DateRangeSelector';
import classNames from 'classnames';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import ChartDataLabels from 'chartjs-plugin-datalabels';
dayjs.extend(quarterOfYear);
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  LogarithmicScale,
  Chart,
} from 'chart.js';
import { useBookings } from '../../../apis/queries/booking.queries';
import { monthsInShort } from '../../../utils';
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  LogarithmicScale,
);
const viewBy = {
  reset: '',
  past10Years: 'Past 10 Years',
  past5Years: 'Past 5 Years',
  previousYear: 'Previous Year',
  currentYear: 'Current Year',
  quarter: 'Quarterly',
  currentMonth: 'Current Month',
  past7: 'Past 7 Days',
  customDate: 'Custom Date Range',
};

const list = [
  { label: 'Past 10 Years', value: 'past10Years' },
  { label: 'Past 5 Years', value: 'past5Years' },
  { label: 'Previous Year', value: 'previousYear' },
  { label: 'Current Year', value: 'currentYear' },
  { label: 'Quarterly', value: 'quarter' },
  { label: 'Current Month', value: 'currentMonth' },
  { label: 'Past 7 Days', value: 'past7' },
  { label: 'Custom Date Range', value: 'customDate' },
];

const RevenueDistribution = () => {
  const [searchParams] = useSearchParams({
    page: 1,
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const chartRef = useRef(null); // Reference to the chart instance

  const { data: bookingData, isLoading: isLoadingBookingData } = useBookings(
    searchParams.toString(),
  );

  const [filter, setFilter] = useState('currentYear');
  const [activeView, setActiveView] = useState('currentYear');

  const [startDate2, setStartDate2] = useState(null);
  const [endDate2, setEndDate2] = useState(null);

  const generateYearRange = (startYear, endYear) => {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const sortFiscalMonths = (a, b) => {
    const fiscalOrder = [
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
    ];
    return fiscalOrder.indexOf(a) - fiscalOrder.indexOf(b);
  };
  const transformedData = useMemo(() => {
    if (!bookingData || !bookingData.docs) return {};

    const currentYear = new Date().getFullYear();
    const fiscalStartMonth = 3; // Fiscal year starts in April

    const past10YearsRange = generateYearRange(currentYear - 10, currentYear - 1);
    const past5YearsRange = generateYearRange(currentYear - 5, currentYear - 1);

    const fiscalYearStart = new Date(currentYear, fiscalStartMonth, 1);
    const fiscalYearEnd = new Date(currentYear + 1, fiscalStartMonth - 1, 31);

    const groupedData = bookingData.docs.reduce((acc, booking) => {
      const date = new Date(booking.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth(); // Month is 0-indexed
      const day = date.getDate();
      const revenue = parseFloat(booking.totalAmount) || 0;

      if (!acc.past10Years) acc.past10Years = {};
      if (!acc.past5Years) acc.past5Years = {};
      if (!acc.previousYear) acc.previousYear = {};
      if (!acc.currentYear) acc.currentYear = {};
      if (!acc.quarter) acc.quarter = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
      if (!acc.currentMonth) acc.currentMonth = acc.currentMonth || {};
      if (!acc.past7) acc.past7 = acc.past7 || {};
      if (!acc.customDate) acc.customDate = acc.customDate || {};
      // Calculate fiscal year months
      const fiscalMonth = (month + 12 - fiscalStartMonth) % 12;

      // Only calculate quarters if the booking falls within the current financial year
      if (date >= fiscalYearStart && date <= fiscalYearEnd) {
        if (fiscalMonth >= 0 && fiscalMonth <= 2) {
          acc.quarter.Q1 += revenue;
        } else if (fiscalMonth >= 3 && fiscalMonth <= 5) {
          acc.quarter.Q2 += revenue;
        } else if (fiscalMonth >= 6 && fiscalMonth <= 8) {
          acc.quarter.Q3 += revenue;
        } else if (fiscalMonth >= 9 && fiscalMonth <= 11) {
          acc.quarter.Q4 += revenue;
        }
      }

      // Past 10 years
      if (year >= currentYear - 10 && year < currentYear) {
        acc.past10Years[year] = (acc.past10Years[year] || 0) + revenue;
      }

      // Past 5 years
      if (year >= currentYear - 5 && year < currentYear) {
        acc.past5Years[year] = (acc.past5Years[year] || 0) + revenue;
      }

      if (year === currentYear && month === new Date().getMonth()) {
        acc.currentMonth[day] = (acc.currentMonth[day] || 0) + revenue;
      }
      const last7DaysDate = new Date();
      last7DaysDate.setDate(last7DaysDate.getDate() - 7);
      if (date >= last7DaysDate) {
        acc.past7[day] = (acc.past7[day] || 0) + revenue;
      }
      if (startDate2 && endDate2 && date >= startDate2 && date <= endDate2) {
        const key = `${month + 1}/${day}`;
        acc.customDate[key] = (acc.customDate[key] || 0) + revenue;
      }

      // Previous fiscal year (April to March)
      if (year === currentYear - 1 || (year === currentYear && month < fiscalStartMonth)) {
        const fiscalMonthName = new Date(0, fiscalMonth).toLocaleString('default', {
          month: 'short',
        });
        acc.previousYear[fiscalMonthName] = (acc.previousYear[fiscalMonthName] || 0) + revenue;
      }

      // Current fiscal year (April to March)
      if (year === currentYear && month >= fiscalStartMonth) {
        const fiscalMonthName = new Date(0, month).toLocaleString('default', { month: 'short' });
        acc.currentYear[fiscalMonthName] = (acc.currentYear[fiscalMonthName] || 0) + revenue;
      }

      return acc;
    }, {});

    // Ensure past10Years and past5Years are populated properly
    groupedData.past10Years = past10YearsRange.map(year => ({
      year,
      revenue: groupedData.past10Years[year] || 0,
    }));

    groupedData.past5Years = past5YearsRange.map(year => ({
      year,
      revenue: groupedData.past5Years[year] || 0,
    }));

    // Sort and map previousYear and currentYear data
    groupedData.previousYear = Object.keys(groupedData.previousYear || {})
      .sort(sortFiscalMonths)
      .map(month => ({
        month,
        revenue: groupedData.previousYear[month] || 0,
      }));

    groupedData.currentYear = Object.keys(groupedData.currentYear || {})
      .sort(sortFiscalMonths)
      .map(month => ({
        month,
        revenue: groupedData.currentYear[month] || 0,
      }));

    // Map currentMonth data
    groupedData.currentMonth = Object.keys(groupedData.currentMonth || {}).map(day => ({
      day,
      revenue: groupedData.currentMonth[day] || 0,
    }));

    // Sort and map past7 days data
    groupedData.past7 = Object.keys(groupedData.past7 || {})
      .sort((a, b) => new Date(a) - new Date(b))
      .map(day => ({
        day,
        revenue: groupedData.past7[day] || 0,
      }));

    // Map customDate range data
    groupedData.customDate = Object.keys(groupedData.customDate || {}).map(key => ({
      day: key,
      revenue: groupedData.customDate[key] || 0,
    }));

    // Format quarter data for the current financial year only
    groupedData.quarter = [
      { quarter: 'First Quarter', revenue: groupedData.quarter.Q1 || 0 },
      { quarter: 'Second Quarter', revenue: groupedData.quarter.Q2 || 0 },
      { quarter: 'Third Quarter', revenue: groupedData.quarter.Q3 || 0 },
      { quarter: 'Fourth Quarter', revenue: groupedData.quarter.Q4 || 0 },
    ];

    return groupedData;
  }, [bookingData, startDate2, endDate2]);

  const chartData1 = useMemo(() => {
    // Default to 'currentYear' if no valid filter is set
    let selectedData = transformedData[filter] || transformedData.currentYear || [];

    // Format the selected data based on the filter
    const filteredData = selectedData.map(d => ({
      ...d,
      revenue: d.revenue > 0 ? d.revenue / 100000 : 0,
    }));

    // If filter is 'customDate', ensure data is sorted by date
    if (filter === 'customDate') {
      filteredData.sort((a, b) => new Date(a.day) - new Date(b.day));
    }

    // Return the chart data
    return {
      labels: filteredData.map(d => d.year || d.month || d.quarter || d.day),
      datasets: [
        {
          label: 'Revenue (in Lacs)',
          data: filteredData.map(d => d.revenue),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
      ],
    };
  }, [transformedData, filter]);

  const chartOptions1 = useMemo(
    () => ({
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text:
              filter === 'past10Years' || filter === 'past5Years'
                ? 'Years'
                : filter === 'quarter'
                ? 'Quarters'
                : filter === 'currentYear' || filter === 'previousYear'
                ? 'Months'
                : ['past7', 'customDate', 'currentMonth'].includes(filter)
                ? 'Days'
                : '', // Default to an empty string if no match
          },
          ticks: {
            callback: function (value, index, values) {
              if (filter === 'quarter') {
                return ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'][
                  index
                ];
              }
              return this.getLabelForValue(value);
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Revenue (lac)',
          },
          ticks: {
            callback: value => `${value} L`, // Display the value in Lacs
          },
        },
      },
      plugins: {
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'end',
          formatter: (value, context) => {
            return value >= 1 ? Math.floor(value) : value.toFixed(1);
          },
          color: '#000', // Label color
          font: {
            weight: 'light',
            size: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: context => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += `${context.parsed.y.toFixed(2)} L`; // Format the tooltip to show Lacs
              }
              return label;
            },
          },
        },
      },
    }),
    [filter, transformedData], // Dynamically update when filter or data changes
  );

  const onDateChange = val => {
    setStartDate2(val[0]);
    setEndDate2(val[1]);
  };

  const handleMenuItemClick = value => {
    setFilter(value);
    setActiveView(value);
  };

  const handleReset = () => {
    setFilter('currentYear');
    setActiveView('currentYear');
    setStartDate2(null);
    setEndDate2(null);
  };
  return (
    <div className="p-6 w-[50rem]" id="Revenue_distribution">
      <p className="font-bold ">Revenue Distribution</p>
      <p className="text-sm text-gray-600 italic py-4">
        This line chart shows revenue trends over selected time periods, with revenue displayed in
        lakhs.
      </p>
      <Menu shadow="md" width={130}>
        <Menu.Target>
          <Button className="secondary-button">View By: {viewBy[activeView] || 'Select'}</Button>
        </Menu.Target>
        <Menu.Dropdown>
          {list.map(({ label, value }) => (
            <Menu.Item
              key={value}
              onClick={() => handleMenuItemClick(value)}
              className={classNames(
                activeView === value && label !== 'Reset' && 'text-purple-450 font-medium',
              )}
            >
              {label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      {filter && (
        <Button onClick={handleReset} className="mx-2 secondary-button">
          Reset
        </Button>
      )}

      {filter === 'customDate' && (
        <div className="flex flex-col items-start space-y-4 py-2 ">
          <DateRangeSelector dateValue={[startDate2, endDate2]} onChange={onDateChange} />
        </div>
      )}

      <div className="my-4">
        <Line
          data={chartData1}
          options={chartOptions1}
          ref={chartRef}
          plugins={[ChartDataLabels]}
        />
      </div>
    </div>
  );
};

export default RevenueDistribution;
