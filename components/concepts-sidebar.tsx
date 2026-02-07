"use client";

import { Lightbulb, Sparkles } from "lucide-react";
import type { KeyConcept } from "@/components/live-learn-view";

interface ConceptsSidebarProps {
  concepts: KeyConcept[];
  selectedId: string | null;
  onSelectConcept: (id: string) => void;
}

export function ConceptsSidebar({
  concepts,
  selectedId,
  onSelectConcept,
}: ConceptsSidebarProps) {
  return (
    <aside className="w-80 shrink-0 bg-surface/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <Lightbulb className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-semibold text-foreground">
            Key Concepts
          </h2>
        </div>
        <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-1 rounded-md uppercase tracking-wider">
          AI Detected
        </span>
      </div>

      {/* Concepts list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        <div className="flex flex-col gap-2">
          {concepts.map((concept) => {
            const isSelected = selectedId === concept.id;
            return (
              <button
                key={concept.id}
                onClick={() => onSelectConcept(concept.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "bg-card border-border hover:border-foreground/20 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-medium text-sm ${
                      isSelected ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {concept.title}
                  </span>
                  {concept.id === "wave-particle" && (
                    <Sparkles
                      className={`w-3.5 h-3.5 ${
                        isSelected
                          ? "text-primary-foreground/60"
                          : "text-brand"
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`text-xs leading-relaxed line-clamp-2 ${
                    isSelected
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {concept.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
