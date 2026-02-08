import { motion } from 'framer-motion';

export interface Concept {
    id: string;
    keyword: string;
    definition: string;
    stem_concept: boolean;
    source_chunk_id?: string;
}

interface KeyConceptsProps {
    concepts: Concept[];
    selectedConceptId: string | null;
    onConceptClick: (concept: Concept) => void;
}

export function KeyConcepts({ concepts, selectedConceptId, onConceptClick }: KeyConceptsProps) {
    return (
        <div className="w-[400px] border-l border-white/5 bg-black/20 flex flex-col backdrop-blur-xl h-full">
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400">Key Concepts</h3>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-violet-500/20 text-violet-300 rounded-md border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.2)]">AI ACTIVE</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {concepts.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <p className="text-sm">Waiting for concepts...</p>
                    </div>
                ) : (
                    concepts.map((concept) => (
                        <motion.div
                            layoutId={concept.id}
                            key={concept.id}
                            onClick={() => onConceptClick(concept)}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all group ${selectedConceptId === concept.id
                                ? 'bg-violet-600/20 border-violet-500/50 shadow-[0_0_20px_rgba(124,58,237,0.25)]'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-lg'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className={`font-semibold text-base ${selectedConceptId === concept.id ? 'text-violet-200' : 'text-gray-200 group-hover:text-white'}`}>
                                    {concept.keyword}
                                </h4>
                                {selectedConceptId === concept.id && <span className="material-symbols-outlined text-sm text-violet-400">arrow_forward</span>}
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors">
                                {concept.definition || "No definition available yet."}
                            </p>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
