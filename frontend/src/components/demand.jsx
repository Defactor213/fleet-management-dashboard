// demand component, listens to backend for data and displays
import React, { useEffect, useState, useContext } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

function DemandComponent() {
  const [demandData, setDemandData] = useState('-');
  const socket = useContext(SocketContext);
  const { resetValue, selectedCountry } = useContext(AppContext);

  // listen to backend for data
  useEffect(() => {
    socket.on('graph_data', msg => {
      setDemandData(msg.actual_total_demand);
    });
    return () => {
      socket.off('graph_data');
    };
  }, [socket, selectedCountry]);

  // reset function
  useEffect(() => {
    setDemandData('-');
  }, [resetValue]);

  return (
    <Box textAlign={'center'}>
      <Text color={'#9c9c9c'} fontSize={'2vh'}>
        Demand
      </Text>
      <Text fontSize={'2.5vh'}>{demandData}</Text>
    </Box>
  );
}

export default DemandComponent;
