import React, { useRef, useEffect, useContext } from 'react';
import Chart from 'chart.js/auto';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

const BarChart = () => {
  const socket = useContext(SocketContext);
  const { resetValue, showRebalancing, selectedZone } = useContext(AppContext);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null); // Reference to the Chart instance
  let barChartdata = [];

  // chart settings
  let chartConfig = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: ['Total Undersupplied Amount'],
          data: barChartdata,
          // empty array, will push colors in when updating chart data
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          reverse: true, // Reverse the x-axis direction
          ticks: {
            color: '#FAF0E6',
            callback: function (value, index, values) {
              if (chartInstanceRef.current) {
                return chartInstanceRef.current.data.labels[value];
              }
            },
          },
          grid: {
            color: '#7A7671',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#FAF0E6',
          },
          grid: {
            color: '#3B3B3B',
          },
        },
      },
    },
  };

  // reset function
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, chartConfig);
  }, [resetValue]);

  // highest demand value update
  const updateHighestDemand = chart => {
    const highestValue = Math.max(...barChartdata);

    if (highestValue > 0) {
      const highestIndex = barChartdata.findIndex(element => element === highestValue);

      // Add the highest value label annotation
      chart.options.plugins.annotation.annotations.highestValueLabel = {
        type: 'line',
        xMin: highestIndex,
        xMax: highestIndex,
        yMin: highestValue,
        yMax: highestValue,
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 0,
        label: {
          enabled: true,
          display: true,
          content: `Highest Value: ${highestValue}`,
          backgroundColor: 'rgba(0, 220, 255, 0.2)',
          color: '#FAF0E6',
        },
      };
    }
  };

  // lowest demand value update
  const updateLowestDemand = chart => {
    const lowestValue = Math.min(...barChartdata);

    const lowestIndex = barChartdata.findIndex(element => element === lowestValue);

    // Add the lowest value label annotation
    chart.options.plugins.annotation.annotations.lowestValueLabel = {
      type: 'line',
      xMin: lowestIndex,
      xMax: lowestIndex,
      yMin: lowestValue + 1,
      yMax: lowestValue,
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 0,
      label: {
        enabled: true,
        display: true,
        content: `Lowest Value: ${lowestValue}`,
        backgroundColor: 'rgba(0, 220, 255, 0.2)',
        color: '#FAF0E6',
      },
    };
  };

  // update data in chart
  const updateChartData = (chart, msg) => {
    if (selectedZone !== 0) {
      const zoneAmount = msg[selectedZone];
      chart.data.datasets[0].data.unshift(zoneAmount);
    } else {
      const negativeSum = Object.values(msg).reduce((sum, value) => (value < 0 ? sum + value : sum), 0);
      // Add the new value to the beginning of the data array
      chart.data.datasets[0].data.unshift(negativeSum);
    }

    // function to push color of bar in based on whether it is rebalancing or wait policy
    if (showRebalancing) {
      chart.data.datasets[0].backgroundColor.unshift('rgba(245, 45, 15, 0.2)');
      chart.data.datasets[0].borderColor.unshift('rgba(245, 45, 15, 0.2)');
    } else {
      chart.data.datasets[0].backgroundColor.unshift('rgba(245, 45, 15, 0.4)');
      chart.data.datasets[0].borderColor.unshift('rgba(245, 45, 15, 0.4)');
    }

    // Keep only the latest 24 data points
    if (chart.data.datasets[0].data.length > 25) {
      chart.data.datasets[0].data.pop();
      chart.data.labels.pop();
      chart.data.datasets[0].backgroundColor.pop();
      chart.data.datasets[0].borderColor.pop();
    }

    chart.data.labels.unshift(msg.date_time.split(' ')[1]); // Update the x-axis label
  };

  // wrapper function to wrap above functions
  const updateAll = msg => {
    const chart = chartInstanceRef.current;
    updateHighestDemand(chart);
    updateLowestDemand(chart);
    updateChartData(chart, msg);
    chart.update();
  };

  // main hook to listen to socket and trigger updates
  useEffect(() => {
    if (showRebalancing) {
      socket.on('rebalancing_data', updateAll);
    } else {
      socket.on('demand_gap_data', updateAll);
    }

    return () => {
      socket.off('rebalancing_data', updateAll);
      socket.off('demand_gap_data', updateAll);
    };
  }, [resetValue, showRebalancing, selectedZone]);

  return <canvas ref={chartRef} />;
};

export default BarChart;
