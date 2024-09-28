import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

const InvoiceReportChart = ({ data }) => {
  const chartData = {
    labels: data.length > 0 ? data.map(item => item.month) : ['No Data'], // X-axis labels (Months)
    datasets: data.length > 0 ? [
      {
        type: 'line',
        label: 'Invoice Raised',
        data: data.map(item => item.outStandingInvoice), // Convert to lac
        borderColor: '#FF900E',
        backgroundColor: '#FF900E',
        yAxisID: 'y1',
        tension: 0.3,
        fill: false,
      },
      {
        type: 'line',
        label: 'Amount Collected',
        data: data.map(item => item.totalPayment), // Convert to lac
        borderColor: '#2938F7',
        backgroundColor: '#2938F7',
        yAxisID: 'y1',
        tension: 0.3,
        fill: false,
      },
      {
        type: 'bar',
        label: 'Outstanding',
        data: data.map(item => item.outstandingAmount), // Convert to lac
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        yAxisID: 'y2',
      },
    ] : [], // Empty datasets when no data
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
      y1: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Amount (lac)',
        },
        ticks: {
          callback: value => `${value} L`,
          beginAtZero: true, // y-axis starts from 0
        },
      },
      y2: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Outstanding (lac)',
        },
        ticks: {
          callback: value => `${value} L`,
          beginAtZero: true, // y-axis starts from 0
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: data.length === 0 ? 'No Data Available' : 'Invoice Raised vs. Amount Collected vs. Outstanding',
      },
    },
  };

  return <Chart type="bar" data={chartData} options={chartOptions} />;
};

export default InvoiceReportChart;
