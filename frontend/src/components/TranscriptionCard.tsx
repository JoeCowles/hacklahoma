"use client";

import { TranscriptionItem } from "../hooks/useRealtimeTranscription";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface TranscriptionCardProps {
  isRecording: boolean;
  transcripts: TranscriptionItem[];
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
}

export function TranscriptionCard({ isRecording, transcripts, error, startRecording, stopRecording }: TranscriptionCardProps) {
  // Auto-scroll to bottom of transcripts
  const listEndRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulationCode, setSimulationCode] = useState<string | null>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({
        text: sel.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY
      });
    } else {
      if (!isGenerating && !simulationCode) {
        setSelection(null);
      }
    }
  };

  const handleCreateSimulation = async () => {
    if (!selection) return;
    setIsGenerating(true);
    setSimulationCode(null);

    try {
      const response = await fetch("http://localhost:8000/animations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: selection.text,
          lecture_id: "manual_selection"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Simulation Generation Failed:", response.status, errorText);
        throw new Error(`Failed to generate simulation: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      setSimulationCode(data.code);
    } catch (err) {
      console.error(err);
      alert("Failed to generate simulation. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex-[3] flex flex-col h-full overflow-hidden glass-panel rounded-2xl relative">
=======
    <div 
      className="flex-[3] flex flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative animate-in fade-in duration-300 h-full overflow-hidden"
      onMouseUp={handleMouseUp}
    >
>>>>>>> cb2d02a (sims)
      <TranscriptionHeader
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
      />

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8 relative">
        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 px-6 py-4 text-sm mb-6 backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">error</span>
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TranscriptList transcripts={transcripts} />
        <div ref={listEndRef} />

        <div className="pt-10 mt-10 border-t border-white/5">
          <RelatedLectures />
        </div>
      </div>

      {/* Floating Simulation Tooltip */}
      <AnimatePresence>
        {selection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ 
              position: 'fixed', 
              left: selection.x, 
              top: selection.y - 10,
              transform: 'translateX(-50%) translateY(-100%)',
              zIndex: 100
            }}
            className="bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-gray-200 dark:border-slate-700 p-2 min-w-[200px]"
          >
            {!simulationCode && !isGenerating && (
              <button
                onClick={handleCreateSimulation}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/10 rounded-lg text-primary transition-colors text-sm font-bold"
              >
                <span className="material-symbols-outlined text-lg">science</span>
                Simulate Selection
              </button>
            )}

            {isGenerating && (
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-[#616f89]">
                <div className="animate-spin size-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Generating Visuals...
              </div>
            )}

            {simulationCode && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="text-[10px] font-bold text-primary uppercase">Selection Visualizer</span>
                  <button onClick={() => { setSelection(null); setSimulationCode(null); }} className="text-gray-400 hover:text-red-500">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <div className="w-[350px] h-[300px] bg-white rounded-lg overflow-hidden border border-gray-100">
                  <iframe 
                    srcDoc={simulationCode} 
                    className="w-full h-full border-none" 
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/20 sticky top-0 z-10 shrink-0 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
          <span className="material-symbols-outlined text-xl">description</span>
        </div>
        <h2 className="font-bold text-xl whitespace-nowrap flex items-center gap-3 text-white">
          Lecture Transcription
          {isRecording && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-[0_0_12px_rgba(239,68,68,0.8)]"
            />
          )}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          layout
          onClick={isRecording ? onStop : onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all min-w-[160px] justify-center shadow-lg backdrop-blur-sm border",
            isRecording
              ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 hover:shadow-red-500/20"
              : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 hover:shadow-green-500/20"
          )}
        >
          <span className="material-symbols-outlined text-xl">
            {isRecording ? "stop_circle" : "play_circle"}
          </span>
          <span className="inline uppercase tracking-wide">
            {isRecording ? "End Session" : "Start Session"}
          </span>
        </motion.button>

        <div className="h-6 w-px bg-white/10 mx-2"></div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-xl">text_fields</span>
        </button>
      </div>
    </div>
  );
}

function TranscriptList({ transcripts }: { transcripts: TranscriptionItem[] }) {
  return (
    <div className="space-y-8">
      <AnimatePresence initial={false}>
        {transcripts.map((item, index) => (
          <TranscriptItem key={`${item.time}-${index}`} item={item} />
        ))}
        {transcripts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-gray-400 space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-white/10">
              <span className="material-symbols-outlined text-4xl opacity-50">graphic_eq</span>
            </div>
            <p className="text-base font-medium">Ready to transcribe. Press start via the button above.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TranscriptItem({ item }: { item: TranscriptionItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-8 group"
    >
      <span className="text-xs font-mono text-primary/80 font-semibold pt-2 shrink-0 w-20 text-right group-hover:text-primary transition-colors">
        {item.time}
      </span>
      <p className={cn(
        "text-xl leading-relaxed text-gray-200 font-light",
        item.type === 'partial' && "opacity-70 italic animate-pulse text-gray-400"
      )}>
        {item.text}
      </p>
    </motion.div>
  );
}

function RelatedLectures() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-gray-300 mb-6">
        <span className="material-symbols-outlined text-lg">subscriptions</span>
        <h3 className="font-bold text-sm uppercase tracking-wider">Related Content</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-video bg-black/40 rounded-2xl overflow-hidden shadow-lg border border-white/5 group relative cursor-pointer hover:border-white/20 transition-all">
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors z-10 pointer-events-none">
              <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 text-5xl drop-shadow-xl">play_circle</span>
            </div>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity"
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
}
