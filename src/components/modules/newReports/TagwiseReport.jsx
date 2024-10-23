import { useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button, MultiSelect, Text } from '@mantine/core';
import DateRangeSelector from '../../../components/DateRangeSelector';
import { useDistinctAdditionalTags } from '../../../apis/queries/inventory.queries';
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
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  LogarithmicScale,
} from 'chart.js';
import { useBookingsNew } from '../../../apis/queries/booking.queries';
import Table from '../../Table/Table';
import Table1 from '../../Table/Table1';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
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
const viewBy3 = {
  reset: '',
  revenue: 'Revenue',
  profitability: 'Profitability',
};

const list3 = [
  { label: 'Revenue', value: 'revenue' },
  { label: 'Profitability', value: 'profitability' },
];
const TagwiseReport = () => {
  const [searchParams] = useSearchParams({
    page: 1,
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: bookingData2, isLoading: isLoadingBookingData } = useBookingsNew(
    searchParams.toString(),
  );
  const chartRef = useRef(null); // Reference to the chart instance

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

  const generateYearRange = (startYear, endYear) => {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
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
  const handleMenuItemClick4 = value => {
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

  return (
    <div className="col-span-12 lg:col-span-10 border-gray-450 overflow-y-auto" id="Tagfilter_distribution">
      <div className="p-5 w-[50rem]">
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
                    onClick={() => handleMenuItemClick4(value)}
                    className={classNames(activeView5 === value && 'text-purple-450 font-medium')}
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
                      activeView3 === value && label !== 'Reset' && 'text-purple-450 font-medium',
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
            options={activeView5 === 'revenue' ? chartOptionsRevenue : chartOptionsProfitability}
            ref={chartRef}
            plugins={[ChartDataLabels]}
          />
        </div>
      </div>
      <div className="px-5 col-span-12 md:col-span-12 lg:col-span-10 border-gray-450 overflow-auto">
        <Table1
          COLUMNS={activeView5 === 'revenue' ? tableColumnsRevenue : tableColumnsProfitability}
          data={activeView5 === 'revenue' ? tableDataRevenue : tableDataProfitability}
          showPagination={false}
        />
      </div>
    </div>
  );
};

export default TagwiseReport;
