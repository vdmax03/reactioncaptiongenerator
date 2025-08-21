
import React, { useState, useEffect, useCallback } from 'react';
import { ReactionStyle, OutputLength } from './types';
import { API_KEY_STORAGE_KEY } from './constants';
import { ApiKeyInput } from './components/ApiKeyInput';
import { FileUpload } from './components/FileUpload';
import { MediaPreview } from './components/MediaPreview';
import { OptionsPanel } from './components/OptionsPanel';
import { ResultDisplay } from './components/ResultDisplay';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { fileToBase64, processVideo } from './services/mediaProcessor';
import { callGeminiApi } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [rememberApiKey, setRememberApiKey] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const [reactionStyle, setReactionStyle] = useState<ReactionStyle>(ReactionStyle.Auto);
  const [outputLength, setOutputLength] = useState<OutputLength>(OutputLength.Sedang);
  const [withHashtags, setWithHashtags] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
      setRememberApiKey(true);
    }
  }, []);

  useEffect(() => {
    if (rememberApiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  }, [apiKey, rememberApiKey]);
  
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setGeneratedCaption('');
    setMediaPreviewUrl(URL.createObjectURL(selectedFile));
    setMediaType(selectedFile.type.startsWith('image/') ? 'image' : 'video');
  };

  const clearFile = () => {
    setFile(null);
    if(mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaPreviewUrl(null);
    setMediaType(null);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Please enter your Gemini API key.");
      return;
    }
    if (!file) {
      setError("Please upload a file to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedCaption('');

    try {
      let mediaBase64: string[];
      let mimeType: string;

      if (mediaType === 'image') {
        setLoadingMessage("Processing image...");
        mediaBase64 = [await fileToBase64(file)];
        mimeType = file.type;
      } else if (mediaType === 'video') {
        mediaBase64 = await processVideo(file, setLoadingMessage);
        mimeType = 'image/jpeg'; // Frames are extracted as JPEGs
      } else {
          throw new Error("Unsupported media type");
      }

      setLoadingMessage("Generating caption with Gemini...");
      const caption = await callGeminiApi({
        apiKey,
        mediaBase64,
        mimeType,
        style: reactionStyle,
        length: outputLength,
        withHashtags: withHashtags,
      });

      setGeneratedCaption(caption);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };


  return (
    <div className="min-h-screen container mx-auto px-4 py-8 flex flex-col items-center">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Reaction Caption Generator</h1>
        <p className="mt-2 text-lg text-gray-400">
          Generate viral captions for your images and videos instantly.
        </p>
      </header>
      
      <main className="w-full max-w-2xl bg-white dark:bg-dark-card p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
        <ApiKeyInput 
            apiKey={apiKey}
            setApiKey={setApiKey}
            rememberApiKey={rememberApiKey}
            setRememberApiKey={setRememberApiKey}
        />

        <div className="border-t border-gray-200 dark:border-dark-border"></div>

        <FileUpload onFileSelect={handleFileSelect} clearFile={clearFile} selectedFile={file} />

        <MediaPreview previewUrl={mediaPreviewUrl} mediaType={mediaType} />

        {file && (
            <>
            <div className="border-t border-gray-200 dark:border-dark-border"></div>
            <OptionsPanel
              reactionStyle={reactionStyle}
              setReactionStyle={setReactionStyle}
              outputLength={outputLength}
              setOutputLength={setOutputLength}
              withHashtags={withHashtags}
              setWithHashtags={setWithHashtags}
            />
            </>
        )}
        
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isLoading || !file}
          className="w-full flex items-center justify-center bg-brand-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
        >
          {isLoading ? (
            <>
              <SpinnerIcon />
              <span className="ml-2">{loadingMessage || 'Generating...'}</span>
            </>
          ) : (
            'Analyze & Generate Caption'
          )}
        </button>

        <ResultDisplay caption={generatedCaption} />
      </main>
    </div>
  );
};

export default App;
