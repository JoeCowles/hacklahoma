"use client";

import {
  Mic,
  Radio,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import type { ActiveView } from "@/components/dashboard";

interface DashboardSidebarProps {
  userName: string;
  onLogout: () => void;
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
}

const navItems: { icon: typeof Mic; label: string; view: ActiveView }[] = [
  { icon: Radio, label: "Live Learn", view: "live-learn" },
  { icon: BookOpen, label: "Lectures", view: "lectures" },
];

export function DashboardSidebar({
  userName,
  onLogout,
  activeView,
  onChangeView,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={`${
        collapsed ? "w-[68px]" : "w-60"
      } shrink-0 bg-card border-r border-border flex flex-col transition-all duration-200 ease-in-out`}
    >
      {/* Logo header */}
      <div className="h-16 flex items-center px-4 border-b border-border gap-3">
        <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center shrink-0">
          <Mic className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight whitespace-nowrap flex-1">
            LearnStream
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors shrink-0 cursor-pointer"
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
      <nav className="flex-1 p-2.5 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-foreground text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2.5 border-t border-border flex flex-col gap-0.5">
        <button className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg bg-muted/50">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-brand-foreground">
              {initials}
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
