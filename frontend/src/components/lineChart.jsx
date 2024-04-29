// line chart component, used to track predicted and actual demand data
import React, { useRef, useEffect, useContext } from 'react';
import Chart from 'chart.js/auto';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

const LineChart = () => {
  const socket = useContext(SocketContext);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null); // Reference to the Chart instance
  const { resetValue, selectedZone } = useContext(AppContext);

  // chart settings
  let chartConfig = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        // setting 4 labels
        {
          label: 'Predicted Demand',
          backgroundColor: '#FCB134',
          borderColor: '#FCB134',
        },
        {
          label: 'True Demand',
          // if true demand is in prediction horizon, will not appear
          // perform operation twice, 1 for background 1 for border
          backgroundColor: context => {
            const chart = context.chart;
            const { ctx, chartArea, scales } = chart;
            if (!chartArea) {
              return null;
            }
            return setBlank(ctx, chartArea, scales);
          },
          borderColor: context => {
            const chart = context.chart;
            const { ctx, chartArea, scales } = chart;
            if (!chartArea) {
              return null;
            }
            return setBlank(ctx, chartArea, scales);
          },
        },
        {
          label: 'Upper Bound',
          type: 'line',
          borderColor: 'transparent',
          pointRadius: 0,
          fill: '0',
          yAxisID: 'y',
          xAxisID: 'x',
          backgroundColor: 'rgba(227, 158, 48, 0.4)',
        },
        {
          label: 'Lower Bound',
          type: 'line',
          borderColor: 'transparent',
          pointRadius: 0,
          fill: '0',
          yAxisID: 'y',
          xAxisID: 'x',
          backgroundColor: 'rgba(227, 158, 48, 0.4)',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // axis settings
      scales: {
        x: {
          type: 'linear',
          ticks: {
            color: '#FAF0E6',
            autoSkip: false,
            // controls interval between steps, set to 2 for clarity of chart
            stepSize: 2,
            steps: 27,
            callback: function (value, index, values) {
              if (chartInstanceRef.current) {
                return chartInstanceRef.current.data.labels[value];
              }
            },
          },
          min: -27,
          max: 0,
          grid: {
            color: '#7A7671',
            drawTicks: true,
          },
        },
        y: {
          title: {
            display: true,
            text: 'Demand',
            color: '#FAF0E6',
          },
          ticks: {
            color: '#FAF0E6',
          },
          grid: {
            color: '#7A7671',
          },
        },
      },
      // addons
      plugins: {
        // allows changing of legend color
        legend: {
          labels: {
            color: '#FAF0E6',
          },
        },
        // used for prediction horizon box and highest demand value line
        // set as null here just to establish they exist, actual settings and values are in updateChart above
        annotation: {
          annotations: {
            PredictionHorizon: null,
            HighestTrueDemand: null,
          },
        },
      },
    },
  };

  // function to set true demand line to blank when in prediction horizon
  function setBlank(ctx, chartArea) {
    const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    // from 0 to 0.89 line will be blue
    gradientBg.addColorStop(0, '#00DCFF');
    gradientBg.addColorStop(0.89, '#00DCFF');
    // 0.89 to 1 will be transarent
    gradientBg.addColorStop(0.89, 'rgba(0, 0, 0, 0)');
    gradientBg.addColorStop(1, 'rgba(0, 0, 0, 0)');

    return gradientBg;
  }

  // reset function
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, chartConfig);
  }, [resetValue]);

  // delete old data from dataset when zone changes
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (selectedZone !== 0 && chart) {
      // Clear data from all datasets
      chart.data.datasets.forEach(dataset => {
        dataset.data = [];
      });

      // update annotation and highestDemand
      if (
        chart.options.plugins.annotation.annotations.PredictionHorizon &&
        chart.options.plugins.annotation.annotations.HighestTrueDemand
      ) {
        chart.options.plugins.annotation.annotations.PredictionHorizon.yMin = 0;
        chart.options.plugins.annotation.annotations.PredictionHorizon.yMax = 100;
        chart.options.plugins.annotation.annotations.HighestTrueDemand.yMin = 0;
        chart.options.plugins.annotation.annotations.HighestTrueDemand.yMax = 0;
      }

      // Update the chart
      chart.update();
    }
  }, [selectedZone]);

  // annotation update
  const updateAnnotation = chart => {
    const xAxisMax = chart.scales['x'].max;

    chart.options.plugins.annotation.annotations.PredictionHorizon = {
      type: 'box',
      xMin: xAxisMax - 2,
      xMax: xAxisMax + 1,
      yMin: chart.scales.y.min,
      yMax: chart.scales.y.max,
      drawTime: 'afterDraw',
      borderWidth: 0,
      backgroundColor: 'rgba(252, 177, 52, 0.1)',
      // label: {
      //   enabled: true,
      //   display: true,
      //   content: 'Prediction Horizon',
      //   position: { x: '0%', y: '0%' },
      //   backgroundColor: '#FAF0E6',
      //   color: '#FAF0E6',
      // },
    };
  };

  // highest demand value update
  const updateHighestDemand = chart => {
    // finding highest point using algorithm
    const trueDemandData = chart.data.datasets[1].data;
    const recentData = trueDemandData.slice(-29); // Get the last 29 elements

    const highestIndex = recentData.reduce(
      (maxIndex, data, currentIndex) => (data.y > recentData[maxIndex].y ? currentIndex : maxIndex),
      0
    );

    // Since we're using the last 27 elements, we need to map the highestIndex back to the original array
    const highestIndexInOriginalData = trueDemandData.findIndex(
      data => data.x === recentData[highestIndex].x && data.y === recentData[highestIndex].y
    );

    // setting highest value to red
    chart.data.datasets[1].pointBackgroundColor = Array(trueDemandData.length).fill('#00DCFF');
    chart.data.datasets[1].pointBackgroundColor[highestIndexInOriginalData] = '#FF0000';
    chart.data.datasets[1].pointRadius = Array(trueDemandData.length).fill(3);
    chart.data.datasets[1].pointRadius[highestIndexInOriginalData] = 6;

    // due to Chart.js limitations, can't make tooltip show up by itself
    // workaround: create colorless line with label to show highest value
    if (trueDemandData[highestIndexInOriginalData]?.y) {
      const highestTrueDemand = trueDemandData[highestIndexInOriginalData].y;
      chart.options.plugins.annotation.annotations.HighestTrueDemand = {
        type: 'line',
        xMin: trueDemandData[highestIndexInOriginalData].x,
        xMax: trueDemandData[highestIndexInOriginalData].x,
        yMin: chart.scales.y.max * 0.9,
        yMax: chart.scales.y.max,
        drawTime: 'afterDraw',
        borderWidth: 0,
        borderColor: '#00DCFF',
        label: {
          enabled: true,
          display: true,
          content: `Highest True Demand: ${highestTrueDemand}`,
          position: { x: 'center', y: 0 },
          backgroundColor: 'rgba(0, 220, 255, 0.2)',
          color: '#FAF0E6',
        },
      };
    }
  };

  // update data in chart
  const updateChartData = (chart, msg) => {
    const xAxisMax = chart.scales['x'].max;
    const predictionArea = xAxisMax - 3;

    const xnow = chart.data.labels.length;
    const trueDemand = msg.actual_total_demand;
    const predictedDemand = msg.predicted_total_demand;
    const predictedTimestamp = msg.predicted_timestamp.split(' ')[1];

    chart.data.labels.push(predictedTimestamp); // Update the x-axis label

    const { min, max } = chart.scales.y;
    const boundLimits = (max - min) * 0.1;
    const upperBound = predictedDemand + boundLimits;
    const lowerBound = predictedDemand - boundLimits;

    chart.data.datasets[0].data.push({ x: xnow, y: predictedDemand });
    chart.data.datasets[1].data.push({ x: xnow, y: trueDemand });
    chart.data.datasets[2].data.push({ x: xnow, y: upperBound });
    chart.data.datasets[3].data.push({ x: xnow, y: lowerBound });

    chart.data.datasets[2].data = chart.data.datasets[2].data.filter(data => data.x > predictionArea);
    chart.data.datasets[3].data = chart.data.datasets[3].data.filter(data => data.x > predictionArea);

    // old optimization: removing old data that is not visible in chart 
    // may be detrimental, hard to a/b test 
    // if (chart.data.datasets[0].data.length > 29) {
    //   chart.data.datasets[0].data.shift();
    //   chart.data.datasets[1].data.shift();
    //   chart.data.datasets[2].data.shift();
    //   chart.data.datasets[3].data.shift();
    // }

    // extra section to set point to blank when in predictionHorizon
    // cant be placed in setBlank as chart is not defined
    chart.data.datasets[1].pointRadius = chart.data.datasets[1].data.map(data => (data.x > predictionArea ? 0 : 4));
  };

  // update axis in chart
  const updateChartAxis = chart => {
    // updating x axis
    const xAxis = chart.scales['x'];

    const currentMin = xAxis.min;
    const currentMax = xAxis.max;

    chart.options.scales.x.min = currentMin + 1;
    chart.options.scales.x.max = currentMax + 1;

    // updating y axis
    let max = 0;

    for (let i = 0; i < 2; i++) {
      const dataset = chart.data.datasets[i];
      const dataPoints = dataset.data.map(dataPoint => dataPoint.y);
      // Find the maximum and minimum values within the dataset
      const datasetMax = Math.max(...dataPoints);
      // Update the overall max and min values if necessary
      if (datasetMax > max) {
        max = datasetMax;
      }
    }

    const diffRange = max * 0.1;
    chart.options.scales.y.min = 0;
    if (max + diffRange !== 0) {
      chart.options.scales.y.max = max + diffRange;
    } else {
      chart.options.scales.y.max = 10;
    }
    chart.options.scales.y.max = max + diffRange;
  };

  // wrapper function to wrap above functions
  const updateAll = msg => {
    const chart = chartInstanceRef.current;

    const predictedTimestamp = msg.predicted_timestamp.split(' ')[1];
    // syncing of axis and rest of chart, otherwise xaxis will be ahead by 1
    if (chart.data.datasets[0].data.length !== 0) {
      updateChartAxis(chart);
    }
    updateAnnotation(chart);
    updateHighestDemand(chart);
    updateChartData(chart, msg);

    chart.update();
  };

  // main hook to listen to socket and trigger updates
  useEffect(() => {
    socket.on('graph_data', updateAll);

    return () => {
      socket.off('graph_data', updateAll);
    };
  }, [socket, resetValue]);

  return <canvas ref={chartRef}/>;
};

export default LineChart;
