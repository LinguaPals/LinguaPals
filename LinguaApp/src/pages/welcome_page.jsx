
function WelcomePage() {
    /* Once we get mongo set up put in the sign in with google feature here, as well as user authentication */
    /* Then change the user var so the App() switches states to Dashboard */
    const signInWithGoogle = async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);

        setUser(result.user);
    };

    return (
        <>
            <div className="welcomePage">
                <h1 className="logo">LinguaPals</h1>
                
                <div className="loginButtons">
                    <button id="email">
                        Enter your email
                    </button>
                    <button id="password">
                        Enter your password
                    </button>
                    <button onClick={signInWithGoogle}>
                        Sign in With Google
                    </button>
                </div>

            </div>
            <p>The right way to learn a language</p>
        </>
    )
}
export default WelcomePage;