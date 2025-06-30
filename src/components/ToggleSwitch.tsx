import React from 'react';

interface ToggleSwitchProps {
  labelLeft: string;
  labelRight: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ labelLeft, labelRight, value, onChange }) => {
  const handleToggle = () => {
    onChange(!value);
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <span className={`font-medium transition-colors ${!value ? 'text-cyan-300' : 'text-slate-400'}`}>
        {labelLeft}
      </span>
      <button
        onClick={handleToggle}
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 ${
          value ? 'bg-cyan-600' : 'bg-slate-600'
        }`}
        aria-pressed={value}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={`font-medium transition-colors ${value ? 'text-cyan-300' : 'text-slate-400'}`}>
        {labelRight}
      </span>
    </div>
  );
};

export default ToggleSwitch;
