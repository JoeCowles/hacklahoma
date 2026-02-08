"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const GlobalSearchBar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const q = searchTerm.trim();
        if (!q) return;
        if (pathname === '/') {
            router.push(`/?section=explore&q=${encodeURIComponent(q)}`);
        } else {
            router.push(`/?section=explore&q=${encodeURIComponent(q)}`);
        }
        setSearchTerm('');
    };

    return (
        <div className="relative w-full max-w-md mx-auto z-50">
            <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                    type="text"
                    id="lecture-search-input"
                    placeholder="Search all lectures..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center dark:bg-blue-700 dark:hover:bg-blue-800"
                    aria-label="Search"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default GlobalSearchBar;