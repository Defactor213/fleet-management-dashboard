import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

function NetSupplyDemandGap() {
  const [gapData, setGapData] = useState('-');
  const socket = useContext(SocketContext);
  const { resetValue, showRebalancing, selectedZone } = useContext(AppContext);

  const handleData = useCallback(
    msg => {
      if (selectedZone !== 0) {
        const zoneAmount = msg[selectedZone];
        setGapData(Math.abs(zoneAmount.toFixed(2)));
      } else {
        // sum all values in msg that is negative
        const negativeSum = Object.values(msg).reduce((sum, value) => (value < 0 ? sum + value : sum), 0);
        // count all values in msg that is negative
        const negativeCount = Object.values(msg).filter(value => value < 0).length;
        // average of sum/count
        const negativeAverage = negativeCount === 0 ? 0 : negativeSum / negativeCount;
        setGapData(Math.abs(negativeAverage.toFixed(2)));
      }
    },
    [selectedZone]
  );

  useEffect(() => {
    if (showRebalancing) {
      socket.on('rebalancing_data', handleData);
    } else {
      socket.on('demand_gap_data', handleData);
    }

    return () => {
      if (showRebalancing) {
        socket.off('rebalancing_data', handleData);
      } else {
        socket.off('demand_gap_data', handleData);
      }
    };
  }, [socket, showRebalancing, handleData]);

  useEffect(() => {
    setGapData('-');
  }, [resetValue]);

  return (
    <Box textAlign="center">
      <Text color={'#9c9c9c'} fontSize={'2vh'}>
        average supply demand gap (absolute mean)
      </Text>
      <Text fontSize={'2.5vh'}>{gapData}</Text>
    </Box>
  );
}

export default NetSupplyDemandGap;
