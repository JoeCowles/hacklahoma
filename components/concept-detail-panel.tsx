"use client";

import { X, FlaskConical, Play } from "lucide-react";
import type { KeyConcept } from "@/components/live-learn-view";

interface ConceptDetailPanelProps {
  concept: KeyConcept;
  onClose: () => void;
}

export function ConceptDetailPanel({
  concept,
  onClose,
}: ConceptDetailPanelProps) {
  return (
    <div className="flex-[3] flex flex-col border-r border-border bg-card overflow-hidden animate-fade-in">
      {/* Compact header */}
      <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4 text-brand" />
          </div>
          <h2 className="font-semibold text-sm text-foreground truncate">
            {concept.title}
          </h2>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
            Summary
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors shrink-0 cursor-pointer"
          aria-label="Close concept detail"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 flex flex-col gap-8 max-w-4xl">
          {/* Overview card */}
          <div className="rounded-xl border border-border bg-background p-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Concept Overview
            </h3>
            <p className="text-base leading-relaxed text-foreground">
              {concept.summary}
            </p>
          </div>

          {/* Interactive simulation placeholder */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Interactive Simulation
            </h3>
            <div className="w-full aspect-video bg-muted rounded-xl border border-border flex items-center justify-center relative overflow-hidden group hover:border-brand/30 transition-colors cursor-pointer">
              <div className="text-center relative z-10 p-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-4 group-hover:border-brand/30 transition-colors">
                  <FlaskConical className="w-6 h-6 text-muted-foreground group-hover:text-brand transition-colors" />
                </div>
                <p className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Interactive {concept.title} Model
                </p>
                <span className="mt-3 px-4 py-2 bg-card rounded-lg border border-border text-xs font-medium text-muted-foreground group-hover:border-brand/30 group-hover:text-brand transition-all">
                  Click to Load Simulation
                </span>
              </div>
            </div>
          </div>

          {/* Related lectures */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Related Lectures
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video bg-foreground rounded-xl overflow-hidden relative group cursor-pointer"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-card/30 transition-colors">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-xs font-medium text-white/80">
                      Related Lecture {i}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
