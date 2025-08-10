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

  const getLabelClass = (isActive: boolean) =>
    `toggle-switch__label ${isActive ? 'toggle-switch__label--active' : ''}`;

  return (
    <div className="toggle-switch">
      <span className={getLabelClass(!value)}>
        {labelLeft}
      </span>
      <button
        onClick={handleToggle}
        className={`toggle-switch__button ${value ? 'toggle-switch__button--on' : 'toggle-switch__button--off'}`}
        aria-pressed={value}
      >
        <span
          className={`toggle-switch__slider ${value ? 'toggle-switch__slider--on' : 'toggle-switch__slider--off'}`}
        />
      </button>
      <span className={getLabelClass(value)}>
        {labelRight}
      </span>
    </div>
  );
};

export default ToggleSwitch;
