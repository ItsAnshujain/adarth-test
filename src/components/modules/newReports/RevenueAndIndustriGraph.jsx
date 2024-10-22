import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button, Loader, } from '@mantine/core';
import DateRangeSelector from '../../DateRangeSelector';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
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
import { useBookingReportByRevenueGraph, useBookingRevenueByIndustry, useBookings } from '../../../apis/queries/booking.queries';
import { financialEndDate, financialStartDate, monthsInShort, serialize, timeLegend } from '../../../utils';
import ViewByFilter from '../reports/ViewByFilter';
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
dayjs.extend(quarterOfYear);

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
const RevenueAndIndustriGraph = () => {
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
 
  const [startDate, setStartDate] = useState(financialStartDate);
  const [endDate, setEndDate] = useState(financialEndDate);

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
  return (
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
  );
};

export default RevenueAndIndustriGraph;
