import React, { useState } from 'react';

export default function UploadVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewURL, setPreviewURL] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setPreviewURL(URL.createObjectURL(file));
      setUploadStatus('');
    } else {
      setUploadStatus('Please select a valid video file.');
      setVideoFile(null);
      setPreviewURL(null);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setUploadStatus('No video selected.');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('Upload successful!');
      } else {
        const err = await response.text();
        setUploadStatus(`Upload failed: ${err}`);
      }
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload a Video</h2>

      <input type="file" accept="video/*" onChange={handleFileChange} />
      
      {previewURL && (
        <div style={styles.preview}>
          <video src={previewURL} controls width="480" />
        </div>
      )}

      <button onClick={handleUpload} style={styles.button}>
        Upload
      </button>

      {uploadStatus && <p>{uploadStatus}</p>}
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
  preview: {
    marginTop: '1rem',
  },
  button: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
  },
};
