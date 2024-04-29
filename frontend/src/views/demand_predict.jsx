// chakra and React modules
import { Box, Flex, Grid, Divider } from '@chakra-ui/react';
import { Stack } from '@chakra-ui/react';
import React, { useEffect, useContext } from 'react';
import { AppContext } from '../AppContext.js';

// styling sheet
import componentStyles from '../styles/styles.js';

// individual components
import DemandComponent from '../components/demand.jsx';
import MREComponent from '../components/mre.jsx';
import CountrySelect from '../components/country.jsx';
import ZoneSelect from '../components/zone.jsx';

// charting modules
import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartStreaming from 'chartjs-plugin-streaming';
import 'chartjs-adapter-luxon';

// the actual component file
import LineChart from '../components/lineChart.jsx';

// registering modules with chart
Chart.register(CategoryScale, annotationPlugin, ChartStreaming);

function DemandPredict() {
  const { selectedCountry } = useContext(AppContext);

  // selecting individual styles from stylesheet
  const { greyBox, dividerStack, dividerLine } = componentStyles;

  return (
    <Box id="DemandPrediction_Box" h={'100%'}>
      <Flex id="TabContainer_Flex" h={'100%'} p={'1%'} flexDirection={'column'}>
        {/* numerical data header, grid gives more space to right side MRE component if country is sg as sg has more data to show */}
        <Grid
          id="DataBar_Grid"
          h={'12%'}
          {...greyBox}
          alignItems={'center'}
          justifyContent={'space-evenly'}
          overflow={'hidden'}
          templateColumns={selectedCountry.toLowerCase() === 'singapore' ? '1fr 0.2fr 2fr' : '1fr 0.2fr 1fr'}
        >
          <DemandComponent />

          <Stack {...dividerStack}>
            <Divider {...dividerLine} />
          </Stack>

          <MREComponent />
        </Grid>

        {/* line chart  */}
        <Box id="Chart_Box" h={'77.6%'} p={'0.8%'} flexDirection={'column'} alignItems={'center'}>
          <LineChart />
        </Box>

        {/* footer row */}
        <Flex
          id="SelectionPanel_Flex"
          {...greyBox}
          p={'1%'}
          mt={'0.8%'}
          h={'8%'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Flex alignItems={'center'}>
            <CountrySelect />
            <ZoneSelect />
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

export default DemandPredict;
