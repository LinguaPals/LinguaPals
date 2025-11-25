import { useState, useEffect } from 'react';
import TopBar from '../components/top_bar.jsx'
import Card from '../components/card.jsx'
import BottomBar from '../components/bottom_bar.jsx'
import PostCard from '../components/PostCard.jsx'
import RecordVideo from '../components/record.jsx'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getPosts, createPost, deletePost, requestMatch, deleteMatchForUsers } from '../services/postService.js'
import { getCurrentUser } from '../services/userService.js'

function Dashboard({ user, setUser }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showRecorder, setShowRecorder] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', description: '' });
    const [usersPair, setUsersPair] = useState(null);
    const [userStats, setUserStats] = useState({ streakCount: 0, level: 0, username: null });
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);
    const fetchUserStats = async () => {
        try {
            setStatsLoading(true);
            setStatsError(null);
            const response = await getCurrentUser();
            if (response?.success && response?.data) {
                console.log("Successfully retrieved user info");
                setUserStats({
                    streakCount: response.data.streakCount ?? 0,
                    level: response.data.level ?? 0,
                    username: response.data.username ?? null
                });
                //set users pair
                console.log("Partner Username: ", response.data.partnerUsername);
                setUsersPair(response.data.partnerUsername);
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
                // Update level if returned from backend
                if (response.user?.level !== undefined) {
                    setUserStats(prev => ({ ...prev, level: response.user.level }));
                }
            }
        } catch (err) {
            alert('Failed to create post');
            console.error(err);
        }
    };

    const handleVideoSubmit = async (videoBlob, title) => {
        try {
            // For now, create a post with the title and a placeholder for video
            // You can upload the video to your backend/storage service here
            const response = await createPost({
                title: title,
                description: 'Video post',
                userId: localStorage.getItem('userID'),
                // videoBlob can be uploaded to backend or cloud storage
            });
            
            if (response.success) {
                setPosts([response.data, ...posts]);
                setShowRecorder(false);
                alert('Video post created successfully!');
                // Update level if returned from backend
                if (response.user?.level !== undefined) {
                    setUserStats(prev => ({ ...prev, level: response.user.level }));
                }
            }
        } catch (err) {
            alert('Failed to create video post');
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
            alert(`User is already matched`);
            return;
        }
        try {
            const pair = await requestMatch();
            if(!pair){
                console.error("Error finding match");
                return;
            }
            console.log("Partner username", pair.data.partnerUsername);
            setUsersPair(pair.data.partnerUsername);
            console.log("Successfully matched user");

        } catch (error) {
            console.log("Couldn't match user: ", error);
            throw error;
        }
    };

    const unmatchUser = async () => {
        try {
            const response = await deleteMatchForUsers();

            setUsersPair(null);
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
                <TopBar username={userStats.username} user_auth={user} setUser={setUser}/>
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
                        <>
                            <h2 style={{color:"black"}}>You're matched with {usersPair}!</h2>
                            <button className="unmatch-button"
                                    onClick={unmatchUser}>
                                -Unmatch-
                            </button>
                        </>       
                        )}
                        <hr style={{ flex: 1, border: "none", borderTop: "1px solid lightgray", margin: "0px"}}/>
                        <h4 style={{ color: "black", margin: "5px"}}>Your turn to respond</h4>
                        
                        {/* Posts Section */}
                        <div style={{ marginTop: '20px', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, color: 'black' }}>Recent Posts</h3>
                                <button 
                                    onClick={() => setShowRecorder(!showRecorder)}
                                    style={{
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showRecorder ? 'Cancel' : '+ New Post'}
                                </button>
                            </div>

                            {/* Video Recorder */}
                            {showRecorder && (
                                <RecordVideo onVideoSubmit={handleVideoSubmit} />
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
                            title="Streak"
                            value={statsLoading ? '...' : statsError ? '--' : userStats.streakCount}
                            footer={statsLoading ? 'Fetching...' : statsError ? statsError : 'Consecutive days active'}
                        />
                        <Card
                            title="Level"
                            footer={statsLoading ? 'Fetching...' : statsError ? statsError : 'Number of videos posted'}
                            children={<div style={{width: "33%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"}}><CircularProgressbar
                                value={userStats.level}
                                text={userStats.level}
                                styles={buildStyles({
                                    pathColor: 'rgb(166,192,94)',
                                    textColor: '#333',
                                    trailColor: '#d6d6d6'
                                })}/></div>}
                        />
                    </div>
                </div>
            </div>
            <BottomBar />
        </>
    )
}
export default Dashboard;

