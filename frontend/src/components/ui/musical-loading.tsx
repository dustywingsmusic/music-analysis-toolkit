import React from 'react';
import { cn } from '../../lib/utils';

interface MusicalLoadingProps {
  variant?: 'analysis' | 'discovery' | 'harmony' | 'reference';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const loadingMessages = {
  analysis: [
    "Deciphering your musical mystery...",
    "Following the melodic breadcrumbs...",
    "Consulting the circle of fifths...",
    "Tuning into your notes...",
    "Analyzing harmonic patterns...",
  ],
  discovery: [
    "Exploring musical territories...",
    "Searching through scales and modes...",
    "Discovering hidden musical gems...",
    "Traversing the musical landscape...",
    "Uncovering modal secrets...",
  ],
  harmony: [
    "Mapping chord relationships...",
    "Analyzing harmonic progressions...",
    "Exploring chord families...",
    "Investigating voice leading...",
    "Studying harmonic functions...",
  ],
  reference: [
    "Organizing musical knowledge...",
    "Preparing scale tables...",
    "Gathering reference materials...",
    "Sorting musical information...",
    "Compiling scale data...",
  ]
};

const MusicalLoading: React.FC<MusicalLoadingProps> = ({
  variant = 'analysis',
  size = 'md',
  className
}) => {
  const [messageIndex, setMessageIndex] = React.useState(0);
  const [currentMessage, setCurrentMessage] = React.useState(loadingMessages[variant][0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        const nextIndex = (prev + 1) % loadingMessages[variant].length;
        setCurrentMessage(loadingMessages[variant][nextIndex]);
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [variant]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-4 p-6",
      className
    )}>
      {/* Musical Note Animation */}
      <div className="relative">
        <div className={cn(
          "animate-bounce rounded-full bg-primary/20 flex items-center justify-center",
          sizeClasses[size]
        )}>
          <span className="text-2xl animate-pulse">🎵</span>
        </div>

        {/* Floating notes */}
        <div className="absolute -top-2 -right-2 animate-float-1">
          <span className="text-sm opacity-60">♪</span>
        </div>
        <div className="absolute -bottom-1 -left-2 animate-float-2">
          <span className="text-xs opacity-40">♫</span>
        </div>
        <div className="absolute top-1 -left-4 animate-float-3">
          <span className="text-xs opacity-50">♬</span>
        </div>
      </div>

      {/* Dynamic Message */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground animate-fade-in-message">
          {currentMessage}
        </p>
        <div className="flex space-x-1 justify-center">
          <span className="animate-bounce-dot-1">•</span>
          <span className="animate-bounce-dot-2">•</span>
          <span className="animate-bounce-dot-3">•</span>
        </div>
      </div>
    </div>
  );
};

export default MusicalLoading;
