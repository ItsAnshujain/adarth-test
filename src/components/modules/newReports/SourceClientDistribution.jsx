import { useMemo, useRef, useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
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
import { useBookingsNew, useUserSalesByUserId } from '../../../apis/queries/booking.queries';
import { financialEndDate, financialStartDate, monthsInShort } from '../../../utils';
import useUserStore from '../../../store/user.store';
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
const SourceClientDistribution = () => {
  const [searchParams] = useSearchParams({
    page: 1,
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const userId = useUserStore(state => state.id);
  const userSales = useUserSalesByUserId({
    startDate: financialStartDate,
    endDate: financialEndDate,
    userId,
  });

  const chartRef = useRef(null); // Reference to the chart instance

  const { data: bookingData2, isLoading: isLoadingBookingData } = useBookingsNew(
    searchParams.toString(),
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
  const showOwnSites = dummyStats.ownsite > 0;
  const showTradedSites = dummyStats.tradedsite > 0;
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
  return (
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
  );
};

export default SourceClientDistribution;
