import React from 'react';
import { Typography, Box } from '@mui/material';

function NotFound() {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h3">404 - Page Not Found</Typography>
      <Typography variant="body1">Sorry, the page you're looking for doesn't exist.</Typography>
    </Box>
  );
}

export default NotFound;