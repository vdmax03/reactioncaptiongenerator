
import { ReactionStyle, OutputLength } from '../types';

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

const buildInstruction = (style: ReactionStyle, length: OutputLength, withTags: boolean): string => {
  const stylePrompts = {
    [ReactionStyle.Auto]: "Buat caption natural dan relatable",
    [ReactionStyle.Wow]: "Buat caption dengan ekspresi WOW/KAGET yang viral",
    [ReactionStyle.Kagum]: "Buat caption dengan reaksi KAGUM/SATISFYING yang bikin puas",
    [ReactionStyle.Wholesome]: "Buat caption hangat, positif, dan wholesome",
    [ReactionStyle.Lucu]: "Buat caption lucu, sarkastik, dan menghibur",
    [ReactionStyle.Mindblown]: "Buat caption dengan reaksi MINDBLOWN yang ekspresif"
  };

  const lengthPrompts = {
    [OutputLength.Pendek]: "1-2 baris saja",
    [OutputLength.Sedang]: "3-5 baris",
    [OutputLength.Panjang]: "6-8 baris"
  };

  return `${stylePrompts[style]} untuk reels. Panjang: ${lengthPrompts[length]}. Maksimal 2 emoji. Tulis langsung caption saja tanpa format.${withTags ? ' WAJIB akhiri dengan 3-5 hashtag viral.' : ''}`.trim();
};


interface CallGeminiParams {
    apiKey: string;
    mediaBase64: string[];
    mimeType: string;
    style: ReactionStyle;
    length: OutputLength;
    withHashtags: boolean;
}

export const callGeminiApi = async ({ apiKey, mediaBase64, mimeType, style, length, withHashtags }: CallGeminiParams): Promise<string> => {
    const instruction = buildInstruction(style, length, withHashtags);

    // Adjust token limit based on output length and hashtag requirement
    const baseTokenLimits = {
        [OutputLength.Pendek]: 40,
        [OutputLength.Sedang]: 70,
        [OutputLength.Panjang]: 100
    };
    
    const tokenLimits = {
        [OutputLength.Pendek]: withHashtags ? 60 : baseTokenLimits[OutputLength.Pendek],
        [OutputLength.Sedang]: withHashtags ? 90 : baseTokenLimits[OutputLength.Sedang],
        [OutputLength.Panjang]: withHashtags ? 120 : baseTokenLimits[OutputLength.Panjang]
    };

    const requestParts = [
        { text: instruction },
        ...mediaBase64.map(b64 => ({
            inline_data: { mime_type: mimeType, data: b64 }
        }))
    ];

    const body = {
        contents: [{ parts: requestParts }],
        generationConfig: {
            temperature: 0.8,
            topP: 0.8,
            topK: 15,
            maxOutputTokens: tokenLimits[length]
        },
        safetySettings: []
    };

    const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error(`Gemini API error: ${errorData?.error?.message || 'Unknown error'}`);
    }

    const json = await response.json();
    
    if (json.promptFeedback && json.promptFeedback.blockReason) {
        throw new Error(`Request blocked: ${json.promptFeedback.blockReason}`);
    }
    
    const candidate = json?.candidates?.[0];
    if (!candidate) {
        throw new Error("No response candidates from Gemini API");
    }
    
    const parts = candidate?.content?.parts;
    if (!parts || !Array.isArray(parts)) {
        if (candidate.finishReason === 'MAX_TOKENS') {
            throw new Error("Response was truncated. Please try with a shorter output length.");
        }
        throw new Error("Invalid response structure from Gemini API");
    }
    
    const text = parts.map((p: any) => p.text || "").join("").trim();
    
    if (!text) {
        throw new Error("Empty response from Gemini API");
    }
    
    // Clean up unwanted formatting and structure
    let cleanedText = text
        .replace(/^(Hook|Isi|Closing|Caption|Berikut|Pilihan|Berikut beberapa):?\s*/gim, '')
        .replace(/\*\*.*?\*\*/g, '') // Remove bold markdown
        .replace(/^\d+\.\s*/gm, '') // Remove numbered lists
        .replace(/^[-*]\s*/gm, '') // Remove bullet points
        .replace(/\(.*?\)/g, '') // Remove parentheses content
        .replace(/Surga tersembunyi.*$/s, '') // Remove long descriptions
        .replace(/^\s*-\s*/gm, '') // Remove dashes
        .trim();
    
    // Ensure hashtags are included if requested
    if (withHashtags && !cleanedText.includes('#')) {
        const hashtags = ['#fyp', '#viral', '#trending', '#reels', '#indonesia'];
        cleanedText += '\n' + hashtags.slice(0, 3).join(' ');
    }
    
    return cleanedText;
};
