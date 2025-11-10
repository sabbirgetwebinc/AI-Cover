import React, { useState, useCallback } from 'react';
import { generateCoverLetter } from './services/geminiService';
import { ClipboardIcon, CheckIcon, SparklesIcon, XCircleIcon, ArrowPathIcon } from './components/Icons';

const App: React.FC = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!jobDescription) {
            setError('Please paste the job description.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setCoverLetter('');

        try {
            const letter = await generateCoverLetter(jobDescription);
            setCoverLetter(letter);
        } catch (e: any) {
            setError(`Failed to generate cover letter. Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [jobDescription]);

    const handleCopy = useCallback(() => {
        if (coverLetter) {
            navigator.clipboard.writeText(coverLetter);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [coverLetter]);
    
    const handleReset = useCallback(() => {
        setJobDescription('');
        setCoverLetter('');
        setError(null);
        setIsCopied(false);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                        AI Cover Letter Generator <span className="text-blue-500">for Upwork</span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                        Paste the job details and get a professional cover letter in seconds.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="flex flex-col gap-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div>
                            <label htmlFor="job-description" className="block text-sm font-medium text-gray-300 mb-2">
                                Paste Upwork Job Description
                            </label>
                            <textarea
                                id="job-description"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the full job description here..."
                                className="w-full h-96 bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                             <button
                                onClick={handleGenerate}
                                disabled={isLoading || !jobDescription}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon />
                                        Generate Cover Letter
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={isLoading}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-all duration-300"
                            >
                                <ArrowPathIcon />
                            </button>
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="relative p-6 bg-gray-800/50 rounded-xl border border-gray-700 min-h-[400px]">
                        {coverLetter && !isLoading && (
                            <button
                                onClick={handleCopy}
                                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition duration-200"
                                aria-label="Copy to clipboard"
                            >
                                {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                            </button>
                        )}
                        <h2 className="text-lg font-semibold text-white mb-4">Generated Cover Letter</h2>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                <SparklesIcon className="w-12 h-12 text-blue-500 animate-pulse" />
                                <p className="mt-4 text-lg">Crafting your proposal...</p>
                                <p className="text-sm">This may take a moment.</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
                                <XCircleIcon />
                                <p className="mt-2 font-semibold">An Error Occurred</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        ) : coverLetter ? (
                            <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
                                <pre className="whitespace-pre-wrap bg-transparent p-0 font-sans text-base text-gray-300">
                                    {coverLetter}
                                </pre>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                <p className="text-lg">Your generated cover letter will appear here.</p>
                            </div>
                        )}
                    </div>
                </main>
                 <footer className="text-center mt-12 text-gray-500 text-sm">
                    <p>Powered by Gemini API</p>
                </footer>
            </div>
        </div>
    );
};

export default App;