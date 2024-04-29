// Zone component: dropdown menu used to select zones available in selected country
import React, { useEffect, useContext } from 'react';
import { Select } from '@chakra-ui/react';
import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

function ZoneSelect() {
  const socket = useContext(SocketContext);
  const { resetValue, selectedCountry, selectedZone, setSelectedZone, regionGps } = useContext(AppContext);

  // reset function
  useEffect(() => {
    setSelectedZone(0);
  }, [resetValue]);

  // emit selected zone to backend
  const handleZoneChange = event => {
    var zone = event.target.value;
    if (zone === '') {
      zone = '0';
    }
    if (socket && socket.connected) {
      socket.emit('zone', zone);
    }
    // wait for backend to recieve emit before changing front end, otherwise chart will have all zones data
    setTimeout(function () {
      setSelectedZone(zone);
    }, 800);
  };

  // getting correct region to be displayed on frontend based on country
  const getRegionGps = () => {
    if (selectedCountry.toLowerCase() === 'singapore') {
      return regionGps?.singapore;
    } else {
      return regionGps?.manhattan;
    }
  };

  const regionGpsData = getRegionGps();

  return (
    <Select
      width={'8vw'}
      mr={'10px'}
      placeholder={'All Zones'}
      value={selectedZone}
      onChange={handleZoneChange}
      style={{ height: '4vh' }}
    >
      {regionGpsData &&
        Object.keys(regionGpsData).map(zoneKey => (
          <option key={zoneKey} value={zoneKey}>
            {zoneKey}
          </option>
        ))}
    </Select>
  );
}

export default ZoneSelect;
