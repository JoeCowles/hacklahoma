"use client";

import { useState } from "react";
import { Mic, ArrowRight, BookOpen } from "lucide-react";

export function LoginScreen({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      onLogin(name.trim());
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-primary-foreground flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <Mic className="w-5 h-5 text-brand-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            LearnStream
          </span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-tight leading-tight text-balance">
            Your lectures, transcribed in real time.
          </h1>
          <p className="mt-4 text-primary-foreground/60 text-lg leading-relaxed">
            AI-powered transcription that captures every word. Focus on
            learning, not note-taking.
          </p>

          <div className="mt-12 flex flex-col gap-6">
            <Feature
              title="Real-time Transcription"
              description="Watch your lecture appear as text, word by word, as it happens."
            />
            <Feature
              title="Smart Concepts"
              description="Automatically extracts key concepts and definitions from lectures."
            />
            <Feature
              title="Searchable Archive"
              description="Every lecture is saved and fully searchable for easy review."
            />
          </div>
        </div>

        <p className="text-sm text-primary-foreground/40">
          Built for students, by students.
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              LearnStream
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to access your lecture dashboard
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="h-11 rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-shadow"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@university.edu"
                className="h-11 rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="mt-2 h-11 rounded-lg bg-foreground text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              or continue with
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => onLogin("Guest User")}
            className="mt-4 w-full h-11 rounded-lg border border-border bg-background text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 w-2 h-2 rounded-full bg-brand shrink-0" />
      <div>
        <h3 className="font-medium text-primary-foreground">{title}</h3>
        <p className="text-sm text-primary-foreground/50 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}
