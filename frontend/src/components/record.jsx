import { ReactMediaRecorder } from "react-media-recorder";

import { useState } from "react";


const Record = () => (
    <div>
        <ReactMediaRecorder
            video
            audio
            render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                <div>
                    <p>{status}</p>
                    <button onClick={startRecording}>Start Recording</button>
                    <button onClick={stopRecording}>Stop Recording</button>
                    <video src={mediaBlobUrl} controls autoPlay loop />
                </div>

            )}
        />
    </div>
);

function RecordVideo() {
    const [showRecorder, setShowRecorder] = useState(false);
    return (
        <div>
            {!showRecorder && (
                <button onClick={() => setShowRecorder(true)}>
                Record Video
                </button>
            )}
            {showRecorder && (
                <>
                    <Record />
                    <button onClick={() => setShowRecorder(false)}>
                        Close Recorder
                    </button>
                </>
            )}
        </div>
    )
}

export default RecordVideo;