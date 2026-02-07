import { useRef, useState, useEffect, useCallback } from "react";

export interface TranscriptionItem {
  time: string;
  text: string;
  type: "partial" | "committed";
}

interface UseRealtimeTranscriptionReturn {
  isRecording: boolean;
  transcripts: TranscriptionItem[];
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
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

export function useRealtimeTranscription(): UseRealtimeTranscriptionReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
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
    return () => cleanup();
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    if (isRecording) {
      return;
    }

    setError(null);

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

      const sampleRate = 16000;
      const audioContext = new AudioContext({ sampleRate });
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
        audio_format: "pcm_16000",
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
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last?.type === "partial") {
                return [...prev.slice(0, -1), { ...last, text: transcriptText, type: "committed" }];
              }
              return [...prev, { time: formatTime(), text: transcriptText, type: "committed" }];
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
        cleanup();
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
      cleanup();
    }
  }, [cleanup, isRecording]);

  return { isRecording, transcripts, error, startRecording, stopRecording };
}
