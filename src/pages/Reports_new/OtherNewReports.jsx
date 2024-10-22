import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { Doughnut, Bar, Pie, Line } from 'react-chartjs-2';
import {
  useUserSalesByUserId,
  useBookings,
  useBookingsNew,
} from '../../apis/queries/booking.queries';
import {
  generateSlNo,
  daysInAWeek,
  financialEndDate,
  financialStartDate,
  monthsInShort,
  quarters,
  serialize,
  timeLegend,
  downloadPdf,
} from '../../utils';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { useInfiniteCompanies } from '../../apis/queries/companies.queries';
import useUserStore from '../../store/user.store';
import { Download, Loader } from 'react-feather';
import { Link, useSearchParams } from 'react-router-dom';
import { useFetchMasters } from '../../apis/queries/masters.queries';
import { useFetchOperationalCostData } from '../../apis/queries/operationalCost.queries';
import { Menu, Button, MultiSelect, Text } from '@mantine/core';
import DateRangeSelector from '../../components/DateRangeSelector';
import Table from '../../components/Table/Table';
import toIndianCurrency from '../../utils/currencyFormat';
import { useDistinctAdditionalTags, useFetchInventory } from '../../apis/queries/inventory.queries';
import GaugeChart from '../../components/modules/newReports/GaugeChart';
import InvoiceReportChart from '../../components/modules/newReports/InvoiceReportChart';
import PerformanceCard from '../../components/modules/newReports/performanceCard';

import ProposalSentIcon from '../../assets/proposal-sent.svg';
import RevenueCards from '../../components/modules/newReports/RevenueCards';
import classNames from 'classnames';
import {
  useBookingReportByRevenueGraph,
  useBookingRevenueByIndustry,
} from '../../apis/queries/booking.queries';
import { Image } from '@mantine/core';
import { downloadExcel } from '../../apis/requests/report.requests';
import { useDownloadExcel, useShareReport } from '../../apis/queries/report.queries';
import { showNotification } from '@mantine/notifications';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import ViewByFilter from '../../components/modules/reports/ViewByFilter';
import { DATE_FORMAT } from '../../utils/constants';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import OngoingOrdersIcon from '../../assets/ongoing-orders.svg';
import CompletedOrdersIcon from '../../assets/completed-orders.svg';
import UpcomingOrdersIcon from '../../assets/upcoming-orders.svg';
dayjs.extend(quarterOfYear);

import NoData from '../../components/shared/NoData';
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
import { useCampaignStats } from '../../apis/queries/campaigns.queries';
import { registerables } from 'chart.js';
import { useFetchProposals } from '../../apis/queries/proposal.queries';
import MediaWiseReport from '../OtherMediaReport/MediaWiseReport';

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
Chart.register(...registerables);
const customLinesPlugin = {
  id: 'customLines',
  afterDraw(chart) {
    const ctx = chart.ctx;
    if (!ctx) return;

    const dataset = chart.getDatasetMeta(0).data;

    dataset.forEach((arc, index) => {
      const { startAngle, endAngle, outerRadius, x, y } = arc.getProps(
        ['startAngle', 'endAngle', 'outerRadius', 'x', 'y'],
        true,
      );

      const angle = (startAngle + endAngle) / 2;
      const xEdge = Math.cos(angle) * outerRadius;
      const yEdge = Math.sin(angle) * outerRadius;

      const xLine = xEdge + Math.cos(angle) * 10;
      const yLine = yEdge + Math.sin(angle) * 10;

      const xEnd = x + xLine;
      const yEnd = y + yLine;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + xEdge, y + yEdge);
      ctx.lineTo(xEnd, yEnd);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });
  },
};

const barDataConfigByIndustry = {
  options: {
    responsive: true,
    plugins: {
      datalabels: {
        color: '#333',
        formatter: value => {
          const valueInLacs = value / 100000;
          return valueInLacs >= 1 ? Math.floor(valueInLacs) : valueInLacs.toFixed(1);
        },
        anchor: 'end',
        align: 'end',
        offset: 8,
      },
      customLines: true,
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const valueInLacs = value / 100000;
            const formattedValue = `${valueInLacs.toFixed(2)}L`;
            return `Revenue: ${formattedValue}`;
          },
        },
      },
    },
  },
  styles: {
    backgroundColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ],
    borderWidth: 1,
  },
};

export const pieData = {
  labels: [],
  datasets: [
    {
      label: '',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ],
};
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
  customDate: 'Custom Date Range',
};

const list1 = [
  { label: 'Past 10 Years', value: 'past10Years' },
  { label: 'Past 5 Years', value: 'past5Years' },
  { label: 'Previous Year', value: 'previousYear' },
  { label: 'Current Year', value: 'currentYear' },
  { label: 'Custom Date Range', value: 'customDate' },
];
const viewBy3 = {
  reset: '',
  revenue: 'Revenue',
  profitability: 'Profitability',
};

const list3 = [
  { label: 'Revenue', value: 'revenue' },
  { label: 'Profitability', value: 'profitability' },
];
const viewBy2 = {
  reset: '',
  newInclusion: 'New Inclusion',
  oldRetention: 'Old Retention',
};

const list2 = [
  { label: 'New Inclusion', value: 'newInclusion' },
  { label: 'Old Retention', value: 'oldRetention' },
];
const barDataConfigByClient = {
  styles: {
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    radius: '80%', // Shrinks the pie chart to add space around it
    plugins: {
      datalabels: {
        formatter: value => {
          return value >= 1 ? Math.floor(value) : value.toFixed(1);
        },
        color: '#000',
        anchor: 'end',
        align: 'end',
        offset: 2,
        // This keeps the data labels unaffected by chart size adjustments
      },
    },
  },
};

const clientTypeLabels = {
  government: 'Government',
  nationalagency: 'National Agency',
  localagency: 'Local Agency',
  directclient: 'Direct Client',
};

const OtherNewReports = () => {
  const userId = useUserStore(state => state.id);
  const userSales = useUserSalesByUserId({
    startDate: financialStartDate,
    endDate: financialEndDate,
    userId,
  });

  const [searchParams3, setSearchParams3] = useSearchParams({
    page: 1,
    limit: 500,
    sortBy: 'basicInformation.spaceName',
    sortOrder: 'desc',
    isActive: true,
  });

  const { data: inventoryData, isLoading: isLoadingInventoryData } = useFetchInventory(
    searchParams3.toString(),
  );

  const dummyStats = {
    tradedsite: (userSales.data?.totalTradedAmount / 100000).toFixed(2) || 0,
    ownsite: (userSales.data?.ownSiteSales / 100000).toFixed(2) || 0,
  };

  const printSitesData = useMemo(
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
  const config = {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          color: '#333',
          formatter: value => {
            return `${value}L`; // Append 'L' to the value
          },
          anchor: 'end',
          align: 'end',
          offset: 20,
        },
        customLines: true, // Custom lines plugin activation
      },
      layout: {
        padding: {
          top: 70,
          bottom: 70,
        },
      },
      elements: {
        arc: {
          borderWidth: 1,
        },
      },
      cutout: '65%', // Doughnut cutout
    },
  };

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

  const { data: bookingData2 } = useBookingsNew(searchParams.toString());

  const [salesData, setSalesData] = useState([]);

  const getCurrentYear = () => new Date().getFullYear();
  const pastYears = [getCurrentYear() - 3, getCurrentYear() - 2, getCurrentYear() - 1];

  const monthMapping = {
    0: 9,
    1: 10,
    2: 11,
    3: 0,
    4: 1,
    5: 2,
    6: 3,
    7: 4,
    8: 5,
    9: 6,
    10: 7,
    11: 8,
  };

  useEffect(() => {
    if (bookingData && bookingData.docs) {
      const aggregatedData = aggregateSalesData(bookingData.docs);
      setSalesData(aggregatedData);
    }
  }, [bookingData]);

  const aggregateSalesData = data => {
    const aggregated = {};

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

        const dbMonth = date.getMonth();
        const month = monthMapping[dbMonth];
        const year = date.getFullYear();
        const amount = item.totalAmount || 0;

        if (amount <= 0 || isNaN(amount)) return;

        if (pastYears.includes(year)) {
          aggregated[month][year] += amount / 100000;
        }
      } catch (error) {}
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
      return total / pastYears.length;
    });
  };

  const trendLineData = useMemo(() => calculateTrendLineData(), [salesData]);

  const chartRef = useRef(null); // Reference to the chart instance

  const combinedChartData = useMemo(() => {
    const colors = ['#FF6384', '#914EFB', '#36A2EB'];

    return {
      labels: monthsInShort,
      datasets: [
        ...pastYears.map((year, idx) => ({
          label: year,
          data: salesData.map(data => data[`year${year}`] || 0), // Fallback to 0 if data not present
          backgroundColor: colors[idx % colors.length],
          borderColor: colors[idx % colors.length],
          borderWidth: 1,
          type: 'bar',
          yAxisID: 'y',
        })),
        {
          label: 'Trend',
          data: trendLineData,
          borderColor: '#EF4444',
          fill: false,
          tension: 0.1,
          pointBackgroundColor: '#EF4444',
          type: 'line',
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
            callback: value => `${value.toFixed(2)} L`, // Ensure two decimal places on Y-axis
          },
          beginAtZero: true,
          position: 'left',
          max: Math.max(...salesData.map(d => Math.max(d.year2021, d.year2022, d.year2023))) + 5, // Adjust max value
        },
      },
      plugins: {
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'end',
          formatter: (value, context) => {
            if (context.dataset.type === 'bar' && value > 0) {
              return `${value.toFixed(0)}`; // Format the value as "X.XX L"
            }
            return ''; // Do not show labels for 0 or trend line
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
                label += `${context.parsed.y.toFixed(2)} L`; // Tooltip formatting with two decimal places
              }
              return label;
            },
          },
        },
      },
    }),
    [salesData],
  );
  // client details
  const aggregatedData = useMemo(() => {
    if (!bookingData2) return {};

    const validClientTypes = Object.keys(clientTypeLabels);

    const result = {
      government: 0,
      nationalagency: 0,
      localagency: 0,
      directclient: 0,
    };

    bookingData2.forEach(booking => {
      const totalAmount = booking?.totalAmount || 0;

      if (Array.isArray(booking.details) && booking.details.length > 0) {
        booking.details.forEach(detail => {
          const clientType = detail?.client?.clientType;

          if (clientType) {
            const normalizedClientType = clientType.toLowerCase().replace(/\s/g, '');
            if (validClientTypes.includes(normalizedClientType)) {
              result[normalizedClientType] += totalAmount / 100000;
            }
          }
        });
      }
    });

    return result;
  }, [bookingData2]);

  const pieChartData = useMemo(() => {
    const labels = Object.keys(aggregatedData).map(clientType => clientTypeLabels[clientType]); // Use the mapping for labels
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
    if (bookingData2) {
      setUpdatedClient(pieChartData);
    }
  }, [pieChartData, bookingData2]);
  // client details

  const { data: operationalCostTypes } = useFetchMasters(
    serialize({
      type: 'operational_cost_type',
      limit: 100,
      page: 1,
      sortBy: 'name',
      sortOrder: 'asc',
    }),
  );

  const { data: operationalCostData, isLoading: isStatsLoading } = useFetchOperationalCostData();

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

  const doughnutChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
        align: 'center',
        labels: {
          boxWidth: 20,
          padding: 20,
        },
      },
      datalabels: {
        color: '#333',
        formatter: value => {
          const inLacs = value / 100000;
          return inLacs >= 1 ? Math.floor(inLacs) : inLacs.toFixed(1);
        },
        anchor: 'end',
        align: 'end',
        offset: 10,
      },
      customLines: true,
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const valueInLacs = value / 100000;
            const formattedValue = `${valueInLacs.toFixed(2)}L`;
            return `Operational Costs: ${formattedValue}`;
          },
        },
      },
    },
    layout: {
      padding: {
        left: 70,
        right: 70,
      },
    },
    elements: {
      arc: {
        borderWidth: 1,
      },
    },
    cutout: '65%',
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
  };

  const [filter, setFilter] = useState('currentYear');
  const [activeView, setActiveView] = useState('currentYear');
  const [startDate, setStartDate] = useState(financialStartDate);
  const [endDate, setEndDate] = useState(financialEndDate);

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

  // traded margin report

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

    const sortedData = Object.values(cityData).sort((a, b) => b.tradedMargin - a.tradedMargin);

    return sortedData;
  }, [inventoryData]);

  const columns3 = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, 1, 1000)}</p>, []),
      },
      {
        Header: 'City',
        accessor: 'city',
        disableSortBy: true,
        Cell: info => <p>{info.value}</p>,
      },
      {
        Header: 'Price ',
        accessor: 'totalPrice',
        disableSortBy: true,
        Cell: info => <p>{(info.value / 100000).toFixed(2)}</p>,
      },
      {
        Header: 'Traded Price',
        accessor: 'totalTradedAmount',
        disableSortBy: true,
        Cell: info => <p>{(info.value / 100000).toFixed(2)}</p>,
      },
      {
        Header: 'Traded Margin',
        accessor: 'tradedMargin',
        disableSortBy: true,
        Cell: info => <p>{(info.value / 100000).toFixed(2)}</p>,
      },
      {
        Header: 'Percentage Margin (%)',
        accessor: 'percentageMargin',
        disableSortBy: true,
        Cell: info => {
          const percentageMargin =
            isNaN(info.value) || info.value === null ? '-' : `${info.value}%`;
          return <p>{percentageMargin}</p>;
        },
      },
    ],
    [],
  );

  // traded margin report

  // invoice report
  const [activeView1, setActiveView1] = useState('currentYear');

  const formatMonthYear1 = date => {
    const newDate = new Date(date);
    const month = newDate.toLocaleString('default', { month: 'short' });
    const year = newDate.getFullYear();
    const financialYear = newDate.getMonth() + 1 >= 4 ? year : year - 1; // Financial year logic

    return `${month} ${financialYear}`;
  };

  const getFinancialYear = date => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are 0-indexed

    // Financial year starts in April
    if (month >= 4) {
      return { startYear: year, endYear: year + 1 };
    } else {
      return { startYear: year - 1, endYear: year };
    }
  };

  const getFilteredData1 = (data, view, startDate2, endDate2) => {
    if (!data) return [];

    const now = new Date();
    const { startYear: currentFYStartYear } = getFinancialYear(now);

    let startDate, endDate;

    switch (view) {
      case 'past10Years':
        startDate = new Date(currentFYStartYear - 10, 3, 1);
        break;
      case 'past5Years':
        startDate = new Date(currentFYStartYear - 5, 3, 1);
        break;
      case 'previousYear':
        startDate = new Date(currentFYStartYear - 1, 3, 1);
        endDate = new Date(currentFYStartYear, 2, 31);
        break;
      case 'currentYear':
        startDate = new Date(currentFYStartYear, 3, 1);
        endDate = new Date(currentFYStartYear + 1, 2, 31);
        break;
      case 'customDate':
        startDate = startDate2;
        endDate = endDate2;
        break;
      default:
        startDate = null;
        endDate = null;
    }

    const grouped1 = {};

    data.docs.forEach(doc => {
      const date = new Date(doc.createdAt);
      const monthYearKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!grouped1[monthYearKey]) {
        grouped1[monthYearKey] = [];
      }
      grouped1[monthYearKey].push(doc);
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
    return getFilteredData1(bookingData, activeView1, startDate2, endDate2).sort((a, b) => {
      const [yearA, monthA] = a.monthYearKey.split('-').map(Number);
      const [yearB, monthB] = b.monthYearKey.split('-').map(Number);

      return yearA !== yearB ? yearB - yearA : monthB - monthA;
    });
  }, [bookingData?.docs, activeView1, startDate2, endDate2]);

  const column1 = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, 1, 1000)}</p>, []),
      },
      {
        Header: 'Month',
        accessor: 'month',
        disableSortBy: true,
        Cell: info => <p>{info.row.original.month}</p>,
      },
      {
        Header: 'Invoice Raised ',
        accessor: 'outStandingInvoice',
        disableSortBy: true,
        Cell: info => <p>{toIndianCurrency(info.row.original.outStandingInvoice)}</p>,
      },
      {
        Header: 'Amount Collected ',
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
    setActiveView1('currentYear');
    setStartDate2(null);
    setEndDate2(null);
  };

  const onDateChange5 = val => {
    setStartDate2(val[0]);
    setEndDate2(val[1]);
  };

  const invoiceRaised = groupedData1?.reduce((acc, item) => acc + item.outStandingInvoice, 0);

  const amountCollected = groupedData1?.reduce((acc, item) => acc + item.totalPayment, 0);

  const isFilterApplied = activeView1 !== '';

  // invoice report

  // other components

  const [groupBy, setGroupBy] = useState('month');

  const [updatedReveueGraph, setUpdatedRevenueGraph] = useState({
    id: uuidv4(),
    labels: monthsInShort,
    datasets: [
      {
        label: 'Revenue',
        data: [],
        borderColor: '#914EFB',
        backgroundColor: '#914EFB',
        cubicInterpolationMode: 'monotone',
      },
    ],
  });
  const options3 = {
    scales: {
      y: {
        ticks: {
          callback: function (value) {
            return `${(value / 100000).toFixed(2)} L`; // Format y-axis labels in "Lac"
          },
        },
      },
    },
    plugins: {
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        formatter: (value, context) => {
          const inLacs = value / 100000;
          return inLacs >= 1 ? Math.floor(inLacs) : inLacs.toFixed(1);
        },
        color: '#000', // Label color
        font: {
          weight: 'light',
          size: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${(context.parsed.y / 100000).toFixed(2)} L`; // Format tooltips in "Lac"
            }
            return label;
          },
        },
      },
    },
  };

  const [updatedIndustry, setUpdatedIndustry] = useState({
    id: uuidv4(),
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        ...barDataConfigByIndustry.styles,
      },
    ],
  });

  const { data: revenueGraphData, isLoading: isRevenueGraphLoading } =
    useBookingReportByRevenueGraph(
      serialize({
        startDate: startDate,
        endDate: endDate,
        groupBy,
      }),
    );

  const { data: revenueDataByIndustry, isLoading: isByIndustryLoading } =
    useBookingRevenueByIndustry(
      serialize({
        startDate,
        endDate,
      }),
    );

  const handleRevenueGraphViewBy = viewType => {
    if (viewType === 'reset' || viewType === 'year') {
      setStartDate(financialStartDate);
      setEndDate(financialEndDate);
      setGroupBy('month');
    }

    if (viewType === 'week' || viewType === 'month') {
      setStartDate(dayjs().startOf(viewType).format(DATE_FORMAT));
      setEndDate(dayjs().endOf(viewType).format(DATE_FORMAT));
      setGroupBy(viewType === 'month' ? 'dayOfMonth' : 'dayOfWeek');
    }
    if (viewType === 'quarter') {
      setStartDate(financialStartDate);
      setEndDate(financialEndDate);
      setGroupBy('quarter');
    }
  };

  const handleUpdateRevenueGraph = useCallback(() => {
    if (revenueGraphData) {
      const tempData = {
        labels: [],
        datasets: [
          {
            label: 'Revenue',
            data: [],
            borderColor: '#914EFB',
            backgroundColor: '#914EFB',
            cubicInterpolationMode: 'monotone',
          },
        ],
      };

      switch (groupBy) {
        case 'dayOfWeek':
          tempData.labels = daysInAWeek;
          tempData.datasets[0].data = Array(7).fill(0);
          break;
        case 'dayOfMonth':
          tempData.labels = Array.from({ length: dayjs().daysInMonth() }, (_, i) => i + 1);
          tempData.datasets[0].data = Array(dayjs().daysInMonth()).fill(0);
          break;
        case 'quarter':
          tempData.labels = quarters;
          tempData.datasets[0].data = Array(4).fill(0);
          break;
        default:
          tempData.labels = monthsInShort;
          tempData.datasets[0].data = Array(12).fill(0);
          break;
      }

      revenueGraphData?.forEach(item => {
        const id = Number(item._id);
        const total = Number(item.total).toFixed(2) || 0;

        if (groupBy === 'dayOfMonth' && id <= dayjs().daysInMonth()) {
          tempData.datasets[0].data[id - 1] = total;
        } else if (groupBy === 'dayOfWeek' && id <= 7) {
          tempData.datasets[0].data[id - 1] = total;
        } else if (groupBy === 'quarter' && id <= 4) {
          tempData.datasets[0].data[id - 1] = total;
        } else if (groupBy === 'month' || groupBy === 'year') {
          if (id < 4) {
            tempData.datasets[0].data[id + 8] = total;
          } else {
            tempData.datasets[0].data[id - 4] = total;
          }
        }
      });

      setUpdatedRevenueGraph(tempData);
    }
  }, [revenueGraphData, groupBy]);

  const filterBookingDataByDate = useCallback(() => {
    if (!bookingData || !Array.isArray(bookingData.docs)) {
      return []; // Return an empty array if bookingData is undefined or not an array
    }

    return bookingData.docs.filter(booking => {
      const bookingDate = dayjs(booking.createdAt);
      return bookingDate.isBetween(dayjs(startDate), dayjs(endDate), 'day', '[]');
    });
  }, [bookingData, startDate, endDate]);

  const handleUpdatedReveueByIndustry = useCallback(() => {
    const filteredData = filterBookingDataByDate();

    const industryRevenueMap = filteredData.reduce((acc, booking) => {
      const industryName = booking?.campaign?.industry?.name;

      // Check if the industry name is defined and not an empty string
      if (industryName) {
        const totalAmount = booking?.totalAmount || 0;

        if (!acc[industryName]) {
          acc[industryName] = 0;
        }
        acc[industryName] += totalAmount;
      }

      return acc;
    }, {});

    const tempBarData = {
      labels: Object.keys(industryRevenueMap),
      datasets: [
        {
          label: 'Revenue by Industry',
          data: Object.values(industryRevenueMap),
          ...barDataConfigByIndustry.styles,
        },
      ],
    };

    setUpdatedIndustry(tempBarData);
  }, [filterBookingDataByDate]);

  useEffect(() => {
    if (!isLoadingBookingData && bookingData) {
      handleUpdatedReveueByIndustry(); // Only process data once it's fully loaded
    }
  }, [handleUpdatedReveueByIndustry, isLoadingBookingData, bookingData]);

  useEffect(() => {
    handleUpdateRevenueGraph();
  }, [revenueGraphData, groupBy]);

  // other components

  // tagwise report

  const additionalTagsQuery = useDistinctAdditionalTags();
  const [selectedTags, setSelectedTags] = useState(['best', 'ASTC']);
  const [startDate1, setStartDate1] = useState(null);
  const [endDate1, setEndDate1] = useState(null);
  const [filter3, setFilter3] = useState('currentYear');
  const [activeView3, setActiveView3] = useState('currentYear');
  const [activeView5, setActiveView5] = useState('revenue');

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const currentYear = new Date().getFullYear();
  const generatePast7Days = () => {
    const past7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      past7Days.push(`${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`);
    }
    return past7Days;
  };

  const transformedRevenueData = useMemo(() => {
    if (!bookingData2 || !selectedTags.length) return {};

    const past7DaysRange = generatePast7Days();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const fiscalStartMonth = 3;

    const groupedData = bookingData2.reduce((acc, booking) => {
      const detailsWithTags = booking.details.filter(detail => {
        const campaign = detail.campaign;
        if (!campaign || !campaign.spaces || !Array.isArray(campaign.spaces)) return false;

        return campaign.spaces.some(space => {
          const spaceTags = space.specifications?.additionalTags || [];
          return Array.isArray(spaceTags) && selectedTags.some(tag => spaceTags.includes(tag));
        });
      });

      if (detailsWithTags.length === 0) return acc;

      detailsWithTags.forEach(detail => {
        const date = new Date(detail.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const formattedDay = `${month + 1}/${day}`;
        const revenue = booking.totalAmount;

        selectedTags.forEach(tag => {
          const tagMatches = detail.campaign.spaces.some(space =>
            space.specifications?.additionalTags?.includes(tag),
          );
          if (!tagMatches) return;

          let timeUnit;

          const fiscalYear = month >= fiscalStartMonth ? year : year - 1;
          const fiscalMonth = (month + 12 - fiscalStartMonth) % 12;
          const fiscalQuarter = Math.ceil((fiscalMonth + 1) / 3);

          if (filter3 === 'past10Years' && fiscalYear >= currentYear - 10) {
            timeUnit = fiscalYear;
          } else if (filter3 === 'past5Years' && fiscalYear >= currentYear - 5) {
            timeUnit = fiscalYear;
          } else if (filter3 === 'previousYear' && fiscalYear === currentYear - 1) {
            timeUnit = date.toLocaleString('default', { month: 'short' });
          } else if (filter3 === 'currentYear' && fiscalYear === currentYear) {
            timeUnit = date.toLocaleString('default', { month: 'short' });
          } else if (filter3 === 'currentMonth' && year === currentYear && month === currentMonth) {
            timeUnit = day;
          } else if (filter3 === 'past7' && past7DaysRange.includes(date.toLocaleDateString())) {
            timeUnit = formattedDay;
          } else if (
            filter3 === 'customDate' &&
            startDate1 &&
            endDate1 &&
            date.getTime() >= new Date(startDate1).setHours(0, 0, 0, 0) &&
            date.getTime() <= new Date(endDate1).setHours(23, 59, 59, 999)
          ) {
            timeUnit = formattedDay;
          } else if (filter3 === 'quarter' && fiscalYear === currentYear) {
            const quarterNames = [
              'First Quarter',
              'Second Quarter',
              'Third Quarter',
              'Fourth Quarter',
            ];
            timeUnit = quarterNames[fiscalQuarter - 1];
          }

          if (!timeUnit) return;

          if (!acc[timeUnit]) acc[timeUnit] = {};
          if (!acc[timeUnit][tag]) acc[timeUnit][tag] = 0;

          acc[timeUnit][tag] += revenue;
        });
      });

      return acc;
    }, {});

    return groupedData;
  }, [bookingData2, selectedTags, filter3, startDate1, endDate1]);
  const chartDataRevenue = useMemo(() => {
    const selectedData = transformedRevenueData || {};

    if (!selectedData || Object.keys(selectedData).length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    let labels = Object.keys(selectedData);

    const fiscalMonthLabels = [
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

    if (filter3 === 'quarter') {
      labels = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];
    } else if (filter3 === 'previousYear' || filter3 === 'currentYear') {
      labels = fiscalMonthLabels;
    }

    const datasets = selectedTags.map((tag, index) => {
      const data = labels.map(label => {
        const tagRevenue = selectedData[label]?.[tag] || 0;
        return tagRevenue > 0 ? tagRevenue / 100000 : 0;
      });

      const hue = ((index * 360) / selectedTags.length) % 360;
      const color = `hsl(${hue}, 70%, 50%)`;
      const colorRGBA = `hsla(${hue}, 70%, 50%, 0.2)`;

      return {
        label: ` ${tag} `,
        data,
        borderColor: color,
        backgroundColor: colorRGBA,
        tension: 0.1,
      };
    });

    return {
      labels,
      datasets,
    };
  }, [transformedRevenueData, selectedTags, filter3]);

  const chartOptionsRevenue = useMemo(
    () => ({
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text:
              filter3 === 'year'
                ? 'Years'
                : filter3 === 'quarter'
                ? 'Quarters'
                : filter3 === 'currentYear' || filter3 === 'previousYear'
                ? 'Months'
                : ['past7', 'customDate', 'currentMonth'].includes(filter3)
                ? 'Days'
                : '',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Revenue (lac)',
          },
          ticks: {
            callback: value => `${value} L`,
          },
        },
      },
      plugins: {
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'end',
          formatter: (value, context) => {
            if (value == 0) {
              return '';
            }
            return value >= 1 ? Math.floor(value) : value.toFixed(2);
          },
          color: '#000',
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
                label += `${context.parsed.y} L`;
              }
              return label;
            },
          },
        },
      },
    }),
    [filter3, transformedRevenueData],
  );
  const tableDataRevenue = useMemo(() => {
    if (!transformedRevenueData || Object.keys(transformedRevenueData).length === 0) {
      return [];
    }

    let timeUnits = [];

    if (filter3 === 'past10Years' || filter3 === 'past5Years') {
      timeUnits =
        filter3 === 'past10Years'
          ? generateYearRange(currentYear - 10, currentYear - 1)
          : generateYearRange(currentYear - 5, currentYear - 1);
    } else if (filter3 === 'previousYear' || filter3 === 'currentYear') {
      timeUnits = [
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
    } else if (filter3 === 'currentMonth') {
      const daysInMonth = new Date(currentYear, new Date().getMonth() + 1, 0).getDate();
      timeUnits = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    } else if (filter3 === 'past7') {
      const past7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleString('default', { month: 'short', day: 'numeric' });
      }).reverse();
      timeUnits = past7Days;
    } else if (filter3 === 'customDate' && startDate1 && endDate1) {
      const customRangeDates = [];
      let currentDate = new Date(startDate1);
      while (currentDate <= new Date(endDate1)) {
        const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
        customRangeDates.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      timeUnits = customRangeDates;
    } else if (filter3 === 'quarter') {
      timeUnits = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];
    }

    const tableRows3 = selectedTags.map(tag => {
      const row = { tag };
      let totalForTag = 0;

      timeUnits.forEach(timeUnit => {
        const revenue = transformedRevenueData[timeUnit]?.[tag] || 0;
        row[timeUnit] = revenue > 0 ? (revenue / 100000).toFixed(2) : '-';
        totalForTag += revenue;
      });

      row['Grand Total'] = totalForTag > 0 ? (totalForTag / 100000).toFixed(2) : '-';
      return row;
    });

    const grandTotalRow = { tag: 'Grand Total' };
    let overallTotal = 0;

    timeUnits.forEach(timeUnit => {
      const total = selectedTags.reduce((sum, tag) => {
        return sum + (transformedRevenueData[timeUnit]?.[tag] || 0);
      }, 0);
      grandTotalRow[timeUnit] = total > 0 ? (total / 100000).toFixed(2) : '-';
      overallTotal += total;
    });

    grandTotalRow['Grand Total'] = overallTotal > 0 ? (overallTotal / 100000).toFixed(2) : 0;

    return [...tableRows3, grandTotalRow];
  }, [transformedRevenueData, selectedTags, filter3, startDate1, endDate1]);

  const tableColumnsRevenue = useMemo(() => {
    const dynamicColumns = [];

    if (filter3 === 'past10Years' || filter3 === 'past5Years') {
      const yearRange =
        filter3 === 'past10Years'
          ? generateYearRange(currentYear - 10, currentYear - 1)
          : generateYearRange(currentYear - 5, currentYear - 1);
      yearRange.forEach(year => {
        dynamicColumns.push({
          Header: year.toString(),
          accessor: year.toString(),
          disableSortBy: true,
        });
      });
    } else if (filter3 === 'previousYear' || filter3 === 'currentYear') {
      const months = [
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
      months.forEach(month => {
        dynamicColumns.push({
          Header: month,
          accessor: month,
          disableSortBy: true,
        });
      });
    } else if (filter3 === 'currentMonth') {
      const daysInMonth = new Date(currentYear, new Date().getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        dynamicColumns.push({
          Header: i.toString(),
          accessor: i.toString(),
          disableSortBy: true,
        });
      }
    } else if (filter3 === 'past7') {
      const past7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleString('default', { month: 'short', day: 'numeric' });
      }).reverse();

      past7Days.forEach(day => {
        dynamicColumns.push({
          Header: day,
          accessor: day,
          disableSortBy: true,
        });
      });
    } else if (filter3 === 'customDate') {
      const customRangeDates = [];
      let currentDate = new Date(startDate1);
      while (currentDate <= new Date(endDate1)) {
        customRangeDates.push(
          currentDate.toLocaleString('default', { month: 'short', day: 'numeric' }),
        );
        currentDate.setDate(currentDate.getDate() + 1);
      }
      customRangeDates.forEach(date => {
        dynamicColumns.push({
          Header: date,
          accessor: date,
          disableSortBy: true,
        });
      });
    } else if (filter3 === 'quarter') {
      const quarters = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];
      quarters.forEach(quarter => {
        dynamicColumns.push({
          Header: quarter,
          accessor: quarter,
          disableSortBy: true,
        });
      });
    }

    return [
      {
        Header: 'Tag',
        accessor: 'tag',
        disableSortBy: true,
      },
      ...dynamicColumns,
      {
        Header: 'Grand Total',
        accessor: 'Grand Total',
        disableSortBy: true,
      },
    ];
  }, [filter3, currentYear, startDate1, endDate1]);

  const transformedProfitabilityData = useMemo(() => {
    if (!bookingData2 || !selectedTags.length) return {};

    const past7DaysRange = generatePast7Days();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const fiscalStartMonth = 3;

    const groupedData = bookingData2.reduce((acc, booking) => {
      const totalOperationalCost = (booking?.campaign?.spaces?.operationalCosts || []).reduce(
        (sum, cost) => sum + cost.amount,
        0,
      );

      const detailsWithTags = booking.details.filter(detail => {
        const campaign = detail.campaign;
        if (!campaign || !campaign.spaces || !Array.isArray(campaign.spaces)) return false;

        return campaign.spaces.some(space => {
          const spaceTags = space.specifications?.additionalTags || [];
          return Array.isArray(spaceTags) && selectedTags.some(tag => spaceTags.includes(tag));
        });
      });

      if (detailsWithTags.length === 0) return acc;

      detailsWithTags.forEach(detail => {
        const date = new Date(detail.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const formattedDay = `${month + 1}/${day}`;

        const revenue = booking.totalAmount;

        const profitability =
          revenue > 0 ? (((revenue - totalOperationalCost) / revenue) * 100).toFixed(2) : 0;

        selectedTags.forEach(tag => {
          const tagMatches = detail.campaign.spaces.some(space =>
            space.specifications?.additionalTags?.includes(tag),
          );
          if (!tagMatches) return;

          let timeUnit;

          const fiscalYear = month >= fiscalStartMonth ? year : year - 1;
          const fiscalMonth = (month + 12 - fiscalStartMonth) % 12;
          const fiscalQuarter = Math.ceil((fiscalMonth + 1) / 3);

          if (filter3 === 'past10Years' && fiscalYear >= currentYear - 10) {
            timeUnit = fiscalYear;
          } else if (filter3 === 'past5Years' && fiscalYear >= currentYear - 5) {
            timeUnit = fiscalYear;
          } else if (filter3 === 'previousYear' && fiscalYear === currentYear - 1) {
            timeUnit = date.toLocaleString('default', { month: 'short' });
          } else if (filter3 === 'currentYear' && fiscalYear === currentYear) {
            timeUnit = date.toLocaleString('default', { month: 'short' });
          } else if (filter3 === 'currentMonth' && year === currentYear && month === currentMonth) {
            timeUnit = day;
          } else if (filter3 === 'past7' && past7DaysRange.includes(date.toLocaleDateString())) {
            timeUnit = formattedDay;
          } else if (
            filter3 === 'customDate' &&
            startDate1 &&
            endDate1 &&
            date.getTime() >= new Date(startDate1).setHours(0, 0, 0, 0) &&
            date.getTime() <= new Date(endDate1).setHours(23, 59, 59, 999)
          ) {
            timeUnit = formattedDay;
          } else if (filter3 === 'quarter' && fiscalYear === currentYear) {
            const quarterNames = [
              'First Quarter',
              'Second Quarter',
              'Third Quarter',
              'Fourth Quarter',
            ];
            timeUnit = quarterNames[fiscalQuarter - 1];
          }

          if (!timeUnit) return;

          if (!acc[timeUnit]) acc[timeUnit] = {};
          if (!acc[timeUnit][tag]) acc[timeUnit][tag] = 0;

          acc[timeUnit][tag] += parseFloat(profitability);
        });
      });

      return acc;
    }, {});

    return groupedData;
  }, [bookingData2, selectedTags, filter3, startDate1, endDate1]);

  const chartDataProfitability = useMemo(() => {
    const selectedData = transformedProfitabilityData || {};

    if (!selectedData || Object.keys(selectedData).length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    let labels = Object.keys(selectedData);

    const fiscalMonthLabels = [
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

    if (filter3 === 'quarter') {
      labels = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];
    } else if (filter3 === 'previousYear' || filter3 === 'currentYear') {
      labels = fiscalMonthLabels;
    }

    const datasets = selectedTags.map((tag, index) => {
      const data = labels.map(label => {
        const tagProfitability = selectedData[label]?.[tag] || 0;
        return tagProfitability > 0 ? tagProfitability : 0;
      });

      const hue = ((index * 360) / selectedTags.length) % 360;
      const color = `hsl(${hue}, 70%, 50%)`;
      const colorRGBA = `hsla(${hue}, 70%, 50%, 0.2)`;

      return {
        label: ` ${tag} `,
        data,
        borderColor: color,
        backgroundColor: colorRGBA,
        tension: 0.1,
      };
    });

    return {
      labels,
      datasets,
    };
  }, [transformedProfitabilityData, selectedTags, filter3]);

  const chartOptionsProfitability = useMemo(
    () => ({
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text:
              filter3 === 'year'
                ? 'Years'
                : filter3 === 'quarter'
                ? 'Quarters'
                : filter3 === 'currentYear' || filter3 === 'previousYear'
                ? 'Months'
                : ['past7', 'customDate', 'currentMonth'].includes(filter3)
                ? 'Days'
                : '',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Profitability (%)',
          },
          ticks: {
            callback: value => `${value}%`,
          },
        },
      },
      plugins: {
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'end',
          formatter: (value, context) => {
            if (value == 0) {
              return '';
            }
            return value >= 1 ? Math.floor(value) + '%' : value.toFixed(2) + '%';
          },
          color: '#000',
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
                label += `${context.parsed.y}%`;
              }
              return label;
            },
          },
        },
      },
    }),
    [filter3, transformedProfitabilityData],
  );

  const onDateChange3 = val => {
    setStartDate1(val[0]);
    setEndDate1(val[1]);
  };

  const handleReset3 = () => {
    setFilter3('currentYear');
    setActiveView3('currentYear');
    setActiveView5('revenue');
    setStartDate1(null);
    setEndDate1(null);
    setSelectedTags(['best', 'ASTC']);
  };

  const handleMenuItemClick3 = value => {
    setFilter3(value);
    setActiveView3(value);
  };
  const handleMenuItemClick5 = value => {
    setActiveView5(value);
  };
  const tags = additionalTagsQuery.data || [];
  const options = tags.map(tag => ({ value: tag, label: tag }));

  const tableDataProfitability = useMemo(() => {
    if (!transformedProfitabilityData || Object.keys(transformedProfitabilityData).length === 0) {
      return [];
    }

    let timeUnits = [];

    if (filter3 === 'past10Years' || filter3 === 'past5Years') {
      timeUnits =
        filter3 === 'past10Years'
          ? generateYearRange(currentYear - 10, currentYear - 1)
          : generateYearRange(currentYear - 5, currentYear - 1);
    } else if (filter3 === 'previousYear' || filter3 === 'currentYear') {
      timeUnits = [
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
    } else if (filter3 === 'currentMonth') {
      const daysInMonth = new Date(currentYear, new Date().getMonth() + 1, 0).getDate();
      timeUnits = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    } else if (filter3 === 'past7') {
      const past7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleString('default', { month: 'short', day: 'numeric' });
      }).reverse();
      timeUnits = past7Days;
    } else if (filter3 === 'customDate' && startDate1 && endDate1) {
      const customRangeDates = [];
      let currentDate = new Date(startDate1);
      while (currentDate <= new Date(endDate1)) {
        const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
        customRangeDates.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      timeUnits = customRangeDates;
    } else if (filter3 === 'quarter') {
      timeUnits = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];
    }

    const tableRows3 = selectedTags.map(tag => {
      const row = { tag };
      let totalForTag = 0;

      timeUnits.forEach(timeUnit => {
        const profitability = transformedProfitabilityData[timeUnit]?.[tag] || 0;
        row[timeUnit] = profitability > 0 ? `${profitability.toFixed(2)}%` : '-';
        totalForTag += profitability;
      });

      row['Grand Total'] = totalForTag > 0 ? `${totalForTag.toFixed(2)}%` : '-';
      return row;
    });
    const grandTotalRow = { tag: 'Grand Total' };
    let overallTotal = 0;

    timeUnits.forEach(timeUnit => {
      const total = selectedTags.reduce((sum, tag) => {
        return sum + (transformedProfitabilityData[timeUnit]?.[tag] || 0);
      }, 0);

      grandTotalRow[timeUnit] = total > 0 ? `${total.toFixed(2)}%` : '-';
      overallTotal += total;
    });

    grandTotalRow['Grand Total'] = overallTotal > 0 ? `${overallTotal.toFixed(2)}%` : 0;

    return [...tableRows3, grandTotalRow];
  }, [transformedProfitabilityData, selectedTags, filter3, startDate1, endDate1]);

  const tableColumnsProfitability = useMemo(() => {
    const dynamicColumns = [];

    if (filter3 === 'past10Years' || filter3 === 'past5Years') {
      const yearRange =
        filter3 === 'past10Years'
          ? generateYearRange(currentYear - 10, currentYear - 1)
          : generateYearRange(currentYear - 5, currentYear - 1);
      yearRange.forEach(year => {
        dynamicColumns.push({
          Header: year.toString(),
          accessor: year.toString(),
          disableSortBy: true,
        });
      });
    } else if (filter3 === 'previousYear' || filter3 === 'currentYear') {
      const months = [
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
      months.forEach(month => {
        dynamicColumns.push({
          Header: month,
          accessor: month,
          disableSortBy: true,
        });
      });
    } else if (filter3 === 'currentMonth') {
      const daysInMonth = new Date(currentYear, new Date().getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        dynamicColumns.push({
          Header: i.toString(),
          accessor: i.toString(),
          disableSortBy: true,
        });
      }
    } else if (filter3 === 'past7') {
      const past7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleString('default', { month: 'short', day: 'numeric' });
      }).reverse();

      past7Days.forEach(day => {
        dynamicColumns.push({
          Header: day,
          accessor: day,
          disableSortBy: true,
        });
      });
    } else if (filter3 === 'customDate') {
      const customRangeDates = [];
      let currentDate = new Date(startDate1);
      while (currentDate <= new Date(endDate1)) {
        customRangeDates.push(
          currentDate.toLocaleString('default', { month: 'short', day: 'numeric' }),
        );
        currentDate.setDate(currentDate.getDate() + 1);
      }
      customRangeDates.forEach(date => {
        dynamicColumns.push({
          Header: date,
          accessor: date,
          disableSortBy: true,
        });
      });
    } else if (filter3 === 'quarter') {
      const quarters = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];
      quarters.forEach(quarter => {
        dynamicColumns.push({
          Header: quarter,
          accessor: quarter,
          disableSortBy: true,
        });
      });
    }

    return [
      {
        Header: 'Tag',
        accessor: 'tag',
        disableSortBy: true,
      },
      ...dynamicColumns,
      {
        Header: 'Grand Total',
        accessor: 'Grand Total',
        disableSortBy: true,
      },
    ];
  }, [filter3, currentYear, startDate1, endDate1]);
  // tagwise report

  // category type wise
  const [filter4, setFilter4] = useState('currentYear');
  const [activeView4, setActiveView4] = useState('currentYear');
  const [secondFilter, setSecondFilter] = useState('category');
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Billboards');

  useEffect(() => {
    if (bookingData2) {
      const categories = new Set();
      bookingData2.forEach(booking => {
        if (booking?.details && Array.isArray(booking.details)) {
          booking.details.forEach(detail => {
            const campaign = detail.campaign;
            if (campaign?.spaces && Array.isArray(campaign.spaces)) {
              campaign.spaces.forEach(space => {
                const category = space.basicInformation?.category?.[0]?.name;
                if (category) categories.add(category);
              });
            }
          });
        }
      });
      setCategoryList([...categories]); // Only update the state if the category list changes
    }
  }, [bookingData2]);

  const transformedData4 = useMemo(() => {
    if (!bookingData2 || !secondFilter || !selectedCategory) return {};

    const past7DaysRange = generatePast7Days(); // Ensure it returns dates in 'MM/DD/YYYY' format
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const fiscalStartMonth = 3; // Fiscal year starts in April (0-indexed)

    const groupedData = bookingData2.reduce((acc, booking) => {
      booking.details.forEach(detail => {
        const campaign = detail.campaign;
        if (!campaign || !campaign.spaces || !Array.isArray(campaign.spaces)) return;

        campaign.spaces.forEach(space => {
          const category = space.basicInformation?.category?.[0]?.name;
          const subCategory = space.basicInformation?.subCategory?.name || 'Other Subcategory';
          const date = new Date(detail.createdAt);
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          const formattedDay = `${month + 1}/${day}`;
          const revenue = booking.totalAmount;

          if (category !== selectedCategory) return;

          let timeUnit;

          const fiscalYear = month >= fiscalStartMonth ? year : year - 1;
          const fiscalMonth = (month + 12 - fiscalStartMonth) % 12;
          const fiscalQuarter = Math.ceil((fiscalMonth + 1) / 3);

          if (
            filter4 === 'past10Years' &&
            fiscalYear >= currentYear - 10 &&
            fiscalYear < currentYear
          ) {
            timeUnit = fiscalYear;
          } else if (
            filter4 === 'past5Years' &&
            fiscalYear >= currentYear - 5 &&
            fiscalYear < currentYear
          ) {
            timeUnit = fiscalYear;
          } else if (filter4 === 'previousYear' && fiscalYear === currentYear - 1) {
            timeUnit = new Date(0, month).toLocaleString('default', { month: 'short' });
          } else if (filter4 === 'currentYear' && fiscalYear === currentYear) {
            timeUnit = new Date(0, month).toLocaleString('default', { month: 'short' });
          } else if (filter4 === 'currentMonth' && year === currentYear && month === currentMonth) {
            timeUnit = day;
          } else if (filter4 === 'past7' && past7DaysRange.includes(date.toLocaleDateString())) {
            timeUnit = formattedDay;
          } else if (
            filter4 === 'customDate' &&
            startDate1 &&
            endDate1 &&
            date.getTime() >= new Date(startDate1).setHours(0, 0, 0, 0) &&
            date.getTime() <= new Date(endDate1).setHours(23, 59, 59, 999)
          ) {
            timeUnit = formattedDay;
          } else if (filter4 === 'quarter' && fiscalYear === currentYear) {
            const quarterly = Math.ceil((date.getMonth() + 1) / 3);
            timeUnit = `Q${quarterly}`;
          }

          if (!timeUnit) return;

          if (!acc[subCategory]) acc[subCategory] = {};
          if (!acc[subCategory][timeUnit]) acc[subCategory][timeUnit] = 0;

          acc[subCategory][timeUnit] += revenue;
        });
      });
      return acc;
    }, {});

    return groupedData;
  }, [bookingData2, filter4, secondFilter, selectedCategory, startDate1, endDate1]);

  const chartData4 = useMemo(() => {
    if (!transformedData4 || Object.keys(transformedData4).length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = Object.keys(transformedData4);
    const data = labels.map(subCategory => {
      const revenueData = transformedData4[subCategory];
      let totalRevenue = 0;

      Object.keys(revenueData).forEach(timeUnit => {
        totalRevenue += revenueData[timeUnit] || 0;
      });

      return totalRevenue / 100000;
    });

    if (data.every(value => value === 0)) {
      return { labels: [], datasets: [] };
    }

    const colors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ];

    return {
      labels,
      datasets: [
        {
          label: `Revenue by Subcategory`,
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('1)', '0.8)')),
          borderWidth: 1,
        },
      ],
    };
  }, [transformedData4, secondFilter, filter4]);

  const chartOptions4 = useMemo(
    () => ({
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + ' L'; // Display as lac
            },
          },
          title: {
            display: true,
            text: 'Revenue (lac)',
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
            size: 12, // Increase the size for visibility
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
                label += `${context.parsed.y.toFixed(2)} L`; // Tooltip formatting with two decimal places
              }
              return label;
            },
          },
        },
      },
    }),
    [filter4, transformedData4, secondFilter],
  );

  const onDateChange4 = val => {
    setStartDate1(val[0]);
    setEndDate1(val[1]);
  };

  const handleReset4 = () => {
    setFilter4('currentYear');
    setActiveView4('currentYear');
    setSecondFilter('category');
    setSelectedCategory('Billboards');
    setStartDate1(null);
    setEndDate1(null);
    setCategoryList([]); // Trigger chart re-render
  };

  const handleMenuItemClick4 = value => {
    setFilter4(value);
    setActiveView4(value);
  };
  // category type wise

  // existing campaing card
  // const { data: stats, isLoading: isStatsLoading } = useCampaignStats();
  // const printStatusData = useMemo(
  //   () => ({
  //     datasets: [
  //       {
  //         data: [stats?.printCompleted ?? 0, stats?.printOngoing ?? 0],
  //         backgroundColor: ['#914EFB', '#FF900E'],
  //         borderColor: ['#914EFB', '#FF900E'],
  //         borderWidth: 1,
  //       },
  //     ],
  //   }),
  //   [stats],
  // );

  // const mountStatusData = useMemo(
  //   () => ({
  //     datasets: [
  //       {
  //         data: [stats?.mountCompleted ?? 0, stats?.mountOngoing ?? 0],
  //         backgroundColor: ['#914EFB', '#FF900E'],
  //         borderColor: ['#914EFB', '#FF900E'],
  //         borderWidth: 1,
  //       },
  //     ],
  //   }),
  //   [stats],
  // );
  // existing campaing card

  // existing campagin details
  const { data: campaignStatus } = useFetchMasters(
    serialize({
      type: 'booking_campaign_status',
      parentId: null,
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'desc',
    }),
  );
  const { data: paymentStatus } = useFetchMasters(
    serialize({
      type: 'payment_status',
      parentId: null,
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'desc',
    }),
  );

  const column5 = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, 1, 1000)}</p>, []),
      },
      {
        Header: 'CAMPAIGN NAME',
        accessor: 'campaign.name',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { campaign, _id },
          },
        }) =>
          useMemo(
            () => (
              <Link to={`/bookings/view-details/${_id}`} className="text-purple-450 font-medium">
                <Text
                  className="overflow-hidden text-ellipsis max-w-[180px] underline"
                  lineClamp={1}
                  title={campaign?.name}
                >
                  {campaign?.name || '-'}
                </Text>
              </Link>
            ),
            [],
          ),
      },

      {
        Header: 'CLIENT TYPE',
        accessor: 'client.clientType',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { client },
          },
        }) =>
          useMemo(
            () => (
              <Text className="overflow-hidden text-ellipsis max-w-[180px]" lineClamp={1}>
                {client?.clientType || '-'}
              </Text>
            ),
            [],
          ),
      },
      {
        Header: 'OUTSTANDING AMOUNT',
        accessor: 'outstandingAmount',
        disableSortBy: true,
        Cell: info =>
          useMemo(
            () => (
              <p>
                {info.row.original.unpaidAmount
                  ? toIndianCurrency(info.row.original.unpaidAmount)
                  : '-'}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'CAMPAIGN AMOUNT',
        accessor: 'campaign.totalPrice',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { campaign },
          },
        }) =>
          useMemo(
            () => (
              <div className="flex items-center justify-between max-w-min">
                {toIndianCurrency(campaign?.totalPrice || 0)}
              </div>
            ),
            [],
          ),
      },

      {
        Header: 'BOOKING DURATION',
        accessor: 'schedule',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { campaign },
          },
        }) =>
          useMemo(
            () => (
              <div className="flex items-center w-max">
                <p className="font-medium bg-gray-450 px-2 rounded-sm min-w-[120px] text-center">
                  {campaign?.startDate ? (
                    dayjs(campaign?.startDate).format(DATE_FORMAT)
                  ) : (
                    <NoData type="na" />
                  )}
                </p>
                <span className="px-2">&gt;</span>
                <p className="font-medium bg-gray-450 px-2 rounded-sm min-w-[120px] text-center">
                  {campaign?.endDate ? (
                    dayjs(campaign?.endDate).format(DATE_FORMAT)
                  ) : (
                    <NoData type="na" />
                  )}
                </p>
              </div>
            ),
            [],
          ),
      },
    ],
    [bookingData?.docs, campaignStatus, paymentStatus],
  );
  const sortedBookingData = useMemo(() => {
    if (!bookingData?.docs) return [];

    // Safely sort the data, handling undefined campaign or totalPrice values
    return bookingData.docs.sort((a, b) => {
      const aPrice = a?.campaign?.totalPrice || 0; // Use 0 if campaign or totalPrice is missing
      const bPrice = b?.campaign?.totalPrice || 0;

      return bPrice - aPrice; // Sort in descending order
    });
  }, [bookingData?.docs]);

  // existing campagin details

  // printing and mounting

  const config1 = {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          color: '#333',
          formatter: value => {
            const valueInLacs = value / 100000;
            return valueInLacs >= 1 ? Math.floor(valueInLacs) : valueInLacs.toFixed(1);
          },
          anchor: 'end',
          align: 'end',
          offset: 8,
        },
        customLines: true,
        tooltip: {
          callbacks: {
            label: tooltipItem => {
              const dataset = tooltipItem.dataset;
              const value = dataset.data[tooltipItem.dataIndex];
              const valueInLacs = (value / 100000).toFixed(2);
              return `Revenue: ${valueInLacs}L`;
            },
          },
        },
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20,
          left: 25,
          right: 25,
        },
      },
      elements: {
        arc: {
          borderWidth: 1,
        },
      },
      cutout: '65%',
    },
  };

  // Extract and filter relevant data

  const costData = useMemo(() => {
    if (!operationalCostData) return {};

    const relevantTypes = ['Printing', 'Mounting', 'Reprinting', 'Remounting'];

    // Initialize totals for each type
    const totals = {
      Printing: 0,
      Mounting: 0,
      Reprinting: 0,
      Remounting: 0,
    };

    // Calculate the total for each type
    operationalCostData.forEach(item => {
      const typeName = item?.type?.name;
      if (relevantTypes.includes(typeName)) {
        totals[typeName] += item.amount || 0;
      }
    });

    return totals;
  }, [operationalCostData]);

  const printingMountingData = useMemo(
    () => ({
      datasets: [
        {
          data: [costData.Printing, costData.Mounting],
          backgroundColor: ['#FF900E', '#914EFB'],
          borderColor: ['#FF900E', '#914EFB'],
        },
      ],
    }),
    [costData], // Add costData as a dependency
  );

  const reprintingRemountingData = useMemo(
    () => ({
      datasets: [
        {
          data: [costData.Reprinting, costData.Remounting],
          backgroundColor: ['#FF900E', '#914EFB'],
          borderColor: ['#FF900E', '#914EFB'],
        },
      ],
    }),
    [costData], // Add costData as a dependency
  );
  // printing and mounting

  // ongoing orders
  const calculateTotalRevenue = status => {
    if (!bookingData2) return 0;
    return bookingData2.reduce((total, booking) => {
      if (booking.currentStatus?.campaignStatus === status) {
        return total + (booking.totalAmount || 0); // Replace `totalAmount` with the correct field if needed
      }
      return total;
    }, 0);
  };

  // Calculate total revenue for each order status (only if data is available)
  const ongoingRevenue = bookingData2 ? calculateTotalRevenue('Ongoing') : null;
  const upcomingRevenue = bookingData2 ? calculateTotalRevenue('Upcoming') : null;
  const completedRevenue = bookingData2 ? calculateTotalRevenue('Completed') : null;

  // ongoing orders
  const showOwnSites = dummyStats.ownsite > 0;
  const showTradedSites = dummyStats.tradedsite > 0;

  // proposals data
  const [searchParams4, setSearchParams4] = useSearchParams({
    page: 1,
    limit: 500,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: proposalsData, isLoading: isLoadingProposalsData } = useFetchProposals(
    searchParams4.toString(),
  );

  const proposalsArray = Array.isArray(proposalsData?.docs) ? proposalsData.docs : [];

  const totalProposalsCreated = proposalsArray.length;
  const totalPrice = proposalsArray.reduce((acc, proposal) => acc + (proposal.price || 0), 0);

  const totalPriceInLacs = (totalPrice / 100000).toFixed(2);

  // proposals data

  // revenue breakup according to client type
  const aggregatedData2 = useMemo(() => {
    if (!bookingData2) return {};

    const validClientTypes = ['government', 'nationalagency', 'localagency', 'directclient']; // Define valid client types

    const result = {
      government: 0,
      nationalagency: 0,
      localagency: 0,
      directclient: 0,
    };

    bookingData2.forEach(booking => {
      const totalAmount = booking?.totalAmount || 0;

      if (Array.isArray(booking.details) && booking.details.length > 0) {
        booking.details.forEach(detail => {
          const clientType = detail?.client?.clientType;

          if (clientType) {
            const normalizedClientType = clientType.toLowerCase().replace(/\s/g, '');
            if (validClientTypes.includes(normalizedClientType)) {
              result[normalizedClientType] += totalAmount / 100000;
            }
          }
        });
      }
    });

    return result;
  }, [bookingData2]);

  const revenueBreakupData = useMemo(
    () => ({
      datasets: [
        {
          data: [
            aggregatedData2.directclient ?? 0,
            aggregatedData2.localagency ?? 0,
            aggregatedData2.nationalagency ?? 0,
            aggregatedData2.government ?? 0,
          ],
          backgroundColor: ['#FF900E', '#914EFB', '#4BC0C0', '#2938F7'],
          borderColor: ['#FF900E', '#914EFB', '#4BC0C0', '#2938F7'],
          borderWidth: 1,
        },
      ],
    }),
    [aggregatedData2],
  );
  // revenue breakup according to client type

  // month wise contribution of client type
  const currentFinancialYear = date => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const aggregatedData3 = useMemo(() => {
    if (!bookingData2) {
      return {
        sales: monthsInShort.reduce((acc, month) => {
          acc[month] = { government: 0, nationalagency: 0, localagency: 0, directclient: 0 };
          return acc;
        }, {}),
      };
    }

    const result = {
      sales: monthsInShort.reduce((acc, month) => {
        acc[month] = { government: 0, nationalagency: 0, localagency: 0, directclient: 0 };
        return acc;
      }, {}),
    };

    bookingData2.forEach(booking => {
      const bookingDate = new Date(booking.createdAt);
      const fy = currentFinancialYear(bookingDate);

      if (fy === currentFinancialYear(new Date())) {
        const totalAmount = booking?.totalAmount || 0;

        if (Array.isArray(booking.details) && booking.details.length > 0) {
          booking.details.forEach(detail => {
            const clientType = detail?.client?.clientType?.toLowerCase().replace(/\s/g, '');

            const monthKey = bookingDate.toLocaleString('default', { month: 'short' });
            if (result.sales[monthKey] && clientType) {
              result.sales[monthKey][clientType] += totalAmount / 100000;
            }
          });
        }
      }
    });

    return result;
  }, [bookingData2]);

  const totalSalesByMonth = useMemo(
    () =>
      Object.values(aggregatedData3.sales).map(
        item => item.government + item.nationalagency + item.localagency + item.directclient,
      ),
    [aggregatedData3],
  );

  const barChartOptions = useMemo(
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
            text: 'Sales (lac)',
          },
          ticks: {
            callback: value => `${value.toFixed(2)} L`,
          },
          beginAtZero: true,
          position: 'left',
        },
      },
      plugins: {
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'end',
          formatter: (value, context) => {
            if (value === 0) {
              return '';
            }
            return value >= 1 ? Math.floor(value) : value.toFixed(2);
          },
          color: '#000',
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
                label += `${context.parsed.y.toFixed(2)} L`;
              }
              return label;
            },
          },
        },
      },
    }),
    [],
  );

  const stackedBarOptions = useMemo(
    () => ({
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month',
          },
          stacked: true,
        },
        y: {
          title: {
            display: true,
            text: 'Percentage Contribution (%)',
          },
          stacked: true,
          beginAtZero: true,
          ticks: {
            callback: value => `${value}%`,
          },
        },
      },
      plugins: {
        datalabels: {
          display: true,
          anchor: 'center',
          align: 'center',
          formatter: value => {
            const parsedValue = parseFloat(value);
            if (parsedValue > 0) {
              return `${parsedValue.toFixed(0)}%`;
            } else {
              return '';
            }
          },
          color: '#000',
          font: {
            size: 12,
          },
        },
        tooltip: {
          callbacks: {
            label: context => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.raw !== null) {
                label += `${context.raw}%`;
              }
              return label;
            },
          },
        },
      },
    }),
    [],
  );
  const barData = useMemo(
    () => ({
      labels: monthsInShort,
      datasets: [
        {
          label: 'Government',
          data: Object.values(aggregatedData3.sales).map(item => item.government),
          backgroundColor: '#FF6384',
        },
        {
          label: 'National Agency',
          data: Object.values(aggregatedData3.sales).map(item => item.nationalagency),
          backgroundColor: '#36A2EB',
        },
        {
          label: 'Local Agency',
          data: Object.values(aggregatedData3.sales).map(item => item.localagency),
          backgroundColor: '#FFCE56',
        },
        {
          label: 'Direct Client',
          data: Object.values(aggregatedData3.sales).map(item => item.directclient),
          backgroundColor: '#4BC0C0',
        },
      ],
    }),
    [aggregatedData3],
  );

  const percentageBarData = useMemo(
    () => ({
      labels: monthsInShort,
      datasets: [
        {
          label: 'Government',
          data: Object.values(aggregatedData3.sales).map((item, idx) =>
            totalSalesByMonth[idx]
              ? ((item.government / totalSalesByMonth[idx]) * 100).toFixed(2)
              : 0,
          ),
          backgroundColor: '#FF6384',
        },
        {
          label: 'National Agency',
          data: Object.values(aggregatedData3.sales).map((item, idx) =>
            totalSalesByMonth[idx]
              ? ((item.nationalagency / totalSalesByMonth[idx]) * 100).toFixed(2)
              : 0,
          ),
          backgroundColor: '#36A2EB',
        },
        {
          label: 'Local Agency',
          data: Object.values(aggregatedData3.sales).map((item, idx) =>
            totalSalesByMonth[idx]
              ? ((item.localagency / totalSalesByMonth[idx]) * 100).toFixed(2)
              : 0,
          ),
          backgroundColor: '#FFCE56',
        },
        {
          label: 'Direct Client',
          data: Object.values(aggregatedData3.sales).map((item, idx) =>
            totalSalesByMonth[idx]
              ? ((item.directclient / totalSalesByMonth[idx]) * 100).toFixed(2)
              : 0,
          ),
          backgroundColor: '#4BC0C0',
        },
      ],
    }),
    [aggregatedData3, totalSalesByMonth],
  );

  // month wise contribution of client type

  // client details
  const getFinancialYear1 = date => {
    const fiscalYearStartMonth = 4; // April
    const currentDate = new Date();
    const fiscalYearStart = new Date(currentDate.getFullYear(), fiscalYearStartMonth - 1, 1);
    return date >= fiscalYearStart ? 'newInclusion' : 'oldRetention';
  };
  const [filter2, setFilter2] = useState('');
  const [activeView2, setActiveView2] = useState('');

  const handleReset2 = () => {
    setFilter2('');
    setActiveView2('');
  };

  const handleMenuItemClick2 = value => {
    setFilter2(value);
    setActiveView2(value);
  };

  const tableData4 = useMemo(() => {
    if (!bookingData2) return [];

    return bookingData2
      .map(booking => {
        const { totalAmount, details, campaign } = booking;
        const firstDetail = details[0] || {};
        const client = firstDetail.client || {};

        if (!client.clientType) return null;

        const firstBookingDate = new Date(booking.createdAt);
        const revenue = (totalAmount / 100000).toFixed(2) || 0;

        const totalOperationalCost = (campaign?.spaces?.operationalCosts || []).reduce(
          (sum, cost) => sum + cost.amount,
          0,
        );

        const profitability =
          revenue > 0
            ? (((revenue * 100000 - totalOperationalCost) / (revenue * 100000)) * 100).toFixed(2) +
              '%'
            : '0%';

        const retentionStatus = getFinancialYear1(firstBookingDate);
        if (filter2 && retentionStatus !== filter2) {
          return null;
        }

        const timeline = firstBookingDate.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric',
        });

        return {
          clientCategory: client.clientType,
          name: client.name || 'N/A',
          timeline,
          retentionStatus: viewBy2[retentionStatus],
          revenue,
          profitability,
        };
      })
      .filter(Boolean);
  }, [bookingData2, filter2]);

  const tableColumns4 = useMemo(() => {
    return [
      {
        Header: 'Client Type Category',
        accessor: 'clientCategory',
        disableSortBy: true,
      },
      {
        Header: 'Names',
        accessor: 'name',
        disableSortBy: true,
      },
      {
        Header: 'TimeLine',
        accessor: 'timeline',
        disableSortBy: true,
      },
      {
        Header: 'Retention Status',
        accessor: 'retentionStatus',
        disableSortBy: true,
      },
      {
        Header: 'Revenue (lac)',
        accessor: 'revenue',
        disableSortBy: true,
      },
      {
        Header: 'Profitability (%)',
        accessor: 'profitability',
        disableSortBy: true,
      },
    ];
  }, []);

  // client details

  // For PDF Download
  const { mutateAsync: mutateAsyncPdf, isLoading: isDownloadPdfLoading } = useShareReport();

  const handleDownloadPdf = async () => {
    const activeUrl = new URL(window.location.href);
    activeUrl.searchParams.append('share', 'report');

    await mutateAsyncPdf(
      { url: activeUrl.toString() },
      {
        onSuccess: data => {
          showNotification({
            title: 'Report has been downloaded successfully',
            color: 'green',
          });
          if (data?.link) {
            downloadPdf(data.link);
          }
        },
      },
    );
  };

  // For Excel Download
  const { mutateAsync: mutateAsyncExcel, isLoading: isDownloadExcelLoading } = useDownloadExcel();

  const handleDownloadExcel = async () => {
    const activeUrl = new URL(window.location.href);

    await mutateAsyncExcel(
      { s3url: activeUrl.toString() },
      {
        onSuccess: data => {
          showNotification({
            title: 'Report has been downloaded successfully',
            color: 'green',
          });
          if (data?.link) {
            downloadExcel(data.link);
          }
        },
        onError: err => {
          showNotification({
            title: err?.message,
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <div className="overflow-y-auto p-3 col-span-10 overflow-hidden">
      {/* <Button
        leftIcon={<Download size="20" color="white" />}
        className="primary-button mx-3"
        onClick={handleDownloadPdf}
        loading={isDownloadPdfLoading}
        disabled={isDownloadPdfLoading}
      >
        Download PDF
      </Button> */}

      <div className="flex flex-end justify-end ">
        <div className="py-5 flex items-start">
          <Button
            leftIcon={<Download size="20" color="white" />}
            className="primary-button"
            onClick={handleDownloadExcel}
            loading={isDownloadExcelLoading}
            disabled={isDownloadExcelLoading}
          >
            Income Statement
          </Button>
        </div>
      </div>
      <div className="border-2 p-5 border-black">
        <p className="font-bold text-lg"> Revenue </p>
        <div className="overflow-hidden p-5 ">
          <RevenueCards />
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col p-6 w-[30rem] gap-4">
            <p className="font-bold">Source Distribution</p>
            <p className="text-sm text-gray-600 italic">
              This chart shows the revenue split between "Own Sites" and "Traded Sites".
            </p>
            {!showOwnSites && !showTradedSites ? (
              <p className="text-center">NA</p>
            ) : (
              <>
                <div className="flex gap-8 mt-6 justify-center">
                  {showOwnSites && (
                    <div className="flex gap-2 items-center">
                      <div className="h-4 w-4 rounded-full bg-orange-350" />
                      <div>
                        <p className="my-2 text-xs font-light">Own Sites</p>
                        <p className="text-sm">{dummyStats.ownsite} L</p>
                      </div>
                    </div>
                  )}
                  {showTradedSites && (
                    <div className="flex gap-2 items-center">
                      <div className="h-4 w-4 rounded-full bg-purple-350" />
                      <div>
                        <p className="my-2 text-xs font-light">Traded Sites</p>
                        <p className="text-sm">{dummyStats.tradedsite} L</p>
                      </div>
                    </div>
                  )}
                </div>
                {showOwnSites || showTradedSites ? (
                  <div className="w-[200px] m-6">
                    <Doughnut options={config} data={printSitesData} plugins={[ChartDataLabels]} />
                  </div>
                ) : null}
              </>
            )}
          </div>
          <div className="flex mt-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 p-4  min-h-[200px]">
                <p className="font-bold">Client Type Distribution</p>
                <p className="text-sm text-gray-600 italic">
                  This chart breaks down revenue by client type, including "Direct Clients", "Local
                  Agencies", "National Agencies", and "Government".
                </p>
                <div className="w-72 justify-center mx-40">
                  {isLoadingBookingData ? (
                    <p className="text-center">Loading...</p>
                  ) : updatedClient && updatedClient.datasets[0].data.length > 0 ? (
                    <Pie
                      data={updatedClient}
                      options={barDataConfigByClient.options}
                      height={200}
                      width={200}
                      ref={chartRef}
                      plugins={[ChartDataLabels, customLinesPlugin]}
                    />
                  ) : (
                    <p className="text-center">NA</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 w-[50rem]">
          <p className="font-bold ">Revenue Distribution</p>
          <p className="text-sm text-gray-600 italic py-4">
            This line chart shows revenue trends over selected time periods, with revenue displayed
            in lakhs.
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
        <div className={classNames('overflow-y-auto px-5 col-span-10 overflow-x-hidden')}>
          <div className="my-6 w-[60rem]" id="revenue-pdf">
            <div className="flex gap-8">
              <div className="w-[70%] flex flex-col justify-between min-h-[300px]">
                <div className="flex justify-between items-center">
                  <p className="font-bold">Revenue Graph</p>
                </div>
                <div className="h-[60px] mt-5 border-gray-450 flex ">
                  <ViewByFilter handleViewBy={handleRevenueGraphViewBy} />
                </div>
                {isRevenueGraphLoading ? (
                  <Loader className="m-auto" />
                ) : (
                  <div className="flex flex-col pl-7 relative">
                    <p className="transform rotate-[-90deg] absolute left-[-38px] top-[40%] text-sm">
                      Amount in Lac &gt;
                    </p>
                    <div className="max-h-[350px]">
                      <Line
                        data={updatedReveueGraph}
                        options={options3}
                        key={updatedReveueGraph.id}
                        className="w-full"
                        ref={chartRef}
                        plugins={[ChartDataLabels]}
                      />
                    </div>
                    <p className="text-center text-sm">{timeLegend[groupBy]} &gt;</p>
                  </div>
                )}
              </div>
              <div className="w-[40%] flex flex-col">
                <div className="flex flex-col">
                  <p className="font-bold"> Industry Type Distribution</p>
                  <p className="text-sm text-gray-600 italic py-4">
                    This pie chart shows the percentage split of revenue generated across various
                    industries
                  </p>
                </div>
                <div className="w-72 m-auto">
                  {isByIndustryLoading ? (
                    <Loader className="mx-auto" />
                  ) : !updatedIndustry.datasets[0].data.length ? (
                    <p className="text-center">NA</p>
                  ) : (
                    <Pie
                      data={updatedIndustry}
                      options={barDataConfigByIndustry.options}
                      key={updatedIndustry.id}
                      ref={chartRef}
                      plugins={[ChartDataLabels, customLinesPlugin]} // Ensure custom lines plugin is included
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row  w-[60rem] px-4">
          <div className="pt-6 w-[40rem]">
            <p className="font-bold "> Category Wise Distribution</p>
            <p className="text-sm text-gray-600 italic py-4">
              This chart displays revenue data over different time periods, filtered by category of
              inventory.
            </p>
            <div className="flex">
              <div>
                <Menu shadow="md" width={130}>
                  <Menu.Target>
                    <Button className="secondary-button">
                      View By: {viewBy[activeView4] || 'Select'}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {list.map(({ label, value }) => (
                      <Menu.Item
                        key={value}
                        onClick={() => handleMenuItemClick4(value)}
                        className={classNames(
                          activeView4 === value && 'text-purple-450 font-medium',
                        )}
                      >
                        {label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </div>
              <div className="mx-2">
                <Menu shadow="md" width={130}>
                  <Menu.Target>
                    <Button className="secondary-button">
                      {selectedCategory ? `Category: ${selectedCategory}` : 'Select Category'}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {categoryList.map(category => (
                      <Menu.Item key={category} onClick={() => setSelectedCategory(category)}>
                        {category}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </div>
              <div>
                {filter4 && (
                  <Button onClick={handleReset4} className="mx-2 secondary-button">
                    Reset
                  </Button>
                )}
              </div>
            </div>
            {filter4 === 'customDate' && (
              <div className="flex flex-col items-start space-y-4 py-2 ">
                <DateRangeSelector
                  dateValue={[startDate1, endDate1]}
                  onChange={onDateChange4}
                  minDate={threeMonthsAgo}
                  maxDate={today}
                />
              </div>
            )}

            <div className=" my-4">
              <Bar
                ref={chartRef}
                plugins={[ChartDataLabels]}
                data={chartData4}
                options={chartOptions4}
              />
            </div>
          </div>
        </div>

        <MediaWiseReport />
      </div>
      <div className="border-2 p-5 border-black my-2">
        <p className="font-bold text-lg"> Trends </p>
        <div className="col-span-10 overflow-y-auto overflow-hidden">
          <div className="pt-6 w-[50rem] mx-10">
            <p className="font-bold "> Additional Filter Distribution</p>
            <p className="text-sm text-gray-600 italic py-4">
              This line chart displays the{' '}
              {activeView5 === 'revenue' ? 'revenue trends' : 'profitability'} over different time
              periods, filtered by specific tags.
            </p>
            <div className="flex">
              <div>
                <Menu shadow="md" width={130}>
                  <Menu.Target>
                    <Button className="mr-2 secondary-button">
                      View By: {viewBy3[activeView5] || 'Select'}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {list3.map(({ label, value }) => (
                      <Menu.Item
                        key={value}
                        onClick={() => handleMenuItemClick5(value)}
                        className={classNames(
                          activeView5 === value && 'text-purple-450 font-medium',
                        )}
                      >
                        {label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </div>
              <div>
                <Menu shadow="md" width={130}>
                  <Menu.Target>
                    <Button className="secondary-button">
                      View By: {viewBy[activeView3] || 'Select'}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {list.map(({ label, value }) => (
                      <Menu.Item
                        key={value}
                        onClick={() => handleMenuItemClick3(value)}
                        className={classNames(
                          activeView3 === value &&
                            label !== 'Reset' &&
                            'text-purple-450 font-medium',
                        )}
                      >
                        {label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </div>
              <div className="mx-2">
                <MultiSelect
                  data={options}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Select Additional Tags"
                  searchable
                  clearable
                />
              </div>
              <div>
                {filter3 && (
                  <Button onClick={handleReset3} className="mx-2 secondary-button">
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {filter3 === 'customDate' && (
              <div className="flex flex-col items-start space-y-4 py-2 ">
                <DateRangeSelector
                  dateValue={[startDate1, endDate1]}
                  onChange={onDateChange3}
                  minDate={threeMonthsAgo}
                  maxDate={today}
                />
              </div>
            )}
            <div className="my-4">
              <Line
                data={activeView5 === 'revenue' ? chartDataRevenue : chartDataProfitability}
                options={
                  activeView5 === 'revenue' ? chartOptionsRevenue : chartOptionsProfitability
                }
                ref={chartRef}
                plugins={[ChartDataLabels]}
              />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-10 border-gray-450 mx-10  h-[300px] overflow-y-auto">
            <Table
              COLUMNS={activeView5 === 'revenue' ? tableColumnsRevenue : tableColumnsProfitability}
              data={activeView5 === 'revenue' ? tableDataRevenue : tableDataProfitability}
              showPagination={false}
            />
          </div>
        </div>
        <div className="flex p-6 flex-col">
          <div>
            <div className="flex justify-between items-center">
              <p className="font-bold">Monthly Sales Distribution</p>
            </div>
            <p className="text-sm text-gray-600 italic pt-3">
              This bar chart shows the monthly revenue distribution between different clients types.
            </p>
            {isLoadingBookingData ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : (
              <div className="gap-10">
                <div className="pt-4 w-[50rem]">
                  <Bar
                    ref={chartRef}
                    data={barData}
                    options={barChartOptions}
                    plugins={[ChartDataLabels]}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="mt-10">
            <div className="flex justify-between items-center">
              <p className="font-bold">Monthly Percentage Contribution</p>
            </div>
            <p className="text-sm text-gray-600 italic pt-3">
              This chart visualizes the percentage contribution of different client types.
            </p>
            {isLoadingBookingData ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : (
              <div className="gap-10">
                <div className="pt-4 w-[50rem]">
                  <Bar
                    ref={chartRef}
                    data={percentageBarData}
                    options={stackedBarOptions}
                    plugins={[ChartDataLabels]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex p-6 flex-col ">
          <div className="flex justify-between items-center">
            <p className="font-bold"> Sales Comparison</p>
          </div>
          <p className="text-sm text-gray-600 italic pt-3">
            This bar chart shows the sales trends for selected time duration
          </p>
          {isLoadingBookingData ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <div className="">
              {salesData.length > 0 ? (
                <div className=" gap-10 ">
                  <div className="pt-4 w-[50rem]">
                    <Bar
                      ref={chartRef}
                      data={combinedChartData}
                      options={combinedChartOptions}
                      plugins={[ChartDataLabels]}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-600">No data available.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-2 p-5 border-black my-2">
        <p className="font-bold text-lg"> Operational Cost </p>
        <div className="mb-4 flex flex-col p-6">
          <p className="font-bold  ">Operational cost bifurcation</p>
          <p className="text-sm text-gray-600 italic pt-4">
            This chart displays the breakdown of operational costs by different cost types.
          </p>
          <div className="w-[600px]">
            <Doughnut
              data={doughnutChartData}
              options={doughnutChartOptions}
              height={550}
              width={600}
              ref={chartRef}
              plugins={[ChartDataLabels, customLinesPlugin]} // Register the plugin here
            />
          </div>
        </div>
        <div className="px-5">
          <div className="mb-4 flex flex-col">
            <p className="font-bold">Printing & Mounting Costs</p>
            <p className="text-sm text-gray-600 italic py-4">
              This chart compares costs for printing, mounting, reprinting, and remounting
              activities.
            </p>
          </div>

          <div className="flex w-1/3 gap-4 h-[200px] ">
            {/* Printing & Mounting Revenue Split */}
            <div className="flex gap-4 p-4 border rounded-md items-center min-h-[200px]">
              <div className="w-32">
                {isStatsLoading ? (
                  <Loader className="mx-auto" />
                ) : costData.Printing === 0 && costData.Mounting === 0 ? (
                  <p className="text-center">NA</p>
                ) : (
                  <Doughnut
                    options={config1.options}
                    data={printingMountingData}
                    ref={chartRef}
                    plugins={[ChartDataLabels, customLinesPlugin]}
                  />
                )}
              </div>
              <div>
                <div className="flex gap-8 mt-6 flex-wrap">
                  <div className="flex gap-2 items-center">
                    <div className="h-2 w-1 p-2 bg-orange-350 rounded-full" />
                    <div>
                      <p className="my-2 text-xs font-light text-slate-400">Printing</p>
                      <p className="font-bold text-md">
                        {(costData.Printing / 100000).toFixed(2) ?? 0} L
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="h-2 w-1 p-2 rounded-full bg-purple-350" />
                    <div>
                      <p className="my-2 text-xs font-light text-slate-400">Mounting</p>
                      <p className="font-bold text-md">
                        {(costData.Mounting / 100000).toFixed(2) ?? 0} L
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reprinting & Remounting Revenue Split */}
            <div className="flex gap-4 p-4 border rounded-md items-center min-h-[200px]">
              <div className="w-32">
                {isStatsLoading ? (
                  <Loader className="mx-auto" />
                ) : costData.Remounting === 0 && costData.Reprinting === 0 ? (
                  <p className="text-center">NA</p>
                ) : (
                  <Doughnut
                    options={config1.options}
                    data={reprintingRemountingData}
                    ref={chartRef}
                    plugins={[ChartDataLabels, customLinesPlugin]}
                  />
                )}
              </div>
              <div>
                <div className="flex gap-8 mt-6 flex-wrap">
                  <div className="flex gap-2 items-center">
                    <div className="h-2 w-1 p-2 bg-orange-350 rounded-full" />
                    <div>
                      <p className="my-2 text-xs font-light text-slate-400">Reprinting</p>
                      <p className="font-bold text-md">
                        {(costData.Reprinting / 100000).toFixed(2) ?? 0} L
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="h-2 w-1 p-2 rounded-full bg-purple-350" />
                    <div>
                      <p className="my-2 text-xs font-light text-slate-400">Remounting</p>
                      <p className="font-bold text-md">
                        {(costData.Remounting / 100000).toFixed(2) ?? 0} L
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-2 p-5 border-black my-2">
        <p className="font-bold text-lg"> Client Data</p>

        <div className="flex flex-col col-span-10 overflow-hidden">
          <div className="py-6 w-[50rem] ml-8">
            <p className="font-bold ">Campaign Details</p>
          </div>
        </div>
        <div className="ml-8 col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 h-[400px] overflow-auto">
          <Table
            data={sortedBookingData} // Use manually sorted data
            COLUMNS={column5}
            loading={isLoadingBookingData}
            showPagination={false}
            initialState={{
              sortBy: [
                {
                  id: 'campaign.totalPrice',
                  desc: true,
                },
              ],
            }}
          />
        </div>
        <div className="flex flex-col col-span-10 overflow-x-hidden">
          <div className="pt-10 w-[50rem] ml-8">
            <p className="font-bold ">Client Details</p>
            <p className="text-sm text-gray-600 italic py-4">
              This report shows the client details based on retention status.
            </p>
            <div className="flex">
              <div>
                <Menu shadow="md" width={130}>
                  <Menu.Target>
                    <Button className="secondary-button">
                      View By: {viewBy2[activeView2] || 'Retention Status'}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {list2.map(({ label, value }) => (
                      <Menu.Item
                        key={value}
                        onClick={() => handleMenuItemClick2(value)}
                        className={
                          activeView2 === value && label !== 'Reset'
                            ? 'text-purple-450 font-medium'
                            : ''
                        }
                      >
                        {label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </div>
              <div>
                {filter2 && (
                  <Button onClick={handleReset2} className="mx-2 secondary-button">
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="ml-8 my-5 col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 h-[400px] overflow-auto">
            <Table
              COLUMNS={tableColumns4}
              data={tableData4}
              loading={isLoadingBookingData}
              showPagination={false}
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-12 lg:col-span-10 overflow-y-auto p-5">
          <p className="font-bold">Price and Traded Margin Report</p>
          <p className="text-sm text-gray-600 italic py-4">
            This report provide insights into the pricing trends, traded prices, and margins grouped
            by cities. (Amounts in Lacs)
          </p>
          <div className="overflow-y-auto h-[400px]">
            <Table
              data={processedData || []}
              COLUMNS={columns3}
              loading={isLoadingInventoryData}
              showPagination={false}
            />
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-12 lg:col-span-10 p-5 overflow-hidden">
        <p className="font-bold ">Invoice and amount collected Report</p>
        <p className="text-sm text-gray-600 italic py-4">
          This report provide insights into the invoice raised, amount collected and outstanding by
          table, graph and chart.
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
          <InvoiceReportChart
            data={activeView1 ? groupedData1 : []}
            chartDataLabels={[ChartDataLabels]}
          />{' '}
        </div>
      </div>

      <div className="overflow-y-auto px-5 col-span-10 w-[65rem]">
        <p className="font-bold pt-10">Performance Ranking Report</p>
        <p className="text-sm text-gray-600 italic py-4">
          This report shows Performance Cards with pagination controls and a sortable, paginated
          table.
        </p>
        <PerformanceCard />
      </div>

      <div className="flex gap-4 px-5 flex-wrap">
        <div className="border rounded p-8 pr-20">
          <Image src={OngoingOrdersIcon} alt="ongoing" height={24} width={24} fit="contain" />
          <Text className="my-2" size="sm" weight="200">
            Ongoing Orders
          </Text>
          <Text weight="bold">
            {ongoingRevenue !== null && !isNaN(ongoingRevenue)
              ? `${(ongoingRevenue / 100000).toFixed(2)} L`
              : ''}
          </Text>
        </div>

        <div className="border rounded p-8 pr-20">
          <Image src={UpcomingOrdersIcon} alt="upcoming" height={24} width={24} fit="contain" />
          <Text className="my-2" size="sm" weight="200">
            Upcoming Orders
          </Text>
          <Text weight="bold">
            {upcomingRevenue !== null && !isNaN(upcomingRevenue)
              ? `${(upcomingRevenue / 100000).toFixed(2)} L`
              : ''}
          </Text>
        </div>

        <div className="border rounded p-8 pr-20">
          <Image src={CompletedOrdersIcon} alt="completed" height={24} width={24} fit="contain" />
          <Text className="my-2" size="sm" weight="200">
            Completed Orders
          </Text>
          <Text weight="bold">
            {completedRevenue !== null && !isNaN(completedRevenue)
              ? `${(completedRevenue / 100000).toFixed(2)} L`
              : ''}
          </Text>
        </div>
      </div>
      <div className="p-5">
        <div className="border rounded p-8 flex-1 w-72">
          <Image src={ProposalSentIcon} alt="folder" fit="contain" height={24} width={24} />
          <p className="my-2 text-sm">
            Total Proposals Created :{' '}
            <span className="font-bold text-[17px]">{totalProposalsCreated}</span>
          </p>

          <p className="font-bold">{totalPriceInLacs} L</p>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between gap-4 flex-wrap">
          <div className="flex gap-4 p-4 border rounded-md items-center">
            <div className="w-32">
              {isLoadingBookingData ? (
                <Loader className="mx-auto" />
              ) : (
                <Doughnut options={{ responsive: true }} data={revenueBreakupData} />
              )}
            </div>
            <div>
              <p className="font-medium">Revenue Breakup</p>
              <div className="flex gap-8 mt-6">
                <div className="flex gap-2 items-center">
                  <div className=" p-2 rounded-full bg-orange-350" />
                  <div>
                    <Text size="sm" weight="200">
                      Direct Client
                    </Text>
                    <Text weight="bolder" size="md">
                      {aggregatedData2.directclient?.toFixed(2) || 0} L
                    </Text>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 bg-purple-350 rounded-full" />
                  <div>
                    <Text size="sm" weight="200">
                      Local Agency
                    </Text>
                    <Text weight="bolder" size="md">
                      {aggregatedData2.localagency?.toFixed(2) || 0} L
                    </Text>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 bg-green-350 rounded-full" />
                  <div>
                    <Text size="sm" weight="200">
                      National Agency
                    </Text>
                    <Text weight="bolder" size="md">
                      {aggregatedData2.nationalagency?.toFixed(2) || 0} L
                    </Text>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 bg-blue-350 rounded-full" />
                  <div>
                    <Text size="sm" weight="200">
                      Government
                    </Text>
                    <Text weight="bolder" size="md">
                      {aggregatedData2.government?.toFixed(2) || 0} L
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="px-5">
        <p className="font-bold py-4">Campaigns stats report</p>
        <div className="flex w-1/3 gap-4 h-[250px] ">
          <div className="flex gap-4 p-4 border rounded-md items-center min-h-[200px]">
            <div className="w-32">
              {isStatsLoading ? (
                <Loader className="mx-auto" />
              ) : stats?.printOngoing === 0 && stats?.printCompleted === 0 ? (
                <p className="text-center">NA</p>
              ) : (
                <Doughnut options={config.options} data={printStatusData} />
              )}
            </div>
            <div>
              <p className="font-medium">Printing Status</p>
              <div className="flex gap-8 mt-6 flex-wrap">
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 bg-orange-350 rounded-full" />
                  <div>
                    <p className="my-2 text-xs font-light text-slate-400">Ongoing</p>
                    <p className="font-bold text-lg">{stats?.printOngoing ?? 0}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 rounded-full bg-purple-350" />
                  <div>
                    <p className="my-2 text-xs font-light text-slate-400">Completed</p>
                    <p className="font-bold text-lg">{stats?.printCompleted ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4 p-4 border rounded-md items-center min-h-[200px]">
            <div className="w-32">
              {isStatsLoading ? (
                <Loader className="mx-auto" />
              ) : stats?.mountOngoing === 0 && stats?.mountCompleted === 0 ? (
                <p className="text-center">NA</p>
              ) : (
                <Doughnut options={config.options} data={mountStatusData} />
              )}
            </div>
            <div>
              <p className="font-medium">Mounting Status</p>
              <div className="flex gap-8 mt-6 flex-wrap">
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 bg-orange-350 rounded-full" />
                  <div>
                    <p className="my-2 text-xs font-light text-slate-400">Ongoing</p>
                    <p className="font-bold text-lg">{stats?.mountOngoing ?? 0}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-1 p-2 rounded-full bg-purple-350" />
                  <div>
                    <p className="my-2 text-xs font-light text-slate-400">Completed</p>
                    <p className="font-bold text-lg">{stats?.mountCompleted ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default OtherNewReports;
