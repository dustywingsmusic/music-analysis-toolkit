import React from 'react';

const NearestGuessIcon: React.FC = () => {
  return (
    <div className="nearest-guess-icon group">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="nearest-guess-icon__svg"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <div
        role="tooltip"
        className="tooltip"
      >
        This is the closest match as the input notes don't perfectly form a known mode.
      </div>
    </div>
  );
};

export default NearestGuessIcon;