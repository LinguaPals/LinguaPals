import { useState, useEffect, useRef } from 'react';
import TopBar from '../components/top_bar.jsx'
import Card from '../components/card.jsx'
import BottomBar from '../components/bottom_bar.jsx'
import PostCard from '../components/PostCard.jsx'
import RecordVideo from '../components/record.jsx'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getPosts, createPost, deletePost, requestMatch, deleteMatchForUsers } from '../services/postService.js'
import { getCurrentUser, getUserState } from '../services/userService.js'
import ChatBox from '../components/friendChat.jsx';

const initialMatchState = {
    isMatched: false,
    partnerId: null,
    partnerUsername: null,
    currentMatchId: null,
    waiting: false
};

function Dashboard({ user, setUser }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showRecorder, setShowRecorder] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', description: '' });
    const [matchState, setMatchState] = useState(initialMatchState);
    const [userStats, setUserStats] = useState({ streakCount: 0, level: 0, videoCount: 0, username: null });
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);
    const postsListRef = useRef(null);

    const applyMatchState = (matchData) => {
        if (!matchData) {
            setMatchState(initialMatchState);
            return;
        }
        setMatchState({
            isMatched: Boolean(matchData.isMatched ?? matchData.matched ?? matchData.matchId),
            partnerId: matchData.partnerId ?? null,
            partnerUsername: matchData.partnerUsername ?? null,
            currentMatchId: matchData.currentMatchId ?? matchData.matchId ?? null,
            waiting: Boolean(matchData.waiting)
        });
    };

    const fetchMatchState = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMatchState(initialMatchState);
            return;
        }
        try {
            // Load user info and update match
            const response = await getCurrentUser();
            if (response?.success && response?.data) {
                const currentUser = response.data;
                const matchData = (currentUser.currentMatchId || currentUser.partnerUsername || currentUser.isMatched)
                    ? {
                        matchId: currentUser.currentMatchId ?? null,
                        partnerId: null,
                        partnerUsername: currentUser.partnerUsername ?? null,
                        matched: Boolean(currentUser.isMatched),
                        waiting: Boolean(!currentUser.isMatched && currentUser.currentMatchId),
                        isMatched: Boolean(currentUser.isMatched)
                      }
                    : null;
                applyMatchState(matchData);
            } else {
                setMatchState(initialMatchState);
            }
        } catch (err) {
            console.error('Unable to load user state:', err);
            setMatchState(initialMatchState);
        }
    };

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
                    videoCount: response.data.videoCount ?? 0,
                    username: response.data.username ?? null
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
    const handleLogout = () => {
        setUser(null);
        setPosts([]);
        setUserStats({ streakCount: 0, level: 0, videoCount: 0, username: null });
        setMatchState(initialMatchState);
    };

    // Fetch data when user/token changes
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            handleLogout();
            return;
        }
        fetchPosts();
        fetchUserStats();
        fetchMatchState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

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
                if (response.user?.level !== undefined) {
                    setUserStats(prev => ({ ...prev, level: response.user.level }));
                }
                if (response.user?.streakCount !== undefined) {
                    setUserStats(prev => ({ ...prev, streakCount: response.user.streakCount }));
                }
                if (response.user?.videoCount !== undefined) {
                    setUserStats(prev => ({ ...prev, videoCount: response.user.videoCount }));
                }
            }
        } catch (err) {
            alert('Failed to create post');
            console.error(err);
        }
    };

    const handleVideoSubmit = async (videoBlob, title) => {
        try {
            // Import the new createVideoPost function
            const { createVideoPost: createVideoPostAPI } = await import('../services/postService.js');
            
            // Upload video with FormData
            const response = await createVideoPostAPI(videoBlob, title, 'Video post');
            
            if (response.success) {
                setPosts([response.data, ...posts]);
                setShowRecorder(false);
                alert('Video post created successfully!');
                
                // Update level if returned from backend
                if (response.user?.level !== undefined) {
                    setUserStats(prev => ({ ...prev, level: response.user.level }));
                }
                // Update streak if returned from backend
                if (response.user?.streakCount !== undefined) {
                    setUserStats(prev => ({ ...prev, streakCount: response.user.streakCount }));
                }
                if (response.user?.videoCount !== undefined) {
                    setUserStats(prev => ({ ...prev, videoCount: response.user.videoCount }));
                }
            }
        } catch (err) {
            alert('Failed to create video post: ' + (err.message || 'Unknown error'));
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
        if(matchState.isMatched || matchState.partnerUsername) {
            alert(`User is already matched`);
            return;
        }
        try {
            const pair = await requestMatch();
            if(!pair){
                console.error("Error finding match");
                return;
            }
            if (pair.data) {
                applyMatchState({
                    matched: pair.data.matched,
                    partnerId: pair.data.partnerId,
                    partnerUsername: pair.data.partnerUsername,
                    matchId: pair.data.matchId,
                    waiting: pair.data.waiting
                });
            } else {
                await fetchMatchState();
            }
            console.log("Successfully matched user");

        } catch (error) {
            console.log("Couldn't match user: ", error);
            throw error;
        }
    };

    const unmatchUser = async () => {
        try {
            const response = await deleteMatchForUsers();
            if (response?.success) {
                await fetchMatchState();
                alert("You have been unmatched successfully.");
            }
        }
        catch (error) {
            console.log("Failed unmatching user ", error);
            throw error;
        }
    }
    return (
        <>
            <div>
                <TopBar username={userStats.username} user_auth={user} setUser={setUser} onLogout={handleLogout}/>
            </div>

            <div className="content">
                <div className="dashboard-layout">
                    <div className="center-box" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        {!matchState.partnerUsername ? (
                        <button className="match-button"
                        onClick={matchUser}>
                        Match Me!
                        </button> ) : (
                        <>
                            <h2 style={{color:"black"}}>You're matched with {matchState.partnerUsername}!</h2>
                            <button className="unmatch-button"
                                    onClick={unmatchUser}>
                                -Unmatch-
                            </button>
                        </>       
                        )}
                        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid lightgray', margin: '12px 0' }}/>
                        
                        {/* Posts Section */}
                        <div style={{ marginTop: '2.5px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, color: 'black' }}>Recent Video Posts</h3>
                                <button 
                                    id="record-video-button"
                                    onClick={matchState.partnerUsername ? () => setShowRecorder(prev => !prev) : () => window.alert("Please create a match before posting.")}
                                >
                                    + New Video Post
                                </button>
                            </div>

                            {/* Video Recorder */}
                            {showRecorder && (
                                <RecordVideo onVideoSubmit={handleVideoSubmit} onClose={() => setShowRecorder(false)} />
                            )}

                            {/* Posts List */}
                            {loading ? (
                                <p style={{ color: '#666' }}>Loading posts...</p>
                            ) : error ? (
                                <p style={{ color: '#ff4444' }}>{error}</p>
                            ) : posts.length === 0 ? (
                                <p style={{ color: '#666' }}>No posts yet. Create your first post!</p>
                            ) : (
                                <div ref={postsListRef} style={{ overflowY: 'auto', flex: 1, width: '100%', paddingRight: '8px' }}>
                                    {posts.map(post => (
                                        <PostCard 
                                            key={post._id} 
                                            post={post}
                                            partner={matchState.partnerUsername}
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
                            footer={statsLoading ? 'Fetching...' : statsError ? statsError : 'Consecutive days active'}
                            children={<div style={{ position: "relative", display: "inline-block" }}>
                                <span style={{ fontSize: "75px" }}>🔥</span>

                                <div style={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 5,
                                    width: "35px",
                                    height: "35px",
                                    background: "#ff5722",
                                    color: "white",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    border: "2px solid white"
                                }}>
                                    {userStats.streakCount}
                                </div>
                                </div>
                            }
                        />
                        <Card
                            title="Level"
                            footer={statsLoading ? 'Fetching...' : statsError ? statsError : 'Level +1 every 5 videos posted'}
                            children={<div style={{width: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"}}><CircularProgressbar
                                value={userStats.level}
                                text={userStats.level}
                                styles={buildStyles({
                                    pathColor: 'rgb(166,192,94)',
                                    textColor: '#333',
                                    trailColor: '#d6d6d6'
                                })}/></div>
                            }
                        />
                    </div>
                </div>
                {matchState.isMatched && <ChatBox username={userStats.username} />}
            </div>
            
    </>
)}
export default Dashboard;

