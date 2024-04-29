// header component for top of page
// contains date, time, playpause, restart components
import { Box, Flex, Text, Divider } from '@chakra-ui/react';
import { Stack } from '@chakra-ui/react';

// styling sheet
import componentStyles from '../styles/styles.js';

import continental_logo from '../images/continental-logo.png';

// individual components
import DateComponent from '../components/date.jsx';
import TimeComponent from '../components/time.jsx';
import StartPauseButton from '../components/startPause.jsx';
import RestartButton from '../components/restart.jsx';

function HeaderComponent() {
  const { greyBox, dividerStack, dividerLine } = componentStyles;

  return (
    <Flex id="Header_Box" {...greyBox} h={'10vh'} alignItems={'center'}>
      <Flex id="HeaderContent_Flex" w={'100%'} p={'8px'} alignItems={'center'} justifyContent={'space-between'}>
        <Text id="Title" w={'18vw'} ml={'10px'} overflow={'hidden'} fontSize={'3vh'} fontWeight={'bold'} color={'#FCB134'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} isTruncated>
          Analytics Dashboard
        </Text>
        <Flex id="ControlPanel_Flex" w={'35vw'} mr={'2%'} alignItems={'center'} justifyContent={'center'} color={'#ffffff'} textAlign={'center'}>
          <StartPauseButton />
          <RestartButton />

          <Stack {...dividerStack}>
            <Divider {...dividerLine} />
          </Stack>

          <Box id="DateText_Box" h={'100%'} w={'13vw'} alignContent={'vertical'} justifyContent={'center'} overflow={'hidden'}>
            <DateComponent />
          </Box>

          <Stack {...dividerStack}>
            <Divider {...dividerLine} />
          </Stack>

          <Box id="TimeText_Box" h={'100%'} w={'18vw'} overflow={'hidden'} textAlign={'left'}>
            <TimeComponent />
          </Box>
        </Flex>
        <Box h={'9vh'} aspectRatio={1 / 1}>
          <img src={continental_logo} alt="continental_logo" style={{ width: '100%', height: '100%' }} />
        </Box>
      </Flex>
    </Flex>
  );
}

export default HeaderComponent;
