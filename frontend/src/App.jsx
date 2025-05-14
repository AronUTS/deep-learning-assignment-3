import React from 'react';
import { CssBaseline, ThemeProvider, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import UploadVideo from './pages/UploadVideo';
import UploadTasks from './pages/UploadTasks';
import VideoAnalysis from './pages/VideoAnalysis';
import Footer from './components/Footer';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Navbar />
          <Box
            component="main"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<UploadVideo />} />
              <Route path="/tasks" element={<UploadTasks />} />
              <Route path="/analysis/:id" element={<VideoAnalysis />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
