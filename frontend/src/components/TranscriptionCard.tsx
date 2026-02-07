"use client";

import { useRealtimeTranscription } from "../hooks/useRealtimeTranscription";


export function TranscriptionCard() {
  const { isRecording, transcripts, error, startRecording, stopRecording } = useRealtimeTranscription();

  return (
    <div className="flex-[3] flex flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative animate-in fade-in duration-300">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">description</span>
          <h2 className="font-bold text-lg whitespace-nowrap">Lecture Transcription</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={startRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold hover:bg-green-200 transition-colors"
          >
            <span className="material-symbols-outlined text-base">play_arrow</span>
            <span className="inline">Start Transcription</span>
          </button>
          <button
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold hover:bg-red-200 transition-colors"
          >
            <span className="material-symbols-outlined text-base">stop</span>
            <span className="inline">End Transcription</span>
          </button>
          <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-light dark:bg-slate-800 text-xs font-medium hover:bg-gray-200 transition-colors">
            <span className="material-symbols-outlined text-base">text_increase</span>
            <span className="inline">Font Size</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {transcripts.map((item, index) => (
          <div key={`${item.time}-${index}`} className="flex gap-4">
            <span className="text-xs font-mono text-primary font-bold pt-1 shrink-0">{item.time}</span>
            <p className="text-lg leading-relaxed text-[#111318] dark:text-slate-200">{item.text}</p>
          </div>
        ))}

        <div className="pt-8 border-t border-gray-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-[#111318] dark:text-slate-200 mb-4">Related Lectures</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-black rounded-lg overflow-hidden shadow-sm">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
