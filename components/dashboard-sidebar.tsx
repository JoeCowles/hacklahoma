"use client";

import {
  Mic,
  LayoutDashboard,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

interface DashboardSidebarProps {
  userName: string;
  onLogout: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Mic, label: "Live Transcription", active: false },
  { icon: FileText, label: "Lecture Notes", active: false },
  { icon: BookOpen, label: "Study Materials", active: false },
];

export function DashboardSidebar({
  userName,
  onLogout,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-64"
      } shrink-0 bg-card border-r border-border flex flex-col transition-all duration-200 ease-in-out h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
              LearnStream
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors ${
              item.active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && (
              <span className="whitespace-nowrap">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border flex flex-col gap-1">
        <button className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-brand-foreground">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground">Student</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
