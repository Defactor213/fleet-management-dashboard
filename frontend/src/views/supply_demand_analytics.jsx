// chakra and React modules
import { Box } from '@chakra-ui/react';
import React from 'react';

// charting modules
import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartStreaming from 'chartjs-plugin-streaming';
import 'chartjs-adapter-luxon';

// the actual component file
import LineChart from '../components/lineChart.jsx';
import BarChart from '../components/barChart.jsx';

// registering modules with chart
Chart.register(CategoryScale, annotationPlugin, ChartStreaming);
function SupplyDemandAnalytics() {
  return (
    <Box id="DemandPrediction_Box" h={'100%'}>
      <Box id="Chart_Box" h={'50%'} p={'1%'} flexDirection={'column'} alignItems={'center'}>
        <LineChart />
      </Box>
      <Box id="Chart_Box" h={'50%'} p={'1%'} flexDirection={'column'} alignItems={'center'}>
        <BarChart />
      </Box>
    </Box>
  );
}

export default SupplyDemandAnalytics;
