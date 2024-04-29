// random imported chart, no function now, waiting for requirements
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const PieChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      const chartData = {
        labels: ['Red', 'Blue', 'Yellow', 'Green'], // Only 4 labels
        datasets: [
          {
            data: [12, 19, 3, 5], // Corresponding data for 4 labels
            backgroundColor: ['#FF5733', '#3498DB', '#F9C62A', '#27AE60'], // Custom colors
          },
        ],
      };

      new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }, []);

  return <canvas ref={chartRef} />;
};

export default PieChart;
