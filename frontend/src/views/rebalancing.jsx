// chakra and React modules
import { Box, Flex, Grid } from '@chakra-ui/react';
import React from 'react';

// styling sheet
import componentStyles from '../styles/styles.js';

// individual components
import Map from '../components/map.jsx';
import RebalancingHeader from '../components/rebalancingHeader.jsx';

function Rebalancing() {
  // selecting individual styles from stylesheet
  const { greyBox } = componentStyles;

  return (
    <Box id="Rebalancing_Box" h={'100%'} overflow={'hidden'}>
      <Flex id="TabContainer_Flex" h={'100%'} p={'2px'} flexDirection={'column'}>
        <Grid id="DataBar_Flex" h={'12.4%'} {...greyBox} alignItems={'center'}>
          <RebalancingHeader section="rebalancing"/>
        </Grid>

        <Box id="LefrtMapContainer_Box" h={'82%'} p={'8px'} alignItems={'center'} justifyContent={'center'}>
          <Map mapId="Rebalancing" />
        </Box>
      </Flex>
    </Box>
  );
}

export default Rebalancing;
