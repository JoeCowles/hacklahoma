"use client";
// Force rebuild
import { useRealtimeTranscription } from "../hooks/useRealtimeTranscription";

export function TranscriptionCard() {
    const { isRecording, transcripts, error, startRecording, stopRecording } = useRealtimeTranscription();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] flex flex-col flex-1 overflow-hidden border border-gray-100 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h2 className="font-bold text-lg">Lecture Transcription</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        <span className={`size-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        <span className="text-xs font-bold uppercase">{isRecording ? 'Live' : 'Offline'}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                        {error}
                    </div>
                )}
                {transcripts.length === 0 && !isRecording ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">mic_off</span>
                        <p>Click Start Transcription to begin</p>
                    </div>
                ) : (
                    <>
                        {transcripts.map((item, index) => (
                            <div key={index} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <span className="text-xs font-mono text-[#616f89] dark:text-slate-500 pt-1 shrink-0">{item.time}</span>
                                <p className="text-lg leading-relaxed text-[#111318] dark:text-slate-200">{item.text}</p>
                            </div>
                        ))}
                    </>
                )}

                {isRecording && (
                    <div className="flex items-center gap-2 mt-4 opacity-50">
                        <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-sm italic text-[#616f89] dark:text-slate-400">Listening...</span>
                    </div>
                )}
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-center gap-4">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined">mic</span>
                        Start Transcription
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined">stop</span>
                        End Session
                    </button>
                )}
            </div>
        </div>
    );
}
