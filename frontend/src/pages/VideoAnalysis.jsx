import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
} from '@mui/material';

const mockResponse = {
  video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
  video_info: {
    name: 'sample_video.mp4',
    resolution: '1280x720',
    duration: '15 seconds',
    size: '4.5MB',
    format: 'MP4',
  },
  metrics: {
    'Detected Objects': 42,
    'Average Confidence': '91%',
    'Processing Time': '2.3s',
    'Frames Processed': 120,
  },
};

export default function VideoAnalysis() {
  const { id } = useParams();
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/analysis?task_id=${id}`);
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
  
        const data = await response.json();
  
        // Construct the processed video URL if you store it locally or remotely
        const videoUrl = `${window.location.origin}/assets/videos/processed/encoded_${data.file_name}`;
  
        // Convert duration seconds to readable time
        const formatDuration = (seconds) => {
          if (seconds !== null) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}m ${secs}s`;
          } else {
            return '-'
          }
        };
  
        // Format average precision (if it's a float like 0.87)
        const avgConfidence = data.average_precision
          ? `${Math.round(data.average_precision * 100)}%`
          : 'N/A';
  
        setVideoUrl(videoUrl);
  
        setVideoInfo({
          Name: data.file_name,
          Uploaded: new Date(data.upload_timestamp).toLocaleString(),
          Format: data.format,
          Resolution: data.resolution,
          Duration: formatDuration(data.duration),
          Size: `${(data.size / (1024 * 1024)).toFixed(2)} MB`,
        });
  
        setMetrics({
          'Detected Objects': data.detected_objects,
          'Frames Processed': data.processed_frames,
          'Average Confidence': avgConfidence,
          'Processing Time': formatDuration(data.processing_time),
        });
  
        setStatus('');
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    };
  
    fetchAnalysis();
  }, [id]);

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
        Analysis Report: ID #{id}
      </Typography>

      {status && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          {status.startsWith('Loading') ? (
            <CircularProgress size={40} />
          ) : (
            <Typography color="error">{status}</Typography>
          )}
        </Box>
      )}

      {/* Responsive two-column layout */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {/* Left column: Video */}
        <Grid item xs={12} md={6}>
          {videoUrl && (
            <Box
              sx={{
                width: '100%',
                boxShadow: 3,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <video
                controls
                width="100%"
                src={videoUrl}
                style={{ display: 'block' }}
                preload="auto"  // Preload video to allow better streaming and buffering
                type="video/mp4"
              />
            </Box>
          )}
        </Grid>

        {/* Right column: Info + Metrics */}
        <Grid item xs={12} md={6}>
          {/* Video Info */}
          {videoInfo && (
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎬 Video Details
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(videoInfo).map(([label, value]) => (
                    <Grid item xs={6} sm={4} key={label}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body1">{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Metrics Summary Text */}
          {metrics && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ fontSize: '1.05rem' }}>
                This video analysis processed <strong>{metrics['Frames Processed']}</strong> frames,
                detecting <strong>{metrics['Detected Objects']}</strong> objects with an average confidence of{' '}
                <strong>{metrics['Average Confidence']}</strong> in just <strong>{metrics['Processing Time']}</strong>.
              </Typography>
            </Box>
          )}

          {/* Metric Cards */}
          {metrics && (
            <Grid container spacing={2}>
              {Object.entries(metrics).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: 1,
                      transition: '0.3s',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {key}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
