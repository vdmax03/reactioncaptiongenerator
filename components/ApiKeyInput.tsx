
import React from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  rememberApiKey: boolean;
  setRememberApiKey: (remember: boolean) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  apiKey,
  setApiKey,
  rememberApiKey,
  setRememberApiKey,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
          Gemini API Key
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key here"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
        />
      </div>
      
      <div className="flex items-center">
        <input
          id="rememberKey"
          type="checkbox"
          checked={rememberApiKey}
          onChange={(e) => setRememberApiKey(e.target.checked)}
          className="h-4 w-4 text-brand-primary bg-gray-800 border-gray-600 rounded focus:ring-brand-secondary focus:ring-2"
        />
        <label htmlFor="rememberKey" className="ml-2 text-sm text-gray-300">
          Remember API key
        </label>
      </div>
    </div>
  );
};
