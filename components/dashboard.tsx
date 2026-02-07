"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LiveLearnView } from "@/components/live-learn-view";
import { LecturesView } from "@/components/lectures-view";

interface DashboardProps {
  userName: string;
  onLogout: () => void;
}

export type ActiveView = "live-learn" | "lectures";

export function Dashboard({ userName, onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>("live-learn");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar
        userName={userName}
        onLogout={onLogout}
        activeView={activeView}
        onChangeView={setActiveView}
      />
      <main className="flex-1 flex overflow-hidden">
        {activeView === "live-learn" && <LiveLearnView />}
        {activeView === "lectures" && <LecturesView />}
      </main>
    </div>
  );
}
