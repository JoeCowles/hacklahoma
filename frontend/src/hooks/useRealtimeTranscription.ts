import { useRef, useState, useEffect, useCallback, useMemo } from "react";

export interface TranscriptionItem {
    time: string;
    text: string;
    type: "partial" | "committed";
    chunkId?: string;
}

interface UseRealtimeTranscriptionReturn {
    isRecording: boolean;
    isPaused: boolean;
    transcripts: TranscriptionItem[];
    error: string | null;
    startRecording: () => Promise<void>;
    pauseRecording: () => void;
    endSession: () => void;
    stopRecording: () => void;
    concepts: any[];
    videos: any[];
    simulations: any[];
    flashcards: any[];
    quizzes: any[];
    referenceTexts: any[];
    setConcepts: (val: any[] | ((prev: any[]) => any[])) => void;
    setVideos: React.Dispatch<React.SetStateAction<any[]>>;
    setSimulations: React.Dispatch<React.SetStateAction<any[]>>;
    setTranscripts: React.Dispatch<React.SetStateAction<TranscriptionItem[]>>;
    setFlashcards: React.Dispatch<React.SetStateAction<any[]>>;
    setQuizzes: React.Dispatch<React.SetStateAction<any[]>>;
    setReferenceTexts: React.Dispatch<React.SetStateAction<any[]>>;
}

const ELEVENLABS_REALTIME_URL = "wss://api.elevenlabs.io/v1/speech-to-text/realtime";

const formatTime = () =>
    new Date().toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

function toBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function float32ToInt16Buffer(input: Float32Array): ArrayBuffer {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i += 1) {
        const value = Math.max(-1, Math.min(1, input[i]));
        output[i] = value < 0 ? value * 0x8000 : value * 0x7fff;
    }
    return output.buffer;
}

async function fetchRealtimeToken(): Promise<string> {
    const response = await fetch("/api/transcribe/token", {
        method: "POST",
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            Pragma: "no-cache",
        },
        body: "{}",
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create ElevenLabs realtime token");
    }
    const body = (await response.json()) as { token?: string };
    if (!body.token) {
        throw new Error("Missing realtime token in response");
    }
    return body.token;
}

export function useRealtimeTranscription(lectureId: string | null): UseRealtimeTranscriptionReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [transcripts, setTranscripts] = useState<TranscriptionItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Pipeline states
    const [conceptsMap, setConceptsMap] = useState<Map<string, any>>(new Map());
    const [videos, setVideos] = useState<any[]>([]);
    const [simulations, setSimulations] = useState<any[]>([]);
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [referenceTexts, setReferenceTexts] = useState<any[]>([]);

    const concepts = useMemo(() => Array.from(conceptsMap.values()), [conceptsMap]);

    const setConcepts = useCallback((val: any[] | ((prev: any[]) => any[])) => {
        setConceptsMap(prevMap => {
            const prevArray = Array.from(prevMap.values());
            const nextArray = typeof val === 'function' ? val(prevArray) : val;
            const nextMap = new Map();
            nextArray.forEach((c: any) => {
                const key = c.keyword.toLowerCase();
                if (!nextMap.has(key)) {
                    nextMap.set(key, c);
                }
            });
            return nextMap;
        });
    }, []);

    const socketRef = useRef<WebSocket | null>(null);
    const backendSocketRef = useRef<WebSocket | null>(null);
    const transcriptsRef = useRef<TranscriptionItem[]>([]);
    const lastCommittedTextRef = useRef<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        transcriptsRef.current = transcripts;
    }, [transcripts]);

    const cleanupTranscription = useCallback(() => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current.onaudioprocess = null;
            processorRef.current = null;
        }

        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }

        if (audioContextRef.current) {
            void audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (socketRef.current) {
            const socket = socketRef.current;
            socketRef.current = null;
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        }

        setIsRecording(false);
    }, []);

    useEffect(() => {
        // Persistent Backend WebSocket connection
        const connectBackend = () => {
            if (backendSocketRef.current?.readyState === WebSocket.OPEN) return;

            const token = localStorage.getItem('token');
            if (!token) return;

            const backendSocket = new WebSocket(`ws://127.0.0.1:8000/ws/user_1?token=${token}`);
            backendSocketRef.current = backendSocket;

            backendSocket.onopen = () => {
                console.log("✅ Connected to Backend WebSocket at 127.0.0.1:8000");
            };

            backendSocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "pipeline_result") {
                        const results = data.results;
                        console.log("Pipeline Results received:", results);
                        if (results.concepts) {
                            setConcepts(prev => [...prev, ...results.concepts]);
                        }
                        if (results.videos) {
                            setVideos(prev => {
                                const next = [...prev];
                                results.videos.forEach((newVideo: any) => {
                                    if (!next.some(v => v.url === newVideo.url)) {
                                        next.push(newVideo);
                                    }
                                });
                                return next;
                            });
                        }
                        if (results.simulations) {
                            setSimulations(prev => {
                                const next = [...prev];
                                results.simulations.forEach((newSim: any) => {
                                    const index = next.findIndex(s => s.concept_id === newSim.concept_id);
                                    if (index !== -1) {
                                        next[index] = { ...next[index], ...newSim };
                                    } else {
                                        next.push(newSim);
                                    }
                                });
                                return next;
                            });
                        }
                        if (results.flashcards) {
                            setFlashcards(prev => {
                                const next = [...prev];
                                results.flashcards.forEach((newCard: any) => {
                                    const index = next.findIndex(f => f.id === newCard.id);
                                    if (index !== -1) {
                                        next[index] = { ...next[index], ...newCard };
                                    } else {
                                        next.push(newCard);
                                    }
                                });
                                return next;
                            });
                        }
                        if (results.quizzes) {
                            setQuizzes(prev => {
                                const next = [...prev];
                                results.quizzes.forEach((newQuiz: any) => {
                                    const index = next.findIndex(q => q.id === newQuiz.id);
                                    if (index !== -1) {
                                        next[index] = { ...next[index], ...newQuiz };
                                    } else {
                                        next.push(newQuiz);
                                    }
                                });
                                return next;
                            });
                        }
                        if (results.reference_texts) {
                            setReferenceTexts(prev => {
                                const next = [...prev];
                                results.reference_texts.forEach((newRef: any) => {
                                    // Check if URL already exists to avoid duplicates
                                    if (!next.some(r => r.url === newRef.url)) {
                                        next.push(newRef);
                                    }
                                });
                                return next;
                            });
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse backend message", e);
                }
            };

            backendSocket.onclose = () => {
                console.log("❌ Backend WebSocket closed. Retrying in 3s...");
                setTimeout(connectBackend, 3000);
            };
        };

        connectBackend();

        return () => {
            if (backendSocketRef.current) {
                backendSocketRef.current.close();
                backendSocketRef.current = null;
            }
            cleanupTranscription();
        };
    }, [cleanupTranscription]);

    const pauseRecording = useCallback(() => {
        setIsPaused(true);
        cleanupTranscription();
    }, [cleanupTranscription]);

    const endSession = useCallback(() => {
        // Force commit the last partial transcript if it exists
        setTranscripts((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.type === "partial" && last.text.trim()) {
                const transcriptText = last.text;
                const finalLectureId = lectureId || "lecture_" + new Date().toISOString().split('T')[0];
                const chunkId = "chunk_final_" + Date.now();

                // Deduplication
                if (lastCommittedTextRef.current === transcriptText) {
                    return prev;
                }
                lastCommittedTextRef.current = transcriptText;

                // Send to Backend WebSocket before cleaning up
                if (backendSocketRef.current && backendSocketRef.current.readyState === WebSocket.OPEN) {
                    backendSocketRef.current.send(JSON.stringify({
                        type: "transcript_commit",
                        lecture_id: finalLectureId,
                        chunk_id: chunkId,
                        text: transcriptText,
                        previous_context: prev.length > 1 ? prev[prev.length - 2].text : "",
                        is_final: true
                    }));
                }

                return [...prev.slice(0, -1), { ...last, text: transcriptText, type: "committed", chunkId: chunkId }];
            } else if (prev.length > 0) {
                // Send a final marker even if no partial transcript exists
                const finalLectureId = lectureId || "lecture_" + new Date().toISOString().split('T')[0];
                if (backendSocketRef.current && backendSocketRef.current.readyState === WebSocket.OPEN) {
                    backendSocketRef.current.send(JSON.stringify({
                        type: "transcript_commit",
                        lecture_id: finalLectureId,
                        chunk_id: "chunk_marker_" + Date.now(),
                        text: "",
                        previous_context: prev[prev.length - 1].text,
                        is_final: true
                    }));
                }
            }
            return prev;
        });

        setIsPaused(false);
        cleanupTranscription();
    }, [cleanupTranscription, lectureId]);

    const startRecording = useCallback(async () => {
        if (isRecording) {
            return;
        }

        setError(null);
        setIsPaused(false);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError("Microphone access is not available. Ensure you are using HTTPS or localhost (Secure Context).");
            return;
        }

        try {
            const token = await fetchRealtimeToken();

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            streamRef.current = stream;

            const audioContext = new AudioContext();
            const sampleRate = audioContext.sampleRate;

            if (audioContext.state === "suspended") {
                await audioContext.resume();
            }
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            source.connect(processor);
            processor.connect(audioContext.destination);

            const params = new URLSearchParams({
                model_id: "scribe_v2_realtime",
                token,
                audio_format: `pcm_${sampleRate}`,
                language_code: "en",
                commit_strategy: "vad",
                include_timestamps: "true",
            });

            const socket = new WebSocket(`${ELEVENLABS_REALTIME_URL}?${params.toString()}`);
            socketRef.current = socket;

            socket.onopen = () => {
                setIsRecording(true);
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as {
                        message_type?: string;
                        text?: string;
                        error?: string;
                    };

                    if (data.message_type === "partial_transcript" && data.text) {
                        const transcriptText = data.text;
                        setTranscripts((prev) => {
                            const last = prev[prev.length - 1];
                            if (last?.type === "partial") {
                                return [...prev.slice(0, -1), { ...last, text: transcriptText }];
                            }
                            return [...prev, { time: formatTime(), text: transcriptText, type: "partial" }];
                        });
                        return;
                    }

                    if ((data.message_type === "committed_transcript" || data.message_type === "committed_transcript_with_timestamps") && data.text) {
                        const transcriptText = data.text;

                        // Deduplication: If we receive both committed types for the same text, only process once
                        if (lastCommittedTextRef.current === transcriptText) {
                            console.log("DEBUG: Skipping duplicate commit for:", transcriptText);
                            return;
                        }
                        lastCommittedTextRef.current = transcriptText;

                        // Generate IDs for concept extraction
                        // Use passed lectureId or fallback to daily ID if null
                        const finalLectureId = lectureId || "lecture_" + new Date().toISOString().split('T')[0];
                        const chunkId = "chunk_" + Date.now();

                        // Send to Backend WebSocket
                        if (backendSocketRef.current && backendSocketRef.current.readyState === WebSocket.OPEN) {
                            backendSocketRef.current.send(JSON.stringify({
                                type: "transcript_commit",
                                lecture_id: finalLectureId,
                                chunk_id: chunkId,
                                text: transcriptText,
                                previous_context: transcriptsRef.current.length > 0 ? transcriptsRef.current[transcriptsRef.current.length - 1].text : ""
                            }));
                        }

                        setTranscripts((prev) => {
                            const last = prev[prev.length - 1];
                            // Only update if the last item is partial. If it's already committed, ignore this update to prevent duplicates.
                            if (last?.type === "partial") {
                                return [...prev.slice(0, -1), { ...last, text: transcriptText, type: "committed", chunkId: chunkId }];
                            }
                            // If last is not partial, we ignore the committed transcript to avoid appending duplicates.
                            // This relies on the assumption that a partial transcript for the segment has already been received.
                            return prev;
                        });
                        return;
                    }

                    if (data.message_type?.includes("error")) {
                        setError(data.error || "Realtime transcription error");
                    }
                } catch {
                    setError("Failed to parse realtime transcription message");
                }
            };

            socket.onerror = () => {
                setError("Realtime websocket connection failed");
            };

            socket.onclose = () => {
                cleanupTranscription();
            };

            processor.onaudioprocess = (event) => {
                if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
                    return;
                }

                const inputData = event.inputBuffer.getChannelData(0);
                const pcmBuffer = float32ToInt16Buffer(inputData);

                socketRef.current.send(
                    JSON.stringify({
                        message_type: "input_audio_chunk",
                        audio_base_64: toBase64(pcmBuffer),
                        sample_rate: sampleRate,
                    })
                );
            };
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : "Failed to start realtime transcription";
            setError(message);
            cleanupTranscription();
        }
    }, [cleanupTranscription, isRecording, transcripts, lectureId]);

    return {
        isRecording,
        isPaused,
        transcripts,
        error,
        startRecording,
        stopRecording: endSession, // Mapping endSession to stopRecording for compatibility if needed, but we expose both
        pauseRecording,
        endSession,
        concepts,
        videos,
        simulations,
        flashcards,
        quizzes,
        referenceTexts,
        setConcepts,
        setVideos,
        setSimulations,
        setTranscripts,
        setFlashcards,
        setQuizzes,
        setReferenceTexts
    };
}
