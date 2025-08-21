
import React, { useState } from 'react';

interface ResultDisplayProps {
  caption: string;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ caption }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!caption) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
       <h2 className="text-lg font-semibold text-center">Generated Caption</h2>
      <div className="relative">
        <textarea
          readOnly
          value={caption}
          className="w-full h-48 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-dark-border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary resize-none"
          placeholder="Your caption will appear here..."
        />
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-all"
          aria-label="Copy to clipboard"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  );
};
