"use client";

import { useState } from "react";
import { LoginScreen } from "@/components/login-screen";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  const [user, setUser] = useState<string | null>(null);

  if (!user) {
    return <LoginScreen onLogin={(name) => setUser(name)} />;
  }

  return (
    <Dashboard userName={user} onLogout={() => setUser(null)} />
  );
}
