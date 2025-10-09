import CompanyLogo from "/src/images/temporary_logo.jpeg"
import ProfileImg from "/src/images/profile.png"
const TopBar = ({ user_auth }) => {
    return (
        <div className="top-bar">
            <img src={CompanyLogo} className="top-bar-img" />
            <p>Whats good</p>
            <img src={ProfileImg} alt='Profile' className="top-bar-img" />

        </div>
    )
}

export default TopBar;