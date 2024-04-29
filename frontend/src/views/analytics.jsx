// react imports
import React, { useEffect, useContext } from 'react';

// App context stores all variables, so that there is less prop passing
import { AppContext } from '../AppContext.js';

// some styling stuff
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box, Grid, Flex } from '@chakra-ui/react';
import componentStyles from '../styles/styles.js';

// Summary views for different tabs
import DemandPredict from './demand_predict.jsx';
import SupplyDemand from './supply_demand.jsx';
import Rebalancing from './rebalancing';
import HeaderComponent from './header.jsx';
import SupplyDemandAnalytics from './supply_demand_analytics.jsx';

// Single components
import Map from '../components/map.jsx';
import PieChart from '../components/pieChart.jsx';
import RebalancingHeader from '../components/rebalancingHeader.jsx';


function Analytics() {
  // fetching variables
  const { activeTab, handleTabChange } = useContext(AppContext);
  const { greyBox } = componentStyles;

  // set dark mode
  useEffect(() => {
    const colorMode = localStorage.getItem('chakra-ui-color-mode');

    if (colorMode !== 'dark') {
      localStorage.setItem('chakra-ui-color-mode', 'dark');
    }
  }, []);

  return (
    <Box id="AppContainer_Box" h={'100vh'} w={'100vw'} overflow={'hidden'}>
      <HeaderComponent id="HeaderBar" overflowY="auto" />
      <Grid
        id="Content_Grid"
        h={'90.6vh'}
        p={'2px'}
        bg={'#2b2b2b'}
        textAlign={'center'}
        fontSize={'xl'}
        overflow={'hidden'}
        templateColumns={'1fr 1fr'}
      >
        <Tabs id="Pages_Tabs" h={'88.5vh'} style={{ minWidth: 0 }} variant={'enclosed'} onChange={handleTabChange}>
          <TabList m={'10px'}>
            <Tab fontSize={'1.85vh'}>Demand Prediction</Tab>
            <Tab fontSize={'1.85vh'}>Supply Demand Gap</Tab>
            <Tab fontSize={'1.85vh'}>Rebalancing vs Wait Policy</Tab>
            <Tab fontSize={'1.85vh'}>Supply Demand Analytics</Tab>
          </TabList>

          <TabPanels h={'85vh'}>
            <TabPanel h={'100%'} overflowY={'auto'}>
              <DemandPredict />
            </TabPanel>

            <TabPanel h={'100%'} overflowY={'auto'}>
              <SupplyDemand />
            </TabPanel>

            <TabPanel h={'100%'} overflowY={'auto'}>
              <Rebalancing />
            </TabPanel>

            <TabPanel h={'100%'} overflowY={'auto'}>
              <SupplyDemandAnalytics />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {activeTab === 3 ? (
          <Tabs id="Map_Tab" h={'100%'} style={{ minWidth: 0 }} variant={'enclosed'}>
            <TabList m={'10px'}>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Demand Prediction
              </Tab>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Supply Demand Gap
              </Tab>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Rebalancing vs Wait Policy
              </Tab>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Supply Demand Analytics
              </Tab>
            </TabList>

            <TabPanels h={'85vh'}>
              <TabPanel h={'100%'} overflowY={'auto'}>
                <Flex id="TabContainer_Flex" h={'50%'} p={'1%'} flexDirection={'column'}>
                  <Map mapId="Map" />
                </Flex>
                <Flex id="TabContainer_Flex" h={'50%'} p={'1%'} flexDirection={'column'}>
                  <PieChart />
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : activeTab === 2 ? (
          // Your code for activeTab equal to 2
          <Tabs id="Map_Tab" h={'100%'} style={{ minWidth: 0 }} variant={'enclosed'}>
            <TabList m={'10px'}>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Demand Prediction
              </Tab>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Supply Demand Gap
              </Tab>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Rebalancing vs Wait Policy
              </Tab>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Supply Demand Analytics
              </Tab>
            </TabList>

            <TabPanels h={'85vh'}>
              <TabPanel h={'100%'} overflowY={'auto'}>
                <Flex id="TabContainer_Flex" h={'100%'} flexDirection={'column'}>
                  <Grid id="DataBar_Flex" h={'12.4%'} {...greyBox} alignItems={'center'} mt="2px" mb="1%" pb={'1%'}>
                    <RebalancingHeader section="wait" />
                  </Grid>
                  <Map mapId="Map" />
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <Tabs id="Map_Tab" h={'100%'} style={{ minWidth: 0 }} variant={'enclosed'}>
            <TabList m={'10px'}>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Demand Prediction
              </Tab>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Supply Demand Gap
              </Tab>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Rebalancing vs Wait Policy
              </Tab>
              <Tab fontSize={'1.85vh'} style={{ visibility: 'hidden' }}>
                Supply Demand Analytics
              </Tab>
            </TabList>

            <TabPanels h={'85vh'}>
              <TabPanel h={'100%'} overflowY={'auto'}>
                <Flex id="TabContainer_Flex" h={'100%'} p={'1%'} flexDirection={'column'}>
                  <Map mapId="Map" />
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Grid>
    </Box>
  );
}

export default Analytics;
