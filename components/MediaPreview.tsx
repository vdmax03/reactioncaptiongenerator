
import React from 'react';

interface MediaPreviewProps {
  previewUrl: string | null;
  mediaType: 'image' | 'video' | null;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ previewUrl, mediaType }) => {
  if (!previewUrl || !mediaType) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
        {mediaType === 'image' && (
          <img src={previewUrl} alt="Media preview" className="w-full h-full object-contain" />
        )}
        {mediaType === 'video' && (
          <video src={previewUrl} controls className="w-full h-full object-contain" />
        )}
      </div>
    </div>
  );
};
