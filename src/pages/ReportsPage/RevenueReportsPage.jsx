import { useCallback, useEffect, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Button, Loader } from '@mantine/core';
import { ChevronDown } from 'react-feather';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import classNames from 'classnames';
import { useModals } from '@mantine/modals';
import Header from '../../components/modules/reports/Header';
import RevenueFilter from '../../components/modules/reports/RevenueFilter';
import {
  useBookingReportByRevenueStats,
  useBookingReportByRevenueGraph,
  useBookingRevenueByIndustry,
  useBookingRevenueByLocation,
} from '../../apis/queries/booking.queries';
import {
  daysInAWeek,
  downloadPdf,
  financialEndDate,
  financialStartDate,
  monthsInShort,
  quarters,
  serialize,
  timeLegend,
} from '../../utils';
import RevenueStatsContent from '../../components/modules/reports/Revenue/RevenueStatsContent';
import ViewByFilter from '../../components/modules/reports/ViewByFilter';
import { useShareReport } from '../../apis/queries/report.queries';
import modalConfig from '../../utils/modalConfig';
import ShareContent from '../../components/modules/reports/ShareContent';
import { DATE_FORMAT } from '../../utils/constants';
import { useLeadAgencyStats } from '../../apis/queries/leads.queries';

dayjs.extend(quarterOfYear);

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Title,
  Legend,
);

const barDataConfigByLocation = {
  options: {
    responsive: true,
    maintainAspectRatio: false,
  },
  styles: {
    backgroundColor: '#914EFB',
    cubicInterpolationMode: 'monotone',
  },
};

const barDataConfigByIndustry = {
  options: {
    responsive: true,
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

const options = {
  responsive: true,
  maintainAspectRatio: false,
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

const RevenueReportsPage = () => {
  const modals = useModals();
  const [searchParams, setSearchParams] = useSearchParams({
    startDate: financialStartDate,
    endDate: financialEndDate,
    by: 'city',
    groupBy: 'month',
  });

  const { mutateAsync, isLoading: isDownloadLoading } = useShareReport();

  const share = searchParams.get('share');
  const groupBy = searchParams.get('groupBy');
  const by = searchParams.get('by');

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

  const [updatedLocation, setUpdatedLocation] = useState({
    id: uuidv4(),
    labels: [],
    datasets: [
      {
        label: 'City or State',
        data: [],
        ...barDataConfigByLocation.styles,
      },
    ],
  });

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

  const [showFilter, setShowFilter] = useState(false);
  const toggleFilter = () => setShowFilter(!showFilter);

  const removeUnwantedQueries = removeArr => {
    const params = [...searchParams];
    let updatedParams = params.filter(elem => !removeArr.includes(elem[0]));
    updatedParams = Object.fromEntries(updatedParams);
    return serialize(updatedParams);
  };

  const { data: revenueData } = useBookingReportByRevenueStats();
  const { data: leadStats } = useLeadAgencyStats(
    serialize({
      from: financialStartDate,
      to: financialEndDate,
    }),
  );

  const {
    data: revenueGraphData,
    isLoading: isRevenueGraphLoading,
    isSuccess,
  } = useBookingReportByRevenueGraph(removeUnwantedQueries(['by']));

  const { data: revenueDataByLocation, isLoading: isByLocationLoading } =
    useBookingRevenueByLocation(removeUnwantedQueries(['groupBy']));
  const { data: revenueDataByIndustry, isLoading: isByIndustryLoading } =
    useBookingRevenueByIndustry(removeUnwantedQueries(['groupBy', 'by']));

  const handleRevenueGraphViewBy = viewType => {
    if (viewType === 'reset' || viewType === 'year') {
      const startDate = financialStartDate;
      const endDate = financialEndDate;
      searchParams.set('startDate', startDate);
      searchParams.set('endDate', endDate);
      searchParams.set('by', by);
      searchParams.set('groupBy', 'month');
      setSearchParams(searchParams);
    }

    if (viewType === 'week' || viewType === 'month') {
      const startDate = dayjs().startOf(viewType).format(DATE_FORMAT);
      const endDate = dayjs().endOf(viewType).format(DATE_FORMAT);

      searchParams.set('startDate', startDate);
      searchParams.set('endDate', endDate);
      searchParams.set('by', by);
      searchParams.set(
        'groupBy',
        viewType === 'month' ? 'dayOfMonth' : viewType === 'week' ? 'dayOfWeek' : 'month',
      );
      setSearchParams(searchParams);
    }
    if (viewType === 'quarter') {
      searchParams.set('startDate', financialStartDate);
      searchParams.set('endDate', financialEndDate);
      searchParams.set('by', by);
      searchParams.set('groupBy', 'quarter');
      setSearchParams(searchParams);
    }
  };

  const toggleShareOptions = () => {
    modals.openContextModal('basic', {
      title: 'Share via:',
      innerProps: {
        modalBody: <ShareContent />,
      },
      ...modalConfig,
    });
  };

  const handleDownloadPdf = async () => {
    const activeUrl = new URL(window.location.href);
    activeUrl.searchParams.append('share', 'report');

    await mutateAsync(
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

  const handleUpdateRevenueGraph = useCallback(() => {
    if (revenueGraphData) {
      const tempData = {
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
      };
      tempData.labels =
        groupBy === 'dayOfWeek'
          ? daysInAWeek
          : groupBy === 'dayOfMonth'
          ? Array.from({ length: dayjs().daysInMonth() }, (_, index) => index + 1)
          : groupBy === 'quarter'
          ? quarters
          : monthsInShort;

      tempData.datasets[0].data = Array.from({ length: dayjs().daysInMonth() }, () => 0);
      revenueGraphData?.forEach(item => {
        if (Number(item._id)) {
          if (groupBy === 'dayOfMonth' || groupBy === 'dayOfWeek') {
            tempData.datasets[0].data[Number(item._id) - 1] = Number(item.total).toFixed(2) || 0;
          } else if (groupBy === 'quarter') {
            if (dayjs().quarter() === 1 && Number(item._id) === 1) {
              tempData.datasets[0].data[Number(item._id) + 3] = Number(item.total).toFixed(2) || 0;
            } else if (dayjs().quarter() === 4 && Number(item._id) === 4) {
              tempData.datasets[0].data[Number(item._id) - 3] = Number(item.total).toFixed(2) || 0;
            } else {
              tempData.datasets[0].data[Number(item._id) - 1] = Number(item.total).toFixed(2) || 0;
            }
          } else if (Number(item._id) < 4) {
            // For financial year. if the month is less than 4 then it will be in the next year
            tempData.datasets[0].data[Number(item._id) + 8] = Number(item.total).toFixed(2) || 0;
          } else {
            // For financial year. if the month is greater than 4 then it will be in the same year
            tempData.datasets[0].data[Number(item._id) - 4] = Number(item.total).toFixed(2) || 0;
          }
        }
      });

      setUpdatedRevenueGraph(tempData);
    }
  }, [revenueGraphData]);

  const handleUpdatedReveueByLocation = useCallback(() => {
    const tempBarData = {
      labels: [],
      datasets: [
        {
          label: 'City or State',
          data: [],
          ...barDataConfigByLocation.styles,
        },
      ],
    };
    if (revenueDataByLocation) {
      revenueDataByLocation?.forEach((item, index) => {
        tempBarData.labels[index] = item?._id;
        tempBarData.datasets[0].data[index] = item?.total;
      });
      setUpdatedLocation(tempBarData);
    }
  }, [revenueDataByLocation]);

  const handleUpdatedReveueByIndustry = useCallback(() => {
    const tempBarData = {
      labels: [],
      datasets: [
        {
          label: '',
          data: [],
          ...barDataConfigByIndustry.styles,
        },
      ],
    };
    if (revenueDataByIndustry) {
      revenueDataByIndustry?.forEach((item, index) => {
        tempBarData.labels[index] = item?._id;
        tempBarData.datasets[0].data[index] = item?.total;
      });
      setUpdatedIndustry(tempBarData);
    }
  }, [revenueDataByIndustry]);

  useEffect(() => {
    handleUpdateRevenueGraph();
  }, [revenueGraphData, isSuccess]);

  useEffect(() => {
    handleUpdatedReveueByLocation();
  }, [revenueDataByLocation]);

  useEffect(() => {
    handleUpdatedReveueByIndustry();
  }, [revenueDataByIndustry]);

  return (
    <div
      className={classNames(
        'overflow-y-auto px-5',
        share !== 'report' ? 'col-span-10 ' : 'col-span-12',
      )}
    >
      <Header
        shareType={share}
        text="Revenue Reports"
        onClickDownloadPdf={handleDownloadPdf}
        onClickSharePdf={toggleShareOptions}
        isDownloadLoading={isDownloadLoading}
      />

      <div className="my-5" id="revenue-pdf">
        <RevenueStatsContent revenueData={revenueData} leadStatsData={leadStats} />
        {share !== 'report' ? (
          <div className="h-[60px] border-b border-t my-5 border-gray-450 flex justify-end items-center">
            <ViewByFilter handleViewBy={handleRevenueGraphViewBy} />
          </div>
        ) : null}
        <div className="flex gap-8">
          <div className="w-[70%] flex flex-col justify-between min-h-[300px]">
            <div className="flex justify-between items-center">
              <p className="font-bold">Revenue Graph</p>
            </div>
            {isRevenueGraphLoading ? (
              <Loader className="m-auto" />
            ) : (
              <div className="flex flex-col pl-7 relative">
                <p className="transform rotate-[-90deg] absolute left-[-38px] top-[40%] text-sm">
                  Amount in INR &gt;
                </p>
                <div className="max-h-[350px]">
                  <Line
                    data={updatedReveueGraph}
                    options={options}
                    key={updatedReveueGraph.id}
                    className="w-full"
                  />
                </div>
                <p className="text-center text-sm">{timeLegend[groupBy]} &gt;</p>
              </div>
            )}
          </div>
          <div className="w-[30%] flex flex-col">
            <div className="flex justify-between items-start">
              <p className="font-bold">Industry wise revenue graph</p>
            </div>
            <div className="w-80 m-auto">
              {isByIndustryLoading ? (
                <Loader className="mx-auto" />
              ) : !updatedIndustry.datasets[0].data.length ? (
                <p className="text-center">NA</p>
              ) : (
                <Pie
                  data={updatedIndustry}
                  options={barDataConfigByIndustry.options}
                  key={updatedIndustry.id}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex justify-between items-center">
            <p className="font-bold">City Or State</p>
            <div className="flex justify-around">
              <div className="mx-2">
                {share !== 'report' ? (
                  <Button onClick={toggleFilter} variant="default" className="font-medium">
                    <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
                  </Button>
                ) : null}
                {showFilter && (
                  <RevenueFilter isOpened={showFilter} setShowFilter={setShowFilter} />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col pl-7 relative">
            <p className="transform rotate-[-90deg] absolute left-[-15px] top-[40%]">Total &gt;</p>
            {isByLocationLoading ? (
              <Loader className="mx-auto my-10" />
            ) : (
              <div className="max-h-[350px]">
                <Bar
                  data={updatedLocation}
                  options={barDataConfigByLocation.options}
                  key={updatedLocation.id}
                  className="w-full"
                />
              </div>
            )}
            <p className="text-center capitalize">{searchParams.get('by')} &gt;</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReportsPage;
