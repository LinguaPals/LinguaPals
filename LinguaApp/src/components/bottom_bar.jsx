import githubIcon from "../images/github.png"
import instaIcon from "../images/instagram.png"
function BottomBar() {

    return (
        <>
            <div className="bottom-bar">
                <h3 style={{color: "rgb(166,192,94)"}}>Lingua Pals</h3>
                <div className="contact-us">
                    <h3 style={{marginBottom: "0px"}}>Contact us</h3>
                    <ul>
                        <li>(###)###-####</li>
                        <li>penjaminpals@gmail.com</li>
                        <li>444 Newell Dr, Gainesville, FL</li>
                </ul>
                </div>
                <div className="need-help">
                    <h3 style={{marginBottom: "0px"}}>Need Help?</h3>
                    <ul>
                        <li>FAQ</li>
                        <li>Report a bug</li>
                        <li>Report a user</li>
                    </ul>
                </div>
                <div className="socials">
                    <a
                        href="https://github.com/LinguaPals/LinguaPals"
                        target="_blank"
                        rel="noopener noreffer"
                    >
                        <img src={ githubIcon } alt="GitHub" width="40" height="40" />  
                    </a>

                    <a
                        href="https://www.instagram.com/thomasmlller/"
                        target="_blank"
                        rel="noopener noreffer"
                    >
                        <img src={ instaIcon } alt="Instagram" width="40" height="40" />
                    </a>

                </div>
            </div>
        </>
        
    );

};
export default BottomBar;