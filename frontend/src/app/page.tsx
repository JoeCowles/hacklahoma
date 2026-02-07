'use client';

import { useState } from 'react';

interface KeyConcept {
  id: string;
  title: string;
  summary: string;
  type: 'concept' | 'term' | 'person';
}

const keyConceptsData: KeyConcept[] = [
  {
    id: 'wave-particle',
    title: 'Wave-Particle Duality',
    summary: 'The wave-particle duality is a fundamental concept of quantum mechanics that suggests that every particle or quantum entity may be described as either a particle or a wave. It expresses the inability of the classical concepts "particle" or "wave" to fully describe the behavior of quantum-scale objects. As Albert Einstein wrote: "It seems as though we must use sometimes the one theory and sometimes the other, while at times we may use either. We are faced with a new kind of difficulty. We have two contradictory pictures of reality; separately neither of them fully explains the phenomena of light, but together they do."',
    type: 'concept'
  },
  {
    id: 'quantum-mechanics',
    title: 'Quantum Mechanics',
    summary: 'Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science.',
    type: 'concept'
  },
  {
    id: 'schrodinger-equation',
    title: 'Schrödinger Equation',
    summary: 'The Schrödinger equation is a linear partial differential equation that governs the wave function of a quantum-mechanical system. It is a key result in quantum mechanics, and its discovery was a significant landmark in the development of the subject. The equation is named after Erwin Schrödinger, who postulated the equation in 1925, and published it in 1926.',
    type: 'concept'
  },
  {
    id: 'particle-physics',
    title: 'Particle Physics',
    summary: 'Particle physics is a branch of physics that studies the nature of the particles that constitute matter and radiation. Although the word particle can refer to various types of very small objects, particle physics usually investigates the irreducibly smallest detectable particles and the fundamental interactions necessary to explain their behavior.',
    type: 'concept'
  },
  {
    id: 'classical-concepts',
    title: 'Classical Concepts',
    summary: 'Classical physics mainly includes the theories of mechanics, electromagnetism, and thermodynamics. These theories were developed before the 20th century. In classical physics, energy and matter are considered separate entities. However, in quantum physics, they are considered to be two forms of the same entity.',
    type: 'concept'
  },
  {
    id: 'wave-function',
    title: 'Wave Function',
    summary: 'A wave function in quantum physics is a mathematical description of the quantum state of an isolated quantum system. The wave function is a complex-valued probability amplitude, and the probabilities for the possible results of measurements made on the system can be derived from it. The most common symbols for a wave function are the Greek letters ψ and Ψ (lower-case and capital psi, respectively).',
    type: 'concept'
  }
];

const lecturesData = [
  { id: 1, title: "Quantum Physics 101", instructor: "Prof. Julian Barnes", time: "10:30 AM", duration: "1h 30m", date: "Today", status: "Live" },
  { id: 2, title: "Introduction to Linear Algebra", instructor: "Dr. Sarah Chen", time: "02:00 PM", duration: "1h 15m", date: "Today", status: "Upcoming" },
  { id: 3, title: "History of Renaissance Art", instructor: "Prof. Michael Rossi", time: "09:00 AM", duration: "55m", date: "Yesterday", status: "Completed" },
  { id: 4, title: "Advanced Algorithms", instructor: "Dr. Alan Turing", time: "11:00 AM", duration: "1h 30m", date: "Yesterday", status: "Completed" },
  { id: 5, title: "Organic Chemistry II", instructor: "Prof. Marie Curie", time: "01:00 PM", duration: "2h 00m", date: "Feb 5, 2026", status: "Completed" },
];

export default function LectureAssistantDashboard() {
  const [selectedConcept, setSelectedConcept] = useState<KeyConcept | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'live-learn' | 'lectures'>('live-learn');

  const handleConceptClick = (conceptId: string) => {
    const concept = keyConceptsData.find(c => c.id === conceptId);
    if (concept) {
      setSelectedConcept(concept);
    }
  };

  const handleClosePanel = () => {
    setSelectedConcept(null);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavigation = (section: 'live-learn' | 'lectures') => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Navigation Drawer */}
      <div className={`fixed inset-y-0 left-0 z-[60] w-64 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-slate-800 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={toggleMenu} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => handleNavigation('live-learn')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeSection === 'live-learn' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-[#616f89] dark:text-slate-400'}`}
          >
            <span className="material-symbols-outlined">cast_for_education</span>
            Live Learn
          </button>
          <button
            onClick={() => handleNavigation('lectures')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeSection === 'lectures' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-[#616f89] dark:text-slate-400'}`}
          >
            <span className="material-symbols-outlined">class</span>
            Lectures
          </button>
        </nav>
      </div>

      {/* Overlay Backdrop */}
      {isMenuOpen && (
        <div onClick={toggleMenu} className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm transition-opacity"></div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={toggleMenu} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-[#616f89]">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">Lecture Assistant</h1>
            </div>
            {activeSection === 'live-learn' && (
              <>
                <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
                <div className="hidden md:flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate max-w-[200px]">Quantum Physics 101</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      LIVE
                    </div>
                  </div>
                  <p className="text-xs text-[#616f89] dark:text-slate-400">Prof. Julian Barnes • 00:45:22</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 mr-6">
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Dashboard</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">History</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Settings</a>
            </div>
            {activeSection === 'live-learn' && (
              <button className="flex items-center gap-2 px-4 h-10 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
                <span className="material-symbols-outlined text-lg">download</span>
                <span>Export Transcript</span>
              </button>
            )}
            <div className="size-10 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-100 dark:bg-slate-800">
              <img alt="User profile avatar icon" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIVAqHgSOAHJfcUBhDu4ipaIfZWLXUh9AwBZbW8WXhiG3FtXZgvj7FDR7EScQVqFCgU0vlaLru9MFcN66GzsqByoz6PviTBNeaZ57fWVwADFEI-5vwP2ZE9zZPVMM7rmVE16azyPAXXPwq5DQ9n0PbFu7MG4NmlajV-CEc2_oGilRniLgCMcqTznLKadjhdNrJoukLBPM8g12oTorLRzMNTZ-9R61EiHqmIhxW0_o61Vnz5QhKzQT4IXWCSL4xZEpq1k-OlydCkSsZ" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex overflow-hidden h-[calc(100vh-4rem)]">

        {/* ======================= */}
        {/* LECTURES SECTION        */}
        {/* ======================= */}
        {activeSection === 'lectures' && (
          <div className="flex-1 flex flex-col w-full bg-gray-50 dark:bg-black/5 p-8 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-6xl mx-auto w-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#111318] dark:text-white">Lectures</h2>
                  <p className="text-[#616f89] dark:text-slate-400 mt-1">Manage your courses and view past recordings.</p>
                </div>
                <button className="flex items-center gap-2 px-6 h-12 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
                  <span className="material-symbols-outlined">add</span>
                  Add Class
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Card (optional visual cue) */}
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer group min-h-[200px]">
                  <div className="size-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-primary transition-colors">add</span>
                  </div>
                  <p className="font-bold text-[#616f89] group-hover:text-primary transition-colors">Create New Class</p>
                </div>

                {lecturesData.map((lecture) => (
                  <div key={lecture.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${lecture.status === 'Live' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                          lecture.status === 'Upcoming' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                        {lecture.status}
                      </div>
                      <button className="text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>
                    <h3 className="font-bold text-lg text-[#111318] dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">{lecture.title}</h3>
                    <p className="text-sm text-[#616f89] dark:text-slate-400 mb-6">{lecture.instructor}</p>

                    <div className="flex items-center justify-between text-xs font-medium text-[#616f89] dark:text-slate-500 pt-4 border-t border-gray-50 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        {lecture.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {lecture.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================= */}
        {/* LIVE LEARN SECTION      */}
        {/* ======================= */}
        {activeSection === 'live-learn' && (
          <>
            {/* Left Section: Transcription OR Key Concept Detail */}
            {/* We use conditional rendering to swap them, occupying the same flex space */}

            {/* Transcription Panel */}
            {!selectedConcept && (
              <div className="flex-[3] flex flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative animate-in fade-in duration-300">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h2 className="font-bold text-lg whitespace-nowrap">Lecture Transcription</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold hover:bg-green-200 transition-colors">
                      <span className="material-symbols-outlined text-base">play_arrow</span>
                      <span className="inline">Start Transcription</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold hover:bg-red-200 transition-colors">
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
                  <div className="flex gap-4">
                    <span className="text-xs font-mono text-[#616f89] dark:text-slate-500 pt-1 shrink-0">00:00:15</span>
                    <p className="text-lg leading-relaxed text-[#111318] dark:text-slate-200">Welcome everyone. Today we are diving into the fundamentals of quantum mechanics, specifically focusing on the Schrödinger Equation and its implications for particle physics. Before we start, let's look at the historical context of the wave-particle duality.</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-xs font-mono text-[#616f89] dark:text-slate-500 pt-1 shrink-0">00:05:42</span>
                    <p className="text-lg leading-relaxed text-[#111318] dark:text-slate-200">The wave-particle duality suggests that every particle or quantum entity may be described as either a particle or a wave. It expresses the inability of the classical concepts 'particle' or 'wave' to fully describe the behavior of quantum-scale objects.</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-xs font-mono text-primary font-bold pt-1 shrink-0">00:44:15</span>
                    <div className="flex flex-col gap-2">
                      <p className="text-lg leading-relaxed text-[#111318] dark:text-slate-200">...and so, as we move further into the Schrödinger equation, we must account for the probability density of a particle's position. This is where the concept of the wave function becomes critical. In a macroscopic scale, these effects are negligible, but at the atomic level, they govern everything.</p>
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-sm italic text-[#616f89] dark:text-slate-400">Assistant is transcribing live...</span>
                      </div>
                    </div>
                  </div>

                  {/* Transcription Related Lectures */}
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
            )}

            {/* Key Concept Detail Panel (Replaces Transcription) */}
            {selectedConcept && (
              <div className="flex-[3] flex flex-col border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/30 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Compact Header */}
                <div className="px-6 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 h-14 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-1.5 rounded text-primary">
                      <span className="material-symbols-outlined text-lg">lightbulb</span>
                    </div>
                    <h2 className="font-bold text-base text-[#111318] dark:text-white truncate">{selectedConcept.title}</h2>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-[10px] font-bold text-[#616f89] uppercase tracking-wider">Summary View</span>
                  </div>
                  <button
                    onClick={handleClosePanel}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-[#616f89]"
                    title="Close Summary"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-8 w-full space-y-8">

                    {/* Summary Section (Top ~1/5th) */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                      <h3 className="font-bold text-sm text-[#616f89] mb-2 uppercase tracking-wide">Concept Overview</h3>
                      <p className="text-lg leading-relaxed text-[#111318] dark:text-slate-200">
                        {selectedConcept.summary}
                      </p>
                    </div>

                    {/* Mock Iframe (Approx 40-50% height) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-[#111318] dark:text-slate-200">Interactive Simulation</h3>
                      </div>
                      <div className="w-full aspect-video bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900"></div>
                        <div className="text-center relative z-10 p-6">
                          <span className="material-symbols-outlined text-6xl text-[#616f89]/30 group-hover:text-primary transition-colors mb-4">science</span>
                          <p className="font-medium text-[#616f89] group-hover:text-primary transition-colors">Interactive {selectedConcept.title} Model</p>
                          <button className="mt-4 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm text-sm font-bold border border-gray-200 dark:border-slate-700 group-hover:border-primary group-hover:text-primary transition-all">Click to Load Simulation</button>
                        </div>
                      </div>
                    </div>

                    {/* YouTube Videos (Side by side) */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-sm text-[#111318] dark:text-slate-200">Related Lectures</h3>
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

                    <div className="h-4"></div> {/* Bottom Spacer */}
                  </div>
                </div>
              </div>
            )}

            {/* Right Sidebar: Key Concepts */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-950/50 min-w-[300px]">
              <div className="p-6 h-full flex flex-col gap-4">
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">lightbulb</span>
                    <h2 className="font-bold">Key Concepts</h2>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">AI Detected</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-2">
                    {keyConceptsData.map((concept) => (
                      <div
                        key={concept.id}
                        onClick={() => handleConceptClick(concept.id)}
                        className={`p-3 rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedConcept?.id === concept.id
                            ? 'bg-primary text-white border-primary shadow-primary/20 ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900'
                            : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-sm ${selectedConcept?.id === concept.id ? 'text-white' : ''}`}>{concept.title}</span>
                          {concept.id === 'wave-particle' && (
                            <span className={`material-symbols-outlined text-xs ${selectedConcept?.id === concept.id ? 'text-white/80' : 'text-primary'}`}>auto_awesome</span>
                          )}
                        </div>
                        <p className={`text-xs line-clamp-2 ${selectedConcept?.id === concept.id ? 'text-white/80' : 'text-[#616f89] dark:text-slate-400'}`}>
                          {concept.summary}
                        </p>
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}