import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Dummy function to simulate API call for existing tasks
const fetchTasks = () => {
  return Promise.resolve([
    {
      id: 1,
      name: 'video1.mp4',
      status: 'processing',
      progress: 70,
    },
    {
      id: 2,
      name: 'video2.mp4',
      status: 'completed',
      progress: 100,
    },
    {
      id: 3,
      name: 'video3.mp4',
      status: 'queued',
      progress: 0,
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
        <Typography variant="h4" gutterBottom>
          Uploaded Task List
        </Typography>
        {statusMsg && (
          <Typography sx={{ mt: 2 }} color="textSecondary">
            {statusMsg}
          </Typography>
        )}
      </Box>

      <Typography variant="h5" gutterBottom>
        Existing Tasks
      </Typography>

      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card
              onClick={() => handleCardClick(task)}
              sx={{
                height: '100%',
                cursor: task.status === 'completed' ? 'pointer' : 'default',
                '&:hover': {
                  boxShadow:
                    task.status === 'completed' ? 6 : undefined,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {task.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {task.status}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={task.progress}
                  sx={{ mt: 1 }}
                  color={task.status === 'completed' ? 'success' : 'primary'}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
