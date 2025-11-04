import React, { useState, useCallback, useRef } from 'react';
// FIX: Remove unused import for `stopTranscriptionSession` to fix the error.
import { startTranscriptionSession } from '../services/geminiService';

const Transcription: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const sessionRef = useRef<{ close: () => void } | null>(null);
    const finalTranscriptionRef = useRef('');

    const handleTranscriptionUpdate = useCallback((text: string, isFinal: boolean) => {
        if (isFinal) {
            finalTranscriptionRef.current += text + ' ';
            setTranscription(finalTranscriptionRef.current);
        } else {
            setTranscription(finalTranscriptionRef.current + text);
        }
    }, []);

    const handleStartRecording = useCallback(async () => {
        if (isRecording) return;

        setError(null);
        setTranscription('');
        finalTranscriptionRef.current = '';
        setIsRecording(true);

        try {
            sessionRef.current = await startTranscriptionSession(handleTranscriptionUpdate, (err) => {
                setError(err.message);
                setIsRecording(false);
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start recording.');
            setIsRecording(false);
        }
    }, [isRecording, handleTranscriptionUpdate]);

    const handleStopRecording = useCallback(() => {
        if (!isRecording) return;
        
        // FIX: The sessionRef.current.close() calls stopTranscriptionSession internally.
        // The explicit call here was redundant.
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        setIsRecording(false);
    }, [isRecording]);

    return (
        <div className="mt-12 border-t-2 border-slate-700 pt-8">
            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-4">
                Live Audio Transcription
            </h2>
            <p className="text-slate-400 mb-6">
                Click "Start Recording" and speak into your microphone to get a live transcription.
            </p>

            <div className="flex items-center space-x-4 mb-4">
                <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`px-6 py-3 rounded-lg font-bold text-white transition-all flex items-center space-x-2 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isRecording ? (
                        <>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                            <span>Stop Recording</span>
                        </>
                    ) : (
                         <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                                <path d="M5.5 4a.5.5 0 00-.5.5v6a.5.5 0 00.5.5h1a.5.5 0 00.5-.5V4.5a.5.5 0 00-.5-.5h-1zM14.5 4a.5.5 0 00-.5.5v6a.5.5 0 00.5.5h1a.5.5 0 00.5-.5V4.5a.5.5 0 00-.5-.5h-1zM10 15a4 4 0 004-4h1a5 5 0 01-10 0h1a4 4 0 004 4z" />
                            </svg>
                            <span>Start Recording</span>
                         </>
                    )}
                </button>
            </div>

            {error && <p className="text-red-400 text-sm my-3">{`Error: ${error}`}</p>}

            <div className="w-full min-h-[150px] bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-inner">
                <p className="text-slate-300 whitespace-pre-wrap">
                    {transcription || <span className="text-slate-500">Waiting for audio...</span>}
                </p>
            </div>
        </div>
    );
};

export default Transcription;
