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
              <span>Export Transcript</span>
            </button>
            <div className="size-10 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-100 dark:bg-slate-800">
              <img alt="User profile avatar icon" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIVAqHgSOAHJfcUBhDu4ipaIfZWLXUh9AwBZbW8WXhiG3FtXZgvj7FDR7EScQVqFCgU0vlaLru9MFcN66GzsqByoz6PviTBNeaZ57fWVwADFEI-5vwP2ZE9zZPVMM7rmVE16azyPAXXPwq5DQ9n0PbFu7MG4NmlajV-CEc2_oGilRniLgCMcqTznLKadjhdNrJoukLBPM8g12oTorLRzMNTZ-9R61EiHqmIhxW0_o61Vnz5QhKzQT4IXWCSL4xZEpq1k-OlydCkSsZ" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      {/* Main Dashboard Layout */}
      <main className="flex-1 w-full flex overflow-hidden h-[calc(100vh-4rem)]">
        {/* Left Section: Transcription */}
        <div className="flex-[3] flex flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              <h2 className="font-bold text-lg">Lecture Transcription</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold hover:bg-green-200 transition-colors">
                <span className="material-symbols-outlined text-base">play_arrow</span>
                Start Transcription
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold hover:bg-red-200 transition-colors">
                <span className="material-symbols-outlined text-base">stop</span>
                End Transcription
              </button>
              <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-light dark:bg-slate-800 text-xs font-medium hover:bg-gray-200 transition-colors">
                <span className="material-symbols-outlined text-base">text_increase</span>
                Font Size
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
          </div>
        </div>

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
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">Wave-Particle Duality</span>
                    <span className="material-symbols-outlined text-xs text-primary">auto_awesome</span>
                  </div>
                  <p className="text-xs text-[#616f89] dark:text-slate-400 line-clamp-2">The concept that every particle or quantum entity may be described as either a particle or a wave.</p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
                  <span className="font-semibold text-sm">Quantum Mechanics</span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
                  <span className="font-semibold text-sm">Schrödinger Equation</span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
                  <span className="font-semibold text-sm">Particle Physics</span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
                  <span className="font-semibold text-sm">Classical Concepts</span>
                </div>

                <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 shadow-sm">
                  <span className="font-semibold text-sm text-primary">Wave Function</span>
                  <p className="text-xs text-[#616f89] dark:text-slate-400 mt-1">Critical concept for probability density of a particle's position.</p>
                </div>
              </div>
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