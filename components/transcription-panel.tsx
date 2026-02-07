"use client";

import {
  useRealtimeTranscription,
  TranscriptionItem,
} from "@/hooks/use-realtime-transcription";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";
import {
  Mic,
  Square,
  AlertCircle,
  Clock,
  FileText,
} from "lucide-react";

export function TranscriptionPanel() {
  const { isRecording, transcripts, error, startRecording, stopRecording } =
    useRealtimeTranscription();

  const listEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-card">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Live Transcription
            </h1>
            <p className="text-xs text-muted-foreground">
              {isRecording
                ? `Recording -- ${transcripts.length} segments captured`
                : "Ready to start"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium"
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-2 h-2 rounded-full bg-destructive"
              />
              Live
            </motion.div>
          )}

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isRecording
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-foreground text-primary-foreground hover:bg-foreground/90"
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-3.5 h-3.5" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                Start Recording
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transcription area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="m-6 flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive px-4 py-3 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {transcripts.length === 0 ? (
          <EmptyState isRecording={isRecording} />
        ) : (
          <div className="p-6 flex flex-col gap-1">
            <AnimatePresence initial={false}>
              {transcripts.map((item, index) => (
                <TranscriptLine
                  key={`${item.time}-${index}`}
                  item={item}
                  isLatest={index === transcripts.length - 1}
                />
              ))}
            </AnimatePresence>
            <div ref={listEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ isRecording }: { isRecording: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-6">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        {isRecording ? (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mic className="w-7 h-7 text-destructive" />
          </motion.div>
        ) : (
          <Mic className="w-7 h-7 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground text-center">
        {isRecording ? "Listening..." : "Ready to transcribe"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
        {isRecording
          ? "Speak into your microphone. Text will appear here in real time."
          : "Click \"Start Recording\" to begin real-time lecture transcription powered by AI."}
      </p>
    </div>
  );
}

function TranscriptLine({
  item,
  isLatest,
}: {
  item: TranscriptionItem;
  isLatest: boolean;
}) {
  const isPartial = item.type === "partial";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group flex items-start gap-4 py-2.5 px-3 rounded-lg transition-colors hover:bg-muted/50 ${
        isLatest && isPartial ? "bg-brand/5" : ""
      }`}
    >
      <div className="flex items-center gap-2 shrink-0 pt-0.5">
        <Clock className="w-3 h-3 text-muted-foreground/50" />
        <span className="text-xs font-mono text-muted-foreground w-16">
          {item.time}
        </span>
      </div>

      <p
        className={`text-sm leading-relaxed flex-1 ${
          isPartial
            ? "text-muted-foreground italic"
            : "text-foreground"
        }`}
      >
        {item.text}
      </p>

      {isPartial && isLatest && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0"
        />
      )}
    </motion.div>
  );
}
