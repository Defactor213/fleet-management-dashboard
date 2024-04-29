// country component, dropdown to select which country's data to view
import React, { useEffect, useContext } from 'react';
import { Select } from '@chakra-ui/react';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

const CountrySelect = () => {
  const { resetValue, setSelectedCountry, selectedCountry } = useContext(AppContext);

  const socket = useContext(SocketContext);

  const handleCountryChange = event => {
    const country = event.target.value;
    setSelectedCountry(country);
    socket.emit('country', country.toLowerCase());
  };

  // reset function
  useEffect(() => {
    if (resetValue) {
      setSelectedCountry('manhattan');
      socket.emit('country', 'manhattan');
    }
  }, [resetValue, socket]);

  return (
    <Select
      width={'10vw'}
      mr={'10px'}
      placeholder={'Choose Country'}
      value={selectedCountry}
      onChange={handleCountryChange}
      style={{ height: '4vh' }}
    >
      <option value="singapore">Singapore</option>
      <option value="manhattan">Manhattan</option>
    </Select>
  );
};

export default CountrySelect;
