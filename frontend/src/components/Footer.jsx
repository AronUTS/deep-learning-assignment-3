import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundImage: 'linear-gradient(to bottom right, #66bb6a, #1b5e20)', // More contrast
        color: 'white',
        py: 3,
        mt: 4,
        transition: 'background-image 0.5s ease-in-out', // Optional smooth transition for dynamic theme changes
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" color="inherit">
          &copy; {new Date().getFullYear()} Agritrack. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
