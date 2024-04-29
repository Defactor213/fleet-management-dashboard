import React, { useState } from 'react';
import { Box, Heading, Stack, Input, Button, Text, Container, SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/login', formData);

      if (response.status === 200) {
        setMessage('Login successful');
        navigate('/analytics');
      } else {
        setMessage('Login failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Login failed. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Box position="relative">
      <Container
        as={SimpleGrid}
        maxW={'7xl'}
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 10, lg: 32 }}
        py={{ base: 10, sm: 20, lg: 32 }}>
          <Stack spacing={{ base: 10, md: 20 }}>
          <Heading
            lineHeight={1.1}
            fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}>
            Fleet Maintenance{' '}
            <Text as={'span'} bgGradient="linear(to-r, #FCB134,#F1C40F)" bgClip="text">
              &
            </Text>{' '}
            Analytics
          </Heading>
          <Stack direction={'row'} spacing={4} align={'center'}>
          </Stack>
        </Stack>
      <Stack
        bg="gray.50"
        rounded="xl"
        p={{ base: 4, sm: 6, md: 8 }}
        spacing={{ base: 8 }}
        maxW={{ lg: 'lg' }}
      >
        <Stack spacing={4}>
          <Heading
            color="gray.800"
            lineHeight={1.1}
            fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
          >
            User Login
          </Heading>
        </Stack>
        <Box as="form" mt={10} onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Input
              placeholder="Username"
              name="username"
              value={formData.username}
              bg="gray.100"
              border={0}
              color="gray.500"
              _placeholder={{
                color: 'gray.500',
              }}
              onChange={handleInputChange}
            />
            <Input
              placeholder="Password"
              type="password"
              name="password"
              value={formData.password}
              bg="gray.100"
              border={0}
              color="gray.500"
              _placeholder={{
                color: 'gray.500',
              }}
              onChange={handleInputChange}
            />
          </Stack>
          <Button
            type="submit"
            fontFamily={'heading'}
            mt={8}
            w={'full'}
            bgGradient="linear(to-r, #FCB134,#F1C40F)"
            color={'white'}
            _hover={{
            bgGradient: 'linear(to-r, #FCB134,#F1C40F)',
            boxShadow: 'xl',
        }}
          >
            Login
          </Button>
          {message && (
            <Text color={message === 'Login successful' ? 'green.500' : 'red.500'}>
              {message}
            </Text>
          )}
        </Box>
      </Stack>
      </Container>
    </Box>
  );
}
