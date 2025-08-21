
import { ReactionStyle, OutputLength } from './types';

export const MAX_FILE_SIZE_MB = 150;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const REACTION_STYLE_OPTIONS: { id: ReactionStyle; label: string }[] = [
  { id: ReactionStyle.Auto, label: "Auto" },
  { id: ReactionStyle.Wow, label: "Wow / Kaget" },
  { id: ReactionStyle.Kagum, label: "Kagum / Satisfying" },
  { id: ReactionStyle.Wholesome, label: "Wholesome" },
  { id: ReactionStyle.Lucu, label: "Lucu / Sarkas" },
  { id: ReactionStyle.Mindblown, label: "Mindblown" },
];

export const OUTPUT_LENGTH_OPTIONS: { id: OutputLength; label: string }[] = [
  { id: OutputLength.Pendek, label: "Pendek" },
  { id: OutputLength.Sedang, label: "Sedang" },
  { id: OutputLength.Panjang, label: "Panjang" },
];

export const API_KEY_STORAGE_KEY = 'gemini_api_key';
