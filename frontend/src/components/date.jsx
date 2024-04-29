// date component, shows current date or date of datapoint
import React, { useEffect, useState, useContext } from 'react';
import { Stack, Text } from '@chakra-ui/react';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

function DateComponent() {
  const currentDate = new Date().toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // default date set to current date

  const [weekday, setWeekday] = useState(currentDate.split(',')[0]);
  const [day, setDay] = useState(currentDate.split(' ')[1]);
  const [month, setMonth] = useState(currentDate.split(' ')[2]);
  const [year, setYear] = useState(currentDate.split(' ')[3]);
  const { resetValue } = useContext(AppContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Define the function to handle the received data
    const handleReceivedData = msg => {
      const updateDate = msg.date_time.split(' ')[0];

      const dateParts = updateDate.split('/');
      const updateDay = parseInt(dateParts[0]);
      const updateMonth = parseInt(dateParts[1]);
      const updateYear = parseInt(dateParts[2]);

      const formattedDate = new Date(updateYear, updateMonth - 1, updateDay).toLocaleString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      setWeekday(formattedDate.split(',')[0]);
      setDay(formattedDate.split(' ')[1]);
      setMonth(formattedDate.split(' ')[2]);
      setYear(formattedDate.split(' ')[3]);
    };

    // Receive data from backend
    socket.on('hourly_actual_demand_json', handleReceivedData);

    // Return a function to close the socket connection when the component unmounts
    return () => {
      socket.off('hourly_actual_demand_json', handleReceivedData);
    };
  }, [socket]);

  // reset function
  useEffect(() => {
    setWeekday(currentDate.split(',')[0]);
    setDay(currentDate.split(' ')[1]);
    setMonth(currentDate.split(' ')[2]);
    setYear(currentDate.split(' ')[3]);
  }, [resetValue]);

  return (
    <Stack fontSize={'1vw'} gap={'1px'}>
      <Text as="span" whiteSpace={'nowrap'}>
        {weekday}
      </Text>
      <Text as="span" whiteSpace={'nowrap'}>
        {day + ' ' + month + ' ' + year}
      </Text>
    </Stack>
  );
}

export default DateComponent;
