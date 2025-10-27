import React from 'react';
import '../App.css';

function LandingPage({ setShowLogin }) {
    const handleGetStarted = () => {
        setShowLogin(true);
    };

    return (
        <div className="landing-page">
            <div className="landing-content">
                <h1 className="landing-title">Welcome to LinguaPals</h1>
                <h2 className="landing-subtitle">Connect with Language Partners Worldwide</h2>
                
                <div className="landing-features">
                    <div className="feature">
                        <h3>🌍 Global Community</h3>
                        <p>Connect with language learners from around the world</p>
                    </div>
                    <div className="feature">
                        <h3>💬 Language Exchange</h3>
                        <p>Practice languages with native speakers</p>
                    </div>
                    <div className="feature">
                        <h3>🤝 Find Your Perfect Match</h3>
                        <p>Match with partners based on your learning goals</p>
                    </div>
                </div>

                <button 
                    className="get-started-button"
                    onClick={handleGetStarted}
                >
                    Get Started
                </button>
            </div>
        </div>
    );
}

export default LandingPage;