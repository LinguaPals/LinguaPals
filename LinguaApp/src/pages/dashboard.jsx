import TopBar from '../components/top_bar.jsx'
import Card from '../components/card.jsx'

function Dashboard({ user, setUser }) {
    return (
        <>
            <div>
                <TopBar user_auth={user} setUser={setUser}/>
            </div>

            <div className="content">
                <h1 className="logo">LinguaPals</h1> {/*this will prolly get switched out for custom image */}
                <div className="dashboard-cards">
                    <Card title='Card 1' /> {/* Card 1 will be past video history */}

                    <Card title='Card 2' /> {/* Card 2 will have the match me button */}

                    <Card title='Card 3' /> {/* Card 3 will have stats / tbd */}
                </div>
            </div>

        </>
    )
}
export default Dashboard;

