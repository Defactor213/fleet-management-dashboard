// chakra and React modules
import { Box, Flex, Switch, Divider, Text } from '@chakra-ui/react';
import { Stack } from '@chakra-ui/react';
import React, { useContext } from 'react';
import { AppContext } from '../AppContext.js';

// styling sheet
import componentStyles from '../styles/styles.js';

// individual components
import NetSupplyDemandGap from '../components/netSDGap.jsx';
import CountrySelect from '../components/country.jsx';
import ZoneSelect from '../components/zone.jsx';

// charting modules
import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartStreaming from 'chartjs-plugin-streaming';
import 'chartjs-adapter-luxon';

// the actual component file
import BarChart from '../components/barChart.jsx';

// registering modules with chart
Chart.register(CategoryScale, annotationPlugin, ChartStreaming);

function SupplyDemand() {
  // selecting individual styles from stylesheet
  const { greyBox, dividerLine, dividerStack } = componentStyles;
  const { showRebalancing, handleRebalancingToggle } = useContext(AppContext);

  return (
    <Box id="SupplyDemand_Box" h={'100%'}>
      <Flex id="TabContainer_Flex" h={'100%'} p={'1%'} flexDirection={'column'}>
        {/* data header row */}
        <Flex id="DataBar_Flex" h={'12%'} {...greyBox} alignItems={'center'} justifyContent={'space-evenly'}>
          <NetSupplyDemandGap />

          <Stack {...dividerStack}>
            <Divider {...dividerLine} />
          </Stack>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Text color={'#9c9c9c'} fontSize={'2vh'} mr="10px">
              Wait Policy
            </Text>
            <Switch
              colorScheme="green"
              size="lg"
              onChange={handleRebalancingToggle}
              isChecked={showRebalancing}
            ></Switch>
            <Text color={'#9c9c9c'} fontSize={'2vh'} ml="10px">
              Rebalancing Policy
            </Text>
          </Box>
        </Flex>
        {/* bar chart */}
        <Box id="Chart_Box" h={'77.6%'} p={'0.8%'} flexDirection={'column'} alignItems={'center'}>
          <BarChart />
        </Box>

        {/* footer row */}
        <Flex
          id="SelectionPanel_Flex"
          {...greyBox}
          p={'1%'}
          mt={'0.8%'}
          h={'8%'}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Left-aligned dropdowns */}
          <Flex alignItems="center">
            <CountrySelect />
            <ZoneSelect />
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

export default SupplyDemand;