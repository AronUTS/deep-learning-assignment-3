import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  LinearProgress,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';

function UploadVideo() {
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleFile = (file) => {
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (!video) return;

    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          alert('Upload complete!');
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        New Video Upload
      </Typography>

      <Paper
        elevation={isDragging ? 6 : 3}
        sx={{
          border: isDragging ? '2px dashed #1976d2' : '2px dashed #ccc',
          padding: 6, // Increased padding for larger box
          textAlign: 'center',
          backgroundColor: isDragging ? '#e3f2fd' : 'inherit',
          transition: 'background-color 0.2s ease',
          cursor: 'pointer',
          width: '100%', // Ensure the box takes up full available width
          height: isMobile ? 300 : 600, // Set fixed height for the video box (adjust as needed)
          maxWidth: '100%', // Make sure the Paper doesn't exceed the container width
          margin: '0 auto', // Center the paper horizontally
          display: 'flex', // Flexbox to align contents in the center
          justifyContent: 'center', // Center content horizontally
          alignItems: 'center', // Center content vertically
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('video-upload').click()}
      >
        <input
          type="file"
          id="video-upload"
          accept="video/*"
          hidden
          onChange={handleFileChange}
        />
        <Typography variant="body1">
          {video ? video.name : 'Drag & drop your video here or click to select'}
        </Typography>
      </Paper>

      {uploading && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mt: 3 }}
        />
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!video || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </Button>
      </Box>
    </Container>
  );
}

export default UploadVideo;
