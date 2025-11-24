import { ReactMediaRecorder } from "react-media-recorder";
import { useState } from "react";



const Record = () => {
    const [isRecording, setIsRecording] = useState(false);
    return (
    <div>
        <ReactMediaRecorder
            video
            audio
            render={({ status, startRecording, stopRecording, mediaBlobUrl, previewStream }) => (
                <div>
                    <p>{status}</p>
                    <button onClick={() => {
                        startRecording();
                        setIsRecording(true);
                    }}>
                        Start Recording
                    </button>
                    <button onClick={() => {
                        stopRecording();
                        setIsRecording(false);
                    }}>
                        Stop Recording
                    </button>
                    {isRecording ? (
                        <video
                            ref={(video) => {
                                if (video && previewStream) {
                                    video.srcObject = previewStream;
                                }
                            }}
                            autoPlay
                            muted
                            style={{ width: "300px" }}
                        /> ) : mediaBlobUrl ? (
                        <video
                        src={mediaBlobUrl} 
                        controls
                        style={{ width: "300px", marginTop: "10px" }}
                        /> 
                    ) : null}
                </div>

            )}
        />
    </div>
);
}

function RecordVideo() {
    const [showRecorder, setShowRecorder] = useState(false);
    return (
        <div>
            {showRecorder ? (
                <>
                    <Record />
                    <button onClick={() => setShowRecorder(false)}>
                        Close Recorder
                    </button>
                </>
            ) : (
                <button onClick={() => setShowRecorder(true)}>
                    Record Video
                </button>
                
            )}
        </div>
    )
}

export default RecordVideo;