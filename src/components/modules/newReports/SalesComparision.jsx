import { useMemo, useRef, useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { Loader } from '@mantine/core';
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
import { useBookings, useBookingsNew } from '../../../apis/queries/booking.queries';
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
const SalesComparision = () => {
  const chartRef = useRef(null); // Reference to the chart instance
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
  return (
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
  );
};

export default SalesComparision;
