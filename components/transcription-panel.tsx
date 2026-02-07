"use client";

import {
  useRealtimeTranscription,
  type TranscriptionItem,
} from "@/hooks/use-realtime-transcription";
import { useRef, useEffect } from "react";
import { Mic, Square, AlertCircle, Clock, FileText } from "lucide-react";

export function TranscriptionPanel() {
  const { isRecording, transcripts, error, startRecording, stopRecording } =
    useRealtimeTranscription();

  const listEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  return (
    <div className="flex-[3] flex flex-col min-h-0 bg-card border-r border-border">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-foreground">
                Quantum Physics 101
              </h1>
              {isRecording && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive" />
                  </span>
                  Live
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRecording
                ? `Recording -- ${transcripts.length} segments`
                : "Prof. Julian Barnes"}
            </p>
          </div>
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            isRecording
              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
              : "bg-foreground text-primary-foreground hover:opacity-90"
          }`}
        >
          {isRecording ? (
            <>
              <Square className="w-3.5 h-3.5" />
              Stop
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              Start Recording
            </>
          )}
        </button>
      </div>

      {/* Transcript area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {error && (
          <div className="m-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive px-4 py-3 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {transcripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 pb-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
              {isRecording ? (
                <Mic className="w-7 h-7 text-destructive animate-pulse-dot" />
              ) : (
                <Mic className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {isRecording ? "Listening..." : "Ready to transcribe"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
              {isRecording
                ? "Speak into your microphone. Text will appear here in real time."
                : 'Click "Start Recording" to begin real-time lecture transcription.'}
            </p>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-0.5">
            {transcripts.map((item, index) => (
              <TranscriptLine
                key={`${item.time}-${index}`}
                item={item}
                isLatest={index === transcripts.length - 1}
              />
            ))}
            <div ref={listEndRef} />
          </div>
        )}
      </div>
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
    <div
      className={`group flex items-start gap-4 py-2.5 px-3 rounded-lg transition-colors hover:bg-muted/50 animate-fade-in ${
        isLatest && isPartial ? "bg-brand/5" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
        <Clock className="w-3 h-3 text-muted-foreground/40" />
        <span className="text-xs font-mono text-muted-foreground tabular-nums w-[60px]">
          {item.time}
        </span>
      </div>
      <p
        className={`text-sm leading-relaxed flex-1 ${
          isPartial ? "text-muted-foreground italic" : "text-foreground"
        }`}
      >
        {item.text}
      </p>
      {isPartial && isLatest && (
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0 animate-pulse-dot" />
      )}
    </div>
  );
}
