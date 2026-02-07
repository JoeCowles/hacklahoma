"use client";

import { useState } from "react";
import { Mic, ArrowRight, BookOpen, Sparkles, Brain } from "lucide-react";

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    setTimeout(() => onLogin(name.trim()), 500);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
              <Mic className="w-5 h-5 text-brand-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-primary-foreground">
              LearnStream
            </span>
          </div>

          {/* Hero */}
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold tracking-tight leading-[1.1] text-primary-foreground text-balance">
              Your lectures, transcribed in real time.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-primary-foreground/50">
              AI-powered transcription that captures every word so you can focus
              on learning, not note-taking.
            </p>

            <div className="mt-14 flex flex-col gap-5">
              <FeatureRow
                icon={<Mic className="w-4 h-4" />}
                title="Real-time Transcription"
                description="Watch your lecture appear as text, word by word, as it happens."
              />
              <FeatureRow
                icon={<Brain className="w-4 h-4" />}
                title="Smart Concepts"
                description="Automatically extracts key concepts and definitions from lectures."
              />
              <FeatureRow
                icon={<Sparkles className="w-4 h-4" />}
                title="AI-Powered Insights"
                description="Get summaries, related resources, and study materials instantly."
              />
            </div>
          </div>

          <p className="text-sm text-primary-foreground/30">
            Built for students, by students.
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              LearnStream
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-muted-foreground text-[15px]">
            Sign in to access your lecture dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-name"
                className="text-sm font-medium text-foreground"
              >
                Full name
              </label>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="h-12 rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@university.edu"
                className="h-12 rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="mt-1 h-12 rounded-xl bg-foreground text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => onLogin("Guest")}
            className="mt-6 w-full h-12 rounded-xl border border-border bg-card text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            Continue as Guest
          </button>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            {"By continuing, you agree to our Terms of Service."}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/70 shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-primary-foreground text-sm">
          {title}
        </h3>
        <p className="text-sm text-primary-foreground/40 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
