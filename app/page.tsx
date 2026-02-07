"use client";

import { useState } from "react";
import { LoginScreen } from "@/components/login-screen";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { TranscriptionPanel } from "@/components/transcription-panel";
import { LectureInfoPanel } from "@/components/lecture-info-panel";

export default function Home() {
  const [user, setUser] = useState<string | null>(null);

  if (!user) {
    return <LoginScreen onLogin={(name) => setUser(name)} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userName={user} onLogout={() => setUser(null)} />
      <TranscriptionPanel />
      <LectureInfoPanel />
    </div>
  );
}
