// median of relative error component, shows data on graph based on country
import React, { useEffect, useState, useContext } from 'react';
import { Box, Text, Divider } from '@chakra-ui/react';
import { Stack } from '@chakra-ui/react';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

// styling sheet
import componentStyles from '../styles/styles.js';

function MREComponent() {
  const [corrData, setCorrData] = useState('-');
  const [mreData, setMREData] = useState('-');
  const [maeData, setMaeData] = useState('-');
  const { resetValue, selectedCountry } = useContext(AppContext);

  const socket = useContext(SocketContext);
  const [showSg, setShowSg] = useState(false);

  const { dividerStack, dividerLine } = componentStyles;

  // recieve data from backend, filters based on country
  // singapore has more data than manhattan
  useEffect(() => {
    socket.on('graph_data', msg => {
      if (selectedCountry.toLowerCase() === 'singapore') {
        // singapore has correlation and mae
        if (msg.correlation !== null) {
          setCorrData(msg.correlation);
        } else {
          setCorrData('-');
        }
        if (msg.mae !== null) {
          setMaeData(msg.mae);
        } else {
          setMaeData('-');
        }
      } else {
        // manhattan has mre
        setMREData(msg.relative_error_median);
      }
    });
    return () => {
      socket.off('graph_data');
    };
  }, [socket, selectedCountry]);

  // change state when country changes
  useEffect(() => {
    setShowSg(selectedCountry.toLowerCase() === 'singapore');
  }, [selectedCountry]);

  // reset function
  useEffect(() => {
    setMREData('-');
    setMaeData('-');
  }, [resetValue]);

  return (
    // country affects what data will be shown
    <Box textAlign={'center'} whiteSpace={'nowrap'} overflow={'hidden'}>
      {showSg ? (
        // singapore
        <Box h={'100%'} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} textAlign={'center'}>
          <Box textAlign={'center'}>
            <Text color={'#9c9c9c'} fontSize={'2vh'}>
              Correlation
            </Text>
            <Text fontSize={'2.5vh'}>{corrData}</Text>
          </Box>

          <Stack {...dividerStack}>
            <Divider {...dividerLine} />
          </Stack>

          <Box textAlign={'center'}>
            <Text color={'#9c9c9c'} fontSize={'2vh'}>
              Mean Absolute Error
            </Text>
            <Text fontSize={'2.5vh'}>{maeData}</Text>
          </Box>
        </Box>
      ) : (
        // manhattan
        <Box textAlign={'center'}>
          <Text color={'#9c9c9c'} fontSize={'2vh'}>
            Median of Relative Error
          </Text>
          <Text fontSize={'2.5vh'}>{mreData}</Text>
        </Box>
      )}
    </Box>
  );
}

export default MREComponent;
