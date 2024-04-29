import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ChakraProvider, Flex, Spinner, Text } from '@chakra-ui/react';

const SocketContext = React.createContext(null);

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000');

    // socketInstance.connect();
    socketInstance.on('connect', () => {
      console.log('WebSocket connection established');
      setIsLoading(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []); // Empty dependency array ensures useEffect runs only once, on component mount

  if (isLoading) {
    return (
      <ChakraProvider>
        <Flex align="center" justify="center" minHeight="100vh" flexDirection="column" textAlign="center">
          <Spinner width="100px" height="100px" />
          <Text fontSize="24px" mt="2">
            Loading...
          </Text>
        </Flex>
      </ChakraProvider>
    );
  }

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export { SocketContext, SocketProvider };
