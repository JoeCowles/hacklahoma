import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export interface Concept {
    id: string;
    keyword: string;
    definition: string;
    stem_concept: boolean;
    source_chunk_id?: string;
}

export interface Flashcard {
    id: string;
    concept_id: string | null;
    front: string;
    back: string;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correct_option_index: int;
    explanation?: string;
}

export interface Quiz {
    id: string;
    topic: string;
    status: 'pending' | 'ready' | 'error';
    questions: Question[];
}

interface KeyConceptsProps {
    concepts: Concept[];
    flashcards?: Flashcard[];
    quizzes?: Quiz[];
    selectedConceptId: string | null;
    onConceptClick: (concept: Concept) => void;
}

export function KeyConcepts({ concepts, flashcards = [], quizzes = [], selectedConceptId, onConceptClick }: KeyConceptsProps) {
    const [activeTab, setActiveTab] = useState<'concepts' | 'flashcards' | 'quizzes'>('concepts');

    return (
        <div className="w-[400px] border-l border-white/5 bg-black/20 flex flex-col backdrop-blur-xl h-full">
            <div className="p-6 border-b border-white/5 flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400">Learning Tools</h3>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-violet-500/20 text-violet-300 rounded-md border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.2)]">AI ACTIVE</span>
                </div>
                
                <div className="flex p-1 bg-white/5 rounded-xl gap-1">
                    <button 
                        onClick={() => setActiveTab('concepts')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'concepts' 
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Concepts
                    </button>
                    <button 
                        onClick={() => setActiveTab('flashcards')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'flashcards' 
                            ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Cards
                    </button>
                    <button 
                        onClick={() => setActiveTab('quizzes')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'quizzes' 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Quizzes
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'concepts' ? (
                        <motion.div 
                            key="concepts-list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
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
                        </motion.div>
                    ) : activeTab === 'flashcards' ? (
                        <motion.div 
                            key="flashcards-list"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {flashcards.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">
                                    <p className="text-sm">Waiting for flashcards...</p>
                                </div>
                            ) : (
                                flashcards.map((card) => (
                                    <FlashcardItem key={card.id} card={card} />
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="quizzes-list"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {quizzes.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">
                                    <p className="text-sm">Waiting for quizzes...</p>
                                </div>
                            ) : (
                                quizzes.map((quiz) => (
                                    <QuizItem key={quiz.id} quiz={quiz} />
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function QuizItem({ quiz }: { quiz: Quiz }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    if (quiz.status === 'pending') {
        return (
            <div className="p-6 rounded-2xl border border-white/5 bg-white/5 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
                <p className="mt-4 text-xs text-emerald-400 font-bold uppercase tracking-wider">Generating Quiz...</p>
            </div>
        )
    }

    if (isCompleted) {
        return (
            <div className="p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center ring-2 ring-emerald-500/50">
                    <span className="material-symbols-outlined text-3xl text-emerald-400">emoji_events</span>
                </div>
                <div>
                    <h4 className="font-bold text-white text-lg">Quiz Completed!</h4>
                    <p className="text-emerald-200/70 text-sm">You scored {score} out of {quiz.questions.length}</p>
                </div>
                <button 
                    onClick={() => {
                        setIsCompleted(false);
                        setCurrentQuestion(0);
                        setScore(0);
                        setIsAnswered(false);
                        setSelectedOption(null);
                    }}
                    className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold transition-colors"
                >
                    Retake Quiz
                </button>
            </div>
        )
    }

    const question = quiz.questions[currentQuestion];

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        if (index === question.correct_option_index) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsCompleted(true);
        }
    };

    return (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                    {quiz.topic}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                    {currentQuestion + 1} / {quiz.questions.length}
                </span>
            </div>

            <h4 className="font-semibold text-white mb-6 text-sm leading-relaxed">
                {question.text}
            </h4>

            <div className="space-y-2 mb-6">
                {question.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={isAnswered}
                        className={`w-full p-3 rounded-xl text-left text-sm transition-all border ${
                            isAnswered
                                ? idx === question.correct_option_index
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                                    : idx === selectedOption
                                        ? 'bg-red-500/20 border-red-500/50 text-red-200'
                                        : 'bg-white/5 border-transparent text-gray-500 opacity-50'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                                isAnswered && idx === question.correct_option_index
                                ? 'border-emerald-500 text-emerald-500' 
                                : 'border-white/20 text-gray-500'
                            }`}>
                                {String.fromCharCode(65 + idx)}
                            </span>
                            {option}
                        </div>
                    </button>
                ))}
            </div>

            {isAnswered && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4"
                >
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-gray-400 leading-relaxed">
                            <span className="font-bold text-gray-300">Explanation:</span> {question.explanation}
                        </p>
                    </div>
                    <button
                        onClick={nextQuestion}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-lg shadow-emerald-900/20"
                    >
                        {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                </motion.div>
            )}
        </div>
    );
}

function FlashcardItem({ card }: { card: Flashcard }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 cursor-pointer h-40 group"
        >
            <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="w-full h-full relative preserve-3d"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg group-hover:border-fuchsia-500/30 transition-colors">
                    <span className="text-[10px] uppercase tracking-wider text-fuchsia-400 font-bold mb-2">Question</span>
                    <p className="text-white font-medium text-sm">{card.front}</p>
                    <span className="absolute bottom-4 text-[10px] text-gray-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">flip_camera_android</span> Click to flip
                    </span>
                </div>

                {/* Back */}
                <div 
                    className="absolute inset-0 backface-hidden bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    <span className="text-[10px] uppercase tracking-wider text-violet-400 font-bold mb-2">Answer</span>
                    <p className="text-white font-medium text-sm">{card.back}</p>
                </div>
            </motion.div>
        </div>
    );
}
