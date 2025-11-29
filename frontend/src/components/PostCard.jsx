import React from 'react';

const PostCard = ({ post, onDelete, partner }) => {
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
    </div>
  );
};

export default PostCard;
