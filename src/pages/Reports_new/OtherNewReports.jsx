import { useMemo, useEffect, useState } from 'react';
import { Doughnut, Bar, Pie, Line } from 'react-chartjs-2';
import { useUserSalesByUserId, useBookings } from '../../apis/queries/booking.queries';
import { financialEndDate, financialStartDate, serialize, monthsInShort } from '../../utils';
import { useInfiniteCompanies } from '../../apis/queries/companies.queries';
import useUserStore from '../../store/user.store';
import { Loader } from 'react-feather';
import { useSearchParams } from 'react-router-dom';
import { useFetchMasters } from '../../apis/queries/masters.queries';
import { useFetchOperationalCostData } from '../../apis/queries/operationalCost.queries';
import 'react-datepicker/dist/react-datepicker.css';
import { Menu, Button } from '@mantine/core';
import classNames from 'classnames';
import DateRangeSelector from '../../components/DateRangeSelector';
import Table from '../../components/Table/Table';
import toIndianCurrency from '../../utils/currencyFormat';
import { useFetchInventory } from '../../apis/queries/inventory.queries';
import modalConfig from '../../utils/modalConfig';

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
} from 'chart.js';
import GaugeChart from '../../components/modules/newReports/GaugeChart';
import InvoiceReportChart from '../../components/modules/newReports/InvoiceReportChart';
import { groupBy } from 'lodash';
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

const viewBy1 = {
  reset: '',
  past10Years: 'Past 10 Years',
  past5Years: 'Past 5 Years',
  previousYear: 'Previous Year',
  currentYear: 'Current Year',
};

const list1 = [
  { label: 'Past 10 Years', value: 'past10Years' },
  { label: 'Past 5 Years', value: 'past5Years' },
  { label: 'Previous Year', value: 'previousYear' },
  { label: 'Current Year', value: 'currentYear' },
];

const barDataConfigByClient = {
  styles: {
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
  },
};

const normalizeString = str => {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
};
const config = {
  options: {
    responsive: true,
    maintainAspectRatio: false,
  },
};

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'font-dmSans text-xl px-4 font-bold',
    header: 'p-4',
    body: '',
    close: 'mr-4 text-black',
  },
};
const OtherNewReports = () => {
  const userId = useUserStore(state => state.id);
  const userSales = useUserSalesByUserId({
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    userId,
  });

  const [searchParams3, setSearchParams3] = useSearchParams({
    page: 1,
    limit: 500,
    sortBy: 'basicInformation.spaceName',
    sortOrder: 'asc',
    isActive: true,
  });

  const { data: inventoryData, isLoading: isLoadingInventoryData } = useFetchInventory(
    searchParams3.toString(),
  );

  // Process the inventory data to calculate total traded amount
  const sitesData = useMemo(() => {
    if (!inventoryData?.docs?.length) return { totalTradedAmount: 0 };

    let totalTradedAmount = 0;

    inventoryData.docs.forEach(inventory => {
      inventory.campaigns?.forEach(campaign => {
        campaign.place?.forEach(place => {
          totalTradedAmount += place.tradedAmount || 0;
        });
      });
    });

    return { totalTradedAmount };
  }, [inventoryData]);

  const dummyStats = {
    tradedsite: sitesData.totalTradedAmount || 0,
    ownsite: userSales.data?.sales || 0,
  };
  const printStatusData = useMemo(
    () => ({
      datasets: [
        {
          data: [dummyStats.tradedsite, dummyStats.ownsite],
          backgroundColor: ['#914EFB', '#FF900E'],
          borderColor: ['#914EFB', '#FF900E'],
          borderWidth: 1,
        },
      ],
    }),
    [dummyStats.tradedsite, dummyStats.ownsite],
  );

  const [searchParams] = useSearchParams({
    page: 1,
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const {
    data: bookingData,
    isLoading: isLoadingBookingData,
    error,
  } = useBookings(searchParams.toString());
  const [salesData, setSalesData] = useState([]);

  const getCurrentYear = () => new Date().getFullYear();
  const pastYears = [getCurrentYear() - 3, getCurrentYear() - 2, getCurrentYear() - 1];

  // Map from database month to custom month index
  const monthMapping = {
    0: 9, // Jan -> Oct
    1: 10, // Feb -> Nov
    2: 11, // Mar -> Dec
    3: 0, // Apr -> Jan
    4: 1, // May -> Feb
    5: 2, // Jun -> Mar
    6: 3, // Jul -> Apr
    7: 4, // Aug -> May
    8: 5, // Sep -> Jun
    9: 6, // Oct -> Jul
    10: 7, // Nov -> Aug
    11: 8, // Dec -> Sep
  };

  useEffect(() => {
    if (bookingData && bookingData.docs) {
      const aggregatedData = aggregateSalesData(bookingData.docs);
      setSalesData(aggregatedData);
    }
  }, [bookingData]);

  const aggregateSalesData = data => {
    const aggregated = {};

    // Initialize aggregated data for each month
    monthsInShort.forEach((_, index) => {
      aggregated[index] = {};
      pastYears.forEach(year => {
        aggregated[index][year] = 0;
      });
    });

    data.forEach(item => {
      try {
        const date = new Date(item.createdAt);
        if (isNaN(date.getTime())) throw new Error('Invalid date');
        const dbMonth = date.getMonth(); // Database month index
        const month = monthMapping[dbMonth]; // Translate to custom month index
        const year = date.getFullYear();
        const amount = item.totalAmount || 0;

        if (amount <= 0 || isNaN(amount)) return;

        if (pastYears.includes(year)) {
          aggregated[month][year] += amount / 100000; // Convert to 'lac'
        }
      } catch (error) {
        console.error('Error processing date:', item.createdAt, error);
      }
    });

    const result = monthsInShort.map((month, index) => ({
      month,
      ...pastYears.reduce(
        (acc, year) => ({
          ...acc,
          [`year${year}`]: aggregated[index][year],
        }),
        {},
      ),
    }));

    return result;
  };

  const calculateTrendLineData = () => {
    return salesData.map(data => {
      const total = Object.values(data)
        .slice(1)
        .reduce((acc, val) => acc + val, 0);
      return total / pastYears.length; // Average for the past 3 years
    });
  };

  const trendLineData = useMemo(() => calculateTrendLineData(), [salesData]);

  const salesChartData = useMemo(() => {
    const colors = ['#FF6384', '#914EFB', '#36A2EB'];

    return {
      labels: monthsInShort,
      datasets: pastYears.map((year, idx) => ({
        label: year,
        data: salesData.map(data => data[`year${year}`]),
        backgroundColor: colors[idx % colors.length], // Rotate colors based on the index
        borderColor: colors[idx % colors.length],
        borderWidth: 1,
      })),
    };
  }, [salesData, pastYears]);

  const salesChartOptions = useMemo(
    () => ({
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Sales Amount (lac)',
          },
          ticks: {
            callback: value => `${value} L`,
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: context => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += `${context.parsed.y} L`;
              }
              return label;
            },
          },
        },
      },
    }),
    [salesData],
  );

  // Combined bar and line chart data
  const combinedChartData = useMemo(() => {
    const colors = ['#FF6384', '#914EFB', '#36A2EB'];

    return {
      labels: monthsInShort,
      datasets: [
        ...pastYears.map((year, idx) => ({
          label: year,
          data: salesData.map(data => data[`year${year}`]),
          backgroundColor: colors[idx % colors.length],
          borderColor: colors[idx % colors.length],
          borderWidth: 1,
          type: 'bar', // Set as bar for sales data
          yAxisID: 'y',
          order: 1, // Ensure bars are below the trend line
        })),
        {
          label: 'Trend',
          data: trendLineData,
          borderColor: '#EF4444',
          fill: false,
          tension: 0.1, // Smoother curve
          pointBackgroundColor: '#EF4444',
          type: 'line', // Set as line for trend line
          yAxisID: 'y1',
          order: 2, // Ensure trend line is above bars
        },
      ],
    };
  }, [salesData, trendLineData]);

  const combinedChartOptions = useMemo(
    () => ({
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Sales Amount (lac)',
          },
          ticks: {
            callback: value => `${value} L`,
          },
          position: 'left',
        },
        y1: {
          title: {
            display: true,
            text: 'Trend Line',
          },
          ticks: {
            callback: value => `${value} L`,
          },
          position: 'right',
          grid: {
            drawOnChartArea: false, // Only draw grid lines for primary y-axis
          },
        },
      },
    }),
    [],
  );

  const parentCompaniesQuery = useInfiniteCompanies({
    page: 1,
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    type: 'lead-company',
    isParent: false,
  });

  const parentCompanies = useMemo(
    () =>
      parentCompaniesQuery.data?.pages
        .reduce((acc, { docs }) => [...acc, ...docs], [])
        .map(doc => ({
          ...doc,
          label: doc.company,
          value: doc._id,
        })) || [],
    [parentCompaniesQuery?.data],
  );

  const aggregatedData = useMemo(() => {
    if (!bookingData || !parentCompanies.length) return {};

    const validCompanyTypes = ['government', 'nationalAgency', 'localAgency', 'directClient'];

    const companyTypeMap = parentCompanies.reduce((acc, company) => {
      const normalizedCompanyName = normalizeString(company.company);
      acc[normalizedCompanyName] = company.companyType;
      return acc;
    }, {});

    const aggregatedAmount = validCompanyTypes.reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {});

    bookingData.docs.forEach(booking => {
      const normalizedBookingCompany = normalizeString(booking.company);
      const companyType = companyTypeMap[normalizedBookingCompany];

      console.log(`Booking Company: ${normalizedBookingCompany}, Mapped Type: ${companyType}`);

      if (companyType && validCompanyTypes.includes(companyType)) {
        aggregatedAmount[companyType] += booking.totalAmount || 0;
      }
    });

    return aggregatedAmount;
  }, [bookingData, parentCompanies]);

  const pieChartData = useMemo(() => {
    const labels = Object.keys(aggregatedData);
    const data = Object.values(aggregatedData);

    return {
      labels,
      datasets: [
        {
          label: 'Revenue by Client Type',
          data,
          ...barDataConfigByClient.styles,
        },
      ],
    };
  }, [aggregatedData]);

  const [updatedClient, setUpdatedClient] = useState(pieChartData);

  useEffect(() => {
    if (bookingData && parentCompanies) {
      setUpdatedClient(pieChartData);
    }
  }, [pieChartData, bookingData, parentCompanies]);

  const { data: operationalCostTypes } = useFetchMasters(
    serialize({
      type: 'operational_cost_type',
      limit: 100,
      page: 1,
      sortBy: 'name',
      sortOrder: 'asc',
    }),
  );

  const { data: operationalCostData } = useFetchOperationalCostData();

  const totalAmountsByType = useMemo(() => {
    if (!operationalCostData || !operationalCostTypes) return {};

    return operationalCostTypes.docs.reduce((acc, type) => {
      const total = operationalCostData
        .filter(item => item.type.name === type.name)
        .reduce((sum, item) => sum + parseFloat(item.amount) || 0, 0);

      return {
        ...acc,
        [type.name]: total,
      };
    }, {});
  }, [operationalCostData, operationalCostTypes]);

  const chartLabels = Object.keys(totalAmountsByType);
  const chartData2 = Object.values(totalAmountsByType);

  const doughnutChartData = useMemo(() => {
    return {
      labels: chartLabels,
      datasets: [
        {
          label: 'Operational Costs',
          data: chartData2,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#BB9AB1',
            '#6482AD',
            '#BC9F8B',
            '#FFAD60',
            '#4E31AA',
            '#7FA1C3',
            '#8C3061',
          ],
          borderColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#BB9AB1',
            '#6482AD',
            '#BC9F8B',
            '#FFAD60',
            '#4E31AA',
            '#7FA1C3',
            '#8C3061',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [chartLabels, chartData2]);

  const [filter, setFilter] = useState('');
  const [activeView, setActiveView] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const generateYearRange = (startYear, endYear) => {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const sortMonths = (a, b) => {
    const monthOrder = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
  };

  const transformedData = useMemo(() => {
    if (!bookingData || !bookingData.docs) return {};

    const currentYear = new Date().getFullYear();
    const past10YearsRange = generateYearRange(currentYear - 10, currentYear - 1);
    const past5YearsRange = generateYearRange(currentYear - 5, currentYear - 1);

    const groupedData = bookingData.docs.reduce((acc, booking) => {
      const date = new Date(booking.createdAt);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      const revenue = booking.totalAmount;

      if (!acc.past10Years) acc.past10Years = {};
      if (!acc.past5Years) acc.past5Years = {};
      if (!acc.previousYear) acc.previousYear = {};
      if (!acc.currentYear) acc.currentYear = {};
      if (!acc.quarter) acc.quarter = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
      if (!acc.currentMonth) acc.currentMonth = {};
      if (!acc.past7) acc.past7 = {};
      if (!acc.customDate) acc.customDate = {};

      if (year >= currentYear - 10 && year < currentYear) {
        if (!acc.past10Years[year]) acc.past10Years[year] = 0;
        acc.past10Years[year] += revenue;
      }

      if (year >= currentYear - 5 && year < currentYear) {
        if (!acc.past5Years[year]) acc.past5Years[year] = 0;
        acc.past5Years[year] += revenue;
      }

      if (year === currentYear - 1) {
        if (!acc.previousYear[month]) acc.previousYear[month] = 0;
        acc.previousYear[month] += revenue;
      }

      if (year === currentYear) {
        if (!acc.currentYear[month]) acc.currentYear[month] = 0;
        acc.currentYear[month] += revenue;
      }

      if (year === currentYear && date.getMonth() === new Date().getMonth()) {
        if (!acc.currentMonth[day]) acc.currentMonth[day] = 0;
        acc.currentMonth[day] += revenue;
      }

      const last7DaysDate = new Date();
      last7DaysDate.setDate(last7DaysDate.getDate() - 7);
      if (date >= last7DaysDate) {
        if (!acc.past7[day]) acc.past7[day] = 0;
        acc.past7[day] += revenue;
      }

      if (['Jan', 'Feb', 'Mar'].includes(month)) acc.quarter.Q1 += revenue;
      if (['Apr', 'May', 'Jun'].includes(month)) acc.quarter.Q2 += revenue;
      if (['Jul', 'Aug', 'Sep'].includes(month)) acc.quarter.Q3 += revenue;
      if (['Oct', 'Nov', 'Dec'].includes(month)) acc.quarter.Q4 += revenue;

      if (startDate && endDate && date >= startDate && date <= endDate) {
        const key = `${month} ${day}`;
        if (!acc.customDate[key]) acc.customDate[key] = 0;
        acc.customDate[key] += revenue;
      }

      return acc;
    }, {});

    groupedData.past10Years = past10YearsRange.map(year => ({
      year,
      revenue: groupedData.past10Years[year] || 0,
    }));

    groupedData.past5Years = past5YearsRange.map(year => ({
      year,
      revenue: groupedData.past5Years[year] || 0,
    }));

    groupedData.previousYear = Object.keys(groupedData.previousYear)
      .sort(sortMonths)
      .map(month => ({
        month,
        revenue: groupedData.previousYear[month],
      }));

    groupedData.currentYear = Object.keys(groupedData.currentYear)
      .sort(sortMonths)
      .map(month => ({
        month,
        revenue: groupedData.currentYear[month],
      }));

    groupedData.currentMonth = Object.keys(groupedData.currentMonth).map(day => ({
      day,
      revenue: groupedData.currentMonth[day],
    }));

    groupedData.past7 = Object.keys(groupedData.past7)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(day => ({
        day,
        revenue: groupedData.past7[day],
      }));

    groupedData.customDate = Object.keys(groupedData.customDate).map(key => ({
      day: key,
      revenue: groupedData.customDate[key],
    }));

    groupedData.quarter = Object.keys(groupedData.quarter).map(quarter => ({
      quarter,
      revenue: groupedData.quarter[quarter],
    }));

    return groupedData;
  }, [bookingData, startDate, endDate]);

  const chartData1 = useMemo(() => {
    let selectedData = transformedData[filter] || [];
    const filteredData = selectedData.map(d => ({
      ...d,
      revenue: d.revenue > 0 ? d.revenue / 100000 : 0, // Convert to lacs
    }));

    if (filter === 'customDate') {
      filteredData.sort((a, b) => new Date(a.day) - new Date(b.day));
    }

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
            text: filter.includes('Year')
              ? 'Year'
              : filter === 'past7' || filter === 'customDate'
              ? 'Date'
              : 'Month',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Revenue (lac)',
          },
          ticks: {
            callback: value => `${value} L`, // Format tick values in lacs
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: context => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += `${context.parsed.y} L`;
              }
              return label;
            },
          },
        },
      },
    }),
    [filter, transformedData],
  );

  const onDateChange = val => {
    setStartDate(val[0]);
    setEndDate(val[1]);
  };

  const handleMenuItemClick = value => {
    setFilter(value);
    setActiveView(value);
  };

  const handleReset = () => {
    setFilter('');
    setActiveView('');
    setStartDate(null);
    setEndDate(null);
  };

  // traded margin report

  // Process the inventory data to group by city and calculate metrics
  const processedData = useMemo(() => {
    if (!inventoryData?.docs?.length) return [];

    const cityData = {};

    inventoryData.docs.forEach(inventory => {
      const city = inventory.location?.city;
      if (!city) return;

      let totalCityPrice = 0;
      let totalCityTradedAmount = 0;

      inventory.campaigns?.forEach(campaign => {
        campaign.place?.forEach(place => {
          totalCityPrice += place.price || 0;
          totalCityTradedAmount += place.tradedAmount || 0;
        });
      });

      const tradedMargin = totalCityPrice - totalCityTradedAmount;
      const percentageMargin = totalCityPrice
        ? ((tradedMargin / totalCityPrice) * 100).toFixed(2)
        : 0;

      if (!cityData[city]) {
        cityData[city] = {
          city,
          totalPrice: totalCityPrice,
          totalTradedAmount: totalCityTradedAmount,
          tradedMargin,
          percentageMargin,
        };
      } else {
        cityData[city].totalPrice += totalCityPrice;
        cityData[city].totalTradedAmount += totalCityTradedAmount;
        cityData[city].tradedMargin += tradedMargin;
        cityData[city].percentageMargin = (
          (cityData[city].tradedMargin / cityData[city].totalPrice) *
          100
        ).toFixed(2);
      }
    });

    return Object.values(cityData);
  }, [inventoryData]);

  const columns3 = useMemo(
    () => [
      {
        Header: 'City',
        accessor: 'city',
        disableSortBy: true,
        Cell: info => <p>{info.value}</p>,
      },
      {
        Header: 'Price (lac)',
        accessor: 'totalPrice',
        disableSortBy: true,
        Cell: info => <p>{(info.value / 100000).toFixed(2)}</p>, // Assuming 1 lac = 100,000
      },
      {
        Header: 'Traded Price (lac)',
        accessor: 'totalTradedAmount',
        disableSortBy: true,
        Cell: info => <p>{(info.value / 100000).toFixed(2)}</p>,
      },
      {
        Header: 'Traded Margin (lac)',
        accessor: 'tradedMargin',
        disableSortBy: true,
        Cell: info => <p>{(info.value / 100000).toFixed(2)}</p>,
      },
      {
        Header: 'Percentage Margin (%)',
        accessor: 'percentageMargin',
        disableSortBy: true,
        Cell: info => <p>{info.value}%</p>,
      },
    ],
    [],
  );

  // traded margin report

  // invoice report
  const [activeView1, setActiveView1] = useState(''); // Track the active filter

  // Utility function to format month and year
  const formatMonthYear1 = date => {
    const newDate = new Date(date);
    const month = newDate.toLocaleString('default', { month: 'short' });
    const year = newDate.getFullYear();
    return `${month} ${year}`;
  };

  // Filter data based on active view
  const getFilteredData1 = (data, view) => {
    if (!data) return [];

    const now = new Date();
    let startDate, endDate;

    switch (view) {
      case 'past10Years':
        startDate = new Date(now.getFullYear() - 10, 0, 1);
        break;
      case 'past5Years':
        startDate = new Date(now.getFullYear() - 5, 0, 1);
        break;
      case 'previousYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'currentYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = null;
        endDate = null;
    }

    const grouped1 = groupBy(data.docs, doc => {
      const date = new Date(doc.createdAt);
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    });

    const aggregatedData1 = Object.keys(grouped1)
      .map(monthYearKey => {
        const group = grouped1[monthYearKey];
        const totalInvoiceRaised =
          group.reduce((sum, doc) => sum + (doc.outStandingInvoice || 0), 0) / 100000;
        const totalAmountCollected =
          group.reduce((sum, doc) => sum + (doc.totalPayment || 0), 0) / 100000;
        const totalOutstanding = (totalInvoiceRaised - totalAmountCollected).toFixed(2);

        const date = new Date(`${monthYearKey}-01`);
        if ((startDate && date < startDate) || (endDate && date > endDate)) {
          return null;
        }

        if (totalInvoiceRaised >= 0 && totalAmountCollected >= 0 && totalOutstanding >= 0) {
          return {
            monthYearKey,
            month: formatMonthYear1(group[0].createdAt),
            outStandingInvoice: totalInvoiceRaised,
            totalPayment: totalAmountCollected,
            outstandingAmount: totalOutstanding,
          };
        }
        return null;
      })
      .filter(item => item !== null);

    return aggregatedData1.sort((a, b) => {
      const [yearA, monthA] = a.monthYearKey.split('-').map(Number);
      const [yearB, monthB] = b.monthYearKey.split('-').map(Number);

      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    });
  };

  const groupedData1 = useMemo(() => {
    return getFilteredData1(bookingData, activeView1).sort((a, b) => {
      const [yearA, monthA] = a.monthYearKey.split('-').map(Number);
      const [yearB, monthB] = b.monthYearKey.split('-').map(Number);

      // Sorting in descending order
      return yearA !== yearB ? yearB - yearA : monthB - monthA;
    });
  }, [bookingData?.docs, activeView1]);

  const column1 = useMemo(
    () => [
      {
        Header: 'Month',
        accessor: 'month',
        disableSortBy: true,
        Cell: info => <p>{info.row.original.month}</p>,
      },
      {
        Header: 'Invoice Raised (lac)',
        accessor: 'outStandingInvoice',
        disableSortBy: true,
        Cell: info => <p>{toIndianCurrency(info.row.original.outStandingInvoice)}</p>,
      },
      {
        Header: 'Amount Collected (lac)',
        accessor: 'totalPayment',
        disableSortBy: true,
        Cell: info => <p>{toIndianCurrency(info.row.original.totalPayment)}</p>,
      },
      {
        Header: 'Outstanding',
        accessor: 'outstandingAmount (lac)',
        disableSortBy: true,
        Cell: info => <p>{toIndianCurrency(info.row.original.outstandingAmount)}</p>,
      },
    ],
    [groupedData1],
  );

  const handleMenuItemClick1 = value => {
    setActiveView1(value);
  };

  const handleReset1 = () => {
    setActiveView1(''); // Clear the active view (reset)
  };

  const invoiceRaised = groupedData1?.reduce((acc, item) => acc + item.outStandingInvoice, 0); // Calculate total Invoice Raised

  const amountCollected = groupedData1?.reduce((acc, item) => acc + item.totalPayment, 0); // Calculate total Amount Collected

  const isFilterApplied = activeView1 !== ''; // Check if a filter is applied

  // invoice report

  return (
    <div className="overflow-y-auto px-3 col-span-10 overflow-hidden">
      <div className="flex flex-col ">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col p-6 w-[30rem]">
            <p className="font-bold text-center">Sales Trends Report</p>
            <p className="text-sm text-gray-600 italic pt-3">
              This chart displays a sales trends report, featuring data for "Own Sites" and "Traded
              Sites".
            </p>
            <div className="flex gap-8 mt-6 justify-center">
              <div className="flex gap-2 items-center">
                <div className="h-4 w-4 rounded-full bg-orange-350" />
                <div>
                  <p className="my-2 text-xs font-light">Own Sites</p>
                  <p className="text-sm">₹{dummyStats.ownsite}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-4 w-4 rounded-full bg-purple-350" />
                <div>
                  <p className="my-2 text-xs font-light">Traded sites</p>
                  <p className="text-sm">₹ {dummyStats.tradedsite}</p>
                </div>
              </div>
            </div>
            <div className="w-80 mt-4">
              {printStatusData.datasets[0].data.length === 0 ? (
                <p className="text-center">NA</p>
              ) : (
                <Doughnut options={config.options} data={printStatusData} />
              )}
            </div>
          </div>
          <div className="pt-6 w-[40rem]">
            <p className="font-bold text-center">Filtered Revenue Report</p>
            <p className="text-sm text-gray-600 italic py-4">
              This chart shows the filtered revenue data over different time periods.
            </p>
            <Menu shadow="md" width={130}>
              <Menu.Target>
                <Button className="secondary-button">
                  View By: {viewBy[activeView] || 'Select'}
                </Button>
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
              <div className="flex flex-col items-start space-y-4 py-2">
                <DateRangeSelector dateValue={[startDate, endDate]} onChange={onDateChange} />
              </div>
            )}

            <div className="my-4">
              <Line data={chartData1} options={chartOptions1} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col md:flex-row gap-10  w-[60rem]">
            <div className="flex mt-2">
              <div className="flex flex-col gap-4 text-center">
                <div className="flex flex-col gap-4 p-4 items-center min-h-[200px]">
                  <p className="font-bold">Client Company Type Revenue Bifurcation</p>
                  <p className="text-sm text-gray-600 italic">
                    This chart visualizes the revenue distribution by different client company
                    types.{' '}
                  </p>
                  <div className="w-72">
                    {isLoadingBookingData ? (
                      <p className="text-center">Loading...</p>
                    ) : updatedClient.datasets[0].data.length === 0 ? (
                      <p className="text-center">NA</p>
                    ) : (
                      <Pie
                        data={updatedClient}
                        options={barDataConfigByClient.options}
                        height={200}
                        width={200}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 flex text-center">
              <div className="mb-4 items-center flex flex-col">
                <p className="font-bold px-4 text-center">Operational cost bifurcation</p>
                <p className="text-sm text-gray-600 italic py-4">
                  This chart displays the breakdown of operational costs by different cost types.
                </p>
                <div className="w-72 ">
                  <Doughnut
                    data={doughnutChartData}
                    options={barDataConfigByClient.options}
                    height={200}
                    width={200}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex p-6 flex-col ">
            <div className="flex justify-between items-center">
              <p className="font-bold">Sales Report</p>
            </div>
            <p className="text-sm text-gray-600 italic pt-3">
              This chart displays total sales over the past three years with a trend line showing
              the average sales.
            </p>
            {isLoadingBookingData ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : (
              <div className="">
                {salesData.length > 0 ? (
                  <div className=" gap-10 ">
                    <div className="pt-4 w-[40rem]">
                      <Bar data={salesChartData} options={salesChartOptions} />
                    </div>
                    <div className="pt-4 w-[40rem]">
                      <Bar data={combinedChartData} options={combinedChartOptions} />
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-600">No data available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 md:col-span-12 lg:col-span-10 overflow-y-auto p-5">
          <p className="font-bold pt-10">Price and Traded Margin Report</p>
          <p className="text-sm text-gray-600 italic py-4">
            This report provide insights into the pricing trends, traded prices, and margins grouped
            by cities.
          </p>
          <Table
            data={(processedData || []).slice(0, 10)}
            COLUMNS={columns3}
            loading={isLoadingInventoryData}
          />
        </div>
        <div className="col-span-12 md:col-span-12 lg:col-span-10 overflow-y-auto p-5 overflow-hidden">
          <p className="font-bold ">Invoice and amount collected Report</p>
          <p className="text-sm text-gray-600 italic py-4">
            This report provide insights into the invoice raised, amount collected and outstanding
            by table, graph and chart.
          </p>
          <Table
            data={(groupedData1 || []).slice(0, 10)}
            COLUMNS={column1}
            loading={isLoadingInventoryData}
          />
          <p className="py-4 font-bold">Invoice Raised Vs Amount Collected Vs Outstanding</p>
          <div className="flex">
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
          </div>
          <InvoiceReportChart data={activeView1 ? groupedData1 : []} />{' '}
          <p className="pt-4 font-bold">Invoice Raised Vs Amount Collected</p>
          <GaugeChart
            invoiceRaised={isFilterApplied ? invoiceRaised : 0}
            amountCollected={isFilterApplied ? amountCollected : 0}
          />
        </div>
      </div>
    </div>
  );
};

export default OtherNewReports;
