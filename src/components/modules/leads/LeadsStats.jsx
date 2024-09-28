import { Box, Image } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Title,
  BarElement,
  Tooltip,
} from 'chart.js';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import InitiateDiscussionIcon from '../../../assets/message-share.svg';
import InProgressIcon from '../../../assets/git-branch.svg';
import CompleteIcon from '../../../assets/discount-check.svg';
import LostIcon from '../../../assets/file-percent.svg';

ChartJS.register(
  CategoryScale,
  ArcElement,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Legend,
  Tooltip,
  Title,
);

const LeadsStats = ({ styles, leadStatsData, heading }) => {
  const leadsPieConfig = {
    options: {
      responsive: true,
    },
    styles: {
      backgroundColor: ['#FF900E', '#914EFB', '#4BC0C0', '#EF4444'],
      borderColor: ['#FF900E', '#914EFB', '#4BC0C0', '#EF4444'],
      borderWidth: 1,
    },
  };

  const [updatedLeadsChart, setUpdatedLeadsChart] = useState({
    id: uuidv4(),
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        ...leadsPieConfig.styles,
      },
    ],
  });

  const handleUpdatedLeadsStatsChart = useCallback(() => {
    const tempBarData = {
      labels: [],
      datasets: [
        {
          label: '',
          data: [],
          ...leadsPieConfig.styles,
        },
      ],
    };
    if (leadStatsData) {
      tempBarData.datasets[0].data[0] = leadStatsData?.stage?.filter(
        ({ _id }) => _id === 'initiateDiscussion',
      )?.[0]?.count;
      tempBarData.datasets[0].data[1] =
        leadStatsData?.stage?.filter(({ _id }) => _id === 'inProgress')?.[0]?.count || 0;
      tempBarData.datasets[0].data[2] = leadStatsData?.stage?.filter(
        ({ _id }) => _id === 'converted',
      )?.[0]?.count;
      tempBarData.datasets[0].data[3] = leadStatsData?.stage?.filter(
        ({ _id }) => _id === 'lost',
      )?.[0]?.count;

      setUpdatedLeadsChart(tempBarData);
    }
  }, [leadStatsData]);

  useEffect(() => handleUpdatedLeadsStatsChart(), [leadStatsData]);
  return (
    <div className="my-6 p-4 border border-gray-200 rounded-md font-bold w-full">
      <div className="pb-4 text-lg">{heading}</div>
      <div className="flex justify-between gap-3">
        <div className="w-full">
          <Box className="w-36">
            {updatedLeadsChart.datasets?.[0].data.every(item => item === 0 || !item) ? (
              <p className="text-center font-bold text-md my-12">NA</p>
            ) : (
              <Pie
                data={updatedLeadsChart}
                options={leadsPieConfig.options}
                key={updatedLeadsChart.id}
              />
            )}
          </Box>
        </div>
        <div
          className={classNames(
            'text-base font-semibold border border-gray-200 py-4 px-4 rounded-md w-full flex flex-col gap-2 justify-between',
          )}
        >
          <Image src={InitiateDiscussionIcon} alt="icon" width={20} />
          <div className={classNames('font-normal w-full', styles?.heading)}>
            Initiate Discussion
          </div>
          <div className={classNames('text-2xl font-bold text-orange-350', styles?.subHeading)}>
            {leadStatsData?.stage?.filter(({ _id }) => _id === 'initiateDiscussion')?.[0]?.count ||
              0}
          </div>
        </div>
        <div
          className={classNames(
            'text-base font-semibold border border-gray-200 py-4 px-4 rounded-md w-full flex flex-col gap-2 justify-between',
          )}
        >
          <Image src={InProgressIcon} alt="icon" width={20} />
          <div className={classNames('font-normal w-full', styles?.heading)}>In Progress</div>
          <div className={classNames('text-2xl font-bold text-purple-350', styles?.subHeading)}>
            {leadStatsData?.stage?.filter(({ _id }) => _id === 'inProgress')?.[0]?.count || 0}
          </div>
        </div>
        <div
          className={classNames(
            'text-base font-semibold border border-gray-200 py-4 px-4 rounded-md w-full flex flex-col gap-2 justify-between',
          )}
        >
          <Image src={CompleteIcon} alt="icon" width={20} />
          <div className={classNames('font-normal w-full', styles?.heading)}>Converted</div>
          <div className={classNames('text-2xl font-bold text-green-350', styles?.subHeading)}>
            {leadStatsData?.stage?.filter(({ _id }) => _id === 'converted')?.[0]?.count || 0}
          </div>
        </div>
        <div
          className={classNames(
            'text-base font-semibold border border-gray-200 py-4 px-4 rounded-md w-full flex flex-col gap-2 justify-between',
          )}
        >
          <Image src={LostIcon} alt="icon" width={20} />
          <div className={classNames('font-normal w-full', styles?.heading)}>Lost</div>
          <div className={classNames('text-2xl font-bold text-red-500', styles?.subHeading)}>
            {' '}
            {leadStatsData?.stage?.filter(({ _id }) => _id === 'lost')?.[0]?.count || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsStats;
