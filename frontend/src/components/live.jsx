// islive switch, to switch between historic and live data, currently not called by anything
import { Text, Switch } from '@chakra-ui/react';
import { AppContext } from '../AppContext.js';
import React, { useContext } from 'react';

const LiveSwitch = () => {
  const { isLive, handleToggle } = useContext(AppContext);

  return (
    <>
      <Text color={isLive ? '#38A169' : '#FCB134'} mr={2}>
        {isLive ? 'Live' : 'Historic'}
      </Text>
      <Switch colorScheme="green" size="lg" mr={2} onChange={handleToggle} />
    </>
  );
};

export default LiveSwitch;
