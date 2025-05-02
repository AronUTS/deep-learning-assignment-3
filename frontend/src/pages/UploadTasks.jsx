import React, { useState } from 'react';

export default function UploadTasks() {
  const [taskFile, setTaskFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTaskFile(file);
      setStatus('');
    }
  };

  const handleUpload = async () => {
    if (!taskFile) {
      setStatus('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('tasks', taskFile);

    try {
      const response = await fetch('/api/upload_tasks', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatus('Tasks uploaded successfully.');
      } else {
        const err = await response.text();
        setStatus(`Upload failed: ${err}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload Task List</h2>
      <input type="file" accept=".csv,.json" onChange={handleFileChange} />
      <button onClick={handleUpload} style={styles.button}>Upload</button>
      {status && <p>{status}</p>}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  button: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
  },
};
