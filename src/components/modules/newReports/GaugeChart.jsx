import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const drawNeedlePlugin = {
  id: 'drawNeedle',
  afterDatasetDraw(chart, args, options) {
    const { ctx, data, chartArea: { width, height }, } = chart;
    const dataset = data.datasets[0];

    // Validate needleValue
    const needleValue = options.needleValue ?? 0; // Default to 0 if not provided
    const dataTotal = dataset.data.reduce((a, b) => a + b, 0); // Total of the dataset values
    const angle = (Math.PI + (Math.PI * (needleValue / 100))); // Based on percentage

    const cx = width / 2;
    const cy = chart._metasets[0].data[0].y;

    // Draw the needle
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(height / 2.5, 0);
    ctx.lineTo(0, 2);
    ctx.fillStyle = '#444';
    ctx.fill();
    ctx.restore();

    // Draw the needle center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#444';
    ctx.fill();
    ctx.restore();

    // Draw a horizontal line from 0 to 100% on the x-axis
    ctx.beginPath();
    ctx.moveTo(0, cy); // Start from 0 on the x-axis
    ctx.lineTo(width, cy); // End at the full width of the chart
    ctx.strokeStyle = '#000'; // Line color
    ctx.lineWidth = 1; // Line thickness
    ctx.stroke();

    // Draw text on the left side (start), below the x-axis
    const leftText = '0'; // Left text (start)
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText(leftText, 10, cy + 20); // Position text below the x-axis

    // Draw text on the right side (end), below the x-axis
    const rightText = options.rightText ?? `${dataTotal}`; // Right text (end), default to total amount
    ctx.fillText(rightText, width - ctx.measureText(rightText).width - 10, cy + 20); // Position text below the x-axis
  },
};

const GaugeChart = ({ invoiceRaised, amountCollected }) => {
  const collectedPercentage = invoiceRaised > 0 ? (amountCollected / invoiceRaised) * 100 : 0;
  const remainingPercentage = 100 - collectedPercentage;

  const data = {
    labels: ["Amount collected", "Invoice Raised"],
    datasets: [
      {
        data: [collectedPercentage, remainingPercentage], // Collected and remaining scale
        backgroundColor: ['#914EFB', '#E0E0E0'], // Adjust the colors accordingly
        borderWidth: 0,
        circumference: 180, // Half-circle
        rotation: -90, // Start at the top
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: '80%', // Adjust the inner radius
    circumference: 180, // Half-circle
    rotation: -90, // Start from the bottom center
    plugins: {
      tooltip: {
        enabled: true, // Enable tooltips on hover
        callbacks: {
          label: (tooltipItem) => {
            // Show actual amount instead of percentage
            const label = tooltipItem.label;
            const value = tooltipItem.raw;
            if (label === "Amount collected") {
              return `Amount Collected: ${amountCollected.toFixed(2)}`;
            } else {
              return `Invoice Raised: ${invoiceRaised.toFixed(2)}`;
            }
          },
        },
      },
      drawNeedle: {
        needleValue: collectedPercentage, // Needle shows the collected percentage
        rightText: `${invoiceRaised.toFixed(2)}`, // Right end side shows the total invoice raised amount
      },
    },
  };

  return (
    <div style={{ width: '300px', height: '150px', marginInline:"22rem" , marginTop:"1rem" }}>
      <Doughnut
        data={data}
        options={options}
        plugins={[drawNeedlePlugin]} // Only apply the needle plugin to this chart
      />
      <div style={{ textAlign: 'center', marginTop: '-30px' }}>
        <strong>{collectedPercentage.toFixed(2)}%</strong> Amount Collected
      </div>
    </div>
  );
};

export default GaugeChart;
