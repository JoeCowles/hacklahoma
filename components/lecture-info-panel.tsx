"use client";

import {
  Calendar,
  Clock,
  User,
  BookOpen,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

const lectureInfo = {
  title: "Quantum Physics 101",
  instructor: "Dr. Sarah Chen",
  date: new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  time: "2:00 PM - 3:30 PM",
  topic: "Wave-Particle Duality",
};

const keyConcepts = [
  "Heisenberg Uncertainty Principle",
  "Schrodinger Equation",
  "Quantum Superposition",
  "Wave Function Collapse",
];

const relatedResources = [
  {
    title: "MIT OpenCourseWare: Quantum Physics",
    url: "#",
  },
  {
    title: "Feynman Lectures on Physics",
    url: "#",
  },
  {
    title: "Khan Academy: Quantum Mechanics",
    url: "#",
  },
];

export function LectureInfoPanel() {
  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card overflow-y-auto custom-scrollbar h-screen sticky top-0">
      <div className="p-6 flex flex-col gap-6">
        {/* Lecture details */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Current Lecture
          </h2>
          <div className="rounded-xl border border-border bg-background p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-foreground">
              {lectureInfo.title}
            </h3>
            <p className="text-sm text-brand font-medium">
              {lectureInfo.topic}
            </p>

            <div className="flex flex-col gap-2 mt-1">
              <InfoRow icon={User} label={lectureInfo.instructor} />
              <InfoRow icon={Calendar} label={lectureInfo.date} />
              <InfoRow icon={Clock} label={lectureInfo.time} />
            </div>
          </div>
        </div>

        {/* Key concepts */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Key Concepts
          </h2>
          <div className="flex flex-wrap gap-2">
            {keyConcepts.map((concept) => (
              <span
                key={concept}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-medium"
              >
                <Lightbulb className="w-3 h-3" />
                {concept}
              </span>
            ))}
          </div>
        </div>

        {/* Session stats */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Session Stats
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Duration" value="0:00" />
            <StatCard label="Words" value="0" />
            <StatCard label="Concepts" value="0" />
            <StatCard label="Accuracy" value="--" />
          </div>
        </div>

        {/* Resources */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Related Resources
          </h2>
          <div className="flex flex-col gap-2">
            {relatedResources.map((resource) => (
              <a
                key={resource.title}
                href={resource.url}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
              >
                <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">
                  {resource.title}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function InfoRow({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-center">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
