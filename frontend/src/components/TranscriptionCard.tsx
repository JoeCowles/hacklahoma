"use client";

import { useRealtimeTranscription, TranscriptionItem } from "../hooks/useRealtimeTranscription";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function TranscriptionCard() {
  const { isRecording, transcripts, error, startRecording, stopRecording } = useRealtimeTranscription();

  // Auto-scroll to bottom of transcripts
  const listEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  return (
    <div className="flex-[3] flex flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative animate-in fade-in duration-300 h-full overflow-hidden">
      <TranscriptionHeader
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
      />

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6 relative">
        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm mb-4"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <TranscriptList transcripts={transcripts} />
        <div ref={listEndRef} />

        <div className="pt-8 border-t border-gray-100 dark:border-slate-800 mt-8">
          <RelatedLectures />
        </div>
      </div>
    </div>
  );
}

function TranscriptionHeader({
  isRecording,
  onStart,
  onStop
}: {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">description</span>
        <h2 className="font-bold text-lg whitespace-nowrap flex items-center gap-2">
          Lecture Transcription
          {isRecording && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"
            />
          )}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          layout
          onClick={isRecording ? onStop : onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-w-[140px] justification-center",
            isRecording
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40"
          )}
        >
          <span className="material-symbols-outlined text-base">
            {isRecording ? "stop" : "play_arrow"}
          </span>
          <span className="inline">
            {isRecording ? "End Transcription" : "Start Transcription"}
          </span>
        </motion.button>

        <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-light dark:bg-slate-800 text-xs font-medium hover:bg-gray-200 transition-colors">
          <span className="material-symbols-outlined text-base">text_increase</span>
          <span className="inline">Font Size</span>
        </button>
      </div>
    </div>
  );
}

function TranscriptList({ transcripts }: { transcripts: TranscriptionItem[] }) {
  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {transcripts.map((item, index) => (
          <TranscriptItem key={`${item.time}-${index}`} item={item} />
        ))}
        {transcripts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 py-12 italic"
          >
            Start transcription to see live text here...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TranscriptItem({ item }: { item: TranscriptionItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 group"
    >
      <span className="text-xs font-mono text-primary/70 font-bold pt-1 shrink-0 w-12 text-right group-hover:text-primary transition-colors">
        {item.time}
      </span>
      <p className={cn(
        "text-lg leading-relaxed text-[#111318] dark:text-slate-200",
        item.type === 'partial' && "opacity-70 italic"
      )}>
        {item.text}
      </p>
    </motion.div>
  );
}

function RelatedLectures() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm text-[#111318] dark:text-slate-200">Related Lectures</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-video bg-black rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
  );
}
