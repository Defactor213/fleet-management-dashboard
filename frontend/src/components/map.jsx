// map component, used to display map + heatmap + zonemap
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';

import { GoogleMap, useLoadScript } from '@react-google-maps/api';

import { SocketContext } from '../SocketContext.js';
import { AppContext } from '../AppContext.js';

import { Flex, Box, Text } from '@chakra-ui/react';

const _ = require('lodash');

const manhattanCenterCoord = {
  lat: 40.78928978708174,
  lng: -73.96156428542177,
};

const singaporeCenterCoord = {
  lat: 1.3699186781713397,
  lng: 103.8112600763408,
};

// Define color array
const colors = [
  { value: 0, color: '#FF0000' }, // Red
  { value: 0.33, color: '#FFA500' }, // Orange
  { value: 0.66, color: '#FFFF00' }, // Yellow
  { value: 1, color: '#00FF00' }, // Green
];

// Define color gradient
const gradientColors = colors.map(color => `${color.color} ${color.value * 100}%`);

const Map = React.memo(({ mapId }) => {
  const [centerCoord, setCenterCoord] = useState(manhattanCenterCoord);

  // taking variables from app context
  const { resetValue, regionGps, selectedCountry, selectedZone, activeTab, showRebalancing, showRoutes, routeData } =
    useContext(AppContext);

  const [zoneCoordData] = useState(regionGps);
  const [zoneCoord, setZoneCoord] = useState();

  // heatmap stuff
  const [mapLibraries] = useState(['visualization']); // heatmap visualizer
  const [heatmapData, setHeatmapData] = useState([]);

  // zonemap stuff
  const [zoneData, setZoneData] = useState([]); // to store zone data from geojson file
  const [demandGapData, setDemandGap] = useState([]); // to store demand gap data
  const [rebalancingData, setRebalancingGap] = useState([]); // to store demand gap data
  const [zoneLayer, setZoneLayer] = useState(); // zone overlay

  // markermap and routemap stuff
  const [defaultMarkerData, setDefaultMarkerData] = useState({});
  const [markerData, setMarkerData] = useState({});
  const [polylineObjects, setPolylineObjects] = useState([]);

  const [map, setMap] = useState(null);

  const socket = useContext(SocketContext);

  // change api key here to remove dev mode text
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: '',
    libraries: mapLibraries,
    version: '3.53',
  });

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  // need to unmount to prevent multiple instances of map
  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const shiftMap = (coordinates, zoom) => {
    window.google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
      map.panTo(coordinates);
      map.setZoom(zoom);
    });
  };

  // Helper functions
  // function to check if data is valid
  function isValidGeoJson(geoJson) {
    if (typeof geoJson === 'object') {
      if (geoJson.type === 'Feature' || geoJson.type === 'FeatureCollection') {
        return true;
      }
    }
    return false;
  }

  // function to get a color value between 2 colors (for heatmap)
  function getColor(value_percentage) {
    // Calculate the color based on value
    let resultColor = '';
    for (let i = 1; i < colors.length; i++) {
      if (value_percentage <= colors[i].value) {
        const startColor = colors[i - 1].color;
        const endColor = colors[i].color;
        const range = colors[i].value - colors[i - 1].value;
        const factor = (value_percentage - colors[i - 1].value) / range;

        resultColor = interpolateColor(startColor, endColor, factor);
        break;
      }
    }

    return resultColor;
  }

  // function to get color code from value between start and end value
  function interpolateColor(start, end, factor) {
    const startR = parseInt(start.slice(1, 3), 16);
    const startG = parseInt(start.slice(3, 5), 16);
    const startB = parseInt(start.slice(5, 7), 16);

    const endR = parseInt(end.slice(1, 3), 16);
    const endG = parseInt(end.slice(3, 5), 16);
    const endB = parseInt(end.slice(5, 7), 16);

    const r = Math.round(startR + (endR - startR) * factor);
    const g = Math.round(startG + (endG - startG) * factor);
    const b = Math.round(startB + (endB - startB) * factor);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // function to calculate gradient colors (for marker route)
  function calculateGradientColors(segmentCount) {
    const startColor = '#e18000'; // Brown
    const endColor = '#ffffff'; // White

    const colors = [];
    for (let i = 0; i < segmentCount; i++) {
      const ratio = i / (segmentCount - 1);
      const color = interpolateColor(startColor, endColor, ratio);
      colors.push(color);
    }

    return colors;
  }

  // function to update heatmap data
  const handleHourlyActualDemand = useCallback(
    msg => {
      if (zoneCoordData && selectedCountry) {
        const region_gps = zoneCoordData[selectedCountry.toLowerCase()];

        // error here, selected country null?
        const keys = Object.keys(region_gps);
        const heatMapRound = {};
        for (const key of keys) {
          heatMapRound[key] = msg[key];
        }
        setHeatmapData(heatMapRound);
      }
    },
    [zoneCoordData, selectedCountry, selectedZone, heatmapData]
  );

  // parse demand gap data into key:value map
  const handleDemandGap = useCallback(msg => {
    const tempmap = {};
    for (const key in msg) {
      if (msg.hasOwnProperty(key)) {
        const value = msg[key];
        tempmap[key] = value;
      }
    }
    setDemandGap(tempmap);
  }, []);

  // parse demand gap data into key:value map
  const handleRebalancingGap = useCallback(msg => {
    const tempmap = {};
    for (const key in msg) {
      if (msg.hasOwnProperty(key)) {
        const value = msg[key];
        tempmap[key] = value;
      }
    }
    setRebalancingGap(tempmap);
  }, []);

  // function to update car movement
  const handleCarMove = useCallback(
    msg => {
      const region_gps = zoneCoordData[selectedCountry.toLowerCase()];
      // currently testing, only doing first 20 zones
      const keys = Object.keys(region_gps)
      const newPolylineObjects = [];
      // remove all old polylines from map, prevent resource wastage
      setPolylineObjects(prevPolylineObjects => {
        for (const polylineObject of prevPolylineObjects) {
          // remove polyline from map
          polylineObject.setMap(null);
        }
        return [];
      });
      setPolylineObjects(prevPolylineObjects => []);

      // do a check for the correct map before moving markers
      if (map && mapId === 'Rebalancing' && showRoutes && markerData) {
        const car_dict = JSON.parse(msg['car_dict'])
        // each row is one car, has start and end zone
        for (let i = 0; i < Object.keys(car_dict).length; i++) {
          const car = car_dict[i];
          // find start and end zone
          const start_zone = car["start"]
          const end_zone = car["end"]

          // if start and end then skip
          if (start_zone === end_zone) {
            continue;
          }

          // find corresponding marker
          const vehicleKey = 'Vehicle ' + Object.keys(region_gps)[i];
          const marker = markerData[vehicleKey];

          // if marker not found then skip
          if (marker === undefined) {
            continue;
          }

          // reference routeData to find route for start and end
          var route = routeData.find(temp => temp.start_zone == start_zone && temp.end_zone == end_zone);
          // find route
          const routeJson = JSON.parse(route.route)[0];
          const path = routeJson['legs'][0]['steps'];

          // add routes to map
          if (window.google && window.google.maps.geometry) {
            // Decode the overviewPolyline using Google Maps API's geometry library
            const polyline = routeJson.overview_polyline.points;
            const polylinePath = window.google.maps.geometry.encoding.decodePath(polyline);

            // method 1: just set polyline path
            const newPolyline = new window.google.maps.Polyline({
              path: polylinePath,
              strokeColor: '#ffffff',
              strokeOpacity: 1.0,
              strokeWeight: 4,
            });
            newPolylineObjects.push(newPolyline);
            newPolyline.setMap(map);

            //   // method 2: split polyline into parts so that path can have gradient color
            //   const segmentCount = 10;
            //   const segmentSize = Math.floor(polylinePath.length / segmentCount);
            //   const polylineSegments = [];
            //   for (let i = 0; i < segmentCount; i++) {
            //     const startIdx = i * segmentSize;
            //     const endIdx = i === segmentCount - 1 ? polylinePath.length : (i + 1) * segmentSize;
            //     const segment = polylinePath.slice(startIdx, endIdx);
            //     polylineSegments.push(segment);
            //   }

            //   // Calculate the gradient colors
            //   const gradientColors = calculateGradientColors(segmentCount);

            //   // Create a Polyline object for each route segment and add it to the map
            //   for (let i = 0; i < segmentCount; i++) {
            //     // creating polyline object
            //     const newPolyline = new window.google.maps.Polyline({
            //       path: polylineSegments[i],
            //       strokeColor: gradientColors[i],
            //       strokeOpacity: 1.0,
            //       strokeWeight: 4,
            //     });
            //     // adding to temp list
            //     newPolylineObjects.push(newPolyline);
            //   }
            // }
            // // for polyline, set to map
            // for (const polylineObject of newPolylineObjects) {
            //   polylineObject.setMap(map);
          }
          // setting usestate with new objects
          setPolylineObjects(newPolylineObjects);

          let stepIndex = 0;

          // function to recursively call the transition function for each section of path
          async function handleNextStep() {
            if (stepIndex < path.length) {
              const polylinePoints = window.google.maps.geometry.encoding.decodePath(path[stepIndex].polyline.points);

              // Use a promise to wait for the transition to complete
              await new Promise(resolve => {
                transition(marker, polylinePoints, resolve);
              });

              stepIndex++; // Move to the next step
              await handleNextStep(); // Call the function recursively for the next step
            }
          }

          handleNextStep(); // Start the transition for the first step
        }
      }
    },
    [map, mapId, zoneCoordData, selectedCountry, markerData, showRoutes]
  );

  // helper function to move marker based on polylinePoints
  function transition(marker, polylinePoints, callback) {
    // marker is google maps marker object
    // polylinePoints is array of Lat/Lng
    const numDeltas = polylinePoints.length;
    let i = 0;

    // Recursive function, moves 1 step each time
    function moveMarker() {
      const point = polylinePoints[i];
      const newMarkerlatlng = new window.google.maps.LatLng(point.lat(), point.lng());

      // rotation stuff, put on pause
      // const currentMarkerlatlng = marker.getPosition();
      // // angles go from -179 to 180
      // let targetAngle = Math.round(
      //   window.google.maps.geometry.spherical.computeHeading(currentMarkerlatlng, newMarkerlatlng)
      // );
      // const currentAngle = Math.round(marker.getIcon().rotation);

      // // both target and current goes from -179 to 180, so need to use this formula to find angle diff

      // let rotationDifference = Math.abs(
      //   ((((targetAngle + 180) % 360) + 360) % 360) - 180 - ((((currentAngle + 180) % 360) + 360) % 360) + 180
      // );

      // if (rotationDifference > 270) {
      //   rotationDifference = Math.abs(rotationDifference - 360);
      // }
      // if (rotationDifference > 180) {
      //   rotationDifference -= 180;
      // }

      // // do not rotate if smaller than rotation threshold, to reduce wiggling
      // if (rotationDifference > 15) {
      //   // if difference > 90, only rotate by 90
      //   if (rotationDifference > 90) {
      //     // if (marker.getTitle() == 'Vehicle 4') {
      //     //   console.log('current angle is ' + currentAngle);
      //     //   console.log('target angle is ' + targetAngle);
      //     //   console.log('rotation difference is ' + rotationDifference);
      //     //   console.log('corrected current angle is ' + (parseFloat(currentAngle) + 180));
      //     //   console.log('corrected target angle is ' + (parseFloat(targetAngle) + 180));
      //     //   console.log(
      //     //     'corrected difference is ' + (parseFloat(targetAngle) + 180 - (parseFloat(currentAngle) + 180))
      //     //   );
      //     // }
      //     if (parseFloat(targetAngle) + 180 - (parseFloat(currentAngle) + 180) < 0) {
      //       if (marker.getTitle() == 'Vehicle 4') {
      //         console.log('currentAngle ' + currentAngle);
      //         console.log('setting to ' + (parseFloat(currentAngle) - 90));
      //       }
      //       marker.setIcon({
      //         path: window.google.maps.SymbolPath.CIRCLE,
      //         scale: 6,
      //         rotation: parseFloat(currentAngle) - 90,
      //         fillColor: 'yellow',
      //         fillOpacity: 1,
      //         strokeColor: 'black',
      //         strokeWeight: 2,
      //       });
      //     } else {
      //       if (marker.getTitle() == 'Vehicle 4') {
      //         console.log('currentAngle ' + currentAngle);
      //         console.log('setting to ' + (parseFloat(currentAngle) + 90));
      //       }
      //       marker.setIcon({
      //         path: window.google.maps.SymbolPath.CIRCLE,
      //         scale: 6,
      //         rotation: parseFloat(currentAngle) + 90,
      //         fillColor: 'yellow',
      //         fillOpacity: 1,
      //         strokeColor: 'black',
      //         strokeWeight: 2,
      //       });
      //     }
      //     if (marker.getTitle() == 'Vehicle 4') {
      //       console.log('');
      //     }
      //   } else {
      //     // can just rotate normally (15 < rotation < 90)
      //     // update icon with new rotation angle
      //     marker.setIcon({
      //       path: window.google.maps.SymbolPath.CIRCLE,
      //       scale: 6,
      //       rotation: targetAngle,
      //       fillColor: 'yellow',
      //       fillOpacity: 1,
      //       strokeColor: 'black',
      //       strokeWeight: 2,
      //     });
      //   }
      // }

      // "move" marker
      marker.setPosition(newMarkerlatlng);
      i += 2;

      if (i < numDeltas) {
        requestAnimationFrame(moveMarker);
      } else {
        // Call the callback when the animation is finished
        if (typeof callback === 'function') {
          callback();
        }
      }
    }

    if (marker) {
      moveMarker(i); // Start the animation, afterwards will recurse into itself
    }
  }

  // function to get header for map (the stuff left and right of the color bar)
  function mapHeader(activeTab, mapId) {
    const tabText = activeTab => {
      switch (activeTab) {
        case 1:
          return 'Supply Demand Gap';
        case 2:
          switch (mapId) {
            case 'Map':
              return 'Wait Policy Gap';
            case 'Rebalancing':
              return 'Rebalancing Gap';
            default:
              return ' Supply Demand Gap';
          }
        default:
          return 'Demand';
      }
    };

    // function to get name of map (used primarly for tab 3: rebalancing vs wait policy)
    const mapName = activeTab => {
      switch (activeTab) {
        case 2:
          switch (mapId) {
            case 'Map':
              return 'Wait Policy';
            case 'Rebalancing':
              return 'Rebalancing Policy';
            default:
              return '';
          }
        default:
          return '';
      }
    };

    return (
      <Box>
        {mapName(activeTab) !== '' && (
          <Text color={'#9c9c9c'} fontSize={'2vh'}>
            {mapName(activeTab)}
          </Text>
        )}
        <Flex flexDirection="row" alignItems="center" justifyContent="center">
          <Box marginRight="10px">
            <Text color="#9c9c9c" fontSize={'2vh'}>
              High {tabText(activeTab)}
            </Text>
          </Box>
          <Box
            style={{
              width: '100px',
              height: '20px',
              background: `linear-gradient(to right, ${gradientColors.join(', ')})`,
            }}
          ></Box>
          <Box marginLeft="10px">
            <Text color="#9c9c9c" fontSize={'2vh'}>
              low {tabText(activeTab)}
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  // ⌄ useEffects to trigger when things change ⌄

  // socket to listen to backend
  useEffect(() => {
    socket.on('hourly_actual_demand_json', handleHourlyActualDemand);
    socket.on('demand_gap_data', handleDemandGap);
    socket.on('rebalancing_data', handleRebalancingGap);
    socket.on('car_movement', handleCarMove);

    return () => {
      socket.off('hourly_actual_demand_json', handleHourlyActualDemand);
      socket.off('demand_gap_data', handleDemandGap);
      socket.off('rebalancing_data', handleRebalancingGap);
      socket.off('car_movement', handleCarMove);
    };
  }, [socket, handleHourlyActualDemand, handleDemandGap, handleRebalancingGap, showRoutes, markerData]);

  // loads cars into default positions once conditions are met
  useEffect(() => {
    if (map && markerData && activeTab === 2 && mapId === 'Rebalancing' && showRoutes) {
      Object.keys(markerData).forEach(title => {
        const marker = markerData[title];
        marker.setMap(map);
      });
    }
  }, [map, markerData, activeTab, mapId]);

  // reset function
  useEffect(() => {
    if (map) {
      map.setOptions({
        mapId: 'f476029de756efd3',
        mapTypeId: 'roadmap',
      });

      map.panTo(manhattanCenterCoord);
      map.setZoom(12);
    }
    if (markerData && map && activeTab === 2 && mapId === 'Rebalancing') {
      Object.keys(markerData).forEach(title => {
        const marker = markerData[title];
        marker.setMap(null);
      });
      setMarkerData({});
    }
    if (polylineObjects && map && activeTab === 2 && mapId === 'Rebalancing') {
      Object.keys(polylineObjects).forEach(title => {
        const polylineObject = polylineObjects[title];
        polylineObject.setMap(null);
      });
      setPolylineObjects([]);
    }
    setHeatmapData([]);
    setDemandGap([]);
    setRebalancingGap([]);
  }, [resetValue, map]);

  // useEffect to create markers when the map is loaded
  useEffect(() => {
    if (zoneCoordData && selectedCountry && map && showRoutes) {
      const region_gps = zoneCoordData[selectedCountry.toLowerCase()];
      const keys = Object.keys(region_gps).slice(0, 4);
      const markers = {};

      for (const key of keys) {
        for (const route of routeData) {
          const startZone = route.start_zone;
          if (key == startZone) {
            const region = key;
            const zoneCenter = new window.google.maps.LatLng(region_gps[region].lat, region_gps[region].lng);

            const marker = new window.google.maps.Marker({
              position: zoneCenter,
              title: 'Vehicle ' + key,
              optimized: true,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 6,
                rotation: 0,
                fillColor: 'yellow',
                fillOpacity: 1,
                strokeColor: 'black',
                strokeWeight: 2,
              },
              draggable: true,
            });

            const title = 'Vehicle ' + key;
            markers[title] = marker;
          }
        }
        // Set the markers on the map
        setMarkerData(markers);
        // have to create default version of the same thing, deep copy to ensure the data is the same but doesnt point to same marker
        setDefaultMarkerData(_.cloneDeep(markers));
      }
    }
    return;
  }, [zoneCoordData, selectedCountry, map, showRoutes]);

  // fetch zone data on page load
  useEffect(() => {
    fetch('/resources/manhattan_taxi_zones.geojson')
      .then(response => response.json())
      .then(data => setZoneData(data))
      .catch(error => console.error('Error fetching GeoJSON:', error));
  }, []);

  // change center coord when country changes
  useEffect(() => {
    if (selectedCountry && map) {
      if (selectedCountry.toLowerCase() === 'singapore') {
        setCenterCoord(singaporeCenterCoord);
        shiftMap(singaporeCenterCoord, 12);
      } else if (selectedCountry.toLowerCase() === 'manhattan') {
        setCenterCoord(manhattanCenterCoord);
        shiftMap(manhattanCenterCoord, 12);

        // Empty heatmap data
        setHeatmapData([]);
      } else {
        setHeatmapData([]);
      }
    }
  }, [resetValue, map, selectedCountry]);

  // change center coord when zone changes
  useEffect(() => {
    if (zoneCoordData && map) {
      if (selectedZone === 0) {
        // temporary solution to shift map back to manhattan center when resetting.
        shiftMap(manhattanCenterCoord, 12);
      } else {
        if (selectedCountry && selectedCountry.toLowerCase() === 'singapore') {
          setZoneCoord(zoneCoordData.singapore[selectedZone]);
          shiftMap(zoneCoordData.singapore[selectedZone], 15);
        } else {
          setZoneCoord(zoneCoordData.manhattan[selectedZone]);
          shiftMap(zoneCoordData.manhattan[selectedZone], 15);
        }

        setCenterCoord(zoneCoord);
      }
      setHeatmapData([]); // Empty heatmap data
    }
  }, [selectedZone, zoneCoordData, map]);

  // TAB CONTROL AND LAYER SETTING
  // using google maps javascript api, library heatmap does not allow for deleting of heatmap
  useEffect(() => {
    if (map) {
      // clear overlayer
      if (zoneLayer) {
        zoneLayer.setMap(null);
      }

      // check which tab is open to render different overlays
      switch (activeTab) {
        // tab 1: demand prediction heatmap
        case 0: {
          if (isValidGeoJson(zoneData)) {
            var newZoneLayer = new window.google.maps.Data();

            newZoneLayer.addGeoJson(zoneData);
            newZoneLayer.setStyle({ strokeColor: 'white', strokeWeight: 0.25 });

            const highest_demand = Math.min(...Object.values(heatmapData));
            const lowest_demand = Math.max(...Object.values(heatmapData));

            // loop through zones
            newZoneLayer.forEach(function (zone) {
              var zoneLocationID = parseInt(zone.getProperty('location_i')).toString(); // using parseInt() here because of anomaly zone 224.000...0003
              // loop through data
              for (const [key, value] of Object.entries(heatmapData)) {
                if (selectedZone && selectedZone !== '0') {
                  // selectedZone !== '0' because when selecting 'All Zone', value is string instead of int.
                  if (key !== selectedZone) {
                    continue;
                  }
                }
                // found zone and data match
                if (key === zoneLocationID) {
                  const value_percentage = (value - lowest_demand) / (highest_demand - lowest_demand);
                  const zone_color = getColor(value_percentage);
                  newZoneLayer.overrideStyle(zone, { fillColor: zone_color });
                }
              }
            });

            newZoneLayer.setMap(map);
            setZoneLayer(newZoneLayer);
          }
          break;
        }
        // tab 2: supply demand zone map
        case 1: {
          if (isValidGeoJson(zoneData)) {
            delete demandGapData.date_time;
            delete demandGapData.total_gap;
            delete rebalancingData.date_time;
            delete rebalancingData.total_gap;

            const combinedValues = [...Object.values(demandGapData), ...Object.values(rebalancingData)];

            // Find the highest and lowest values from the combined array
            const highest_gap = Math.min(...combinedValues);
            const lowest_gap = Math.max(...combinedValues);

            if (showRebalancing) {
              var newZoneLayer = new window.google.maps.Data();

              newZoneLayer.addGeoJson(zoneData);
              newZoneLayer.setStyle({ strokeColor: 'white', strokeWeight: 0.25 });

              // loop through zones
              newZoneLayer.forEach(function (zone) {
                var zoneLocationID = parseInt(zone.getProperty('location_i')).toString(); // using parseInt() here because of anomaly zone 224.000...0003
                // loop through data
                for (const [key, value] of Object.entries(rebalancingData)) {
                  if (selectedZone && selectedZone !== '0') {
                    // selectedZone !== '0' because when selecting 'All Zone', value is string instead of int.
                    if (key !== selectedZone) {
                      continue;
                    }
                  }
                  // found zone and data match
                  if (key === zoneLocationID) {
                    const value_percentage = (value - lowest_gap) / (highest_gap - lowest_gap);
                    const zone_color = getColor(value_percentage);
                    newZoneLayer.overrideStyle(zone, { fillColor: zone_color });
                  }
                }
              });

              newZoneLayer.setMap(map);
              setZoneLayer(newZoneLayer);
            } else {
              var newZoneLayer = new window.google.maps.Data();

              newZoneLayer.addGeoJson(zoneData);
              newZoneLayer.setStyle({ strokeColor: 'white', strokeWeight: 0.25 });

              // loop through zones
              newZoneLayer.forEach(function (zone) {
                var zoneLocationID = parseInt(zone.getProperty('location_i')).toString(); // using parseInt() here because of anomaly zone 224.000...0003
                // loop through data
                for (const [key, value] of Object.entries(demandGapData)) {
                  if (selectedZone && selectedZone !== '0') {
                    // selectedZone !== '0' because when selecting 'All Zone', value is string instead of int.
                    if (key !== selectedZone) {
                      continue;
                    }
                  }
                  // found zone and data match
                  if (key === zoneLocationID) {
                    const value_percentage = (value - lowest_gap) / (highest_gap - lowest_gap);
                    const zone_color = getColor(value_percentage);
                    newZoneLayer.overrideStyle(zone, { fillColor: zone_color });
                  }
                }
              });

              newZoneLayer.setMap(map);
              setZoneLayer(newZoneLayer);
            }
          }
          break;
        }
        // tab 3: rebalancing has 2 maps
        case 2: {
          // pre-processing before displaying
          delete demandGapData.date_time;
          delete demandGapData.total_gap;
          delete rebalancingData.date_time;
          delete rebalancingData.total_gap;

          const combinedValues = [...Object.values(demandGapData), ...Object.values(rebalancingData)];

          // Find the highest and lowest values from the combined array
          const highest_gap = Math.min(...combinedValues);
          const lowest_gap = Math.max(...combinedValues);

          // additional switch case based on mapId
          switch (mapId) {
            // right side map for wait policy
            case 'Map':
              if (isValidGeoJson(zoneData)) {
                var newZoneLayer = new window.google.maps.Data();

                newZoneLayer.addGeoJson(zoneData);
                newZoneLayer.setStyle({ strokeColor: 'white', strokeWeight: 0.25 });

                // loop through zones
                newZoneLayer.forEach(function (zone) {
                  var zoneLocationID = parseInt(zone.getProperty('location_i')).toString(); // using parseInt() here because of anomaly zone 224.000...0003
                  // loop through data
                  for (const [key, value] of Object.entries(demandGapData)) {
                    if (selectedZone && selectedZone !== '0') {
                      // selectedZone !== '0' because when selecting 'All Zone', value is string instead of int.
                      if (key !== selectedZone) {
                        continue;
                      }
                    }
                    // found zone and data match
                    if (key === zoneLocationID) {
                      const value_percentage = (value - lowest_gap) / (highest_gap - lowest_gap);
                      const zone_color = getColor(value_percentage);
                      newZoneLayer.overrideStyle(zone, { fillColor: zone_color });
                    }
                  }
                });

                newZoneLayer.setMap(map);
                setZoneLayer(newZoneLayer);
              }
              break;
            // left side map for rebalancing
            case 'Rebalancing':
              if (isValidGeoJson(zoneData)) {
                var newZoneLayer = new window.google.maps.Data();

                newZoneLayer.addGeoJson(zoneData);
                newZoneLayer.setStyle({ strokeColor: 'white', strokeWeight: 0.25 });

                // loop through zones
                newZoneLayer.forEach(function (zone) {
                  var zoneLocationID = parseInt(zone.getProperty('location_i')).toString(); // using parseInt() here because of anomaly zone 224.000...0003
                  // loop through data
                  for (const [key, value] of Object.entries(rebalancingData)) {
                    if (selectedZone && selectedZone !== '0') {
                      // selectedZone !== '0' because when selecting 'All Zone', value is string instead of int.
                      if (key !== selectedZone) {
                        continue;
                      }
                    }
                    // found zone and data match
                    if (key === zoneLocationID) {
                      const value_percentage = (value - lowest_gap) / (highest_gap - lowest_gap);
                      const zone_color = getColor(value_percentage);
                      if (showRoutes) {
                        if (value_percentage <= 0.2) {
                          newZoneLayer.overrideStyle(zone, { fillColor: zone_color });
                        }
                      } else {
                        newZoneLayer.overrideStyle(zone, { fillColor: zone_color });
                      }
                    }
                  }
                });

                newZoneLayer.setMap(map);
                setZoneLayer(newZoneLayer);
              }
              break;

            default: {
            }
          }

          break;
        }
        default: {
        }
      }
    }
  }, [map, heatmapData, zoneData]);

  // basic map container css
  const containerStyle = {
    height: '99%',
    width: '100%',
    border: '2px solid #303030',
    borderRadius: '6px',
  };

  // map object
  const mapLayer = useMemo(() => {
    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={centerCoord}
        zoom={12}
        options={{ mapId: 'f476029de756efd3', mapTypeId: 'roadmap' }}
        onLoad={onLoad}
        onUnmount={onUnmount}
      ></GoogleMap>
    );
  }, [heatmapData, selectedCountry, selectedZone]);

  // return loading text if loading is not complete, usually doesn't take too long
  if (!isLoaded) {
    return <>Loading</>;
  }

  // return combined map object with all the stuffs
  return (
    <>
      {mapHeader(activeTab, mapId)}
      {mapLayer}
    </>
  );
});

export default Map;
