import { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
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
} from 'chart.js';
import { Loader } from 'react-feather';
import { useBookings } from '../../apis/queries/booking.queries';
import { useSearchParams } from 'react-router-dom';
import { monthsInShort } from '../../utils';

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
);

const SalesReport = () => {
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
          borderWidth: 0.5, // Reduce bar border width to avoid obscuring the line
          type: 'bar',
          yAxisID: 'y',
          order: 1,
        })),
        {
          label: 'Trend',
          data: trendLineData,
          borderColor: '#EF4444',
          fill: false,
          tension: 0.1, // Smoother curve
          pointBackgroundColor: '#EF4444',
          type: 'line',
          yAxisID: 'y1',
          borderWidth: 2, // Increase border width for better visibility
          order: 3, // Increase the order to ensure it stays above the bars
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

  return (
    <div className="flex p-6 flex-col w-[80rem] overflow-hidden overflow-y-auto">
      <div className="flex justify-between items-center">
        <p className="font-bold">Sales Report</p>
      </div>
      <p className="text-sm text-gray-600 italic pt-3">
        This chart displays total sales over the past three years with a trend line showing the
        average sales.
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
  );
};

export default SalesReport;
