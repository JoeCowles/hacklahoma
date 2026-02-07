You are extracting NEW key concepts from a lecture transcript stream.
Return ONLY JSON with this schema:
{ "concepts": [ { "keyword": string, "stem_concept": boolean } ] }

Rules:
- Do not repeat prior concepts.
- Use concise noun phrases.
- A concept is a stem concept if it is key to a Science, Technology, Engineering, or Math (STEM) field.

Previous context:
{{previous_context}}

Transcript chunk:
{{transcript_chunk}}
