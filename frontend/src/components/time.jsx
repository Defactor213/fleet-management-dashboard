// Time component, displays current time when data is not playing.
// will show time that data was taken when data is playing
import React, { useEffect, useState, useContext } from 'react';
import { Text } from '@chakra-ui/react';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

function TimeComponent() {
  // default time is current time
  const [timeData, setTimeData] = useState(
    new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
  const { resetValue } = useContext(AppContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleHourlyActualDemandJson = msg => {
      const newTime = msg.date_time.split(' ')[1] + ' hrs';
      setTimeData(newTime);
    };
    socket.on('hourly_actual_demand_json', handleHourlyActualDemandJson);
    return () => {
      socket.off('hourly_actual_demand_json', handleHourlyActualDemandJson);
    };
  }, [socket]);

  // Reset the timeData when resetValue changes
  useEffect(() => {
    setTimeData(
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, [resetValue]);

  return (
    <Text as={'span'} whiteSpace={'nowrap'} display={'in-line'} fontSize={'2.5vw'}>
      {timeData}
    </Text>
  );
}

export default TimeComponent;
