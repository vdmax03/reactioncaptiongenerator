
// This script relies on ffmpeg.min.js being loaded in index.html
declare const FFmpeg: any;

// SharedArrayBuffer polyfill for browsers that don't support it
if (typeof SharedArrayBuffer === 'undefined') {
  (window as any).SharedArrayBuffer = ArrayBuffer;
}

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
 * Extracts keyframes from a video file using ffmpeg.wasm.
 * @param ffmpeg An initialized ffmpeg instance.
 * @param file The video file.
 * @returns A promise that resolves with an array of base64 encoded frame strings.
 */
const extractFramesFromVideo = async (ffmpeg: any, file: File, setProgress: (message: string) => void): Promise<string[]> => {
    const { fetchFile } = FFmpeg;
    const inputFileName = 'input.mp4';
    const outputPattern = 'output%02d.jpg';

    setProgress("Reading video file...");
    
    // Read file in chunks to prevent main thread blocking
    const chunkSize = 1024 * 1024; // 1MB chunks
    const fileBuffer = new Uint8Array(file.size);
    let offset = 0;
    
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);
      const chunkBuffer = await chunk.arrayBuffer();
      fileBuffer.set(new Uint8Array(chunkBuffer), offset);
      offset += chunkSize;
      
      // Update progress for large files
      if (file.size > 10 * 1024 * 1024) { // Only for files > 10MB
        const progress = Math.round((offset / file.size) * 50); // 50% for reading
        setProgress(`Reading video file... ${progress}%`);
      }
    }
    
    ffmpeg.FS('writeFile', inputFileName, fileBuffer);
    
    setProgress("Processing video frame...");
    
    // Try to extract frame from the beginning of video for faster processing
    try {
        await ffmpeg.run(
            '-i', inputFileName,
            '-vf', 'scale=320:180', // Smaller scale for faster processing
            '-frames:v', '1',
            '-q:v', '25', // Higher compression for smaller files and faster processing
            '-threads', '1', // Single thread to avoid blocking
            '-y', // Overwrite output file
            'output01.jpg'
        );
    } catch (error) {
        console.log("First attempt failed, trying with seek...");
        // Fallback: seek to 1 second and extract frame
        await ffmpeg.run(
            '-i', inputFileName,
            '-ss', '1', // Seek to 1 second
            '-vf', 'scale=320:180',
            '-frames:v', '1',
            '-q:v', '25',
            '-threads', '1',
            '-y',
            'output01.jpg'
        );
    }

    setProgress("Reading processed frame...");
    const frames: string[] = [];
    try {
        const outputFileName = 'output01.jpg';
        const data = ffmpeg.FS('readFile', outputFileName);
        if (data && data.length > 0) {
            const base64 = btoa(new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
            frames.push(base64);
            ffmpeg.FS('unlink', outputFileName);
        }
    } catch (e) {
        console.error("Error reading frames from MP4, might be less than 3 frames extracted.", e);
    }
    
    ffmpeg.FS('unlink', inputFileName);

    if(frames.length === 0) {
      throw new Error("Could not extract any frames from the video. The video might be corrupted or in an unsupported format.");
    }

    return frames;
};

/**
 * Main function to process a video file and extract frames.
 * It initializes ffmpeg.wasm and calls the extraction logic.
 * @param file The video file to process.
 * @param setProgress A callback to update the loading progress message.
 * @returns An array of base64 encoded frames.
 */
export const processVideo = async (file: File, setProgress: (message: string) => void): Promise<string[]> => {
    try {
        setProgress("Initializing video tools...");
        const { createFFmpeg } = FFmpeg;
        const ffmpeg = createFFmpeg({
          corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
          log: true,
          mainName: 'main',
          printErr: (msg: string) => console.log('FFmpeg Error:', msg),
          print: (msg: string) => console.log('FFmpeg:', msg),
          // Enable SharedArrayBuffer for better performance
          enableSharedArrayBuffer: true,
          // Use worker for better performance
          workerPath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.worker.js'
        });
        
        setProgress("Loading video engine (this may take a moment)...");
        
        // Add timeout for loading
        const loadPromise = ffmpeg.load();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Loading timeout - please try again')), 30000)
        );
        
        await Promise.race([loadPromise, timeoutPromise]);

        setProgress("Extracting keyframes from video...");
        const frames = await extractFramesFromVideo(ffmpeg, file, setProgress);
        
        setProgress("Video processing complete.");
        return frames;
    } catch (error) {
        console.error('Video processing error:', error);
        if (error instanceof Error && error.message.includes('SharedArrayBuffer')) {
            throw new Error('Video processing requires SharedArrayBuffer support. Please ensure you are using a modern browser and the application is served with proper CORS headers.');
        }
        if (error instanceof Error && error.message.includes('bad memory')) {
            throw new Error('Video processing failed due to memory issues. Please try with a smaller video file or refresh the page.');
        }
        if (error instanceof Error && error.message.includes('timeout')) {
            throw new Error('Video processing took too long. Please try with a smaller video file or check your internet connection.');
        }
        throw error;
    }
};
