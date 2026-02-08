"use client";

import { useState } from "react";

interface LectureFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function LectureForm({ onSuccess, onCancel }: LectureFormProps) {
    const [professor, setProfessor] = useState("");
    const [school, setSchool] = useState("");
    const [className, setClassName] = useState("");
    const [classTime, setClassTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/lectures/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    professor,
                    school,
                    class_name: className,
                    class_time: classTime,
                    student_id: "student_default", // Hardcoded for demo
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create lecture");
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-neutral-900 p-6 shadow-xl border border-white/10">
                <h2 className="mb-4 text-xl font-semibold text-white">Add New Class</h2>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-400">
                            Class Name
                        </label>
                        <input
                            type="text"
                            required
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            className="w-full rounded-lg bg-neutral-800 p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Quantum Physics 101"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-400">
                            Professor
                        </label>
                        <input
                            type="text"
                            required
                            value={professor}
                            onChange={(e) => setProfessor(e.target.value)}
                            className="w-full rounded-lg bg-neutral-800 p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Dr. Feynman"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-400">
                            School
                        </label>
                        <input
                            type="text"
                            required
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            className="w-full rounded-lg bg-neutral-800 p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Caltech"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-400">
                            Class Time
                        </label>
                        <input
                            type="text"
                            required
                            value={classTime}
                            onChange={(e) => setClassTime(e.target.value)}
                            className="w-full rounded-lg bg-neutral-800 p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Mon/Wed 10:00 AM"
                        />
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 rounded-lg bg-neutral-800 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : "Create Class"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
