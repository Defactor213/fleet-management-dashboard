// AppContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ChakraProvider, Flex, Spinner, Text } from '@chakra-ui/react';
import { SocketContext } from './SocketContext.js';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  // Define your shared state and functions here
  const socket = useContext(SocketContext);
  const [resetValue, setResetValue] = useState(0);
  const [regionGps, setRegionGps] = useState();
  const [selectedZone, setSelectedZone] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('manhattan');
  const [activeTab, setActiveTab] = useState(0);
  const [shrinkMap, setShrinkMap] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [showRebalancing, setShowRebalancing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapId, setMapId] = useState('');
  const [showRoutes, setShowRoutes] = useState(false);
  const [routeData, setRouteData] = useState({});

  const handleToggle = () => {
    setIsLive(!isLive);
  };

  const handleRebalancingToggle = () => {
    setShowRebalancing(!showRebalancing);
  };

  const handleShowRoutes = () => {
    setShowRoutes(true);
  };

  const handleRestartClick = () => {
    console.log('restarting');
    setResetValue(prevValue => prevValue + 1); // Increment the setResetValue
    setSelectedZone(0);
    setShowRebalancing(false);
    setShowRoutes(false);
    socket.emit('sleeptime', 1.5);
  };

  const handleTabChange = index => {
    setActiveTab(index);
    socket.emit('sleeptime', 1.5);
  };

  const handleCountryChange = country => {
    setSelectedCountry(country);
  };

  const handleZoneSelect = zone => {
    setSelectedZone(zone);
  };

  // fetch function when page loads, gets zone data for both countries, stores in regionGps, sends to zone and map
  useEffect(() => {
    console.log('fetching data');

    const headers = new Headers();
    headers.append('Requester-ID', 'React app Root');

    fetch('http://localhost:5000/', {
      headers: headers,
    })
      .then(response => response.json())
      .then(data => {
        const gpsData = JSON.parse(data['gps_data']);
        const regionGpsData = {
          manhattan: gpsData.manhattan,
          singapore: gpsData.singapore,
        };
        setRegionGps(regionGpsData);
        setIsLoading(false);
        setRouteData(JSON.parse(data['routes']));
      })
      .catch(error => {
        console.log('Error fetching data:', error);
      });
  }, []);

  // while connecting, display loading wheel
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

  // Create an object with the state and functions to be provided to the components
  const contextValues = {
    resetValue,
    setResetValue,
    regionGps,
    setRegionGps,
    selectedZone,
    setSelectedZone,
    selectedCountry,
    setSelectedCountry,
    activeTab,
    setActiveTab,
    shrinkMap,
    setShrinkMap,
    isLive,
    setIsLive,
    mapId,
    setMapId,
    showRebalancing,
    showRoutes,
    routeData,
    handleRebalancingToggle,
    handleRestartClick,
    handleTabChange,
    handleCountryChange,
    handleZoneSelect,
    handleToggle,
    handleShowRoutes,
  };

  return <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
