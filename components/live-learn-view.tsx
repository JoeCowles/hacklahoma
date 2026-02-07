"use client";

import { useState } from "react";
import { TranscriptionPanel } from "@/components/transcription-panel";
import { ConceptDetailPanel } from "@/components/concept-detail-panel";
import { ConceptsSidebar } from "@/components/concepts-sidebar";

export interface KeyConcept {
  id: string;
  title: string;
  summary: string;
  type: "concept" | "term" | "person";
}

export const keyConceptsData: KeyConcept[] = [
  {
    id: "wave-particle",
    title: "Wave-Particle Duality",
    summary:
      'The wave-particle duality is a fundamental concept of quantum mechanics that suggests that every particle or quantum entity may be described as either a particle or a wave. It expresses the inability of the classical concepts "particle" or "wave" to fully describe the behavior of quantum-scale objects.',
    type: "concept",
  },
  {
    id: "quantum-mechanics",
    title: "Quantum Mechanics",
    summary:
      "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science.",
    type: "concept",
  },
  {
    id: "schrodinger-equation",
    title: "Schrodinger Equation",
    summary:
      "The Schrodinger equation is a linear partial differential equation that governs the wave function of a quantum-mechanical system. It is a key result in quantum mechanics, and its discovery was a significant landmark in the development of the subject.",
    type: "concept",
  },
  {
    id: "particle-physics",
    title: "Particle Physics",
    summary:
      "Particle physics is a branch of physics that studies the nature of the particles that constitute matter and radiation. Although the word particle can refer to various types of very small objects, particle physics usually investigates the irreducibly smallest detectable particles.",
    type: "concept",
  },
  {
    id: "classical-concepts",
    title: "Classical Concepts",
    summary:
      "Classical physics mainly includes the theories of mechanics, electromagnetism, and thermodynamics. In classical physics, energy and matter are considered separate entities. However, in quantum physics, they are considered to be two forms of the same entity.",
    type: "concept",
  },
  {
    id: "wave-function",
    title: "Wave Function",
    summary:
      "A wave function in quantum physics is a mathematical description of the quantum state of an isolated quantum system. The wave function is a complex-valued probability amplitude, and the probabilities for the possible results of measurements made on the system can be derived from it.",
    type: "concept",
  },
];

export function LiveLearnView() {
  const [selectedConcept, setSelectedConcept] = useState<KeyConcept | null>(
    null
  );

  const handleConceptClick = (conceptId: string) => {
    const concept = keyConceptsData.find((c) => c.id === conceptId);
    if (concept) setSelectedConcept(concept);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main content: either transcription or concept detail */}
      {selectedConcept ? (
        <ConceptDetailPanel
          concept={selectedConcept}
          onClose={() => setSelectedConcept(null)}
        />
      ) : (
        <TranscriptionPanel />
      )}

      {/* Right sidebar: key concepts */}
      <ConceptsSidebar
        concepts={keyConceptsData}
        selectedId={selectedConcept?.id ?? null}
        onSelectConcept={handleConceptClick}
      />
    </div>
  );
}
