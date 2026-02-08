'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { TranscriptionCard } from '../components/TranscriptionCard';
import { useRealtimeTranscription } from '../hooks/useRealtimeTranscription';
import { motion, AnimatePresence } from 'framer-motion';
import { LectureForm } from '../components/LectureForm';
import { ClassForm } from '../components/ClassForm';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LectureDetailsResponse, LectureSearchResponse, Lecture, Class } from '../types/lecture';

interface User {
  user_id: string;
  email: string;
  display_name: string;
  credits: number;
}

function formatRelativeTime(timestamp?: number | null) {
  if (!timestamp) return 'Never';
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

import { KeyConcepts, Concept, Flashcard, Quiz } from '../components/KeyConcepts';

function LectureAssistantDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [activeSection, setActiveSection] = useState<'live-learn' | 'lectures' | 'classes' | 'explore'>('classes');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [isLectureFormOpen, setIsLectureFormOpen] = useState(false);
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);

  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreResults, setExploreResults] = useState<LectureDetailsResponse[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreError, setExploreError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [router]);

  const {
    isRecording,
    isPaused,
    transcripts,
    error,
    startRecording,
    pauseRecording,
    endSession,
    stopRecording,
    concepts,
    videos,
    simulations,
    flashcards,
    quizzes,
    referenceTexts,
    setConcepts,
    setVideos,
    setSimulations,
    setTranscripts,
    setReferenceTexts
  } = useRealtimeTranscription(currentLecture?.id || null);

  // Map backend concepts to UI format
  const allConcepts: Concept[] = concepts.map((c: any) => ({
    id: c.id,
    keyword: c.keyword,
    definition: c.definition,
    stem_concept: c.stem_concept,
    source_chunk_id: c.source_chunk_id
  }));

  const allFlashcards: Flashcard[] = flashcards.map((f: any) => ({
    id: f.id,
    concept_id: f.concept_id,
    front: f.front,
    back: f.back,
    status: f.status
  }));

  const allQuizzes: Quiz[] = quizzes.map((q: any) => ({
    id: q.id,
    topic: q.topic,
    status: q.status,
    questions: q.questions
  }));

  const fetchLectures = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/lectures`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLectures(data.lectures);
      }
    } catch (error) {
      console.error("Failed to fetch lectures:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const loadLectureDetails = async (lectureId: string) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/lectures/${lectureId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentLecture(data.lecture);
        setConcepts(data.concepts);
        setVideos(data.videos);
        setSimulations(data.simulations);
        if (data.references) {
          setReferenceTexts(data.references);
        } else {
          setReferenceTexts([]);
        }
        if (data.transcripts) {
          setTranscripts(data.transcripts);
        } else {
          setTranscripts([]);
        }
        setActiveSection('live-learn');
      }
    } catch (error) {
      console.error("Failed to fetch lecture details:", error);
    }
  };

  const fetchExploreResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setExploreResults([]);
      return;
    }
    setExploreLoading(true);
    setExploreError(null);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/lectures/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LectureSearchResponse = await res.json();
      setExploreResults(data.results);
    } catch (e: unknown) {
      setExploreError(e instanceof Error ? e.message : 'Search failed');
      setExploreResults([]);
    } finally {
      setExploreLoading(false);
    }
  }, []);

  useEffect(() => {
    const section = searchParams.get('section');
    const q = searchParams.get('q');
    if (section === 'explore' && user) {
      setActiveSection('explore');
      if (q != null && q !== '') {
        setExploreQuery(q);
        fetchExploreResults(q);
      }
    }
  }, [searchParams, user, fetchExploreResults]);

  useEffect(() => {
    if (user) {
      if (activeSection === 'lectures') {
        fetchLectures();
      } else if (activeSection === 'classes') {
        fetchClasses();
      }
    }
  }, [activeSection, user]);

  const handleConceptClick = (concept: Concept) => {
    setSelectedConcept(concept);
  };

  const handleClosePanel = () => {
    setSelectedConcept(null);
  };

  const handleNavigation = (section: 'live-learn' | 'lectures' | 'classes' | 'explore') => {
    setActiveSection(section);
  };

  const handleLikeSimulation = async (concept: string, code: string, description?: string) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/simulations/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          concept,
          code,
          description
        })
      });
      if (res.ok) {
        alert(`Successfully liked and cached the simulation for ${concept}!`);
      }
    } catch (error) {
      console.error("Failed to like simulation:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    router.push('/login');
  };

  // Filter videos and simulations for selected concept
  const relatedVideos = selectedConcept
    ? videos.filter(v =>
      v.context_concept_id === selectedConcept.id ||
      v.context_concept?.toLowerCase() === selectedConcept.keyword.toLowerCase()
    )
    : [];

  const relatedReferences = selectedConcept
    ? referenceTexts.filter(r =>
      r.context_concept_id === selectedConcept.id ||
      r.context_concept?.toLowerCase() === selectedConcept.keyword.toLowerCase()
    )
    : [];

  const relatedSimulation = selectedConcept
    ? (simulations.find(s => s.concept_id === selectedConcept.id) ||
      simulations.find(s => s.concept.toLowerCase() === selectedConcept.keyword.toLowerCase()))
    : null;

  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative selection:bg-violet-500/50 selection:text-white h-full">

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none h-full w-full overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[20%] w-[800px] h-[800px] bg-violet-900/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
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
          <h1 className="font-bold text-xl tracking-tight hidden md:block text-neutral-800">Interactable</h1>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <SidebarItem
            active={activeSection === 'live-learn'}
            icon="cast_for_education"
            label="Live Learn"
            onClick={() => handleNavigation('live-learn')}
          />
          <SidebarItem
            active={activeSection === 'classes'}
            icon="school"
            label="Classes"
            onClick={() => handleNavigation('classes')}
          />
          <SidebarItem
            active={activeSection === 'explore'}
            icon="explore"
            label="Explore"
            onClick={() => handleNavigation('explore')}
          />
          <SidebarItem active={false} icon="analytics" label="Analytics" />
          <SidebarItem active={false} icon="settings" label="Settings" />
        </div>

        <div className="mt-auto">
          <div 
            onClick={handleLogout}
            className="bg-white/5 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex items-center gap-4 cursor-pointer group transition-all hover:bg-white/10"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-2 ring-white/5">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.display_name}`} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-sm font-bold text-neutral-800 truncate group-hover:text-red-500 transition-colors">{user.display_name}</p>
              <p className="text-xs text-neutral-500 truncate group-hover:text-neutral-600 transition-colors">{user.email}</p>
            </div>
          </div>
        </div>
      </nav>

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
                <button
                  onClick={() => setActiveSection('lectures')}
                  className="group flex items-center gap-2 hover:bg-black/5 px-3 py-1.5 rounded-lg transition-all"
                >
                  <h2 className="text-2xl font-bold text-neutral-800 tracking-tight group-hover:text-violet-600 transition-colors">
                    {currentLecture ? `${currentLecture.class_name}` : "Select a Lecture"}
                  </h2>
                  <span className="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 transition-colors">expand_more</span>
                </button>

                <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2.5 shadow-sm shadow-red-500/5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Live</span>
                </div>
              </motion.div>
            )}
            {activeSection === 'lectures' && (
              <div className="flex items-center gap-4">
                {selectedClass && (
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back to All
                  </button>
                )}
                <motion.h2 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-neutral-800 tracking-tight">
                  {selectedClass ? `${selectedClass.name} Lectures` : "My Lectures"}
                </motion.h2>
              </div>
            )}
            {activeSection === 'classes' && (
              <motion.h2 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-neutral-800 tracking-tight">
                My Classes
              </motion.h2>
            )}
            {activeSection === 'explore' && (
              <motion.h2 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-neutral-800 tracking-tight">
                Explore
              </motion.h2>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 rounded-xl border border-violet-500/20">
              <span className="material-symbols-outlined text-violet-600 text-lg">payments</span>
              <span className="font-bold text-violet-700">{user.credits}</span>
            </div>
            <button className="p-3 rounded-xl hover:bg-black/5 text-neutral-500 hover:text-neutral-800 transition-all hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
          </div>
        </header>


        <div className="flex-1 overflow-hidden rounded-t-[2rem] rounded-b-none bg-black/40 border-x border-t border-b-0 border-white/5 backdrop-blur-md shadow-2xl flex flex-col relative mx-2">

          {activeSection === 'lectures' && (
            <div className="p-10 overflow-y-auto custom-scrollbar h-full">
              <div className="flex flex-wrap gap-8">
                {/* Create New Lecture Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsLectureFormOpen(true)}
                  className="border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-6 hover:border-violet-500/50 hover:bg-neutral-700/20 transition-all cursor-pointer group aspect-[3/2] w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)] min-h-[220px] bg-neutral-800/20"
                >
                  <div className="size-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors ring-1 ring-white/10 group-hover:ring-violet-500/30">
                    <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-violet-400 transition-colors">add</span>
                  </div>
                  <p className="font-bold text-lg text-gray-400 group-hover:text-violet-300 transition-colors">Add New Lecture</p>
                </motion.div>
                
                {lectures
                  .filter(l => !selectedClass || l.class_id === selectedClass.id)
                  .map((lecture) => (
                    <div key={lecture.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]">
                      <LectureCard
                        lecture={lecture}
                        onClick={() => loadLectureDetails(lecture.id)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeSection === 'classes' && (
            <div className="p-10 overflow-y-auto custom-scrollbar h-full">
              <div className="flex flex-wrap gap-8">
                {/* Create New Class Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsClassFormOpen(true)}
                  className="border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-6 hover:border-violet-500/50 hover:bg-neutral-700/20 transition-all cursor-pointer group aspect-[3/2] w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)] min-h-[220px] bg-neutral-800/20"
                >
                  <div className="size-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors ring-1 ring-white/10 group-hover:ring-violet-500/30">
                    <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-violet-400 transition-colors">add</span>
                  </div>
                  <p className="font-bold text-lg text-gray-400 group-hover:text-violet-300 transition-colors">Add New Class</p>
                </motion.div>
                
                {classes.map((cls) => (
                  <div key={cls.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]">
                    <ClassCard cls={cls} onClick={() => {
                      setSelectedClass(cls);
                      setActiveSection('lectures');
                    }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'explore' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="shrink-0 p-6 pb-4 border-b border-white/5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    fetchExploreResults(exploreQuery);
                  }}
                  className="flex gap-3"
                >
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                    <input
                      type="text"
                      placeholder="Search all lectures by class name or transcript..."
                      value={exploreQuery}
                      onChange={(e) => setExploreQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-xl">search</span>
                    Search
                  </button>
                </form>
                {exploreError && (
                  <p className="mt-2 text-sm text-red-400">{exploreError}</p>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                {exploreLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined text-4xl text-gray-400 animate-spin">progress_activity</span>
                  </div>
                ) : exploreQuery.trim() === '' ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white">
                    <span className="material-symbols-outlined text-5xl mb-4">explore</span>
                    <p className="text-lg font-medium">Search lectures by class name or transcript</p>
                    <p className="text-sm mt-1">Type a query above and click Search</p>
                  </div>
                ) : exploreResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white">
                    <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
                    <p className="text-lg font-medium">No lectures found for &quot;{exploreQuery}&quot;</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-8">
                    {exploreResults.map((item) => (
                      <div key={item.lecture.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]">
                        <LectureCard
                          lecture={item.lecture}
                          onClick={() => loadLectureDetails(item.lecture.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <AnimatePresence>
            {isLectureFormOpen && (
              <LectureForm
                defaultClassId={selectedClass?.id}
                onSuccess={() => {
                  setIsLectureFormOpen(false);
                  fetchLectures();
                }}
                onCancel={() => setIsLectureFormOpen(false)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isClassFormOpen && (
              <ClassForm
                onSuccess={() => {
                  setIsClassFormOpen(false);
                  fetchClasses();
                }}
                onCancel={() => setIsClassFormOpen(false)}
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
                      isPaused={isPaused}
                      transcripts={transcripts}
                      error={error}
                      startRecording={startRecording}
                      pauseRecording={pauseRecording}
                      endSession={endSession}
                      concepts={allConcepts}
                      simulations={simulations}
                      onConceptClick={handleConceptClick}
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
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/5 backdrop-blur-xl shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-fuchsia-500/20 rounded-xl text-fuchsia-600 ring-1 ring-fuchsia-500/30">
                          <span className="material-symbols-outlined text-2xl">lightbulb</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{selectedConcept.keyword}</h3>
                      </div>
                      <button onClick={handleClosePanel} className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all hover:scale-105 active:scale-95">
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>

                    <div className="p-10 overflow-y-auto custom-scrollbar space-y-10">
                      <div className="glass-panel p-8 rounded-3xl border-white/10">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">AI Summary</h4>
                        <p className="text-xl leading-relaxed text-gray-100 font-light">{selectedConcept.definition || "No definition available yet."}</p>
                      </div>

                      {/* Related Material Section */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wide">Related Material</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          {/* Interactive Simulation Card */}
                          {relatedSimulation && (
                            <div className="flex flex-col gap-3 md:col-span-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">science</span>
                                  Interactive Simulation
                                </span>
                                {relatedSimulation.code && (
                                  <button
                                    onClick={() => handleLikeSimulation(selectedConcept.keyword, relatedSimulation.code, relatedSimulation.description)}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/20 rounded-lg transition-all group"
                                  >
                                    <span className="material-symbols-outlined text-sm text-fuchsia-500 group-hover:scale-110 transition-transform">favorite</span>
                                    <span className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-wider">Like & Cache</span>
                                  </button>
                                )}
                              </div>
                              <div className="w-full aspect-video bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-primary/50 transition-colors">
                                {relatedSimulation.code ? (
                                  <iframe
                                    srcDoc={relatedSimulation.code}
                                    className="w-full h-full border-none"
                                    title={`Simulation: ${selectedConcept.keyword}`}
                                    sandbox="allow-scripts"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                                    <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse mb-2">science</span>
                                    <p className="text-sm text-gray-500">Generating simulation...</p>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 italic px-1">
                                {relatedSimulation.description}
                              </p>
                            </div>
                          )}

                          {/* YouTube Videos */}
                          {relatedVideos.map((video, i) => (
                            <div key={i} className="flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">play_circle</span>
                                  Video Reference
                                </span>
                              </div>
                              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-sm border border-gray-200">
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
                              <p className="text-xs font-bold text-gray-200 px-1 line-clamp-1">
                                {video.title}
                              </p>
                            </div>
                          ))}

                          {/* Reference Texts */}
                          {relatedReferences.map((ref, i) => (
                            <div key={i} className="flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">description</span>
                                  Reading Material
                                </span>
                              </div>
                              <a 
                                href={ref.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="glass-panel p-4 rounded-xl border-white/10 hover:border-violet-500/50 transition-all flex flex-col gap-2 group"
                              >
                                <div className="flex items-center justify-between">
                                  <h5 className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors line-clamp-1">{ref.title}</h5>
                                  <span className="material-symbols-outlined text-sm text-gray-400">open_in_new</span>
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-2">{ref.snippet}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-[10px] font-medium text-violet-400 px-1.5 py-0.5 bg-violet-500/10 rounded">
                                    {ref.source || "Web Resource"}
                                  </span>
                                </div>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Panel: Concepts List */}
              <KeyConcepts
                concepts={allConcepts}
                flashcards={allFlashcards}
                quizzes={allQuizzes}
                selectedConceptId={selectedConcept?.id || null}
                onConceptClick={handleConceptClick}
              />
            </div>
          )
          }

        </div>
      </main>
    </div>
  );
}

export default function LectureAssistantDashboard() {
  return (
    <Suspense fallback={null}>
      <LectureAssistantDashboardContent />
    </Suspense>
  );
}

function SidebarItem({ active, icon, label, onClick }: { active: boolean, icon: string, label: string, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group ${active
        ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-black/5 text-violet-700 shadow-lg shadow-violet-500/5'
        : 'hover:bg-black/5 text-neutral-500 hover:text-neutral-800'
        }`}
    >
      <span className={`material-symbols-outlined text-xl transition-colors ${active ? 'text-violet-600' : 'group-hover:text-neutral-700'}`}>{icon}</span>
      <span className="font-medium text-sm hidden md:block tracking-wide">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.8)] hidden md:block" />}
    </button>
  )
}

function LectureCard({ lecture, onClick }: { lecture: Lecture; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className="glass-card rounded-3xl p-6 relative overflow-hidden group cursor-pointer aspect-[4/3] flex flex-col justify-between min-h-[260px] border border-white/10 hover:border-violet-500/50 transition-all shadow-xl hover:shadow-violet-500/10"
    >
      <div className="absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest bg-violet-500/20 text-violet-300 backdrop-blur-md border-l border-b border-white/10">
        Lecture
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-2 ring-white/5 shrink-0">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lecture.creator_name || 'Anonymous'}`} alt="Creator" className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-wider truncate">{lecture.creator_name || 'Anonymous'}</p>
            <p className="text-[10px] text-gray-500 font-medium">Last updated {formatRelativeTime(lecture.updated_at)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors line-clamp-2 leading-tight">
            {lecture.class_name}
          </h3>
          <p className="text-sm text-gray-400 font-medium flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">person</span>
            {lecture.professor}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-white/60 border-t border-white/5 pt-5 mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg">
            <span className="material-symbols-outlined text-sm text-gray-400">calendar_today</span>
            <span className="text-gray-300">{lecture.date}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg">
             <span className="material-symbols-outlined text-sm text-gray-400">description</span>
             <span className="text-gray-300">{lecture.chunk_count} Chunks</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all">
           <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </div>
      </div>
    </motion.div>
  )
}

function ClassCard({ cls, onClick }: { cls: Class; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className="glass-card rounded-3xl p-6 relative overflow-hidden group cursor-pointer aspect-[4/3] flex flex-col justify-between min-h-[260px] border border-white/10 hover:border-fuchsia-500/50 transition-all shadow-xl hover:shadow-fuchsia-500/10"
    >
      <div className="absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest bg-fuchsia-500/20 text-fuchsia-300 backdrop-blur-md border-l border-b border-white/10">
        Class
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-2 ring-white/5 shrink-0">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cls.creator_name || 'Professor'}`} alt="Creator" className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider truncate">{cls.creator_name || 'Anonymous'}</p>
            <p className="text-[10px] text-gray-500 font-medium">Last updated {formatRelativeTime(cls.updated_at)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors line-clamp-2 leading-tight">
            {cls.name}
          </h3>
          <p className="text-sm text-gray-400 font-medium flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">school</span>
            {cls.school}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-white/60 border-t border-white/5 pt-5 mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg">
            <span className="material-symbols-outlined text-sm text-gray-400">layers</span>
            <span className="text-gray-300">{cls.lecture_count} Lectures</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg">
             <span className="material-symbols-outlined text-sm text-gray-400">schedule</span>
             <span className="text-gray-300">{cls.class_time}</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400 group-hover:bg-fuchsia-500 group-hover:text-white transition-all">
           <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </div>
      </div>
    </motion.div>
  )
}