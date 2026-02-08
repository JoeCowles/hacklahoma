'use client';

import { useState } from 'react';
import { TranscriptionCard } from '../components/TranscriptionCard';
import { useRealtimeTranscription } from '../hooks/useRealtimeTranscription';

interface KeyConcept {
  id: string;
  title: string;
  summary: string;
  type: 'concept' | 'term' | 'person';
}

const lecturesData: any[] = [];

export default function LectureAssistantDashboard() {
  const { isRecording, transcripts, error, startRecording, stopRecording, concepts, videos, simulations } = useRealtimeTranscription();

  // Map backend concepts to UI format
  const allConcepts: KeyConcept[] = concepts.map(c => ({
    id: c.id,
    title: c.keyword,
    summary: c.definition,
    type: c.stem_concept ? 'concept' : 'term'
  }));

  const [selectedConcept, setSelectedConcept] = useState<KeyConcept | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'live-learn' | 'lectures'>('live-learn');

  const handleConceptClick = (conceptId: string) => {
    console.log("Concept Clicked - ID:", conceptId);
    const concept = allConcepts.find(c => c.id === conceptId);
    if (concept) {
      console.log("Selected Concept found:", concept);
      setSelectedConcept(concept);
    }
  };

  // Debug: Log all concepts IDs to check for duplicates
  console.log("All Concept IDs:", allConcepts.map(c => c.id));
  if (selectedConcept) {
    console.log("Currently Selected ID:", selectedConcept.id);
  }

  const handleClosePanel = () => {
    setSelectedConcept(null);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavigation = (section: 'live-learn' | 'lectures') => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  // Filter videos and simulations for selected concept
  const relatedVideos = selectedConcept ? videos.filter(v => v.context_concept_id === selectedConcept.id) : [];
  const relatedSimulation = selectedConcept ? simulations.find(s => s.concept_id === selectedConcept.id) : null;

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
              <TranscriptionCard
                isRecording={isRecording}
                transcripts={transcripts}
                error={error}
                startRecording={startRecording}
                stopRecording={stopRecording}
              />
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
                    {relatedSimulation ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-[#111318] dark:text-slate-200">Interactive Simulation</h3>
                          </div>
                          <div className="w-full aspect-video bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900"></div>
                            <div className="text-center relative z-10 p-6">
                              <span className="material-symbols-outlined text-6xl text-[#616f89]/30 group-hover:text-primary transition-colors mb-4">science</span>
                              <p className="font-medium text-[#616f89] group-hover:text-primary transition-colors">
                                {relatedSimulation.description || `Interactive ${selectedConcept.title} Model`}
                              </p>
                              <button className="mt-4 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm text-sm font-bold border border-gray-200 dark:border-slate-700 group-hover:border-primary group-hover:text-primary transition-all">
                                Click to Load Simulation
                              </button>
                            </div>
                          </div>
                        </div>
                    ) : null}


                    {/* YouTube Videos (Side by side) */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-sm text-[#111318] dark:text-slate-200">Related Lectures</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedVideos.length > 0 && (
                            relatedVideos.map((video, i) => (
                              <div key={i} className="aspect-video bg-black rounded-lg overflow-hidden shadow-sm">
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={`https://www.youtube.com/embed/${video.url.split('v=')[1]}`}
                                  title={video.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full"
                                ></iframe>
                              </div>
                            ))
                        )}

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
                    {allConcepts.map((concept) => (
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
                          {concept.type === 'concept' && (
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
