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
        await new Promise((res) => setTimeout(res, 500));
        const data = mockResponse;
        setVideoUrl(data.video_url);
        setMetrics(data.metrics);
        setVideoInfo(data.video_info);
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
