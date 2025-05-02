import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadVideo from './pages/UploadVideo';
import UploadTasks from './pages/UploadTasks';  // Assume you have this component
import VideoAnalysis from './pages/VideoAnalysis';  // Assume you have this component

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<UploadVideo />} />
          <Route path="/tasks" element={<UploadTasks />} />
          <Route path="/analysis/:id" element={<VideoAnalysis />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
