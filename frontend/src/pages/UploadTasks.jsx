import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Container,
  Tooltip,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function UploadTasks() {
  const [statusMsg, setStatusMsg] = useState('');
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId;

    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/processing_queue');
        const data = await response.json();

        if (!Array.isArray(data.result)) {
          throw new Error('Invalid task data');
        }

        const formatted = data.result.map((t) => ({
          id: t.id,
          name: t.file_name,
          status: t.status.toLowerCase(),
          progress: t.progress_percentage || 0,
          processTime: t.processing_time ? `${t.processing_time}s` : '—',
          image: t.thumbnail_path || null,
        }));

        setTasks(formatted);
        setStatusMsg('');
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setStatusMsg('Failed to load tasks. Please try again later.');
      }
    };

    fetchTasks(); // Initial fetch
    intervalId = setInterval(fetchTasks, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleCardClick = (task) => {
    if (task.status === 'completed') {
      navigate(`/analysis/${task.id}`);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Processing Queue
        </Typography>
        {statusMsg && (
          <Typography sx={{ mt: 2 }} color="textSecondary">
            {statusMsg}
          </Typography>
        )}
      </Box>

      {tasks.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            mt: 6,
            p: 4,
            border: '1px dashed #ccc',
            borderRadius: 2,
            backgroundColor: '#fafafa',
          }}
        >
          <Typography variant="h6" gutterBottom>
            No tasks found.
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            It looks like you haven’t uploaded any videos for processing yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/upload')}
            sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
          >
            Upload Your First Video
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Tasks
          </Typography>
          <Stack spacing={2}>
            {tasks.map((task) => {
              const isCompleted = task.status === 'completed';

              return (
                <Tooltip
                  key={task.id}
                  title={isCompleted ? '' : 'Available when completed'}
                  arrow
                  disableHoverListener={isCompleted}
                >
                  <Card
                    onClick={() => handleCardClick(task)}
                    sx={{
                      height: 'auto',
                      position: 'relative',
                      cursor: isCompleted ? 'pointer' : 'not-allowed',
                      opacity: isCompleted ? 1 : 0.7,
                      filter: isCompleted ? 'none' : 'grayscale(0.5)',
                      '&:hover': {
                        boxShadow: isCompleted ? 6 : undefined,
                      },
                    }}
                  >
                    {isCompleted && (
                      <CheckCircleIcon
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontSize: 28,
                          color: 'white',
                          background: 'linear-gradient(to right, #4CAF50, #81C784)',
                          borderRadius: '50%',
                          padding: '2px',
                        }}
                      />
                    )}

                    <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box
                        sx={{
                          width: 100,
                          height: 80,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        {task.status === 'processing' || task.status === 'queued' ? (
                          <HourglassEmptyIcon
                            sx={{
                              fontSize: 40,
                              color: 'primary.main',
                              animation: 'spin 2s linear infinite',
                              '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                              },
                            }}
                          />
                        ) : (
                          <img
                            src={`${window.location.origin}/assets/thumbnails/processed/${task.name}.jpg` || '/assets/sample_video_frame.png'}
                            alt="A thumbnail of the processed video"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {task.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Status: {task.status.toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Processing Time: {formatDuration(task.processTime)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress}
                          sx={{ mt: 1 }}
                          color={isCompleted ? 'success' : 'primary'}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Tooltip>
              );
            })}
          </Stack>

          {/* Upload another video CTA */}
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              Want to upload another video?
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => navigate('/upload')}
              sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
            >
              Upload Another Video
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
