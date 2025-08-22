
// Video processing using HTML5 Canvas instead of FFmpeg
// This approach is more reliable and doesn't require external dependencies

/**
 * Converts a File object to a base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extracts keyframes from a video file using HTML5 Canvas.
 * @param file The video file.
 * @returns A promise that resolves with an array of base64 encoded frame strings.
 */
const extractFramesFromVideo = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

        video.onloadedmetadata = () => {
            // Set canvas size to a reasonable resolution
            canvas.width = 320;
            canvas.height = 180;
            
            // Seek to 25% of the video duration to get a good frame
            video.currentTime = Math.max(0, video.duration * 0.25);
        };

        video.onseeked = () => {
            try {
                // Draw the current frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert canvas to base64
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                const base64Data = base64.split(',')[1]; // Remove data URL prefix
                
                resolve([base64Data]);
            } catch (error) {
                reject(new Error('Failed to extract frame from video'));
            }
        };

        video.onerror = () => {
            reject(new Error('Failed to load video file'));
        };

        // Create object URL and load video
        const videoUrl = URL.createObjectURL(file);
        video.src = videoUrl;
        video.load();
        
        // Clean up object URL after processing
        video.onended = () => {
            URL.revokeObjectURL(videoUrl);
        };
    });
};

/**
 * Main function to process a video file and extract frames.
 * It uses HTML5 Canvas to extract frames from the video.
 * @param file The video file to process.
 * @param setProgress A callback to update the loading progress message.
 * @returns An array of base64 encoded frames.
 */
export const processVideo = async (file: File, setProgress: (message: string) => void): Promise<string[]> => {
    try {
        setProgress("Processing video...");
        const frames = await extractFramesFromVideo(file);
        setProgress("Video processing complete.");
        return frames;
    } catch (error) {
        console.error('Video processing error:', error);
        throw error;
    }
};
