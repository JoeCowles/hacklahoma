'use client';

import { useState, useEffect } from 'react';
import { TranscriptionCard } from '../components/TranscriptionCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeTranscription } from '../hooks/useRealtimeTranscription';
import { LectureForm } from '../components/LectureForm';

interface Lecture {
  id: string;
  professor: string;
  school: string;
  class_name: string;
  class_time: string;
  student_id: string;
}

interface KeyConcept {
  id: string;
  title: string;
  summary: string;
  type: 'concept' | 'term' | 'person';
}

const lecturesData = [
  { id: 1, title: "Quantum Physics 101", instructor: "Prof. Julian Barnes", time: "10:30 AM", duration: "1h 30m", date: "Today", status: "Live" },
  { id: 2, title: "Introduction to Linear Algebra", instructor: "Dr. Sarah Chen", time: "02:00 PM", duration: "1h 15m", date: "Today", status: "Upcoming" },
  { id: 3, title: "History of Renaissance Art", instructor: "Prof. Michael Rossi", time: "09:00 AM", duration: "55m", date: "Yesterday", status: "Completed" },
  { id: 4, title: "Advanced Algorithms", instructor: "Dr. Alan Turing", time: "11:00 AM", duration: "1h 30m", date: "Yesterday", status: "Completed" },
  { id: 5, title: "Organic Chemistry II", instructor: "Prof. Marie Curie", time: "01:00 PM", duration: "2h 00m", date: "Feb 5, 2026", status: "Completed" },
];

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
  const [activeSection, setActiveSection] = useState<'live-learn' | 'lectures'>('live-learn');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchLectures = async () => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/lectures`);
      if (res.ok) {
        const data = await res.json();
        setLectures(data.lectures);
      }
    } catch (error) {
      console.error("Failed to fetch lectures:", error);
    }
  };

  useEffect(() => {
    if (activeSection === 'lectures') {
      fetchLectures();
    }
  }, [activeSection]);

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

  const handleNavigation = (section: 'live-learn' | 'lectures') => {
    setActiveSection(section);
  };

  // Filter videos and simulations for selected concept
  const relatedVideos = selectedConcept
    ? videos.filter(v =>
      v.context_concept_id === selectedConcept.id ||
      v.context_concept?.toLowerCase() === selectedConcept.title.toLowerCase()
    )
    : [];

  // Try ID match first, then keyword fallback
  const relatedSimulation = selectedConcept
    ? (simulations.find(s => s.concept_id === selectedConcept.id) ||
      simulations.find(s => s.concept.toLowerCase() === selectedConcept.title.toLowerCase()))
    : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative selection:bg-fuchsia-500/30 h-full">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none h-full">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            translateY: [0, -20, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[20%] w-[800px] h-[800px] bg-violet-900/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            translateY: [0, 30, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-fuchsia-900/20 rounded-full blur-[100px]"
        />
      </div>

      {/* Floating Sidebar */}
      <nav className="w-20 md:w-72 z-50 flex flex-col p-6 pb-0 gap-8 shrink-0 backdrop-blur-sm h-screen">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/20 shrink-0 ring-1 ring-white/10">
            <span className="material-symbols-outlined text-white text-2xl">school</span>
          </div>
          <h1 className="font-bold text-xl tracking-tight hidden md:block text-white">LearnStream</h1>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <SidebarItem
            active={activeSection === 'live-learn'}
            icon="cast_for_education"
            label="Live Learn"
            onClick={() => handleNavigation('live-learn')}
          />
          <SidebarItem
            active={activeSection === 'lectures'}
            icon="class"
            label="Lectures"
            onClick={() => handleNavigation('lectures')}
          />
          <SidebarItem active={false} icon="analytics" label="Analytics" />
          <SidebarItem active={false} icon="settings" label="Settings" />
        </div>

        <div className="mt-auto">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer group border border-white/10 hover:border-white/20 transition-all hover:bg-white/10">
            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-2 ring-white/20">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-sm font-bold text-white truncate group-hover:text-violet-200 transition-colors">Student User</p>
              <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors">student@edu.com</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 pt-6 pr-6 pb-0 pl-0">

        {/* Header Bar */}
        <header className="h-20 flex items-center justify-between px-8 mb-2 shrink-0">
          <div className="flex items-center gap-6">
            {activeSection === 'live-learn' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-5"
              >
                <h2 className="text-2xl font-bold text-white tracking-tight">Quantum Physics 101</h2>
                <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2.5 shadow-sm shadow-red-500/5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Live</span>
                </div>
              </motion.div>
            )}
            {activeSection === 'lectures' && (
              <motion.h2 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-white tracking-tight">
                My Lectures
              </motion.h2>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <button className="p-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-xl">help</span>
            </button>
          </div>
        </header>


        <div className="flex-1 overflow-hidden rounded-t-[2rem] rounded-b-none bg-black/40 border-x border-t border-b-0 border-white/5 backdrop-blur-md shadow-2xl flex flex-col relative mx-2">

          {activeSection === 'lectures' && (
            <div className="p-10 overflow-y-auto custom-scrollbar h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Create New Class Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsFormOpen(true)}
                  className="border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-6 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer group min-h-[220px]"
                >
                  <div className="size-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors ring-1 ring-white/10 group-hover:ring-violet-500/30">
                    <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-violet-400 transition-colors">add</span>
                  </div>
                  <p className="font-bold text-lg text-gray-400 group-hover:text-violet-300 transition-colors">Add New Class</p>
                </motion.div>

                {lectures.map((lecture) => (
                  <LectureCard key={lecture.id} lecture={lecture} />
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {isFormOpen && (
              <LectureForm
                onSuccess={() => {
                  setIsFormOpen(false);
                  fetchLectures();
                }}
                onCancel={() => setIsFormOpen(false)}
              />
            )}
          </AnimatePresence>

          {activeSection === 'live-learn' && (
            <div className="flex h-full">
              {/* Left Panel: Transcription or Detail */}
              <AnimatePresence mode="wait">
                {!selectedConcept ? (
                  <motion.div
                    key="transcription"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-[2] h-full"
                  >
                    <TranscriptionCard
                      isRecording={isRecording}
                      transcripts={transcripts}
                      error={error}
                      startRecording={startRecording}
                      stopRecording={stopRecording}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="concept-detail"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-[2] flex flex-col h-full bg-black/20"
                  >
                    {/* Concept Detail View Header */}
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-fuchsia-500/20 rounded-xl text-fuchsia-400 ring-1 ring-fuchsia-500/30">
                          <span className="material-symbols-outlined text-2xl">lightbulb</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{selectedConcept.title}</h3>
                      </div>
                      <button onClick={handleClosePanel} className="p-2.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all hover:scale-105 active:scale-95">
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">

                      {/* Concept Summary Card */}
                      <section className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Concept Overview</h4>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl">
                          <p className="text-xl leading-relaxed text-gray-200 font-medium">
                            {selectedConcept.summary}
                          </p>
                        </div>
                      </section>

                      {/* Related Material Section */}
                      <section className="space-y-6">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Related Material</h4>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                          {/* Interactive Simulation Card */}
                          {relatedSimulation && (
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg uppercase flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[14px]">science</span>
                                  Interactive Simulation
                                </span>
                              </div>
                              <div className="w-full aspect-video bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl hover:border-violet-500/30 transition-all group relative">
                                {relatedSimulation.code ? (
                                  <iframe
                                    srcDoc={relatedSimulation.code}
                                    className="w-full h-full border-none bg-white"
                                    title={`Simulation: ${selectedConcept.title}`}
                                    sandbox="allow-scripts"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                                    <span className="material-symbols-outlined text-5xl text-gray-600 animate-pulse mb-4">science</span>
                                    <p className="text-sm text-gray-400 font-medium">Generating visualization...</p>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 italic px-2 leading-relaxed">
                                {relatedSimulation.description}
                              </p>
                            </div>
                          )}

                          {/* YouTube Videos */}
                          {relatedVideos.map((video, i) => (
                            <div key={i} className="flex flex-col gap-4">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg uppercase flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[14px]">play_circle</span>
                                  Video Reference
                                </span>
                              </div>
                              <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 hover:border-red-500/30 transition-all">
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={`https://www.youtube.com/embed/${video.url.split('v=')[1]}`}
                                  title={video.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                                ></iframe>
                              </div>
                              <p className="text-sm font-bold text-white px-2 line-clamp-1 tracking-wide">
                                {video.title}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <div className="h-10" /> {/* Bottom Spacer */}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Panel: Concepts List */}
              <div className="w-[400px] border-l border-white/5 bg-black/20 flex flex-col backdrop-blur-xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400">Key Concepts</h3>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-violet-500/20 text-violet-300 rounded-md border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.2)]">AI ACTIVE</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                  {allConcepts.map((concept) => (
                    <motion.div
                      layoutId={concept.id}
                      key={concept.id}
                      onClick={() => handleConceptClick(concept.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all group ${selectedConcept?.id === concept.id
                        ? 'bg-violet-600/20 border-violet-500/50 shadow-[0_0_20px_rgba(124,58,237,0.25)]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-lg'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`font-semibold text-base ${selectedConcept?.id === concept.id ? 'text-violet-200' : 'text-gray-200 group-hover:text-white'}`}>{concept.title}</h4>
                        {selectedConcept?.id === concept.id && <span className="material-symbols-outlined text-sm text-violet-400">arrow_forward</span>}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors">{concept.summary}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function SidebarItem({ active, icon, label, onClick }: { active: boolean, icon: string, label: string, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group ${active
        ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-white/10 text-white shadow-lg shadow-violet-500/5'
        : 'hover:bg-white/5 text-gray-400 hover:text-white'
        }`}
    >
      <span className={`material-symbols-outlined text-xl transition-colors ${active ? 'text-violet-400' : 'group-hover:text-gray-200'}`}>{icon}</span>
      <span className="font-medium text-sm hidden md:block tracking-wide">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)] hidden md:block" />}
    </button>
  )
}

function LectureCard({ lecture }: { lecture: Lecture }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
    >
      <div className={`absolute top-0 right-0 px-3 py-1.5 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400`}>
        Active
      </div>

      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">{lecture.class_name}</h3>
      <p className="text-sm text-gray-400 mb-6">{lecture.professor}</p>

      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">school</span>
          {lecture.school}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">schedule</span>
          {lecture.class_time}
        </div>
      </div>
    </motion.div>
  )
}
