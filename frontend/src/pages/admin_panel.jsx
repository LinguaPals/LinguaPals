import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoModal from '../components/VideoModal.jsx';
import {
    fetchAllPosts,
    deletePostAsModerator,
    fetchAllUsers,
    deleteUserAsModerator
} from '../services/adminService.js';

function AdminPanel() {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const navigate = useNavigate();

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [postResponse, userResponse] = await Promise.all([
                fetchAllPosts(),
                fetchAllUsers()
            ]);
            setPosts(postResponse?.data || []);
            setUsers(userResponse?.data || []);
        } catch (err) {
            console.error('Failed to load admin data', err);
            setError('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await deletePostAsModerator(postId);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            alert('Failed to delete post');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Delete this user and all their posts?')) return;
        try {
            await deleteUserAsModerator(userId);
            setUsers(users.filter(u => u._id !== userId));
            setPosts(posts.filter(p => String(p.userId?._id) !== String(userId)));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userID');
        localStorage.removeItem('isModerator');
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ margin: '0 0 10px 0' }}>Admin Panel</h1>
                <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>

            {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Loading...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Users Panel */}
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Users Control ({users.length})</h2>
                        {users.length === 0 ? (
                            <p>No users found</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '70vh', overflowY: 'auto' }}>
                                {users.map(user => (
                                    <div
                                        key={user._id}
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {user.username || 'No username'} {user.isModerator && <span style={{ color: 'green' }}>👑</span>}
                                            </h4>
                                            <p style={{ margin: 0, color: '#666', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {user.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            disabled={user.isModerator}
                                            style={{
                                                padding: '6px 12px',
                                                background: user.isModerator ? '#ccc' : '#ff4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: user.isModerator ? 'not-allowed' : 'pointer',
                                                marginLeft: '10px',
                                                fontSize: '12px'
                                            }}
                                            title={user.isModerator ? 'Cannot delete moderators' : ''}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Posts Panel */}
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Posts Control ({posts.length})</h2>
                        {posts.length === 0 ? (
                            <p>No posts found</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '70vh', overflowY: 'auto' }}>
                                {posts.map(post => (
                                    <div
                                        key={post._id}
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {post.title || 'Untitled'}
                                            </h4>
                                            <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                By: {post.userId?.username || 'Unknown'}
                                            </p>
                                            <p style={{ margin: 0, color: '#999', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {post.description}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
                                            <button
                                                onClick={() => setSelectedPostId(post._id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#4CAF50',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post._id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#ff4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedPostId && (
                <VideoModal 
                    postId={selectedPostId} 
                    onClose={() => setSelectedPostId(null)} 
                />
            )}
        </div>
    );
}

export default AdminPanel;
