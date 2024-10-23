import { useMemo, useRef, useState, useEffect } from 'react';
import {  Doughnut } from 'react-chartjs-2';
import dayjs from 'dayjs';
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
import { useFetchOperationalCostData } from '../../../apis/queries/operationalCost.queries';
import { useFetchMasters } from '../../../apis/queries/masters.queries';
import { serialize } from '../../../utils';
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
const OperationalCosts = () => {
  const chartRef = useRef(null); // Reference to the chart instance
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
  return (
    <div id='Operational_costs'>
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
    </div>
  );
};

export default OperationalCosts;
