// react imports
import React, { useEffect } from 'react';

// some styling stuff
import {Box} from '@chakra-ui/react';

import Login from './views/login.jsx';
import Analytics from './views/analytics.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  // set dark mode
  useEffect(() => {
    const colorMode = localStorage.getItem('chakra-ui-color-mode');

    if (colorMode !== 'dark') {
      localStorage.setItem('chakra-ui-color-mode', 'dark');
    }
  }, []);

  const handleLogin = (formData) => {
  };

  return (
    <Box id="AppContainer_Box" h={'100vh'} w={'100vw'} overflow={'hidden'}>

      <Router>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/analytics" element={<Analytics/>}/>
        </Routes>
      </Router>
      {/* <HeaderComponent id="HeaderBar" overflowY="auto" />
      <Grid
        id="Content_Grid"
        h={'90.6vh'}
        p={'2px'}
        bg={'#2b2b2b'}
        textAlign={'center'}
        fontSize={'xl'}
        overflow={'hidden'}
        templateColumns={'1fr 1fr'}
      > */}
        {/* <Tabs id="Pages_Tabs" h={'88.5vh'} style={{ minWidth: 0 }} variant={'enclosed'} onChange={handleTabChange}>
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
          {activeTab === 3 ? (
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
          ) : activeTab === 2 ? (
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
          ) : (
            <TabPanels h={'85vh'}>
              <TabPanel h={'100%'} overflowY={'auto'}>
                <Flex id="TabContainer_Flex" h={'100%'} p={'1%'} flexDirection={'column'}>
                  <Map mapId="Map" />
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )} */}
      {/* </Grid> */}
    </Box>
  );
}

export default App;
