
import React from 'react';
import { ReactionStyle, OutputLength } from '../types';
import { REACTION_STYLE_OPTIONS, OUTPUT_LENGTH_OPTIONS } from '../constants';

interface OptionsPanelProps {
  reactionStyle: ReactionStyle;
  setReactionStyle: (style: ReactionStyle) => void;
  outputLength: OutputLength;
  setOutputLength: (length: OutputLength) => void;
  withHashtags: boolean;
  setWithHashtags: (value: boolean) => void;
}

const RadioGroup = <T extends string>({
  label,
  options,
  selectedValue,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  selectedValue: T;
  onChange: (value: T) => void;
}) => (
  <div>
    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</h3>
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`px-3 py-1.5 text-sm font-medium rounded-2xl transition-colors ${
            selectedValue === option.id
              ? 'bg-brand-secondary text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

const Toggle: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    <button
      type="button"
      className={`${
        enabled ? 'bg-brand-secondary' : 'bg-gray-200 dark:bg-gray-600'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2`}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
    >
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
  reactionStyle,
  setReactionStyle,
  outputLength,
  setOutputLength,
  withHashtags,
  setWithHashtags,
}) => {
  return (
    <div className="w-full space-y-6">
      <RadioGroup
        label="Gaya Reaction"
        options={REACTION_STYLE_OPTIONS}
        selectedValue={reactionStyle}
        onChange={setReactionStyle}
      />
      <RadioGroup
        label="Panjang Output"
        options={OUTPUT_LENGTH_OPTIONS}
        selectedValue={outputLength}
        onChange={setOutputLength}
      />
      <Toggle label="Sertakan Hashtag" enabled={withHashtags} onChange={setWithHashtags} />
    </div>
  );
};
