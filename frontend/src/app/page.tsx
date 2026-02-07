import { TranscriptionCard } from "../components/TranscriptionCard";

export default function LectureAssistantDashboard() {
  return (
    <>
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">Lecture Assistant</h1>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>
            <div className="flex flex-col">
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
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 mr-6">
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Dashboard</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">History</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Settings</a>
            </div>
            <button className="flex items-center gap-2 px-4 h-10 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
              <span className="material-symbols-outlined text-lg">download</span>
              <span>Export</span>
            </button>
            <div className="size-10 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-100 dark:bg-slate-800">
              <img alt="User profile avatar icon" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIVAqHgSOAHJfcUBhDu4ipaIfZWLXUh9AwBZbW8WXhiG3FtXZgvj7FDR7EScQVqFCgU0vlaLru9MFcN66GzsqByoz6PviTBNeaZ57fWVwADFEI-5vwP2ZE9zZPVMM7rmVE16azyPAXXPwq5DQ9n0PbFu7MG4NmlajV-CEc2_oGilRniLgCMcqTznLKadjhdNrJoukLBPM8g12oTorLRzMNTZ-9R61EiHqmIhxW0_o61Vnz5QhKzQT4IXWCSL4xZEpq1k-OlydCkSsZ" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 grid grid-cols-12 gap-6 overflow-hidden h-[calc(100vh-4rem)]">
        {/* Left Section: Transcription */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <TranscriptionCard />
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          {/* Key Concepts Box */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                <h2 className="font-bold">Key Concepts</h2>
              </div>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">AI Detected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-background-light dark:bg-slate-800 text-sm font-medium border border-gray-100 dark:border-slate-700 flex items-center gap-2">
                Wave-Particle Duality
                <span className="material-symbols-outlined text-xs text-[#616f89]">auto_awesome</span>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-background-light dark:bg-slate-800 text-sm font-medium border border-gray-100 dark:border-slate-700">Quantum Mechanics</span>
              <span className="px-3 py-1.5 rounded-lg bg-background-light dark:bg-slate-800 text-sm font-medium border border-gray-100 dark:border-slate-700">Schrödinger Equation</span>
              <span className="px-3 py-1.5 rounded-lg bg-background-light dark:bg-slate-800 text-sm font-medium border border-gray-100 dark:border-slate-700">Particle Physics</span>
              <span className="px-3 py-1.5 rounded-lg bg-background-light dark:bg-slate-800 text-sm font-medium border border-gray-100 dark:border-slate-700">Classical Concepts</span>
              <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold border border-primary/20">Wave Function</span>
            </div>
          </div>

          {/* Tabbed Interface (Resources & Messages) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col flex-1 overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-slate-800">
              <button className="flex-1 py-4 text-sm font-bold border-b-2 border-primary text-primary">Resources</button>
              <button className="flex-1 py-4 text-sm font-bold text-[#616f89] dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Messages (12)</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {/* Resources List */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow bg-background-light/30 dark:bg-slate-800/30 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate">Lecture_Slides_W4.pdf</p>
                        <p className="text-[10px] text-[#616f89] dark:text-slate-400 uppercase font-bold tracking-wider">PDF • 4.2 MB</p>
                      </div>
                    </div>
                    <button className="text-[#616f89] dark:text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined text-xl">download</span>
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow bg-background-light/30 dark:bg-slate-800/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">link</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate">Schrödinger Simulation</p>
                        <p className="text-[10px] text-[#616f89] dark:text-slate-400 uppercase font-bold tracking-wider">EXTERNAL LINK</p>
                      </div>
                    </div>
                    <button className="text-[#616f89] dark:text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined text-xl">open_in_new</span>
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow bg-background-light/30 dark:bg-slate-800/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">menu_book</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate">Reading List - Week 4</p>
                        <p className="text-[10px] text-[#616f89] dark:text-slate-400 uppercase font-bold tracking-wider">DOCS • 1.1 MB</p>
                      </div>
                    </div>
                    <button className="text-[#616f89] dark:text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined text-xl">download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
              <button className="w-full py-2.5 bg-background-light dark:bg-slate-800 text-xs font-bold text-[#111318] dark:text-white rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">upload_file</span>
                Upload New Resource
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar (Contextual Controls) */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 h-14 flex items-center">
        <div className="max-w-[1600px] mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-semibold text-[#616f89] dark:text-slate-400">Microphone: Active (Yeti Pro)</span>
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm">waves</span>
              <span className="text-xs font-semibold text-[#616f89] dark:text-slate-400">Signal: Excellent</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-[#616f89] dark:text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">zoom_in</span>
            </button>
            <button className="p-2 text-[#616f89] dark:text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">fullscreen</span>
            </button>
            <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>
            <button className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">stop_circle</span>
              End Session
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}