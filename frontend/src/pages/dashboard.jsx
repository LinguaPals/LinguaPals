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
                <div className="center-box">
                    <button className="match-button"
                        onClick={matchUser}>
                        Match Me!
                    </button>
                    <hr style={{ flex: 1, border: "none", borderTop: "1px solid lightgray", margin: "0px"}}/>
                    <h4 style={{ color: "black", margin: "5px"}}>Your turn to respond</h4>
                </div>
            </div>
            <BottomBar />

        </>
    )
}
export default Dashboard;

