import { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ postId, mimeType }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const videoRef = useRef(null);
  
  const API_BASE_URL = 'http://localhost:5050/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && postId) {
      fetchVideo();
    }
  }, [postId, token]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting video fetch for post:', postId);
      
      // First, fetch video metadata with auth header
      const metadataResponse = await fetch(`${API_BASE_URL}/posts/${postId}/play`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Metadata response status:', metadataResponse.status);
      
      if (!metadataResponse.ok) {
        throw new Error(`Metadata fetch failed: ${metadataResponse.status}`);
      }
      
      const metadataData = await metadataResponse.json();
      
      if (!metadataData.success) {
        throw new Error(metadataData.message || 'Failed to fetch video metadata');
      }
      
      console.log('Video metadata fetched:', metadataData.data);
      
      // Now fetch the actual video file as a blob
      const streamUrl = `${API_BASE_URL}/posts/${postId}/stream?token=${token}`;
      console.log('Fetching video stream from:', streamUrl);
      
      const videoResponse = await fetch(streamUrl);
      
      console.log('Video response status:', videoResponse.status);
      console.log('Video response headers:', {
        contentType: videoResponse.headers.get('content-type'),
        contentLength: videoResponse.headers.get('content-length')
      });
      
      if (!videoResponse.ok) {
        throw new Error(`Video fetch failed: ${videoResponse.status}`);
      }
      
      const videoBlob = await videoResponse.blob();
      console.log('Video blob received, size:', videoBlob.size, 'type:', videoBlob.type);
      
      if (videoBlob.size === 0) {
        throw new Error('Received empty video blob');
      }
      
      // Create a blob URL for the video
      const blobUrl = URL.createObjectURL(videoBlob);
      console.log('Blob URL created:', blobUrl);
      
      setVideoUrl(blobUrl);
      setLoading(false);
      
    } catch (err) {
      console.error('Video fetch error:', err);
      setError(err.message || 'Failed to load video');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ padding: '20px', background: '#fee', color: '#c00', borderRadius: '4px' }}>
        Please log in to view videos
      </div>
    );
  }
  
  const handleCanPlay = () => {
    setLoading(false);
  };
  
  const handleError = (e) => {
    setLoading(false);
    const errorCode = e.target?.error?.code;
    const errorMsg = e.target?.error?.message || 'Unknown error';
    let friendlyError = 'Failed to load video';
    
    // Map error codes to friendly messages
    if (errorCode === 1) friendlyError = 'Video loading aborted';
    if (errorCode === 2) friendlyError = 'Network error - check backend server';
    if (errorCode === 3) friendlyError = 'Video decoding failed';
    if (errorCode === 4) friendlyError = 'Video format not supported';
    
    setError(friendlyError);
    console.error('Video playback error code:', errorCode);
    console.error('Video playback error message:', errorMsg);
    console.error('Full error:', e.target?.error);
  };
  
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: '#666',
          zIndex: 10
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
      
      {videoUrl && (
        <video
          ref={videoRef}
          controls
          style={{ 
            width: '100%', 
            maxHeight: '400px',
            backgroundColor: '#000',
            display: error ? 'none' : 'block'
          }}
          onCanPlay={handleCanPlay}
          onError={handleError}
        >
          <source src={videoUrl} type={mimeType || "video/mp4"} />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;