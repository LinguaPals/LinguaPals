import CompanyLogo from "/src/images/temporary_logo.jpeg"
import ProfileImg from "/src/images/profile.png"
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import SettingsModal from './SettingsModal.jsx'

const TopBar = ({ username, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    }

    const handleOptionClick = (option) => {
        // where dropdown click logic goes
        setIsOpen(false);
        if (option === 'Log Out') {
            onLogout?.();
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userID");

            navigate('/login');
        }
        if (option === 'Settings') {
            setShowSettings(true);
            setIsOpen(false);
        }
        console.log('Selected option:', option);
        
    };
    
    
    return (
        <div className="top-bar">
            <div style={{display: "flex"}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}><img src={CompanyLogo} className="top-bar-img" /></div>
                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}><h3 style={{margin: "6px"}}>LinguaPals</h3></div>
            </div>
            <p id="welcome-user">Welcome {username}!</p>
            <div className="profile-dropdown">
                <button 
                onClick={ toggleDropdown }
                style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <img src={ ProfileImg } alt='Profile' className="top-bar-img" />
                </button>
                {isOpen && (
                    <ul className="dropdown-menu">
                        <li onClick={() => handleOptionClick('Log Out')}> Log Out </li>
                        <li onClick={() => handleOptionClick('Settings')}>Settings</li>
                    </ul>
                )}
                {showSettings && (
                    <SettingsModal onClose={() => setShowSettings(false)} />
                )}
            </div>
        </div>
    )
}

export default TopBar;