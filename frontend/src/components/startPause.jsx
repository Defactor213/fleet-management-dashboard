// start pause button, controls playing of data on all tabs
import { IconButton } from '@chakra-ui/react';
import { BsFillPlayFill, BsFillPauseFill } from 'react-icons/bs';
import React, { useEffect, useState, useContext } from 'react';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

const StartPauseButton = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const socket = useContext(SocketContext);
  const { resetValue } = useContext(AppContext);

  // data emitting for backend to recieve
  const handleToggleClick = () => {
    setIsPlaying(!isPlaying);
    if (socket && socket.connected) {
      if (isPlaying) {
        console.log('pausing');
        socket.emit('pause');
      } else {
        console.log('starting');
        socket.emit('start');
      }
    }
  };

  // reset function
  useEffect(() => {
    if (resetValue >= 1) {
      setIsPlaying(false);
      socket.emit('pause');
      socket.emit('restart');
    }
  }, [resetValue, socket]);

  return (
    <IconButton
      h={'5vh'}
      mr={'12px'}
      aria-label={isPlaying ? 'Pause' : 'Start'}
      // icon automatically switches between pause and play based on true/false of isPlaying
      icon={isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
      aspectRatio={1 / 1}
      fontSize={'4.5vh'}
      color={'#ffffff'}
      onClick={handleToggleClick}
    />
  );
};

export default StartPauseButton;
