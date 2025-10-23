import TopBar from '../components/top_bar.jsx'
import Card from '../components/card.jsx'
import BottomBar from '../components/bottom_bar.jsx'

function matchUser(){
    return 0;
}

function Dashboard({ user, setUser }) {
    return (
        <>
            <div>
                <TopBar user_auth={user} setUser={setUser}/>
            </div>

            <div className="content">
                <h1 className="logo">LinguaPals</h1>
                <div className="dashboard-layout">
                    <div className="left-card">
                        <h2>Find Partners</h2>
                        <p>Match with language learners</p>
                        <button className="match-button" onClick={matchUser}>
                            Match Me!
                        </button>
                        <div className="stats">
                            <div className="stat-item">
                                <h4>-</h4>
                                <p>Matches Available</p>
                            </div>
                        </div>
                    </div>
                    <div className="right-cards">
                        <div className="card">
                            <h2>Active Chats</h2>
                            <p>Your conversations</p>
                            <div className="chat-status">
                                <h4 className="turn-to-respond">Your turn to respond</h4>
                                <p>- active chats</p>
                            </div>
                        </div>
                        <div className="card">
                            <h2>Progress</h2>
                            <p>Learning Journey</p>
                            <div className="progress-stats">
                                <div className="stat-item">
                                    <h4>-</h4>
                                    <p>Days Active</p>
                                </div>
                                <div className="stat-item">
                                    <h4>-</h4>
                                    <p>Partners</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BottomBar />

        </>
    )
}
export default Dashboard;

