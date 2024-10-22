import { useMemo, useRef} from 'react';
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
} from 'chart.js';
import { useFetchOperationalCostData } from '../../../apis/queries/operationalCost.queries';
import { Loader } from 'react-feather';
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
const PrintingMountingCosts = () => {
  const chartRef = useRef(null); // Reference to the chart instance
  
  const { data: operationalCostData, isLoading: isStatsLoading } = useFetchOperationalCostData();

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
  return (
    <div className="px-5">
    <div className="mb-4 flex flex-col">
      <p className="font-bold">Printing & Mounting Costs</p>
      <p className="text-sm text-gray-600 italic py-4">
        This chart compares costs for printing, mounting, reprinting, and remounting
        activities.
      </p>
    </div>

    <div className="flex w-1/3 gap-4 h-[200px] ">
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
  );
};

export default PrintingMountingCosts;
