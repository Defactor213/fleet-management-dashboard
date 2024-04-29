// median of relative error component, shows data on graph based on country
import React, { useEffect, useState, useContext } from 'react';
import { Box, Text, Divider, Button } from '@chakra-ui/react';
import { Stack } from '@chakra-ui/react';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

// styling sheet
import componentStyles from '../styles/styles.js';

function RebalancingHeader({ section }) {
  const [sdrData, setSdrData] = useState('-');
  const [incomeData, setIncomeData] = useState('-');
  const { resetValue, activeTab, handleShowRoutes, routeData, regionGps, selectedCountry, showRoutes } =
    useContext(AppContext);
  const socket = useContext(SocketContext);
  const { dividerStack, dividerLine } = componentStyles;
  const region_gps = regionGps[selectedCountry.toLowerCase()];

  const handleButtonClick = () => {
    // Emit a message to the socket when the button is clicked
    socket.emit('sleeptime', 12);
    handleShowRoutes();
  };

  const handleChangeSleepTime = msg => {
    // received data, have start and end matrix
    const car_dict = JSON.parse(msg['car_dict'])
    const times = [];

    // each row is one car, has start and end zone
    for (let i = 0; i < Object.keys(car_dict).length; i++) {
      const car = car_dict[i]
      const start_zone = car['start'];
      const end_zone = car['end'];

      var route = routeData.find(temp => temp.start_zone == start_zone && temp.end_zone == end_zone);
      const routeJson = JSON.parse(route.route)[0];
      const timeTaken = routeJson['legs'][0]['distance'].value;
      times.push(timeTaken);
    }
    const maxTime = Math.max(...times);

    const sleepTime = Math.round(maxTime / 1500);
    socket.emit('sleeptime', sleepTime);
  };

  useEffect(() => {
    socket.on('sdr_income', msg => {
      if (section === 'wait') {
        setSdrData(msg['sdr_wait']);
        setIncomeData('$' + Math.round(msg['income_wait']).toLocaleString() + ' USD');
      } else {
        setSdrData(msg['sdr_rebalancing']);
        setIncomeData('$' + Math.round(msg['income_rebalancing']).toLocaleString() + ' USD');
      }
    });

    if (showRoutes && activeTab === 2) {
      socket.on('future_car_movement', handleChangeSleepTime);
    }

    return () => {
      socket.off('sdr_income');
      socket.off('future_car_movement', handleChangeSleepTime);
    };
  }, [socket, section, activeTab, showRoutes]);

  // reset function
  useEffect(() => {
    setSdrData('-');
    setIncomeData('-');
  }, [resetValue]);

  return (
    // country affects what data will be shown
    <Box h={'100%'} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} textAlign={'center'}>
      <Box textAlign={'center'}>
        <Text color={'#9c9c9c'} fontSize={'2vh'}>
          Serve Demand Ratio
        </Text>
        <Text fontSize={'2.5vh'}>{sdrData}</Text>
      </Box>

      <Stack {...dividerStack}>
        <Divider {...dividerLine} />
      </Stack>

      <Box textAlign={'center'}>
        <Text color={'#9c9c9c'} fontSize={'2vh'}>
          Accumulated Income
        </Text>
        <Text fontSize={'2.5vh'}>{incomeData}</Text>
      </Box>
      <Box>
        {section === 'rebalancing' && (
          <Button size="lg" onClick={handleButtonClick} color={'#9c9c9c'}>
            Show Routes
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default RebalancingHeader;
