"use client";

import { useState, useEffect } from "react";

interface LectureFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    defaultClassId?: string;
}

interface ClassOption {
    id: string;
    name: string;
    professor: string;
    school: string;
}

export function LectureForm({ onSuccess, onCancel, defaultClassId }: LectureFormProps) {
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [selectedClassId, setSelectedClassId] = useState(defaultClassId || "");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
                const response = await fetch(`${baseUrl}/classes`);
                if (response.ok) {
                    const data = await response.json();
                    setClasses(data.classes);

                    // If defaultClassId is provided, use it. Otherwise default to first class
                    if (defaultClassId) {
                        setSelectedClassId(defaultClassId);
                    } else if (data.classes.length > 0 && !selectedClassId) {
                        setSelectedClassId(data.classes[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch classes", err);
            }
        };
        fetchClasses();
    }, [defaultClassId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!selectedClassId) {
            setError("Please create a class first!");
            setIsSubmitting(false);
            return;
        }

        try {
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/lectures/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    class_id: selectedClassId,
                    date,
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
                <h2 className="mb-4 text-xl font-semibold text-white">Add New Lecture</h2>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-400">
                            Select Class
                        </label>
                        {classes.length > 0 ? (
                            <select
                                required
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                disabled={!!defaultClassId}
                                className={`w-full rounded-lg bg-neutral-800 p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border-r-[16px] border-transparent ${defaultClassId ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} ({cls.professor})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-sm text-yellow-500 bg-yellow-500/10 p-2 rounded">
                                No classes found. Please create a class first.
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-400">
                            Date
                        </label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-lg bg-neutral-800 p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            disabled={isSubmitting || classes.length === 0}
                            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : "Create Lecture"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
