"use client";
import { useState, useEffect, useRef } from 'react';

export function VoiceAssistant() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioData, setAudioData] = useState<number[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Start and stop recording
    const toggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = async () => {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Set up audio context and analyzer
            audioContextRef.current = new AudioContext();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 128;
            source.connect(analyserRef.current);

            // Create data array for visualization
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            // Start recording
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.start();
            setIsRecording(true);

            // Start animation frame for visualization
            animateWaveform();
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            (mediaRecorderRef.current as MediaRecorder).stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            cancelAnimationFrame(animationFrameRef.current);
            setIsRecording(false);
        }
    };

    const animateWaveform = () => {
        analyserRef.current?.getByteFrequencyData(dataArrayRef.current as Uint8Array);

        // Calculate the average amplitude to create bubble effect
        const sum = dataArrayRef.current.reduce((acc, val) => acc + val, 0);
        const avg = sum / dataArrayRef.current.length;

        // Update audio data for visualization
        setAudioData(Array.from(dataArrayRef.current || []));

        // Continue animation
        animationFrameRef.current = requestAnimationFrame(animateWaveform);
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Calculate average amplitude for bubble size
    const averageAmplitude = audioData.length
        ? audioData.reduce((sum, val) => sum + val, 0) / audioData.length
        : 0;

    // Calculate bubble size based on amplitude
    const bubbleSize = isRecording ? 100 + (averageAmplitude * 1.5) : 100;

    return (
        <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="relative mb-8">
                {/* Bubble that expands/contracts with audio input */}
                <div
                    className="relative flex items-center justify-center rounded-full bg-blue-400 transition-all duration-75 ease-in-out"
                    style={{
                        width: `${bubbleSize}px`,
                        height: `${bubbleSize}px`,
                        boxShadow: `0 0 ${averageAmplitude / 5}px ${averageAmplitude / 10}px rgba(129, 140, 248, 0.6)`
                    }}
                >
                    {/* Waveform circles */}
                    {audioData.slice(0, 32).map((value, index) => (
                        <div
                            key={index}
                            className="absolute bg-white rounded-full opacity-30"
                            style={{
                                width: `${value / 8}px`,
                                height: `${value / 8}px`,
                                transform: `rotate(${index * 11.25}deg) translateY(-${bubbleSize / 2 + 10}px)`
                            }}
                        />
                    ))}

                    {/* Microphone icon in center */}
                    <div className="w-12 h-12 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Record button */}
            <button
                onClick={toggleRecording}
                className={`px-6 py-3 rounded-full font-medium transition-all ${isRecording
                    ? 'bg-blue-400 hover:bg-blue-600 text-white'
                    : 'bg-green-400 hover:bg-green-600 text-white'
                    }`}
            >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>

            <p className="mt-4 text-gray-300 text-sm">
                {isRecording
                    ? 'Speak now - the bubble responds to your voice!'
                    : 'Click to start recording and see the waveform bubble'}
            </p>
        </div>
    )
}