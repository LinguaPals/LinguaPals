import { ReactMediaRecorder } from "react-media-recorder";
import { useState } from "react";
import './record.css';



const Record = ({ onClose, onSubmit }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState(null);
    const [title, setTitle] = useState('');
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    
    const handleSubmit = () => {
        if (!title.trim()) {
            alert('Please enter a title for your video');
            return;
        }
        if (!videoBlob) {
            alert('No video recorded');
            return;
        }
        onSubmit(videoBlob, title);
        onClose();
    };
    
    return (
    <div className="recorder-modal-overlay">
        <div className="recorder-modal-content">
            <ReactMediaRecorder
                video
                audio
                onStop={(blobUrl, blob) => {
                    setVideoBlob(blob);
                    setShowSubmitForm(true);
                }}
                render={({ status, startRecording, stopRecording, mediaBlobUrl, previewStream }) => (
                    <div className="recorder-container">
                        <div className="recorder-video-area">
                            {isRecording && !showSubmitForm ? (
                                <video
                                    ref={(video) => {
                                        if (video && previewStream) {
                                            video.srcObject = previewStream;
                                        }
                                    }}
                                    autoPlay
                                    muted
                                    className="recorder-video"
                                /> 
                            ) : mediaBlobUrl && showSubmitForm ? (
                                <video
                                    src={mediaBlobUrl} 
                                    controls
                                    className="recorder-video"
                                /> 
                            ) : (
                                <div className="recorder-placeholder">
                                    <p>Ready to record</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="recorder-controls">
                            <p className="recorder-status">Status: {status}</p>
                            
                            {showSubmitForm && mediaBlobUrl && (
                                <div className="recorder-submit-form">
                                    <input
                                        type="text"
                                        placeholder="Enter video title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="recorder-title-input"
                                    />
                                </div>
                            )}
                            
                            <div className="recorder-buttons">
                                {!showSubmitForm ? (
                                    <>
                                        <button 
                                            className="recorder-btn recorder-btn-start"
                                            onClick={() => {
                                                startRecording();
                                                setIsRecording(true);
                                            }}
                                            disabled={isRecording}
                                        >
                                            Start Recording
                                        </button>
                                        <button 
                                            className="recorder-btn recorder-btn-stop"
                                            onClick={() => {
                                                stopRecording();
                                                setIsRecording(false);
                                            }}
                                            disabled={!isRecording}
                                        >
                                            Stop Recording
                                        </button>
                                        <button 
                                            className="recorder-btn recorder-btn-close"
                                            onClick={onClose}
                                        >
                                            Close
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            className="recorder-btn recorder-btn-submit"
                                            onClick={handleSubmit}
                                        >
                                            Submit Post
                                        </button>
                                        <button 
                                            className="recorder-btn recorder-btn-start"
                                            onClick={() => {
                                                setShowSubmitForm(false);
                                                setVideoBlob(null);
                                                setTitle('');
                                            }}
                                        >
                                            Record Again
                                        </button>
                                        <button 
                                            className="recorder-btn recorder-btn-close"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            />
        </div>
    </div>
);
}

function RecordVideo({ onVideoSubmit, onClose }) {
    const handleVideoSubmit = (videoBlob, title) => {
        onVideoSubmit?.(videoBlob, title);
    };
    return (
        <Record
            onClose={onClose}
            onSubmit={handleVideoSubmit}
        />
    );
}

export default RecordVideo;