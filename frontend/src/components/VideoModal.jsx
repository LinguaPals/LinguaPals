import { useState, useRef, useEffect } from 'react';

const VideoModal = ({ postId, mimeType, onClose }) => {
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

    // Add ESC key listener
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [postId, token, onClose]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      setError(null);
            
      // First, fetch video metadata with auth header
      const metadataResponse = await fetch(`${API_BASE_URL}/posts/${postId}/play`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
            
      if (!metadataResponse.ok) {
        throw new Error(`Metadata fetch failed: ${metadataResponse.status}`);
      }
      
      const metadataData = await metadataResponse.json();
      
      if (!metadataData.success) {
        throw new Error(metadataData.message || 'Failed to fetch video metadata');
      }
            
      // Now fetch the actual video file as a blob
      const streamUrl = `${API_BASE_URL}/posts/${postId}/stream?token=${token}`;
      
      const videoResponse = await fetch(streamUrl);
      
      if (!videoResponse.ok) {
        throw new Error(`Video fetch failed: ${videoResponse.status}`);
      }
      
      const videoBlob = await videoResponse.blob();
      
      if (videoBlob.size === 0) {
        throw new Error('Received empty video blob');
      }
      
      // Create a blob URL for the video
      const blobUrl = URL.createObjectURL(videoBlob);
      
      setVideoUrl(blobUrl);
      setLoading(false);
      
    } catch (err) {
      console.error('Video fetch error:', err);
      setError(err.message || 'Failed to load video');
      setLoading(false);
    }
  };

  const handleCanPlay = () => {
    setLoading(false);
  };
  
  const handleError = (e) => {
    setLoading(false);
    const errorCode = e.target?.error?.code;
    const errorMsg = e.target?.error?.message || 'Unknown error';
    let friendlyError = 'Failed to load video';
    
    if (errorCode === 1) friendlyError = 'Video loading aborted';
    if (errorCode === 2) friendlyError = 'Network error - check backend server';
    if (errorCode === 3) friendlyError = 'Video decoding failed';
    if (errorCode === 4) friendlyError = 'Video format not supported';
    
    setError(friendlyError);
    console.error('Video playback error code:', errorCode);
    console.error('Video playback error message:', errorMsg);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.3s ease'
      }}
      onClick={(e) => {
        // Close if clicking on the overlay (not the modal content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      
      <div style={{
        position: 'relative',
        backgroundColor: '#1a1a1a',
        borderRadius: '20px',
        padding: '25px',
        maxWidth: '90%',
        maxHeight: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(33, 150, 243, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animation: 'slideIn 0.3s ease',
        overflow: 'hidden'
      }}>
        {/* Header with Title and Close Button */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{
            margin: 0,
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            Video Player
          </h2>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              fontSize: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
              fontWeight: '300'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
            }}
          >
            ×
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            width: '100%'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(33, 150, 243, 0.2)',
              borderTop: '4px solid #2196F3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
            <p style={{
              fontSize: '16px',
              color: '#b0b0b0',
              margin: 0,
              fontWeight: '500'
            }}>
              Loading video...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 193, 7, 0.1))',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            color: '#ff9999',
            borderRadius: '10px',
            marginBottom: '20px',
            maxWidth: '500px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <div style={{ marginBottom: '10px', fontSize: '20px' }}>⚠️</div>
            {error}
          </div>
        )}

        {/* Video Player */}
        {videoUrl && !error && (
          <div style={{
            width: '100%',
            backgroundColor: '#000000',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <video
              ref={videoRef}
              controls
              autoPlay
              style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: '600px',
                display: 'block'
              }}
              onCanPlay={handleCanPlay}
              onError={handleError}
            >
              <source src={videoUrl} type={mimeType || "video/mp4"} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Footer Info */}
        {videoUrl && !loading && !error && (
          <div style={{
            width: '100%',
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#808080',
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              Press ESC or click the X to close
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoModal;
