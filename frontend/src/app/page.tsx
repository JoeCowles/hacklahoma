import "./globals.css";

export default function HomePage() {
  return (
    <main>
      <span className="badge">MVP Scaffold</span>
      <h1>LearnStream: Live Lecture Intelligence</h1>
      <p>
        This scaffold wires the Next.js client to the FastAPI backend and is ready
        for streaming transcript ingestion, concept generation, and social sharing.
      </p>

      <section className="section">
        <h2>Core Modules</h2>
        <div className="grid">
          <div className="card">
            <h3>Real-time Transcript</h3>
            <p>Ingest chunks from ElevenLabs Scribe v2 and forward to concept extraction.</p>
          </div>
          <div className="card">
            <h3>Concept Engine</h3>
            <p>Poll Gemini 2.5 Flash Lite every 10s to surface key concepts.</p>
          </div>
          <div className="card">
            <h3>Learning Artifacts</h3>
            <p>Generate walkthroughs, Three.js experiences, and curated videos.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Next Steps</h2>
        <p>
          Backend endpoints are stubbed and ready for implementation. Frontend can
          now connect to API routes for concept creation, video lookup, and credit
          accounting.
        </p>
      </section>
    </main>
  );
}
