import React from 'react';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">AGRITRACK</Typography>
          <div>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/tasks">
              Uploaded Tasks
            </Button>
          </div>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
