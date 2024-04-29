import React from 'react';

import {Box,Stack,Heading,Text,Container,Input,Button,SimpleGrid,} from '@chakra-ui/react'


import { Link, useNavigate } from 'react-router-dom';

const LoginButton = () => {
    const navigate = useNavigate();

  const handleButtonClick = () => {
    // Navigate to the desired route when the button is clicked
    navigate('/analytics');
  };

  return (
    <Button
        fontFamily={'heading'}
        mt={8}
        w={'full'}
        bgGradient="linear(to-r, #FCB134,#F1C40F)"
        color={'white'}
        _hover={{
        bgGradient: 'linear(to-r, #FCB134,#F1C40F)',
        boxShadow: 'xl',
        }}
        onClick={handleButtonClick}
        >
        Login
        </Button>
  );
};

export default LoginButton;
