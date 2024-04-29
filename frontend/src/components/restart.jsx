// restart component, resets all components to base state
import { IconButton } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import React, { useContext } from 'react';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

const RestartButton = () => {
  const socket = useContext(SocketContext);
  const { handleRestartClick } = useContext(AppContext);
  
  // send restart to backend
  const handleClick = () => {
    if (socket && socket.connected) {
      handleRestartClick();
      socket.emit('restart');
    }
  };

  return <IconButton h={'5vh'} mr={'12px'} aria-label={'Restart'} icon={<RepeatIcon />} aspectRatio={1 / 1} fontSize={'4vh'} color={'#ffffff'} onClick={handleClick} />;
};

export default RestartButton;
