import { Loader } from '@mantine/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
} from 'chart.js';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { useModals } from '@mantine/modals';
import { useSearchParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import classNames from 'classnames';
import Header from '../../components/modules/reports/Header';
import { useCampaignReport, useCampaignStats } from '../../apis/queries/campaigns.queries';
import ViewByFilter from '../../components/modules/reports/ViewByFilter';
import CampaignStatsContent from '../../components/modules/reports/Campaign/CampaignStatsContent';
import CampaignPieContent from '../../components/modules/reports/Campaign/CampaignPieContent';
import {
  daysInAWeek,
  downloadPdf,
  financialEndDate,
  financialStartDate,
  monthsInShort,
  quarters,
} from '../../utils';
import { useShareReport } from '../../apis/queries/report.queries';
import modalConfig from '../../utils/modalConfig';
import ShareContent from '../../components/modules/reports/ShareContent';
import { DATE_FORMAT } from '../../utils/constants';

dayjs.extend(quarterOfYear);

ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement, Title, Legend);
const options = {
  responsive: true,
  maintainAspectRatio: false,
};

const CampaignReportsPage = () => {
  const modals = useModals();
  const [searchParams, setSearchParams] = useSearchParams({
    groupBy: 'month',
    startDate: financialStartDate,
    endDate: financialEndDate,
  });

  const share = searchParams.get('share');
  const groupBy = searchParams.get('groupBy');

  const { mutateAsync, isLoading: isDownloadLoading } = useShareReport();

  const [updatedBarData, setUpdatedBarData] = useState({
    id: uuidv4(),
    labels: monthsInShort,
    datasets: [
      {
        label: 'Upcoming',
        data: [],
        backgroundColor: '#FF900E',
      },
      {
        label: 'Ongoing',
        data: [],
        backgroundColor: '#914EFB',
      },
      {
        label: 'Completed',
        data: [],
        backgroundColor: '#28B446',
      },
    ],
  });

  const { data: stats, isLoading: isStatsLoading } = useCampaignStats();
  const {
    data: report,
    isLoading: isReportLoading,
    isSuccess,
  } = useCampaignReport(searchParams.toString());

  const handleViewBy = viewType => {
    if (viewType === 'reset' || viewType === 'year') {
      const startDate = financialStartDate;
      const endDate = financialEndDate;
      searchParams.set('startDate', startDate);
      searchParams.set('endDate', endDate);
      searchParams.set('groupBy', 'month');
      setSearchParams(searchParams);
    }
    if (viewType === 'week' || viewType === 'month') {
      const startDate = dayjs().startOf(viewType).format(DATE_FORMAT);
      const endDate = dayjs().endOf(viewType).format(DATE_FORMAT);

      searchParams.set('startDate', startDate);
      searchParams.set('endDate', endDate);
      searchParams.set(
        'groupBy',
        viewType === 'month' ? 'dayOfMonth' : viewType === 'week' ? 'dayOfWeek' : 'month',
      );
      setSearchParams(searchParams);
    }
    if (viewType === 'quarter') {
      searchParams.set('startDate', financialStartDate);
      searchParams.set('endDate', financialEndDate);
      searchParams.set('groupBy', 'quarter');
      setSearchParams(searchParams);
    }
  };

  const printStatusData = useMemo(
    () => ({
      datasets: [
        {
          // data: [stats?.printCompleted ?? 0, stats?.printOngoing ?? 0],
          data: [6, 4],
          backgroundColor: ['#914EFB', '#FF900E'],
          borderColor: ['#914EFB', '#FF900E'],
          borderWidth: 1,
        },
      ],
    }),
    [stats],
  );

  const mountStatusData = useMemo(
    () => ({
      datasets: [
        {
          // data: [stats?.mountCompleted ?? 0, stats?.mountOngoing ?? 0],
          data: [1,9],
          backgroundColor: ['#914EFB', '#FF900E'],
          borderColor: ['#914EFB', '#FF900E'],
          borderWidth: 1,
        },
      ],
    }),
    [stats],
  );

  const calculateBarData = useCallback(() => {
    if (report && report?.revenue) {
      const tempBarData = {
        labels: monthsInShort,
        datasets: [
          {
            label: 'Upcoming',
            data: [],
            backgroundColor: '#FF900E',
          },
          {
            label: 'Ongoing',
            data: [],
            backgroundColor: '#914EFB',
          },
          {
            label: 'Completed',
            data: [],
            backgroundColor: '#28B446',
          },
        ],
      };
      tempBarData.labels =
        groupBy === 'dayOfWeek'
          ? daysInAWeek
          : groupBy === 'dayOfMonth'
          ? Array.from({ length: dayjs().daysInMonth() }, (_, index) => index + 1)
          : groupBy === 'quarter'
          ? quarters
          : monthsInShort;

      report?.revenue?.forEach(item => {
        if (item?._id) {
          if (groupBy === 'dayOfMonth' || groupBy === 'dayOfWeek') {
            if (item.upcoming) {
              tempBarData.datasets[0].data[item._id - 1] = item.upcoming;
            }
            if (item.ongoing) {
              tempBarData.datasets[1].data[item._id - 1] = item.ongoing;
            }
            if (item.completed) {
              tempBarData.datasets[2].data[item._id - 1] = item.completed;
            }
          } else if (groupBy === 'quarter') {
            if (dayjs().quarter() === 1) {
              if (item.upcoming) {
                tempBarData.datasets[0].data[item._id + 3] = item.upcoming;
              }
              if (item.ongoing) {
                tempBarData.datasets[1].data[item._id + 3] = item.ongoing;
              }
              if (item.completed) {
                tempBarData.datasets[2].data[item._id + 3] = item.completed;
              }
            } else if (dayjs().quarter() === 4) {
              if (item.upcoming) {
                tempBarData.datasets[0].data[item._id - 3] = item.upcoming;
              }
              if (item.ongoing) {
                tempBarData.datasets[1].data[item._id - 3] = item.ongoing;
              }
              if (item.completed) {
                tempBarData.datasets[2].data[item._id - 3] = item.completed;
              }
            } else {
              if (item.upcoming) {
                tempBarData.datasets[0].data[item._id - 1] = item.upcoming;
              }
              if (item.ongoing) {
                tempBarData.datasets[1].data[item._id - 1] = item.ongoing;
              }
              if (item.completed) {
                tempBarData.datasets[2].data[item._id - 1] = item.completed;
              }
            }
          } else if (item._id < 4) {
            // For financial year. if the month is less than 4 then it will be in the next year
            if (item.upcoming) {
              tempBarData.datasets[0].data[item._id + 8] = item.upcoming;
            }
            if (item.ongoing) {
              tempBarData.datasets[1].data[item._id + 8] = item.ongoing;
            }
            if (item.completed) {
              tempBarData.datasets[2].data[item._id + 8] = item.completed;
            }
          } else {
            // For financial year. if the month is greater than 4 then it will be in the same year
            if (item.upcoming) {
              tempBarData.datasets[0].data[item._id - 4] = item.upcoming;
            }
            if (item.ongoing) {
              tempBarData.datasets[1].data[item._id - 4] = item.ongoing;
            }
            if (item.completed) {
              tempBarData.datasets[2].data[item._id - 4] = item.completed;
            }
          }
        }
      });

      setUpdatedBarData(tempBarData);
    }
  }, [report]);

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

  useEffect(() => {
    calculateBarData();
  }, [report, isSuccess]);

  return (
    <div
      className={classNames(
        'overflow-y-auto px-5',
        share !== 'report' ? 'col-span-10 ' : 'col-span-12',
      )}
      id="campaign_report_pdf"
    >
      <Header
        shareType={share}
        text="Campaign Reports"
        onClickDownloadPdf={handleDownloadPdf}
        onClickSharePdf={toggleShareOptions}
        isDownloadLoading={isDownloadLoading}
      />

      <div id="campaign-pdf">
        <CampaignStatsContent stats={stats} />
        <div className="flex gap-4">
          <div className="w-2/3">
            <div className="flex justify-between items-center">
              <p className="font-bold tracking-wide">Campaign Report</p>
              <div className="border rounded px-4 py-2 flex my-4">
                <p className="my-2 text-sm font-light text-slate-400 mr-5">
                  Total Proposals Sent:{' '}
                  <span className="font-bold">{report?.proposal?.sent ?? 0}</span>
                </p>
                <p className="my-2 text-sm font-light text-slate-400">
                  Total Proposals Created:{' '}
                  <span className="font-bold">{report?.proposal?.created ?? 0}</span>
                </p>
              </div>
              {share !== 'report' ? <ViewByFilter handleViewBy={handleViewBy} /> : null}
            </div>

            <div>
              {isReportLoading ? (
                <Loader className="mx-auto" mt={80} />
              ) : (
                <div className="max-h-[350px]">
                  <Bar
                    options={options}
                    data={updatedBarData}
                    key={updatedBarData.id}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
          <CampaignPieContent
            isStatsLoading={isStatsLoading}
            printStatusData={printStatusData}
            mountStatusData={mountStatusData}
            stats={stats}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignReportsPage;
