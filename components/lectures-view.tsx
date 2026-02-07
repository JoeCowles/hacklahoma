"use client";

import { Plus, Calendar, Clock, MoreVertical } from "lucide-react";

const lecturesData = [
  {
    id: 1,
    title: "Quantum Physics 101",
    instructor: "Prof. Julian Barnes",
    time: "10:30 AM",
    duration: "1h 30m",
    date: "Today",
    status: "Live" as const,
  },
  {
    id: 2,
    title: "Introduction to Linear Algebra",
    instructor: "Dr. Sarah Chen",
    time: "02:00 PM",
    duration: "1h 15m",
    date: "Today",
    status: "Upcoming" as const,
  },
  {
    id: 3,
    title: "History of Renaissance Art",
    instructor: "Prof. Michael Rossi",
    time: "09:00 AM",
    duration: "55m",
    date: "Yesterday",
    status: "Completed" as const,
  },
  {
    id: 4,
    title: "Advanced Algorithms",
    instructor: "Dr. Alan Turing",
    time: "11:00 AM",
    duration: "1h 30m",
    date: "Yesterday",
    status: "Completed" as const,
  },
  {
    id: 5,
    title: "Organic Chemistry II",
    instructor: "Prof. Marie Curie",
    time: "01:00 PM",
    duration: "2h 00m",
    date: "Feb 5, 2026",
    status: "Completed" as const,
  },
];

const statusStyles = {
  Live: "bg-destructive/10 text-destructive",
  Upcoming: "bg-brand/10 text-brand",
  Completed: "bg-muted text-muted-foreground",
};

export function LecturesView() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-background animate-fade-in">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Lectures
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your courses and view past recordings.
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 h-10 bg-foreground text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Create new card */}
          <button className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-brand hover:bg-brand/5 transition-all cursor-pointer group min-h-[200px]">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center group-hover:bg-brand/10 transition-colors">
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-brand transition-colors" />
            </div>
            <p className="font-semibold text-sm text-muted-foreground group-hover:text-brand transition-colors">
              Create New Class
            </p>
          </button>

          {lecturesData.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-card rounded-2xl p-5 border border-border hover:shadow-lg hover:border-foreground/10 hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    statusStyles[lecture.status]
                  }`}
                >
                  {lecture.status}
                </span>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-semibold text-foreground mb-1 group-hover:text-brand transition-colors line-clamp-1">
                {lecture.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                {lecture.instructor}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {lecture.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {lecture.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
