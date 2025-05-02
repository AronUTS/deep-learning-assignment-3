import React, { useEffect, useState } from 'react';

export default function VideoAnalysis() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/video_analysis');
        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }

        const data = await response.json();
        setVideoUrl(data.video_url);
        setMetrics(data.metrics);
        setStatus('');
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    };

    fetchAnalysis();
  }, []);

  return (
    <div style={styles.container}>
      <h2>Video Analysis Results</h2>
      {status && <p>{status}</p>}

      {videoUrl && (
        <video controls width="480" src={videoUrl} style={{ marginTop: '1rem' }} />
      )}

      {metrics && (
        <div style={styles.metrics}>
          <h3>Metrics</h3>
          <ul>
            {Object.entries(metrics).map(([key, value]) => (
              <li key={key}><strong>{key}:</strong> {value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '700px',
    margin: '0 auto',
    textAlign: 'center',
  },
  metrics: {
    textAlign: 'left',
    marginTop: '1.5rem',
  },
};
