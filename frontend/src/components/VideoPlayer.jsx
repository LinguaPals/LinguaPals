import { useState, useRef } from 'react';

const VideoPlayer = ({ postId, mimeType }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  
  const API_BASE_URL = 'http://localhost:5050/api';
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div style={{ padding: '20px', background: '#fee', color: '#c00', borderRadius: '4px' }}>
        Please log in to view videos
      </div>
    );
  }
  
  // Construct streaming URL with auth token as query param
  const streamUrl = `${API_BASE_URL}/posts/${postId}/stream?token=${token}`;
  
  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };
  
  const handleCanPlay = () => {
    setLoading(false);
  };
  
  const handleError = (e) => {
    setLoading(false);
    setError('Failed to load video');
    console.error('Video playback error:', e);
  };
  
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: '#666'
        }}>
          Loading video...
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: '20px', 
          background: '#fee', 
          color: '#c00',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <video
        ref={videoRef}
        controls
        style={{ 
          width: '100%', 
          maxHeight: '400px',
          backgroundColor: '#000',
          display: error ? 'none' : 'block'
        }}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
      >
        <source src={streamUrl} type={mimeType || "video/mp4"} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;