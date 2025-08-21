
import React, { useCallback, useState } from 'react';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../constants';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  clearFile: () => void;
  selectedFile: File | null;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);


export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, clearFile, selectedFile }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileValidation = (file: File): boolean => {
    setError(null);
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Invalid file type. Please upload an image or video.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (handleFileValidation(file)) {
        onFileSelect(file);
      }
    }
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    handleFileChange(event.dataTransfer.files);
  }, [onFileSelect]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const onDragEnter = () => setIsDragOver(true);
  const onDragLeave = () => setIsDragOver(false);

  if (selectedFile) {
    return (
        <div className="w-full text-center">
            <p className="text-lg font-medium">Selected file: <span className="font-normal text-brand-secondary">{selectedFile.name}</span></p>
            <button
              onClick={clearFile}
              className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove file
            </button>
        </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        className={`relative block w-full border-2 ${isDragOver ? 'border-brand-secondary' : 'border-gray-300 dark:border-dark-border'} border-dashed rounded-2xl p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary cursor-pointer transition-colors`}
      >
        <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*,video/*"
            onChange={(e) => handleFileChange(e.target.files)}
        />
        <UploadIcon />
        <span className="mt-2 block text-sm font-semibold text-gray-900 dark:text-gray-200">
          Drop a file here or <span className="text-brand-secondary">browse</span>
        </span>
        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
          Image or Video (Max {MAX_FILE_SIZE_MB}MB)
        </span>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
