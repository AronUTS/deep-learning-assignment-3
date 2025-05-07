import React from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link } from 'react-router-dom';
import landingImageDesktop from '../assets/images/example_landing_desktop.jpg'; 
import landingImageMobile from '../assets/images/example_landing_mobile.png'; 

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Grid container spacing={4} alignItems="center" direction={isMobile ? 'column-reverse' : 'row'}>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant={isMobile ? 'h4' : 'h2'} fontWeight="bold" gutterBottom>
              Agritrack helps you monitor livestock with powerful AI tools
            </Typography>
            <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ mb: 4 }} color="text.secondary">
              Join farmers and ranchers using Agritrack to effortlessly track, count, and analyse livestock from drone footage — all in one simple platform.
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/upload"
              sx={{
                background: 'linear-gradient(135deg, #1b5e20, #66bb6a)',
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                border: 0,
                transition: 'all .3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388e3c, #81c784)',
                  border: 0,
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={isMobile ? landingImageMobile : landingImageDesktop}
              alt="Livestock analysis"
              style={{
                maxHeight: isMobile ? 200 : 600,
                width: '100%',
                borderRadius: 12,
                objectFit: 'cover'
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
