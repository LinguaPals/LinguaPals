import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer.jsx';
import VideoModal from './VideoModal.jsx';

const PostCard = ({ post, onDelete, partner }) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="post-card" style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{post.title}</h3>
          <p style={{ margin: '0 0 8px 0', color: '#666' }}>
            {post?.userId?.toString() === localStorage.getItem('userID') ? 'Posted by you' : `Posted by ${partner}`}
          </p>
          <small style={{ color: '#999' }}>
            {formatDate(post.createdAt)}
            {post.status && ` • ${post.status}`}
          </small>
        </div>
        <div style={{width: "50px"}}>
        {onDelete && (post?.userId?.toString() === localStorage.getItem('userID')) && (
            <button 
              onClick={() => onDelete(post._id)}
              style={{
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Delete
            </button>
        )}
        </div>
      </div>
      
      {/* View Video Button - only show if post has storage info */}
      {post.storage?.storageId && (
        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
          <button 
            onClick={() => setShowVideoModal(true)}
            style={{
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 28px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
            }}
          >
            <span>▶</span>
            View Video
          </button>
        </div>
      )}
      
      {/* Show description if exists */}
      {post.description && post.description !== 'Video post' && (
        <p style={{ marginTop: '10px', color: '#555' }}>{post.description}</p>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <VideoModal 
          postId={post._id} 
          mimeType={post.media?.mime}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </div>
  );
};

export default PostCard;