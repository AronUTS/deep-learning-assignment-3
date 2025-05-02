import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // ✅ Import this
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

const mockResponse = {
  video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
  metrics: {
    'Detected Objects': 42,
    'Average Confidence': '91%',
    'Processing Time': '2.3s',
    'Frames Processed': 120,
  },
};

export default function VideoAnalysis() {
  const { id } = useParams(); // ✅ Get the ID
  const [videoUrl, setVideoUrl] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // Simulate delay or replace with real API call like `/api/video_analysis/${id}`
        await new Promise((res) => setTimeout(res, 500));
        const data = mockResponse;
        setVideoUrl(data.video_url);
        setMetrics(data.metrics);
        setStatus('');
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    };

    fetchAnalysis();
  }, [id]);

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Video Analysis – ID {id}
      </Typography>

      {status && (
        <Box textAlign="center" sx={{ mt: 3 }}>
          {status.startsWith('Loading') ? (
            <CircularProgress />
          ) : (
            <Typography color="error">{status}</Typography>
          )}
        </Box>
      )}

      {videoUrl && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <video
            controls
            width="100%"
            style={{ maxWidth: '720px', borderRadius: 8 }}
            src={videoUrl}
          />
        </Box>
      )}

      {metrics && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Analysis Metrics
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(metrics).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      {key}
                    </Typography>
                    <Typography variant="h6">{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}
