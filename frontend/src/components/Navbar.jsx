import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Button, IconButton, Drawer } from '@mui/material';
import { Link } from 'react-router-dom';
import logo from '../assets/images/agritrack_logo.png';
import MenuIcon from '@mui/icons-material/Menu';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/system';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is mobile or below
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // For mobile menu button
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // For drawer
  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Left side: Logo and Text with Link to homepage */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src={logo} alt="Agritrack Logo" style={{ height: 40, marginRight: 8 }} />
              <Typography
                variant="h6"
                sx={{
                  background: 'linear-gradient(135deg, #1b5e20, #66bb6a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                }}
              >
                AGRITRACK
              </Typography>
            </Link>
          </div>

          {/* For desktop or large screens: Navigation buttons */}
          {!isMobile ? (
            <div>
              <Button
                component={Link}
                to="/upload"
                sx={{
                  background: 'transparent',
                  transition: 'all .3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1b5e20, #66bb6a)', // Gradient background
                    color: 'white',
                  },
                  mr: 2, // Space between buttons
                }}
              >
                Upload Video
              </Button>
              <Button
                component={Link}
                to="/tasks"
                sx={{
                  background: 'transparent',
                  transition: 'all .3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1b5e20, #66bb6a)', // Gradient background
                    color: 'white',
                  },
                }}
              >
                Processing Queue
              </Button>
            </div>
          ) : (
            // For mobile: Hamburger Menu
            <div>
              <IconButton
                edge="end"
                color="inherit"
                onClick={toggleDrawer(true)}
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>

              {/* Drawer for mobile */}
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                <div style={{ width: 250, padding: 20 }}>
                  <Button
                    fullWidth
                    color="inherit"
                    component={Link}
                    to="/upload"
                    onClick={toggleDrawer(false)}
                  >
                    Upload Video
                  </Button>
                  <Button
                    fullWidth
                    color="inherit"
                    component={Link}
                    to="/tasks"
                    onClick={toggleDrawer(false)}
                  >
                    Processing Queue
                  </Button>
                </div>
              </Drawer>
            </div>
          )}
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
