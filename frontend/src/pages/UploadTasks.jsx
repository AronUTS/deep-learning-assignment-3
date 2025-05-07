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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import sampleFrame from '../assets/images/sample_video_frame.png';

// Dummy function to simulate API call for existing tasks
const fetchTasks = () => {
  return Promise.resolve([
    {
      id: 1,
      name: 'video1.mp4',
      status: 'completed',
      progress: 100,
      processTime: '15 mins',
      image: sampleFrame,
    },
    {
      id: 2,
      name: 'video2.mp4',
      status: 'processing',
      progress: 70,
      processTime: '10 mins',
      image: null,
    },
    {
      id: 3,
      name: 'video3.mp4',
      status: 'queued',
      progress: 0,
      processTime: '5 mins',
      image: null,
    },
  ]);
};

export default function UploadTasks() {
  const [statusMsg, setStatusMsg] = useState('');
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks().then((data) => setTasks(data));
  }, []);

  const handleCardClick = (task) => {
    if (task.status === 'completed') {
      navigate(`/analysis/${task.id}`);
    }
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
                {/* Green tick icon for completed */}
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
                      <HourglassEmptyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    ) : (
                      <img
                        src={task.image}
                        alt="Sample Frame"
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
                      Status: {task.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Process Time: {task.processTime}
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
    </Container>
  );
}
