import React from 'react';
import { cn } from '../../lib/utils';
import DelightfulButton from './delightful-button';

interface EmptyStateProps {
  variant?: 'no-input' | 'no-results' | 'coming-soon' | 'error';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const emptyStateContent = {
  'no-input': {
    emoji: '🎼',
    title: 'Ready to analyze your music?',
    description: 'Enter some notes, chords, or upload audio to discover the musical modes hiding in your music.',
    tips: [
      'Try entering a simple scale like "C D E F G A B"',
      'Or analyze a chord progression like "Am F C G"',
      'MIDI input works too - just play your keyboard!'
    ]
  },
  'no-results': {
    emoji: '🔍',
    title: 'Hmm, no matches found',
    description: 'Your input might be using an unusual scale or need some adjustment.',
    tips: [
      'Check for typos in note names',
      'Try entering notes in a different order',
      'Some exotic scales might not be in our database yet'
    ]
  },
  'coming-soon': {
    emoji: '🚀',
    title: 'Exciting feature incoming!',
    description: 'We\'re working hard to bring you this capability.',
    tips: [
      'Audio analysis will support MP3, WAV, and more',
      'Real-time recording from your microphone',
      'Advanced harmonic analysis'
    ]
  },
  'error': {
    emoji: '🎵',
    title: 'Oops! Something went off-key',
    description: 'Don\'t worry - even Bach had rough drafts. Let\'s try again.',
    tips: [
      'Check your internet connection',
      'Try refreshing the page',
      'Make sure your input format is correct'
    ]
  }
};

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'no-input',
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  const [tipIndex, setTipIndex] = React.useState(0);
  const content = emptyStateContent[variant];

  // Rotate tips every 4 seconds
  React.useEffect(() => {
    if (content.tips.length > 1) {
      const interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % content.tips.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [content.tips.length]);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 p-8",
      className
    )}>
      {/* Animated Emoji */}
      <div className="text-6xl animate-bounce-gentle">
        {content.emoji}
      </div>

      {/* Content */}
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-foreground">
          {title || content.title}
        </h3>
        <p className="text-muted-foreground">
          {description || content.description}
        </p>
      </div>

      {/* Rotating Tips */}
      {content.tips.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 max-w-sm">
          <div className="flex items-start space-x-2">
            <span className="text-primary text-sm">💡</span>
            <p className="text-sm text-muted-foreground animate-fade-in-message">
              {content.tips[tipIndex]}
            </p>
          </div>
        </div>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <DelightfulButton
          onClick={onAction}
          musical={variant !== 'error'}
          sparkle={variant === 'coming-soon'}
          className="mt-4"
        >
          {actionLabel}
        </DelightfulButton>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-primary/10 text-4xl animate-float-1">♪</div>
        <div className="absolute top-1/3 right-1/4 text-primary/10 text-3xl animate-float-2">♫</div>
        <div className="absolute bottom-1/3 left-1/3 text-primary/10 text-2xl animate-float-3">♬</div>
      </div>
    </div>
  );
};

export default EmptyState;
