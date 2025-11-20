import { useState, useEffect } from 'react';
import TopBar from '../components/top_bar.jsx'
import Card from '../components/card.jsx'
import BottomBar from '../components/bottom_bar.jsx'
import PostCard from '../components/PostCard.jsx'
import RecordVideo from '../components/record.jsx'
import { getPosts, createPost, deletePost, generateAndPublish, deleteMatchForUsers } from '../services/postService.js'
import { getCurrentUser } from '../services/userService.js'


function Dashboard({ user, setUser }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', description: '' });
    const [usersPair, setUsersPair] = useState(null);
    const [userStats, setUserStats] = useState({ streakCount: 0, level: 0 });
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);
    const fetchUserStats = async () => {
        try {
            setStatsLoading(true);
            setStatsError(null);
            const response = await getCurrentUser();
            if (response?.success && response?.data) {
                setUserStats({
                    streakCount: response.data.streakCount ?? 0,
                    level: response.data.level ?? 0
                });
            } else {
                setStatsError('Unable to load stats');
            }
        } catch (err) {
            console.error(err);
            setStatsError('Unable to load stats');
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch data on mount
    useEffect(() => {
        fetchPosts();
        fetchUserStats();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await getPosts();
            if (response.success) {
                setPosts(response.data);
            }
            setError(null);
        } catch (err) {
            setError('Failed to load posts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.title.trim() || !newPost.description.trim()) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await createPost({
                title: newPost.title,
                description: newPost.description,
                userId: localStorage.getItem('userID')
            });
            
            if (response.success) {
                setPosts([response.data, ...posts]);
                setNewPost({ title: '', description: '' });
                setShowCreateForm(false);
            }
        } catch (err) {
            alert('Failed to create post');
            console.error(err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        
        try {
            await deletePost(postId);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            alert('Failed to delete post');
            console.error(err);
        }
    };

    const matchUser = async () => {
        if(usersPair) {
            alert(`User is already matched with:  ${localStorage.getItem("UserPair")}`);
            console.log("User is already matched with: ", usersPair.partnerId);
            return;
        }
        try {
            const pair = await generateAndPublish();
            if(!pair){
                console.error("Error finding match");
                return;
            }
            setUsersPair(pair);
            localStorage.setItem("UserPair", pair.partnerId);
            console.log("Successfully matched user with: ", pair.partnerId);

        } catch (error) {
            console.log("Couldn't match user: ", error);
            throw error;
        }
    };

    const unmatchUser = async () => {
        try {
            const response = await deleteMatchForUsers();

            setUsersPair(null);
            localStorage.removeItem("UserPair");
            
            alert("You have been unmatched successfully.");
        }
        catch (error) {
            console.log("Failed unmatching user ", error);
            throw error;
        }
        
        
    }
    return (
        <>
            <div>
                <TopBar user_auth={user} setUser={setUser}/>
            </div>

            <div className="content">
                <h1 className="logo">LinguaPals</h1>
                <div className="dashboard-layout">
                    <div className="center-box">
                        {!usersPair ? (
                        <button className="match-button"
                        onClick={matchUser}>
                        Match Me!
                        </button> ) : (
                            <RecordVideo />
                        )}
                        
                        {usersPair && 
                        <button className="unmatch-button"
                                onClick={unmatchUser}>
                            -Unmatch-
                        </button>}
                        <hr style={{ flex: 1, border: "none", borderTop: "1px solid lightgray", margin: "0px"}}/>
                        <h4 style={{ color: "black", margin: "5px"}}>Your turn to respond</h4>
                        
                        {/* Posts Section */}
                        <div style={{ marginTop: '20px', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, color: 'black' }}>Recent Posts</h3>
                                <button 
                                    onClick={() => setShowCreateForm(!showCreateForm)}
                                    style={{
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showCreateForm ? 'Cancel' : '+ New Post'}
                                </button>
                            </div>

                            {/* Create Post Form */}
                            {showCreateForm && (
                                <form onSubmit={handleCreatePost} style={{
                                    background: '#f5f5f5',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    marginBottom: '15px'
                                }}>
                                    <input
                                        type="text"
                                        placeholder="Post Title"
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            marginBottom: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <textarea
                                        placeholder="Post Description"
                                        value={newPost.description}
                                        onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            marginBottom: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            boxSizing: 'border-box',
                                            resize: 'vertical'
                                        }}
                                    />
                                    <button 
                                        type="submit"
                                        style={{
                                            background: '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '10px 20px',
                                            cursor: 'pointer',
                                            width: '100%'
                                        }}
                                    >
                                        Create Post
                                    </button>
                                </form>
                            )}

                            {/* Posts List */}
                            {loading ? (
                                <p style={{ color: '#666' }}>Loading posts...</p>
                            ) : error ? (
                                <p style={{ color: '#ff4444' }}>{error}</p>
                            ) : posts.length === 0 ? (
                                <p style={{ color: '#666' }}>No posts yet. Create your first post!</p>
                            ) : (
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {posts.map(post => (
                                        <PostCard 
                                            key={post._id} 
                                            post={post} 
                                            onDelete={handleDeletePost}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="right-cards">
                        <Card
                            title="Streaks"
                            value={statsLoading ? '...' : statsError ? '--' : userStats.streakCount}
                            footer={statsLoading ? 'Fetching...' : statsError ? statsError : 'Consecutive days active'}
                        />
                        <Card
                            title="Level"
                            value={statsLoading ? '...' : statsError ? '--' : userStats.level}
                            footer={statsLoading ? 'Fetching...' : statsError ? statsError : 'Current proficiency tier'}
                        />
                    </div>
                </div>
            </div>
            <BottomBar />

        </>
    )
}
export default Dashboard;

